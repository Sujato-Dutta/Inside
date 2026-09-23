import readXlsxFile from "read-excel-file/browser";
import {
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
  rawScores: Record<string, Partial<Record<"mathGrade" | "englishGrade" | "scienceGrade", number>>>;
}

export interface IssueResolution {
  action: DataQualityIssue["action"];
  value?: number;
}

const ID_HEADERS = ["studentid", "pupilid", "pupilrefid", "rollno", "admissionnumber", "candidatenumber", "id"];
const SCORE_FIELDS = new Set<keyof StudentRecord>(["mathGrade", "englishGrade", "scienceGrade"]);

function compact(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapHeader(header: string): { key: keyof StudentRecord | "ignore"; confidence: number } {
  const key = compact(header);
  if (ID_HEADERS.includes(key)) return { key: "sourceRef", confidence: 100 };
  if (/studentname|pupilname|fullname|^name$/.test(key)) return { key: "name", confidence: 98 };
  if (/yeargroup|gradelevel|cohort|^year$/.test(key)) return { key: "yearGroup", confidence: 94 };
  if (/classsection|classgroup|tutorgroup|^class$|^form$/.test(key)) return { key: "classGroup", confidence: 92 };
  if (/attendance/.test(key)) return { key: "attendanceRate", confidence: 98 };
  if (/math|maths|mathematics|numeracy/.test(key)) return { key: "mathGrade", confidence: 94 };
  if (/english|literacy|englang|englit/.test(key)) return { key: "englishGrade", confidence: 94 };
  if (/science|biology|chemistry|physics/.test(key)) return { key: "scienceGrade", confidence: 94 };
  if (/sendcategory|inclusionsend|primaryneed|sentype/.test(key)) return { key: "inclusionSend", confidence: 96 };
  if (/^send$|^sen$|senstatus|specialneeds/.test(key)) return { key: "senStatus", confidence: 96 };
  if (/emirati|uaenational|nationalstatus/.test(key)) return { key: "emiratiStatus", confidence: 95 };
  if (/^gender$|^sex$/.test(key)) return { key: "gender", confidence: 98 };
  if (/eal|englishadditionallanguage/.test(key)) return { key: "ealStatus", confidence: 95 };
  return { key: "ignore", confidence: 35 };
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

function readWithFileReader(file: File, mode: "text" | "buffer"): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => resolve(reader.result as string | ArrayBuffer);
    if (mode === "buffer") reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}

async function readRows(file: File): Promise<string[][]> {
  if (/\.xlsx?$/i.test(file.name)) {
    const buffer = (await readWithFileReader(file, "buffer")) as ArrayBuffer;
    const sheets = await readXlsxFile(buffer);
    return (sheets[0]?.data || []).map((row) => row.map((cell) => String(cell ?? "")));
  }
  const text = (await readWithFileReader(file, "text")) as string;
  return parseDelimited(text, /\.tsv$/i.test(file.name) ? "\t" : ",");
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
  const parsed = await Promise.all(selectedFiles.map(async (file) => ({ file, rows: await readRows(file) })));
  const joined = new Map<string, Record<string, string>>();
  const mappings: ColumnMapping[] = [];
  const issues: DataQualityIssue[] = [];
  const auditLog: HygieneAuditEntry[] = [];
  let repairedCells = 0;
  let droppedRows = 0;
  const rawScores: StagedDataset["rawScores"] = {};

  for (const { file, rows } of parsed) {
    const headers = (rows[0] || []).map((value) => value.trim());
    const idIndex = headers.findIndex((header) => ID_HEADERS.includes(compact(header)));
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
        sourceFile: file.name,
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
          id: `${file.name}-row-${rowIndex}`,
          studentRef: "Missing reference",
          sourceFile: file.name,
          field: "row",
          issue: "Missing pupil reference; row cannot be safely joined",
          observed: "Blank",
          action: "exclude",
        });
        return;
      }
      if (seenInFile.has(rawId)) {
        issues.push({
          id: `${file.name}-duplicate-${rowIndex}`,
          studentRef: rawId,
          sourceFile: file.name,
          field: "row",
          issue: "Duplicate pupil reference in the same source file",
          observed: rawId,
          action: "exclude",
        });
        return;
      }
      seenInFile.add(rawId);
      const current = joined.get(rawId) || {};
      headers.forEach((header, index) => {
        const raw = String(row[index] ?? "");
        const cleaned = raw.trim();
        if (raw !== cleaned) repairedCells += 1;
        if (cleaned) current[`${file.name}::${header}`] = cleaned;
      });
      joined.set(rawId, current);
    });
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const records = await Promise.all(Array.from(joined.entries()).map(async ([sourceRef, values], rowIndex) => {
    const draft: Partial<StudentRecord> = {};
    for (const [qualifiedHeader, rawValue] of Object.entries(values)) {
      const [sourceFile, header] = qualifiedHeader.split("::");
      const mapping = mappings.find((item) => item.sourceFile === sourceFile && item.original === header);
      if (!mapping || mapping.mappedTo === "ignore" || mapping.mappedTo === "sourceRef" || mapping.mappedTo === "name") continue;
      const field = mapping.mappedTo;
      if (SCORE_FIELDS.has(field)) {
        const raw = Number(rawValue);
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
        draft.yearGroup = Number(rawValue.replace(/\D/g, "")) || 1;
      } else if (field === "gender") {
        draft.gender = /^m/i.test(rawValue) ? "Male" : /^f/i.test(rawValue) ? "Female" : "Other";
      } else if (field === "senStatus" || field === "emiratiStatus" || field === "ealStatus") {
        (draft as Record<string, unknown>)[field] = toBoolean(rawValue);
      } else {
        (draft as Record<string, unknown>)[field] = rawValue;
      }
    }
    const math = draft.mathGrade ?? 0;
    const english = draft.englishGrade ?? 0;
    const science = draft.scienceGrade ?? 0;
    const attendance = Number.isFinite(draft.attendanceRate) ? draft.attendanceRate! : 0;
    const riskLevel = attendance < 85 || Math.min(math, english, science) < 4
      ? "High"
      : attendance < 90 || Math.min(math, english, science) < 5
        ? "Moderate"
        : "Low";
    return {
      id: await anonymousRef(sourceRef, salt),
      sourceRef,
      name: "Redacted in analysis",
      gender: draft.gender || "Other",
      yearGroup: draft.yearGroup || 1,
      classGroup: draft.classGroup || "Unmapped",
      attendanceRate: attendance,
      mathGrade: math,
      englishGrade: english,
      scienceGrade: science,
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

  const ignored = mappings.filter((mapping) => mapping.mappedTo === "ignore").length;
  return {
    records,
    files: parsed.map(({ file, rows }, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      uploadedAt: "Staged in RAM",
      rowCount: Math.max(0, rows.length - 1),
      columns: (rows[0] || []).map(String),
      status: "mapped",
    })),
    mappings,
    issues,
    auditLog,
    repairedCells,
    droppedRows,
    readinessScore: Math.max(0, 100 - ignored * 2 - issues.length * 3 - droppedRows * 2),
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
