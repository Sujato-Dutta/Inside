export const YEAR_GROUP_ORDER = [
  'FS1', 'FS2', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13'
] as const;

export const KEY_STAGE_ORDER = ['EYFS', 'KS1', 'KS2', 'KS3', 'KS4', 'Post-16'] as const;

export function formatSafePct(numerator: number, denominator: number, decimals: number = 1): string {
  if (!denominator || denominator <= 0 || isNaN(denominator) || isNaN(numerator)) {
    return "N/A (No assessed cohort)";
  }
  return `${((numerator / denominator) * 100).toFixed(decimals)}%`;
}

export interface StudentRecord {
  id: string;
  /** Raw source identifier retained only in volatile browser memory for local joins/lookups. */
  sourceRef?: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  yearGroup: number;
  yearGroupStr?: string;
  phase?: string;
  keyStage?: string;
  classGroup: string;
  tutorGroup?: string;
  nationality?: string;
  attendanceRate: number; // e.g. 84.5% or Att_Overall_Pct
  attT1Pct?: number;
  attT2Pct?: number;
  persistentAbsence?: boolean;
  sessionsPossible?: number;
  absentSessionsAuthorised?: number;
  absentSessionsUnauthorised?: number;
  lateCount?: number;
  mathGrade?: number | null; // 1-9 or score
  englishGrade?: number | null;
  scienceGrade?: number | null;
  overallScore?: number | null;
  senStatus: boolean; // Special Educational Needs
  inclusionSend?: string; // Cognition and Learning, Communication and Interaction, SEMH, Sensory and Physical, or None
  sendSupportLevel?: string | null;
  iepInPlace?: boolean;
  emiratiStatus?: boolean;
  ealStatus?: boolean;
  newJoiner?: boolean;
  giftedTalented?: boolean;
  pupilPremium?: boolean; // Optional backward compatibility
  cat4Verbal?: number;
  cat4NonVerbal?: number;
  cat4Quantitative?: number;
  cat4Spatial?: number;
  cat4Mean?: number | null;
  cat4_sas?: number | null;
  /** Presence flags preserve valid zero marks without treating missing marks as zero. */
  assessmentPresent?: { math: boolean; english: boolean; science: boolean };
  attendancePresent?: boolean;
  cat4Stanine?: number;
  predictedMathGrade?: number;
  predictedScienceGrade?: number;
  predictedEnglishGrade?: number;
  term1MathGrade?: number | null;
  term1ScienceGrade?: number | null;
  term1EnglishGrade?: number | null;
  term2MathGrade?: number | null;
  term2ScienceGrade?: number | null;
  term2EnglishGrade?: number | null;
  avgCoreT1?: number | null;
  avgCoreT2?: number | null;
  targetAvgCore?: number | null;
  progressT1T2?: number | null;
  aboveTargetT2?: boolean;
  arabicTrack?: "Arabic A" | "Arabic B" | string;
  arabicGrade?: number | null;
  arabic_T1?: number | null;
  arabic_T2?: number | null;
  islamicEducationTaken?: boolean;
  islamicGrade?: number | null;
  islamicEd_T1?: number | null;
  islamicEd_T2?: number | null;
  socialStudies_T1?: number | null;
  socialStudies_T2?: number | null;
  moralEd_T1?: number | null;
  moralEd_T2?: number | null;
  gradeDrop?: number;
  missingAssignments?: number;
  behaviourIncidents?: number;
  meritPoints?: number;
  interventionProgramme?: string;
  post16Route?: string | null;
  post16AvgUcasPtsT2?: number | null;
  eyfsGld?: boolean | null;
  weeklyAttendance?: number[];
  targetGrade?: number;
  attainmentGap?: number;
  riskLevel: "Low" | "Moderate" | "High";
  flagReason?: string;
}

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  rowCount: number;
  columns: string[];
  status: "ready" | "processing" | "mapped";
}

export interface ColumnMapping {
  original: string;
  mappedTo: keyof StudentRecord | "ignore";
  confidence: number;
  sourceFile?: string;
  scoreBase?: number;
  normalization?: string;
}

export interface DataQualityIssue {
  id: string;
  studentRef: string;
  sourceFile: string;
  field: keyof StudentRecord | "row";
  issue: string;
  observed: string | number;
  maximum?: number;
  action: "cap" | "adjust-base" | "override" | "exclude";
}

export interface HygieneAuditEntry {
  id: string;
  sourceFile: string;
  studentRef: string;
  action: string;
  detail: string;
}

export interface InsightItem {
  id: string;
  title: string;
  category: "Attendance" | "Attainment" | "SEN Support" | "Cohort Gap" | "Intervention";
  severity: "critical" | "warning" | "positive";
  summary: string;
  impactMetric: string;
  affectedStudentIds: string[];
  recommendedAction: string;
  suggestedPrompt: string;
  templateType: "Leadership Summary" | "Attendance Analysis" | "Attainment Gap" | "Student Progress" | "Intervention Summary" | "Parent Meeting Brief";
}

export interface AskAnswer {
  id: string;
  query: string;
  timestamp: string;
  explanation: string;
  kpis?: {
    label: string;
    value: string;
    change?: string;
    isPositive?: boolean;
  }[];
  chart?: {
    type: "bar" | "line" | "pie" | "donut" | "scatter";
    title: string;
    data: Record<string, string | number>[];
    xKey?: string;
    yKeys?: string[];
  };
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  highlightedStudents?: {
    id: string;
    name: string;
    year: number;
    issue: string;
    metric: string;
  }[];
  suggestedActions?: string[];
  followUps?: string[];
  filterDescription?: string;
  sourceDataset?: string;
}
