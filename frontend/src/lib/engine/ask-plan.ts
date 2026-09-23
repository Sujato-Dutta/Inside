export type AskAnalysis =
  | "core_attainment"
  | "phase_attainment"
  | "send_progress"
  | "send_subject"
  | "send_attendance"
  | "gender_gap"
  | "attendance_attainment"
  | "emirati_attainment"
  | "borderline_math"
  | "data_quality"
  | "cohort_metric"
  | "record_list"
  | "advice"
  | "unsupported";

export interface AskPlan {
  analysis: AskAnalysis;
  subject: "English" | "Mathematics" | "Science" | "All" | null;
  year: number | null;
  stage: "KS3" | "KS4" | null;
  gender: "Male" | "Female" | null;
  send: boolean | null;
  emirati: boolean | null;
  metric: "count" | "mean_grade" | "attainment_rate" | null;
  recordSort: "core_grade" | "subject_grade" | "attendance" | null;
  recordOrder: "lowest" | "highest" | "none" | null;
  recordLimit: number | null;
  focus: "attainment" | "attendance" | "progress" | "general" | null;
  presentation: string;
  reasoning: string;
  advice: string[];
  attendanceThreshold: number | null;
  clarification: string | null;
}

export function canonicalQuestion(plan: AskPlan): string | null {
  const subject = plan.subject && plan.subject !== "All" ? plan.subject : "core subjects";
  switch (plan.analysis) {
    case "core_attainment": return `${subject} attainment against the DSIB benchmark`;
    case "phase_attainment": return "phase attainment against the DSIB benchmark";
    case "send_progress": return "SEND progress compared with non-SEND peers";
    case "send_subject": return `SEND ${subject} attainment compared with non-SEND peers`;
    case "send_attendance": return "SEND attendance below 90% and attainment";
    case "gender_gap": return `${plan.year ? `Year ${plan.year} ` : plan.stage ? `${plan.stage} ` : ""}boys and girls ${subject} gender attainment gap`;
    case "attendance_attainment": return `attendance below ${plan.attendanceThreshold ?? 90}% compared with attainment`;
    case "emirati_attainment": return "Emirati national attainment compared with peers";
    case "borderline_math": return "borderline secondary mathematics boundary";
    case "data_quality": return "data quality duplicate references and mapping";
    case "cohort_metric": return `${plan.metric || "count"} for ${plan.year === null ? plan.stage || "all years" : `Year ${plan.year}`} ${plan.gender || "all genders"} ${plan.subject || "core subjects"}${plan.send === null ? "" : plan.send ? " SEND" : " non-SEND"}${plan.emirati === null ? "" : plan.emirati ? " Emirati" : " non-Emirati"}${plan.attendanceThreshold === null ? "" : ` attendance below ${plan.attendanceThreshold}%`}`;
    case "record_list": return `${plan.recordOrder || "none"} ${plan.recordSort || "core_grade"} records for ${plan.year === null ? plan.stage || "all years" : `Year ${plan.year}`} ${plan.gender || "all genders"} ${plan.subject || "core subjects"}${plan.send === null ? "" : plan.send ? " SEND" : " non-SEND"}${plan.emirati === null ? "" : plan.emirati ? " Emirati" : " non-Emirati"}${plan.attendanceThreshold === null ? "" : ` attendance below ${plan.attendanceThreshold}%`}${plan.recordLimit ? ` first ${plan.recordLimit}` : ""}`;
    case "advice": return `${plan.focus || "general"} advice for ${plan.year === null ? plan.stage || "all years" : `Year ${plan.year}`} ${plan.gender || "all genders"} ${plan.subject || "core subjects"}${plan.send === null ? "" : plan.send ? " SEND" : " non-SEND"}${plan.emirati === null ? "" : plan.emirati ? " Emirati" : " non-Emirati"}${plan.attendanceThreshold === null ? "" : ` attendance below ${plan.attendanceThreshold}%`}`;
    default: return null;
  }
}
