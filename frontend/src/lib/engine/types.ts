export type FilterOperator = "<" | "<=" | ">" | ">=" | "==" | "=" | "!=" | "in";

export interface FilterCondition {
  column?: string;
  field?: string;
  operator?: FilterOperator;
  op?: FilterOperator;
  value: string | number | boolean | (string | number)[];
}

export interface QueryIntent {
  intentType: "attendance" | "attainment" | "cohort_gap" | "progress" | "intervention" | "student_lookup" | "general";
  targetMetric?: string;
  metric?: string;
  filters: FilterCondition[];
  groupBy?: string | null;
  comparison?: string | null;
  threshold?: number | null;
  timeRange?: string | null;
  clarificationNeeded?: boolean;
  clarificationPrompt?: string | null;
  clarificationOptions?: string[] | null;
}

export interface KPIMetric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartData {
  type: "bar" | "line" | "donut" | "scatter";
  title: string;
  xKey: string;
  yKeys: string[];
  data: Record<string, string | number>[];
}

export interface HighlightedPupil {
  id: string;
  name: string;
  year: number | string;
  issue: string;
  metric: string;
}

export interface DeterministicResult {
  intent: QueryIntent;
  kpis: KPIMetric[];
  table: TableData;
  chart: ChartData | null;
  highlightedStudents: HighlightedPupil[];
  filterDescription: string;
  sourceDataset: string;
  explanation: string;
  suggestedActions: string[];
  verification?: {
    interpretation: string;
    cohortRule: string;
    totalRecords: number;
    matchedRecords: number;
    /** Browser-only pointers to the source records used for this calculation. */
    localRecordIds?: string[];
    steps: { label: string; formula: string; inputs: string; result: string }[];
    evidence: TableData;
  };
}

export interface InsightAnomaly {
  id: string;
  category: "Attendance" | "Attainment" | "SEN Support" | "Cohort Gap";
  severity: "high" | "medium" | "positive";
  title: string;
  metric: string;
  description: string;
  affectedStudentIds: string[];
  suggestedAction: string;
  reportTemplate: string;
}

export interface ReportCalculation {
  title: string;
  templateType: string;
  studentCount: number;
  executiveSummary: string;
  keyMetrics: { label: string; value: string; status: string }[];
  breakdown: { label: string; value: number; count: number }[];
  recommendations: string[];
}

export interface RubricIndicator {
  name: string;
  category: string;
  calculatedValue: number;
  unit: string;
  band: string;
  bandIndex: number; // 0=Outstanding ... 5=Very Weak
  formula: string;
  numerator: number;
  denominator: number;
  description: string;
}

export interface InspectionRubric {
  indicators: RubricIndicator[];
  overallBand: string;
  overallBandIndex: number;
  timestamp: string;
  studentCount: number;
}
