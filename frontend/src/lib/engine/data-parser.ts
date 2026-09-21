import { StudentRecord, ColumnMapping } from "@/types/student-data";

// Known column aliases for intelligent educational mapping
const COLUMN_SYNONYMS: Partial<Record<keyof StudentRecord, string[]>> = {
  id: ["pupil id", "student id", "id", "student_id", "pupil_id", "candidate number", "roll no", "admission number"],
  name: ["student name", "pupil name", "name", "full name", "student_name", "first and last name"],
  yearGroup: ["year", "year group", "year_group", "grade", "cohort", "nc year"],
  classGroup: ["class", "section", "classgroup", "class section", "form", "tutor group"],
  attendanceRate: ["attendance", "attendance %", "attendance rate", "attendance_rate", "attnd %", "overall attendance", "att %"],
  mathGrade: ["math", "maths", "mathematics", "numeracy", "algebra", "math_grade", "math score"],
  englishGrade: ["english", "eng", "english lang", "english lit", "literacy", "english_grade", "english score"],
  scienceGrade: ["science", "sci", "combined science", "physics", "chemistry", "biology", "science_grade"],
  senStatus: ["sen", "send", "special needs", "sen status", "sen_status", "iep", "ehcp"],
  inclusionSend: ["inclusion", "send category", "inclusion_send", "sen type", "primary need"],
  emiratiStatus: ["emirati", "emirati_status", "national", "uae national"],
  ealStatus: ["eal", "eal_status", "english additional language"],
  pupilPremium: ["pupil premium", "pp", "disadvantaged", "fsm", "free school meals", "pupil_premium"],
  gender: ["gender", "sex"],
  riskLevel: ["risk", "risk level", "support tier", "status", "risk_level"],
};

export interface ParseResult {
  records: StudentRecord[];
  headers: string[];
  mappings: ColumnMapping[];
  readinessScore: number;
  warnings: string[];
  totalRows: number;
}

// Clean and normalize strings for matching
function cleanKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
}

// Map detected header to standard canonical key
export function detectColumnMapping(header: string): { key: keyof StudentRecord | "ignore"; confidence: number } {
  const cleaned = cleanKey(header);

  for (const [canonical, synonyms] of Object.entries(COLUMN_SYNONYMS) as [keyof StudentRecord, string[]][]) {
    if (synonyms.some((s) => s === cleaned || cleaned.includes(s) || s.includes(cleaned))) {
      const exact = synonyms.includes(cleaned);
      return { key: canonical, confidence: exact ? 98 : 88 };
    }
  }

  return { key: "ignore", confidence: 40 };
}

// Robust browser CSV line parser supporting quoted cells
export function parseCSVLines(text: string): string[][] {
  const lines: string[][] = [];
  const rawLines = text.split(/\r?\n/);

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) continue;

    const row: string[] = [];
    let insideQuote = false;
    let currentCell = "";

    for (let i = 0; i < rawLine.length; i++) {
      const char = rawLine[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        row.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    lines.push(row);
  }

  return lines;
}

// Parse uploaded CSV/spreadsheet content in browser
export function parseSpreadsheetInBrowser(fileContent: string, fileName: string): ParseResult {
  const lines = parseCSVLines(fileContent);
  if (lines.length === 0) {
    return {
      records: [],
      headers: [],
      mappings: [],
      readinessScore: 0,
      warnings: ["File contains no data rows."],
      totalRows: 0,
    };
  }

  const rawHeaders = lines[0];
  const dataRows = lines.slice(1);
  const mappings: ColumnMapping[] = rawHeaders.map((header) => {
    const detected = detectColumnMapping(header);
    return {
      original: header,
      mappedTo: detected.key,
      confidence: detected.confidence,
    };
  });

  const records: StudentRecord[] = [];
  const warnings: string[] = [];
  let missingIdCount = 0;
  let invalidAttendanceCount = 0;

  dataRows.forEach((row, rowIdx) => {
    if (row.length === 0 || row.every((c) => !c)) return;

    let id = `STU-${1000 + rowIdx + 1}`;
    let name = `Student ${rowIdx + 1}`;
    let yearGroup = 10;
    let classGroup = "10A";
    let attendanceRate = 92.0;
    let mathGrade = 6.0;
    let englishGrade = 6.0;
    let scienceGrade = 6.0;
    let senStatus = false;
    let inclusionSend: string | undefined = undefined;
    let emiratiStatus: boolean | undefined = undefined;
    let ealStatus: boolean | undefined = undefined;
    let pupilPremium = false;
    let gender: "Male" | "Female" | "Other" = "Other";
    let riskLevel: "Low" | "Moderate" | "High" = "Low";

    row.forEach((cell, colIdx) => {
      const mapping = mappings[colIdx]?.mappedTo;
      if (!mapping || mapping === "ignore") return;

      const trimmed = cell.replace(/^["']|["']$/g, "").trim();

      switch (mapping) {
        case "id":
          if (trimmed) id = trimmed;
          else missingIdCount++;
          break;

        case "name":
          if (trimmed) name = trimmed;
          break;

        case "yearGroup": {
          const num = parseInt(trimmed.replace(/\D/g, ""), 10);
          if (!isNaN(num) && num >= 1 && num <= 14) yearGroup = num;
          break;
        }

        case "classGroup":
          if (trimmed) classGroup = trimmed;
          break;

        case "attendanceRate": {
          const cleanedNum = parseFloat(trimmed.replace(/%/g, ""));
          if (!isNaN(cleanedNum)) {
            attendanceRate = Math.min(100, Math.max(0, cleanedNum));
          } else {
            invalidAttendanceCount++;
          }
          break;
        }

        case "mathGrade": {
          const num = parseFloat(trimmed);
          if (!isNaN(num)) mathGrade = Math.min(100, Math.max(0, num));
          break;
        }

        case "englishGrade": {
          const num = parseFloat(trimmed);
          if (!isNaN(num)) englishGrade = Math.min(100, Math.max(0, num));
          break;
        }

        case "scienceGrade": {
          const num = parseFloat(trimmed);
          if (!isNaN(num)) scienceGrade = Math.min(100, Math.max(0, num));
          break;
        }

        case "senStatus": {
          const lower = trimmed.toLowerCase();
          senStatus = lower === "true" || lower === "yes" || lower === "k" || lower === "e" || lower === "sen";
          break;
        }

        case "inclusionSend":
          if (trimmed && trimmed.toLowerCase() !== "none") inclusionSend = trimmed;
          break;

        case "emiratiStatus": {
          const lower = trimmed.toLowerCase();
          emiratiStatus = lower === "true" || lower === "yes" || lower === "1";
          break;
        }

        case "ealStatus": {
          const lower = trimmed.toLowerCase();
          ealStatus = lower === "true" || lower === "yes" || lower === "1";
          break;
        }

        case "pupilPremium": {
          const lower = trimmed.toLowerCase();
          pupilPremium = lower === "true" || lower === "yes" || lower === "pp" || lower === "fsm";
          break;
        }

        case "gender": {
          const g = trimmed.toLowerCase();
          if (g.startsWith("m")) gender = "Male";
          else if (g.startsWith("f")) gender = "Female";
          else gender = "Other";
          break;
        }

        case "riskLevel": {
          const lower = trimmed.toLowerCase();
          if (lower.includes("high") || lower.includes("intervention")) riskLevel = "High";
          else if (lower.includes("med") || lower.includes("mod") || lower.includes("monitor")) riskLevel = "Moderate";
          else riskLevel = "Low";
          break;
        }
      }
    });

    // Auto-calculate risk if not explicitly provided
    if (attendanceRate < 85 || mathGrade < 4 || englishGrade < 4) {
      riskLevel = "High";
    } else if (attendanceRate < 90 || mathGrade < 5 || englishGrade < 5) {
      riskLevel = "Moderate";
    }

    const overallScore = Math.round(((mathGrade + englishGrade + scienceGrade) / 3) * 10) / 10;

    records.push({
      id,
      name,
      gender,
      yearGroup,
      classGroup,
      attendanceRate,
      mathGrade,
      englishGrade,
      scienceGrade,
      overallScore,
      senStatus,
      inclusionSend,
      emiratiStatus,
      ealStatus,
      pupilPremium,
      riskLevel,
    });
  });

  // Calculate Data Readiness Score
  const coreColumns = ["id", "name", "attendanceRate", "mathGrade", "englishGrade"];
  const mappedCore = coreColumns.filter((c) => mappings.some((m) => m.mappedTo === c)).length;
  const missingCorePenalty = (coreColumns.length - mappedCore) * 12;
  const missingIdPenalty = Math.min(25, missingIdCount * 4);
  const invalidRatePenalty = Math.min(20, invalidAttendanceCount * 3);

  const readinessScore = Math.max(
    10,
    Math.min(100, Math.round(100 - missingCorePenalty - missingIdPenalty - invalidRatePenalty))
  );

  if (missingIdCount > 0) warnings.push(`${missingIdCount} records had missing student IDs; assigned temporary IDs.`);
  if (invalidAttendanceCount > 0) warnings.push(`${invalidAttendanceCount} records had unparseable attendance values.`);
  if (mappedCore < coreColumns.length) warnings.push("Some core academic columns were unmapped.");

  return {
    records,
    headers: rawHeaders,
    mappings,
    readinessScore,
    warnings,
    totalRows: records.length,
  };
}
