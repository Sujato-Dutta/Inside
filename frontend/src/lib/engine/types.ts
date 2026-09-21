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
  change?: string | null;
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
