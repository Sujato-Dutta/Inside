import { ChartData, QueryIntent } from "./types";

export interface ChartCandidateInput {
  intent: QueryIntent;
  dataPoints: Record<string, string | number>[];
  xKey: string;
  yKeys: string[];
  title: string;
}

// Selects chart type and configuration deterministically from calculation structure
export function selectDeterministicChart(input: ChartCandidateInput): ChartData | null {
  const { intent, dataPoints, xKey, yKeys, title } = input;

  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }

  // 1. Time / change trajectory -> Line chart
  if (intent.timeRange || intent.intentType === "progress" || xKey.toLowerCase().includes("term") || xKey.toLowerCase().includes("month") || xKey.toLowerCase().includes("week")) {
    return {
      type: "line",
      title: title || "Progress Trajectory",
      xKey,
      yKeys,
      data: dataPoints,
    };
  }

  // 2. Small part-to-whole (e.g. Risk distribution or attendance bands <= 5 slices) -> Donut chart
  if (
    (intent.intentType === "attendance" || intent.intentType === "intervention") &&
    dataPoints.length >= 2 &&
    dataPoints.length <= 5 &&
    (xKey.toLowerCase().includes("band") || xKey.toLowerCase().includes("tier") || xKey.toLowerCase().includes("status"))
  ) {
    return {
      type: "donut",
      title: title || "Cohort Distribution",
      xKey,
      yKeys: [yKeys[0] || "count"],
      data: dataPoints,
    };
  }

  // 3. Cohort / Category Comparison (e.g. Year groups, SEN vs Non-SEN, Pupil Premium) -> Bar chart
  if (intent.intentType === "cohort_gap" || intent.groupBy || dataPoints.length <= 12) {
    return {
      type: "bar",
      title: title || "Cohort Comparison",
      xKey,
      yKeys,
      data: dataPoints,
    };
  }

  // 4. Default for multiple values -> Bar chart
  return {
    type: "bar",
    title: title || "Comparative Breakdown",
    xKey,
    yKeys,
    data: dataPoints.slice(0, 15),
  };
}
