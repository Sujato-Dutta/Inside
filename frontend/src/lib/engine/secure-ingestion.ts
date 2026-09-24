import readXlsxFile from "read-excel-file/browser";
import type {
  ColumnMapping,
  DataQualityIssue,
  HygieneAuditEntry,
  StudentRecord,
  UploadedFileMeta,
} from "@/types/student-data";

export interface StagedDataset {
  records: StudentRecord[];
  files: UploadedFileMeta[];
  mappings: ColumnMapping[];
  issues: DataQualityIssue[];
  auditLog: HygieneAuditEntry[];
  repairedCells: number;
  droppedRows: number;
  readinessScore: number;
  dataTrust: DataTrustAudit;
  rawScores: Record<string, Partial<Record<"mathGrade" | "englishGrade" | "scienceGrade", number>>>;
}

export interface DataTrustAudit {
  identityIntegrity: number;
  requiredFieldsCompleteness: number;
  assessmentCompleteness: number;
  cat4Availability: number;
  overallHealth: number;
  scannedRows: number;
  duplicateRefs: number;
  eligiblePupils: number;
  availableCoreMarks: number;
  requiredValues: number;
  possibleRequiredValues: number;
}

export interface IssueResolution {
  action: DataQualityIssue["action"];
  value?: number;
}

const ID_HEADERS = ["studentid", "studentref", "pupilid", "pupilref", "pupilrefid", "rollno", "admissionnumber", "candidatenumber", "id"];
const SCORE_FIELDS = new Set<keyof StudentRecord>(["mathGrade", "englishGrade", "scienceGrade", "term1MathGrade", "term1EnglishGrade", "term1ScienceGrade", "term2MathGrade", "term2EnglishGrade", "term2ScienceGrade"]);
const REQUIRED_KEYS = ["sourceRef", "name", "gender", "yearGroup", "phase", "emiratiStatus"] as const;
type RequiredKey = typeof REQUIRED_KEYS[number];
type CoreSubject = "math" | "english" | "science";
const percent = (count: number, total: number) => total ? Math.round(count / total * 10000) / 100 : 0;

function compact(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapHeader(header: string): { key: keyof StudentRecord | "ignore"; confidence: number } {
  const key = compact(header);
  if (ID_HEADERS.includes(key)) return { key: "sourceRef", confidence: 100 };
  if (["cat4meansas", "cat4mean", "meansas", "overallsas"].includes(key)) return { key: "cat4_sas", confidence: 98 };
  const termScore = key.match(/^(maths?|mathematics|english|science)(?:term|t)?([12])(?:grade|score|mark)?$/);
  if (termScore) {
    const subject = termScore[1].startsWith("math") ? "Math" : termScore[1] === "english" ? "English" : "Science";
    return { key: `term${termScore[2]}${subject}Grade` as keyof StudentRecord, confidence: 99 };
  }
  if (/studentname|pupilname|fullname|^name$/.test(key)) return { key: "name", confidence: 98 };
  if (/yeargroup|gradelevel|cohort|^year$/.test(key)) return { key: "yearGroup", confidence: 94 };
  if (/classsection|classgroup|tutorgroup|^class$|^form$/.test(key)) return { key: "classGroup", confidence: 92 };
  if (/attendance|^attoverallpct$|^attpct$/.test(key)) return { key: "attendanceRate", confidence: 98 };
  if (/math|maths|mathematics|numeracy/.test(key)) return { key: "mathGrade", confidence: 94 };
  if (/english|literacy|englang|englit/.test(key)) return { key: "englishGrade", confidence: 94 };
  if (/science|biology|chemistry|physics/.test(key)) return { key: "scienceGrade", confidence: 94 };
  if (/sendcategory|inclusionsend|primaryneed|sentype/.test(key)) return { key: "inclusionSend", confidence: 96 };
  if (/^send$|^sen$|senstatus|sendflag|specialneeds/.test(key)) return { key: "senStatus", confidence: 96 };
  if (/emirati|uaenational|nationalstatus/.test(key)) return { key: "emiratiStatus", confidence: 95 };
  if (/^gender$|^sex$/.test(key)) return { key: "gender", confidence: 98 };
  if (/eal|englishadditionallanguage/.test(key)) return { key: "ealStatus", confidence: 95 };
  return { key: "ignore", confidence: 35 };
}

function requiredKey(header: string): RequiredKey | null {
  if (compact(header) === "phase") return "phase";
  const mapped = mapHeader(header).key;
  return REQUIRED_KEYS.includes(mapped as RequiredKey) ? mapped as RequiredKey : null;
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function readFileLocally(file: File, mode: "text" | "buffer"): Promise<string | ArrayBuffer> {
  return mode === "buffer" ? file.arrayBuffer() : file.text();
}

interface SourceTable { source: string; rows: string[][] }

function stringRows(rows: unknown[][]): string[][] {
  return rows.map((row) => row.map((cell) => String(cell ?? "")));
}

function isPupilTable(rows: string[][]): boolean {
  return rows.length > 1 && rows[0].some((header) => ID_HEADERS.includes(compact(header)));
}

async function readTables(file: File): Promise<SourceTable[]> {
  if (/\.xlsx$/i.test(file.name)) {
    const buffer = (await readFileLocally(file, "buffer")) as ArrayBuffer;
    const sheets = await readXlsxFile(buffer);
    const tables = sheets.map((sheet) => ({ source: `${file.name} / ${sheet.sheet}`, rows: stringRows(sheet.data) }))
      .filter((table) => isPupilTable(table.rows));
    if (!tables.length) throw new Error(`${file.name}: no pupil-data sheet with a Student_Ref or Student_ID header was found.`);
    return tables;
  }
  if (/\.xls$/i.test(file.name)) throw new Error(`${file.name}: legacy .xls is not supported. Save as .xlsx or CSV before importing.`);
  const text = (await readFileLocally(file, "text")) as string;
  if (/\.json$/i.test(file.name)) {
    const document = JSON.parse(text) as unknown;
    const objects = Array.isArray(document) ? document : typeof document === "object" && document !== null
      ? Object.values(document).find(Array.isArray) : null;
    if (!Array.isArray(objects) || !objects.every((item) => item && typeof item === "object" && !Array.isArray(item)))
      throw new Error(`${file.name}: expected an array of pupil objects.`);
    const headers = Array.from(new Set(objects.flatMap((item) => Object.keys(item as Record<string, unknown>))));
    return [{ source: file.name, rows: [headers, ...objects.map((item) => headers.map((header) => String((item as Record<string, unknown>)[header] ?? "")))] }];
  }
  if (!/\.(csv|tsv|txt)$/i.test(file.name)) throw new Error(`${file.name}: unsupported format. Use XLSX, CSV, TSV, or JSON pupil tables.`);
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiter = /\.tsv$/i.test(file.name) ? "\t" : [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  return [{ source: file.name, rows: parseDelimited(text.replace(/^\uFEFF/, ""), delimiter) }];
}

function detectedBase(header: string, values: number[]): number | undefined {
  const match = header.match(/(?:[\/_([])(\d{1,3})(?:[\])]|$)/);
  if (match) return Number(match[1]);
  if (!values.length) return undefined;
  const highest = Math.max(...values);
  if (highest <= 9) return 9;
  return [40, 50, 60, 80, 100].find((base) => highest <= base) || 100;
}

function toBoolean(value: unknown) {
  return /^(true|yes|y|1|send|sen|emirati)$/i.test(String(value ?? "").trim());
}

function toGrade(value: number, base = 9) {
  if (!Number.isFinite(value)) return 0;
  if (base <= 9) return Math.max(0, Math.min(9, value));
  return Math.round(Math.max(0, Math.min(1, value / base)) * 90) / 10;
}

async function anonymousRef(rawId: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}|${rawId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .slice(0, 5)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `STU-${hex}`;
}

export async function stageSchoolFiles(selectedFiles: File[]): Promise<StagedDataset> {
  const parsedFiles = await Promise.all(selectedFiles.map(async (file) => ({ file, tables: await readTables(file) })));
  const parsed = parsedFiles.flatMap(({ file, tables }) => tables.map(({ source, rows }) => ({ file, source, rows })));
  if (!parsed.length) throw new Error("No pupil table found. Include a Student_Ref or Student_ID column with one row per pupil.");
  const joined = new Map<string, Record<string, string>>();
  const requiredByRef = new Map<string, Set<RequiredKey>>();
  const mappings: ColumnMapping[] = [];
  const issues: DataQualityIssue[] = [];
  const auditLog: HygieneAuditEntry[] = [];
  let repairedCells = 0;
  let droppedRows = 0;
  let scannedRows = 0;
  let duplicateRefs = 0;
  const rawScores: StagedDataset["rawScores"] = {};

  for (const { source, rows } of parsed) {
    scannedRows += Math.max(0, rows.length - 1);
    const headers = (rows[0] || []).map((value) => value.trim());
    const idIndex = headers.findIndex((header) => ID_HEADERS.includes(compact(header)));
    if (idIndex < 0) throw new Error(`${source}: no pupil reference column was found.`);
    const seenInFile = new Set<string>();
    const numericByHeader = headers.map((_, col) =>
      rows.slice(1).map((row) => Number(String(row[col] ?? "").replace(/%/g, ""))).filter(Number.isFinite)
    );
    headers.forEach((header, index) => {
      const mapped = mapHeader(header);
      const base = SCORE_FIELDS.has(mapped.key as keyof StudentRecord)
        ? detectedBase(header, numericByHeader[index])
        : undefined;
      mappings.push({
        original: header,
        mappedTo: mapped.key,
        confidence: mapped.confidence,
        sourceFile: source,
        scoreBase: base,
        normalization:
          mapped.key === "sourceRef"
            ? "SHA-256 pseudonym shown; source key held in volatile RAM"
            : SCORE_FIELDS.has(mapped.key as keyof StudentRecord)
              ? `Normalized from /${base || 100} to Grade 1-9`
              : mapped.key === "yearGroup"
                ? "Standardized to Y1-Y13"
                : "Whitespace and case normalized",
      });
    });

    rows.slice(1).forEach((row, rowIndex) => {
      const rawId = String(row[idIndex] ?? "").trim();
      if (idIndex < 0 || !rawId) {
        droppedRows += 1;
        issues.push({
          id: `${source}-row-${rowIndex}`,
          studentRef: "Missing reference",
          sourceFile: source,
          field: "row",
          issue: "Missing pupil reference; row cannot be safely joined",
          observed: "Blank",
          action: "exclude",
        });
        return;
      }
      if (seenInFile.has(rawId)) {
        duplicateRefs += 1;
        issues.push({
          id: `${source}-duplicate-${rowIndex}`,
          studentRef: rawId,
          sourceFile: source,
          field: "row",
          issue: "Duplicate pupil reference in the same source file",
          observed: rawId,
          action: "exclude",
        });
        return;
      }
      seenInFile.add(rawId);
      const current = joined.get(rawId) || {};
      const present = requiredByRef.get(rawId) || new Set<RequiredKey>();
      present.add("sourceRef");
      headers.forEach((header, index) => {
        const raw = String(row[index] ?? "");
        const cleaned = raw.trim();
        if (raw !== cleaned) repairedCells += 1;
        if (cleaned) {
          current[`${source}::${header}`] = cleaned;
          const required = requiredKey(header);
          if (required) present.add(required);
        }
      });
      joined.set(rawId, current);
      requiredByRef.set(rawId, present);
    });
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const records = await Promise.all(Array.from(joined.entries()).map(async ([sourceRef, values], rowIndex) => {
    const draft: Partial<StudentRecord> = {};
    const currentMarks = new Set<CoreSubject>();
    for (const [qualifiedHeader, rawValue] of Object.entries(values)) {
      const splitAt = qualifiedHeader.lastIndexOf("::");
      const sourceFile = qualifiedHeader.slice(0, splitAt);
      const header = qualifiedHeader.slice(splitAt + 2);
      const mapping = mappings.find((item) => item.sourceFile === sourceFile && item.original === header);
      if (!mapping || mapping.mappedTo === "ignore" || mapping.mappedTo === "sourceRef" || mapping.mappedTo === "name") continue;
      const field = mapping.mappedTo;
      if (SCORE_FIELDS.has(field)) {
        const raw = Number(rawValue);
        if (Number.isFinite(raw) && ["mathGrade", "englishGrade", "scienceGrade", "term2MathGrade", "term2EnglishGrade", "term2ScienceGrade"].includes(field)) {
          currentMarks.add(field.toLowerCase().includes("math") ? "math" : field.toLowerCase().includes("english") ? "english" : "science");
        }
        rawScores[sourceRef] = rawScores[sourceRef] || {};
        rawScores[sourceRef][field as "mathGrade" | "englishGrade" | "scienceGrade"] = raw;
        const base = mapping.scoreBase || 100;
        if (Number.isFinite(raw) && raw > base) {
          issues.push({
            id: `score-${sourceRef}-${field}`,
            studentRef: sourceRef,
            sourceFile,
            field,
            issue: "Assessment mark exceeds confirmed maximum",
            observed: raw,
            maximum: base,
            action: "cap",
          });
        }
        (draft as Record<string, unknown>)[field] = toGrade(raw, base);
      } else if (field === "attendanceRate") {
        const raw = Number(rawValue.replace(/%/g, ""));
        if (raw > 100 || raw < 0) {
          issues.push({
            id: `attendance-${sourceRef}`,
            studentRef: sourceRef,
            sourceFile,
            field,
            issue: "Attendance is outside the valid 0-100% range",
            observed: raw,
            maximum: 100,
            action: "cap",
          });
        }
        draft.attendanceRate = Math.max(0, Math.min(100, raw));
      } else if (field === "yearGroup") {
        draft.yearGroup = /^FS/i.test(rawValue) ? 0 : Number(rawValue.replace(/\D/g, "")) || 0;
      } else if (field === "gender") {
        draft.gender = /^m/i.test(rawValue) ? "Male" : /^f/i.test(rawValue) ? "Female" : "Other";
      } else if (field === "cat4_sas") {
        const sas = Number(rawValue);
        if (Number.isInteger(sas) && sas >= 60 && sas <= 141) draft.cat4_sas = sas;
      } else if (field === "senStatus" || field === "emiratiStatus" || field === "ealStatus") {
        (draft as Record<string, unknown>)[field] = toBoolean(rawValue);
      } else {
        (draft as Record<string, unknown>)[field] = rawValue;
      }
    }
    const math = draft.term2MathGrade ?? draft.mathGrade ?? 0;
    const english = draft.term2EnglishGrade ?? draft.englishGrade ?? 0;
    const science = draft.term2ScienceGrade ?? draft.scienceGrade ?? 0;
    const attendance = Number.isFinite(draft.attendanceRate) ? draft.attendanceRate! : 0;
    const hasGrades = [math, english, science].some((grade) => grade > 0);
    const riskLevel = attendance < 85 || (hasGrades && Math.min(math, english, science) < 4)
      ? "High"
      : attendance < 90 || (hasGrades && Math.min(math, english, science) < 5)
        ? "Moderate"
        : "Low";
    return {
      id: await anonymousRef(sourceRef, salt),
      sourceRef,
      name: "Redacted in analysis",
      gender: draft.gender || "Other",
      yearGroup: draft.yearGroup ?? 0,
      classGroup: draft.classGroup || "Unmapped",
      attendanceRate: attendance,
      mathGrade: math,
      englishGrade: english,
      scienceGrade: science,
      term1MathGrade: draft.term1MathGrade,
      term1EnglishGrade: draft.term1EnglishGrade,
      term1ScienceGrade: draft.term1ScienceGrade,
      term2MathGrade: draft.term2MathGrade,
      term2EnglishGrade: draft.term2EnglishGrade,
      term2ScienceGrade: draft.term2ScienceGrade,
      cat4_sas: draft.cat4_sas ?? null,
      assessmentPresent: { math: currentMarks.has("math"), english: currentMarks.has("english"), science: currentMarks.has("science") },
      attendancePresent: draft.attendanceRate !== undefined,
      overallScore: Math.round(((math + english + science) / 3) * 10) / 10,
      senStatus: Boolean(draft.senStatus || (draft.inclusionSend && draft.inclusionSend !== "None")),
      inclusionSend: draft.inclusionSend || "None",
      emiratiStatus: Boolean(draft.emiratiStatus),
      ealStatus: Boolean(draft.ealStatus),
      riskLevel,
    } satisfies StudentRecord;
  }));

  auditLog.push({
    id: "join",
    sourceFile: selectedFiles.map((file) => file.name).join(" + "),
    studentRef: "All records",
    action: "O(N) pupil-reference join",
    detail: `${records.length} unique pupil records joined across ${selectedFiles.length} source files in volatile memory.`,
  });
  if (repairedCells) {
    auditLog.push({
      id: "clean",
      sourceFile: "All sources",
      studentRef: "Multiple",
      action: "Whitespace normalization",
      detail: `${repairedCells} cells sanitized before mapping.`,
    });
  }

  const requiredValues = Array.from(requiredByRef.values()).reduce((sum, present) => sum + present.size, 0);
  const possibleRequiredValues = (records.length + droppedRows) * REQUIRED_KEYS.length;
  const eligible = records.filter((record) => record.yearGroup >= 1 && record.yearGroup <= 11);
  const availableCoreMarks = eligible.reduce((sum, record) => sum + Number(record.assessmentPresent?.math) + Number(record.assessmentPresent?.english) + Number(record.assessmentPresent?.science), 0);
  const identityIntegrity = percent(Math.max(0, scannedRows - duplicateRefs), scannedRows);
  const requiredFieldsCompleteness = percent(requiredValues, possibleRequiredValues);
  const assessmentCompleteness = eligible.length ? percent(availableCoreMarks, eligible.length * 3) : 100;
  const cat4Availability = percent(records.filter((record) => record.cat4_sas !== null).length, records.length);
  const overallHealth = Math.round((identityIntegrity * 0.4 + requiredFieldsCompleteness * 0.4 + assessmentCompleteness * 0.2) * 100) / 100;
  const dataTrust: DataTrustAudit = {
    identityIntegrity, requiredFieldsCompleteness, assessmentCompleteness, cat4Availability, overallHealth,
    scannedRows, duplicateRefs, eligiblePupils: eligible.length, availableCoreMarks, requiredValues, possibleRequiredValues,
  };
  return {
    records,
    files: parsedFiles.map(({ file, tables }, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      uploadedAt: "Staged in RAM",
      rowCount: Math.max(0, ...tables.map(({ rows }) => rows.length - 1)),
      columns: tables.flatMap(({ rows }) => (rows[0] || []).map(String)),
      status: "mapped",
    })),
    mappings,
    issues,
    auditLog,
    repairedCells,
    droppedRows,
    readinessScore: overallHealth,
    dataTrust,
    rawScores,
  };
}

export function resolveQualityIssues(
  staged: StagedDataset,
  resolutions: Record<string, IssueResolution>
): StudentRecord[] {
  const excluded = new Set(
    staged.issues
      .filter((issue) => (resolutions[issue.id]?.action || issue.action) === "exclude")
      .map((issue) => issue.studentRef)
  );
  return staged.records
    .filter((record) => !excluded.has(record.sourceRef || record.id))
    .map((record) => {
      const next = { ...record };
      const sourceRef = record.sourceRef || record.id;
      const sourceScores = staged.rawScores[sourceRef] || {};
      (["mathGrade", "englishGrade", "scienceGrade"] as const).forEach((field) => {
        const raw = sourceScores[field];
        const base = staged.mappings.find((mapping) => mapping.mappedTo === field)?.scoreBase;
        if (raw !== undefined && base) next[field] = toGrade(raw, base);
      });
      staged.issues.filter((issue) => issue.studentRef === record.sourceRef).forEach((issue) => {
        const resolution = resolutions[issue.id] || { action: issue.action };
        if (issue.field === "row" || resolution.action === "exclude") return;
        const value = resolution.value ?? Number(issue.observed);
        if (issue.field === "attendanceRate") next.attendanceRate = Math.max(0, Math.min(100, value));
        else if (SCORE_FIELDS.has(issue.field)) {
          const base = resolution.action === "adjust-base" ? Math.max(value, Number(issue.observed)) : issue.maximum || 100;
          (next as unknown as Record<string, unknown>)[issue.field] =
            resolution.action === "override" ? toGrade(value, base) : toGrade(Math.min(Number(issue.observed), base), base);
        }
      });
      next.overallScore = Math.round(((next.mathGrade + next.englishGrade + next.scienceGrade) / 3) * 10) / 10;
      return next;
    });
}
