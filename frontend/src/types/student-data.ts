export interface StudentRecord {
  id: string;
  /** Raw source identifier retained only in volatile browser memory for local joins/lookups. */
  sourceRef?: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  yearGroup: number;
  classGroup: string;
  attendanceRate: number; // e.g. 84.5%
  mathGrade: number; // 1-9 or score
  englishGrade: number;
  scienceGrade: number;
  overallScore: number;
  senStatus: boolean; // Special Educational Needs
  inclusionSend?: string; // Dyslexia, ADHD, Autism, Dyscalculia, Dyspraxia, None
  emiratiStatus?: boolean;
  ealStatus?: boolean;
  pupilPremium?: boolean; // Optional backward compatibility
  cat4Verbal?: number;
  cat4NonVerbal?: number;
  cat4Quantitative?: number;
  cat4Spatial?: number;
  cat4Mean?: number;
  cat4Stanine?: number;
  predictedMathGrade?: number;
  predictedScienceGrade?: number;
  predictedEnglishGrade?: number;
  term1MathGrade?: number;
  term1ScienceGrade?: number;
  term1EnglishGrade?: number;
  term2MathGrade?: number;
  term2ScienceGrade?: number;
  term2EnglishGrade?: number;
  gradeDrop?: number;
  missingAssignments?: number;
  behaviourIncidents?: number;
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
