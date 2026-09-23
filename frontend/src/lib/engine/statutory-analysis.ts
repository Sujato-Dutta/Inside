import type { StudentRecord, UploadedFileMeta } from "@/types/student-data";
import type { DeterministicResult } from "./types";
import type { AskPlan } from "./ask-plan";

const avg = (v: number[]) => v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
const pct = (a: number, b: number) => b ? Math.round((a / b) * 1000) / 10 : 0;
const round = (v: number) => Math.round(v * 10) / 10;
const subjectScore = (s: StudentRecord, subject: "math" | "science" | "english") =>
  subject === "math" ? s.term2MathGrade ?? s.mathGrade :
  subject === "science" ? s.term2ScienceGrade ?? s.scienceGrade :
  s.term2EnglishGrade ?? s.englishGrade;
const termOne = (s: StudentRecord) => avg([s.term1MathGrade ?? s.mathGrade, s.term1ScienceGrade ?? s.scienceGrade, s.term1EnglishGrade ?? s.englishGrade]);
const termTwo = (s: StudentRecord) => avg([s.term2MathGrade ?? s.mathGrade, s.term2ScienceGrade ?? s.scienceGrade, s.term2EnglishGrade ?? s.englishGrade]);
const table = (rows: StudentRecord[], limit = 15) => ({
  headers: ["Anonymous Ref", "Year", "Section", "Gender", "Attendance", "Math", "Science", "English", "SEND", "Emirati"],
  rows: rows.slice(0, limit).map((s) => [s.id, `Y${s.yearGroup}`, s.classGroup, s.gender, `${s.attendanceRate}%`, round(subjectScore(s, "math")), round(subjectScore(s, "science")), round(subjectScore(s, "english")), s.inclusionSend || (s.senStatus ? "SEND" : "None"), s.emiratiStatus ? "Yes" : "No"]),
});

type Step = NonNullable<DeterministicResult["verification"]>["steps"][number];
const share = (label: string, count: number, total: number): Step => ({ label, formula: "matching records ÷ cohort records × 100", inputs: `${count} ÷ ${total}`, result: total ? `${pct(count, total)}%` : "No records" });
const mean = (label: string, values: number[]): Step => ({ label, formula: "sum of observed grades ÷ pupil count", inputs: `${round(values.reduce((sum, value) => sum + value, 0))} ÷ ${values.length}`, result: values.length ? String(round(avg(values))) : "No records" });
const numberStep = (label: string, count: number, rule: string): Step => ({ label, formula: rule, inputs: `${count} matching records`, result: String(count) });

function makeResult(students: StudentRecord[], dataset: string, title: string, data: Record<string, string | number>[], findings: string[], subset: StudentRecord[], interpretation: string, cohortRule: string, steps: Step[], xKey = "label", yKeys = ["Attainment"]): DeterministicResult {
  return {
    intent: { intentType: "attainment", filters: [], targetMetric: "statutory_attainment" },
    kpis: [
      { label: "Verified records", value: String(subset.length), change: "Local RAM only", isPositive: true },
    ],
    table: table(subset),
    chart: data.length ? { type: "bar", title, xKey, yKeys, data } : null,
    highlightedStudents: [],
    filterDescription: `${subset.length} matching anonymized records from active memory`,
    sourceDataset: dataset,
    explanation: findings.join("\n"),
    suggestedActions: findings.slice(0, 3),
    verification: { interpretation, cohortRule, totalRecords: students.length, matchedRecords: subset.length, localRecordIds: subset.map((student) => student.id), steps, evidence: table(subset, Number.POSITIVE_INFINITY) },
  };
}

export function clarificationResult(message: string, totalRecords: number, dataset = "Active volatile cohort"): DeterministicResult {
  return {
    intent: { intentType: "general", filters: [], clarificationNeeded: true, clarificationPrompt: message },
    kpis: [], table: table([]), chart: null, highlightedStudents: [],
    filterDescription: "No calculation was run", sourceDataset: dataset, explanation: message,
    suggestedActions: [message],
    verification: { interpretation: "No supported calculation was selected.", cohortRule: "No filter was applied", totalRecords, matchedRecords: 0, steps: [], evidence: table([]) },
  };
}

export function analyzeCohortMetric(students: StudentRecord[], plan: AskPlan, files: UploadedFileMeta[] = []): DeterministicResult {
  const dataset = files.map((file) => file.name).join(" + ") || "Active volatile cohort";
  const subject: "math" | "science" | "english" | null = plan.subject === "Mathematics" ? "math" : plan.subject === "Science" ? "science" : plan.subject === "English" ? "english" : null;
  const rules: string[] = [];
  if (plan.year !== null) rules.push(`Year ${plan.year}`);
  if (plan.stage) rules.push(plan.stage);
  if (plan.gender) rules.push(plan.gender === "Male" ? "boys" : "girls");
  if (plan.send !== null) rules.push(plan.send ? "SEND" : "non-SEND");
  if (plan.emirati !== null) rules.push(plan.emirati ? "Emirati" : "non-Emirati");
  if (plan.attendanceThreshold !== null) rules.push(`attendance below ${plan.attendanceThreshold}%`);
  const cohort = students.filter((student) => {
    if (plan.year !== null && student.yearGroup !== plan.year) return false;
    if (plan.stage === "KS3" && (student.yearGroup < 7 || student.yearGroup > 9)) return false;
    if (plan.stage === "KS4" && (student.yearGroup < 10 || student.yearGroup > 11)) return false;
    if (plan.gender && student.gender !== plan.gender) return false;
    const isSend = student.senStatus || Boolean(student.inclusionSend && student.inclusionSend !== "None");
    if (plan.send !== null && isSend !== plan.send) return false;
    if (plan.emirati !== null && Boolean(student.emiratiStatus) !== plan.emirati) return false;
    if (plan.attendanceThreshold !== null && student.attendanceRate >= plan.attendanceThreshold) return false;
    return true;
  });
  const cohortName = rules.join(", ") || "whole school";
  if (!cohort.length) return clarificationResult(`No records match ${cohortName}. Try a broader cohort or check the loaded files.`, students.length, dataset);
  const metricName = subject ? plan.subject! : "core average";
  const scores = cohort.map((student) => subject ? subjectScore(student, subject) : termTwo(student));
  if (plan.metric === "count") {
    return makeResult(students, dataset, `Pupil count: ${cohortName}`, [{ label: cohortName, Count: cohort.length }],
      [`${cohort.length} of ${students.length} pupils match ${cohortName}.`, "The count uses the committed records in this browser session."], cohort,
      "The question requests a count for one filtered cohort.", cohortName,
      [numberStep("Matching pupils", cohort.length, cohortName), share("Share of loaded pupils", cohort.length, students.length)], "label", ["Count"]);
  }
  if (plan.metric === "mean_grade") {
    const average = round(avg(scores));
    return makeResult(students, dataset, `${metricName} mean grade: ${cohortName}`, [{ label: cohortName, "Mean grade": average }],
      [`${cohort.length} pupils match ${cohortName}.`, `Their current ${metricName} mean is Grade ${average}.`, "This is an observed mean, not a forecast."], cohort,
      `The question requests the current ${metricName} mean for one cohort.`, cohortName,
      [numberStep("Matching pupils", cohort.length, cohortName), mean(`${metricName} mean`, scores)], "label", ["Mean grade"]);
  }
  const attained = scores.filter((score) => score >= 5).length;
  const rate = pct(attained, cohort.length);
  return makeResult(students, dataset, `${metricName} attainment: ${cohortName}`, [{ label: cohortName, Attainment: rate }],
    [`${attained} of ${cohort.length} pupils in ${cohortName} are at or above the current Grade 5 reference in ${metricName}.`, `That is ${rate}% for this cohort.`, "The result is calculated from current loaded marks only."], cohort,
    `The question requests current ${metricName} attainment for one cohort.`, cohortName,
    [numberStep("Matching pupils", cohort.length, cohortName), share(`${metricName} at or above expected`, attained, cohort.length)], "label", ["Attainment"]);
}

export function analyzeRecordList(students: StudentRecord[], plan: AskPlan, files: UploadedFileMeta[] = []): DeterministicResult {
  const dataset = files.map((file) => file.name).join(" + ") || "Active volatile cohort";
  const rules: string[] = [];
  if (plan.year !== null) rules.push(`Year ${plan.year}`);
  if (plan.stage) rules.push(plan.stage);
  if (plan.gender) rules.push(plan.gender === "Male" ? "boys" : "girls");
  if (plan.send !== null) rules.push(plan.send ? "SEND" : "non-SEND");
  if (plan.emirati !== null) rules.push(plan.emirati ? "Emirati" : "non-Emirati");
  if (plan.attendanceThreshold !== null) rules.push(`attendance below ${plan.attendanceThreshold}%`);
  const cohort = students.filter((student) => {
    if (plan.year !== null && student.yearGroup !== plan.year) return false;
    if (plan.stage === "KS3" && (student.yearGroup < 7 || student.yearGroup > 9)) return false;
    if (plan.stage === "KS4" && (student.yearGroup < 10 || student.yearGroup > 11)) return false;
    if (plan.gender && student.gender !== plan.gender) return false;
    const isSend = student.senStatus || Boolean(student.inclusionSend && student.inclusionSend !== "None");
    if (plan.send !== null && isSend !== plan.send) return false;
    if (plan.emirati !== null && Boolean(student.emiratiStatus) !== plan.emirati) return false;
    if (plan.attendanceThreshold !== null && student.attendanceRate >= plan.attendanceThreshold) return false;
    return true;
  });
  const cohortName = rules.join(", ") || "all pupils";
  if (!cohort.length) return clarificationResult(`No records match ${cohortName}. Try a broader cohort or check the loaded files.`, students.length, dataset);
  const subject = plan.subject === "Mathematics" ? "math" : plan.subject === "Science" ? "science" : plan.subject === "English" ? "english" : null;
  const sort = plan.recordSort === "attendance" ? "attendance" : subject ? "subject_grade" : "core_grade";
  const order = plan.recordOrder || "none";
  const score = (student: StudentRecord) => sort === "attendance" ? student.attendanceRate : subject && sort === "subject_grade" ? subjectScore(student, subject) : avg([subjectScore(student, "math"), subjectScore(student, "science"), subjectScore(student, "english")]);
  const ranked = order === "none" ? cohort : [...cohort].sort((a, b) => {
    const difference = score(a) - score(b);
    return (order === "highest" ? -difference : difference) || a.id.localeCompare(b.id);
  });
  const limit = Math.min(50, Math.max(1, plan.recordLimit ?? (order === "none" ? 25 : 10)));
  const selected = ranked.slice(0, limit);
  const metricLabel = sort === "attendance" ? "attendance" : sort === "subject_grade" ? `${plan.subject} grade` : "current core average grade";
  const ordering = order === "lowest" ? "lowest" : order === "highest" ? "highest" : "first";
  const result = makeResult(students, dataset, `Pupils in ${cohortName}`, [], [
    `Here are the ${selected.length} ${ordering} ${metricLabel} records for ${cohortName}, from ${cohort.length} matching pupils.`,
    order === "none" ? "These rows follow the loaded record order; no ranking was requested." : "The ranking is based on current loaded grades or attendance, not a prediction.",
  ], cohort, `The question requests actual pupil records ordered by ${metricLabel}.`, `${cohortName}; ${order === "none" ? "source order" : `${order} ${metricLabel}`}`,
  [numberStep("Matching pupils", cohort.length, cohortName), { label: "Displayed records", formula: order === "none" ? "first matching records in source order" : `sort matching records by ${metricLabel}, ${order} first`, inputs: `${cohort.length} matching records; display limit ${limit}`, result: `${selected.length} records` }]);
  result.intent = { intentType: "student_lookup", filters: [], targetMetric: sort };
  result.table = {
    headers: ["Rank", "Pupil name", "Source / roll reference", "Year", "Class", "English", "Mathematics", "Science", "Core average", "Attendance"],
    rows: selected.map((student, index) => [index + 1, student.name || "—", student.sourceRef || student.id, `Y${student.yearGroup}`, student.classGroup, round(subjectScore(student, "english")), round(subjectScore(student, "math")), round(subjectScore(student, "science")), round(avg([subjectScore(student, "english"), subjectScore(student, "math"), subjectScore(student, "science")])), `${student.attendanceRate}%`]),
  };
  return result;
}

export function analyzeAdvice(students: StudentRecord[], plan: AskPlan, files: UploadedFileMeta[] = []): DeterministicResult {
  const dataset = files.map((file) => file.name).join(" + ") || "Active volatile cohort";
  const matches = (student: StudentRecord, target: AskPlan, attendanceAtLeast = false) => {
    if (target.year !== null && student.yearGroup !== target.year) return false;
    if (target.stage === "KS3" && (student.yearGroup < 7 || student.yearGroup > 9)) return false;
    if (target.stage === "KS4" && (student.yearGroup < 10 || student.yearGroup > 11)) return false;
    if (target.gender && student.gender !== target.gender) return false;
    const isSend = student.senStatus || Boolean(student.inclusionSend && student.inclusionSend !== "None");
    if (target.send !== null && isSend !== target.send) return false;
    if (target.emirati !== null && Boolean(student.emiratiStatus) !== target.emirati) return false;
    if (target.attendanceThreshold !== null && (attendanceAtLeast ? student.attendanceRate < target.attendanceThreshold : student.attendanceRate >= target.attendanceThreshold)) return false;
    return true;
  };
  const filterPlan = plan.focus === "attendance" ? { ...plan, attendanceThreshold: null } : plan;
  const cohort = students.filter((student) => matches(student, filterPlan));
  const cohortParts = [filterPlan.year !== null ? `Year ${filterPlan.year}` : filterPlan.stage, filterPlan.gender === "Male" ? "boys" : filterPlan.gender === "Female" ? "girls" : null, filterPlan.send === null ? null : filterPlan.send ? "SEND pupils" : "non-SEND pupils", filterPlan.emirati === null ? null : filterPlan.emirati ? "Emirati pupils" : "non-Emirati pupils", filterPlan.attendanceThreshold === null ? null : `pupils below ${filterPlan.attendanceThreshold}% attendance`].filter(Boolean);
  const cohortName = cohortParts.join(", ") || "the whole school";
  if (cohort.length < 5) {
    return clarificationResult(`${cohort.length} records match ${cohortName}. There is too little evidence to identify a reliable school-level priority.`, students.length, dataset);
  }
  let peerPlan: AskPlan | null = null;
  let peerName = "";
  let attendanceAtLeast = false;
  if (filterPlan.gender) {
    peerPlan = { ...filterPlan, gender: filterPlan.gender === "Male" ? "Female" : "Male" };
    peerName = filterPlan.gender === "Male" ? "girls" : "boys";
  } else if (filterPlan.send !== null) {
    peerPlan = { ...filterPlan, send: !filterPlan.send };
    peerName = filterPlan.send ? "non-SEND pupils" : "SEND pupils";
  } else if (filterPlan.emirati !== null) {
    peerPlan = { ...filterPlan, emirati: !filterPlan.emirati };
    peerName = filterPlan.emirati ? "non-Emirati pupils" : "Emirati pupils";
  } else if (filterPlan.attendanceThreshold !== null) {
    peerPlan = filterPlan;
    attendanceAtLeast = true;
    peerName = `pupils at or above ${filterPlan.attendanceThreshold}% attendance`;
  }
  const peers = peerPlan ? students.filter((student) => matches(student, peerPlan!, attendanceAtLeast)) : [];
  const comparePeers = peers.length >= 5;
  if (plan.focus === "attendance") {
    const threshold = plan.attendanceThreshold ?? 90;
    const below = cohort.filter((student) => student.attendanceRate < threshold).length;
    const rate = pct(below, cohort.length);
    const peerBelow = comparePeers ? peers.filter((student) => student.attendanceRate < threshold).length : 0;
    const peerRate = comparePeers ? pct(peerBelow, peers.length) : 0;
    const findings = [`${below} of ${cohort.length} pupils in ${cohortName} have attendance below ${threshold}% (${rate}%).`];
    if (comparePeers) findings.push(`${peerRate}% of ${peerName} are below the same attendance threshold. The difference is observed, not an explanation of its cause.`);
    findings.push("Review patterns with the attendance team and families before choosing support; attendance figures alone do not establish why pupils are absent.");
    const chart = comparePeers ? [{ label: `Below ${threshold}%`, Cohort: rate, Peers: peerRate }] : [{ label: `Below ${threshold}%`, Count: below }, { label: `At least ${threshold}%`, Count: cohort.length - below }];
    const steps: Step[] = [numberStep("Selected cohort", cohort.length, cohortName), share(`Attendance below ${threshold}%`, below, cohort.length), ...(comparePeers ? [share(`${peerName} below ${threshold}%`, peerBelow, peers.length)] : [])];
    const result = makeResult(students, dataset, comparePeers ? `Persistent absence comparison for ${cohortName}` : `Attendance counts for ${cohortName}`, chart, findings, cohort,
      "The model selected an attendance improvement question. Counts and rates were calculated locally.", cohortName, steps, "label", comparePeers ? ["Cohort", "Peers"] : ["Count"]);
    result.suggestedActions = findings;
    result.kpis = [{ label: "Selected pupils", value: String(cohort.length) }, { label: `Below ${threshold}%`, value: String(below), isPositive: below === 0 }, { label: "Persistent absence", value: `${rate}%`, isPositive: rate < 10 }];
    if (comparePeers && result.verification) {
      result.verification.matchedRecords = cohort.length + peers.length;
      result.verification.cohortRule = `${cohortName} compared with ${peerName}`;
      result.verification.localRecordIds = [...cohort, ...peers].map((student) => student.id);
      result.verification.evidence = table([...cohort, ...peers], Number.POSITIVE_INFINITY);
    }
    return result;
  }
  const allSubjects = [["English", "english"], ["Mathematics", "math"], ["Science", "science"]] as const;
  const subjects = plan.subject && plan.subject !== "All" ? allSubjects.filter(([label]) => label === plan.subject) : allSubjects;
  if (plan.focus === "progress") {
    const termPair = (student: StudentRecord, subject: "english" | "math" | "science"): [number, number] | null => {
      const first = subject === "math" ? student.term1MathGrade : subject === "science" ? student.term1ScienceGrade : student.term1EnglishGrade;
      const second = subject === "math" ? student.term2MathGrade : subject === "science" ? student.term2ScienceGrade : student.term2EnglishGrade;
      return typeof first === "number" && typeof second === "number" && Number.isFinite(first) && Number.isFinite(second) ? [first, second] : null;
    };
    const deltas = subjects.map(([label, subject]) => {
      const cohortValues = cohort.flatMap((student) => { const pair = termPair(student, subject); return pair ? [pair[1] - pair[0]] : []; });
      const peerValues = peers.flatMap((student) => { const pair = termPair(student, subject); return pair ? [pair[1] - pair[0]] : []; });
      return { label, subject, cohortValues, peerValues, cohortDelta: round(avg(cohortValues)), peerDelta: round(avg(peerValues)) };
    }).filter((item) => item.cohortValues.length >= 5);
    if (!deltas.length) {
      return clarificationResult(`I cannot verify progress for ${cohortName} because fewer than five pupils have both prior and current term grades.`, students.length, dataset);
    }
    const compareProgress = comparePeers && deltas.every((item) => item.peerValues.length >= 5);
    const slowest = [...deltas].sort((a, b) => a.cohortDelta - b.cohortDelta)[0];
    const findings = [`${cohortName} have an observed ${slowest.cohortDelta >= 0 ? "+" : ""}${slowest.cohortDelta} grade change in ${slowest.label} between the two loaded terms, the lowest change among the assessed subjects.`];
    if (compareProgress) findings.push(`${peerName} have a ${slowest.peerDelta >= 0 ? "+" : ""}${slowest.peerDelta} grade change in the same subject. The difference is descriptive, not evidence of a cause.`);
    findings.push("Check whether the same pupils have comparable assessments in both terms before deciding on support.");
    const chart = deltas.map((item) => ({ label: item.label, Cohort: item.cohortDelta, ...(compareProgress ? { Peers: item.peerDelta } : {}) }));
    const deltaStep = (label: string, values: number[]): Step => ({ label, formula: "sum of (Term 2 grade - Term 1 grade) / pupils with both terms", inputs: `${round(values.reduce((sum, value) => sum + value, 0))} / ${values.length}`, result: `${round(avg(values))} grades` });
    const steps: Step[] = [numberStep("Selected cohort", cohort.length, cohortName), ...deltas.flatMap((item) => [deltaStep(`${cohortName}: ${item.label} progress`, item.cohortValues), ...(compareProgress ? [deltaStep(`${peerName}: ${item.label} progress`, item.peerValues)] : [])])];
    const result = makeResult(students, dataset, `Observed progress for ${cohortName}`, chart, findings, cohort,
      "The model selected a progress improvement question. Term differences were calculated locally from pupils with both terms recorded.", cohortName, steps, "label", compareProgress ? ["Cohort", "Peers"] : ["Cohort"]);
    result.suggestedActions = findings;
    result.kpis = [{ label: "Selected pupils", value: String(cohort.length) }, { label: `${slowest.label} change`, value: `${slowest.cohortDelta >= 0 ? "+" : ""}${slowest.cohortDelta} grades` }, { label: "With both terms", value: String(slowest.cohortValues.length) }];
    if (result.verification) {
      const used = [...cohort, ...(compareProgress ? peers : [])].filter((student) => deltas.some((item) => termPair(student, item.subject)));
      result.verification.matchedRecords = used.length;
      result.verification.cohortRule = compareProgress ? `${cohortName} compared with ${peerName}; only records with both terms in an assessed subject` : `${cohortName}; only records with both terms in an assessed subject`;
      result.verification.localRecordIds = used.map((student) => student.id);
      result.verification.evidence = {
        headers: ["Anonymous Ref", "Year", "Gender", "SEND", "Math T1", "Math T2", "Science T1", "Science T2", "English T1", "English T2"],
        rows: used.map((student) => [student.id, `Y${student.yearGroup}`, student.gender, student.senStatus ? "SEND" : "None", student.term1MathGrade ?? "—", student.term2MathGrade ?? "—", student.term1ScienceGrade ?? "—", student.term2ScienceGrade ?? "—", student.term1EnglishGrade ?? "—", student.term2EnglishGrade ?? "—"]),
      };
    }
    return result;
  }
  const subjectEvidence = subjects.map(([label, subject]) => {
    const achieved = cohort.filter((student) => subjectScore(student, subject) >= 5).length;
    const peerAchieved = comparePeers ? peers.filter((student) => subjectScore(student, subject) >= 5).length : 0;
    return { label, achieved, rate: pct(achieved, cohort.length), peerAchieved, peerRate: comparePeers ? pct(peerAchieved, peers.length) : 0 };
  });
  const lowest = [...subjectEvidence].sort((a, b) => a.rate - b.rate)[0];
  const absenceCount = cohort.filter((student) => student.attendanceRate < 90).length;
  const absenceRate = pct(absenceCount, cohort.length);
  const findings = [`${cohort.length} records match ${cohortName}. ${lowest.label} has the lowest observed at-or-above-expected rate in this view: ${lowest.rate}%.`];
  if (comparePeers) {
    const gap = round(lowest.rate - lowest.peerRate);
    findings.push(`${cohortName} are ${Math.abs(gap)} percentage points ${gap < 0 ? "below" : "above"} ${peerName} in ${lowest.label} attainment (${lowest.rate}% versus ${lowest.peerRate}%). This is an observed gap, not a cause.`);
  }
  findings.push(`${absenceCount} of these ${cohort.length} pupils (${absenceRate}%) have attendance below 90%. Review this alongside attainment before deciding on an intervention.`);
  const chart = subjectEvidence.map((item) => ({ label: item.label, Cohort: item.rate, ...(comparePeers ? { Peers: item.peerRate } : {}) }));
  const steps: Step[] = [numberStep("Selected cohort", cohort.length, cohortName), ...subjectEvidence.flatMap((item) => [share(`${cohortName}: ${item.label} at or above expected`, item.achieved, cohort.length), ...(comparePeers ? [share(`${peerName}: ${item.label} at or above expected`, item.peerAchieved, peers.length)] : [])]), share("Persistent absence in selected cohort", absenceCount, cohort.length)];
  const result = makeResult(students, dataset, `Current attainment evidence for ${cohortName}`, chart, findings, cohort,
    "The model interpreted an improvement question and selected a cohort. The evidence and arithmetic were calculated locally.", cohortName, steps, "label", comparePeers ? ["Cohort", "Peers"] : ["Cohort"]);
  result.suggestedActions = findings;
  if (comparePeers && result.verification) {
    result.verification.matchedRecords = cohort.length + peers.length;
    result.verification.cohortRule = `${cohortName} compared with ${peerName}`;
    result.verification.localRecordIds = [...cohort, ...peers].map((student) => student.id);
    result.verification.evidence = table([...cohort, ...peers], Number.POSITIVE_INFINITY);
  }
  result.kpis = [
    { label: "Selected pupils", value: String(cohort.length), isPositive: true },
    { label: `${lowest.label} at/above`, value: `${lowest.rate}%`, isPositive: lowest.rate >= 75 },
    { label: "Persistent absence", value: `${absenceRate}%`, isPositive: absenceRate < 10 },
  ];
  return result;
}

export function analyzeStatutoryQuery(students: StudentRecord[], query: string, files: UploadedFileMeta[] = [], readiness = 100): DeterministicResult {
  const lower = query.toLowerCase();
  const dataset = files.map((f) => f.name).join(" + ") || "Active volatile cohort";
  const lookupRequested = !/duplicate|mapping|data quality/.test(lower) && /\b(?:roll(?: number| no)?|student id|pupil id|anonymous ref|source ref)\b|\bstu-[a-z0-9]+\b/i.test(query);
  const containsReference = (reference: string) => {
    const escaped = reference.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i").test(query);
  };
  const lookup = lookupRequested ? students.find((s) => (s.sourceRef && containsReference(s.sourceRef)) || containsReference(s.id)) : undefined;
  if (lookup) {
    return makeResult(students, dataset, "Verified attainment for requested pupil reference",
      ["Math", "Science", "English"].map((label) => ({ label, Attainment: round(subjectScore(lookup, label.toLowerCase() as "math" | "science" | "english")) })),
      [`Reference ${lookup.id} was matched locally across joined source files.`, `Attendance is ${lookup.attendanceRate}% and the current core average is Grade ${round(termTwo(lookup))}.`, "The source roll number remains in volatile memory and is not shown or transmitted."], [lookup],
      "A pupil reference in the question matched one joined record in local memory.", "Exact source or anonymous pupil reference match",
      [mean("Current core grade average", [subjectScore(lookup, "math"), subjectScore(lookup, "science"), subjectScore(lookup, "english")]), ...(["math", "science", "english"] as const).map((subject) => ({ label: `${subject} current grade`, formula: "Current term grade, otherwise normalized subject grade", inputs: lookup.id, result: String(round(subjectScore(lookup, subject))) }))]);
  }
  if (lookupRequested) return clarificationResult("No matching pupil reference was found in the active files. Check the exact roll or student ID and ask again.", students.length, dataset);
  if (/duplicate|grading scale|unmapped|map correctly|data quality/.test(lower)) {
    const duplicates = students.length - new Set(students.map((s) => s.sourceRef || s.id)).size;
    return makeResult(students, dataset, "Ingestion mapping verification", files.map((f) => ({ label: f.name, Records: f.rowCount })),
      [`${students.length} committed records are available with a ${readiness}% readiness score.`, `${duplicates} duplicate pupil references remain after the quality gateway.`, `${files.length} source files were joined in memory with no server upload.`], students,
      "The question requests an ingestion and mapping check.", "All committed records in the active local dataset",
      [numberStep("Committed records", students.length, "count committed pupil records"), numberStep("Duplicate references", duplicates, "record count minus unique pupil reference count"), ...files.map((file) => numberStep(`${file.name} source rows`, file.rowCount, "source file row count")), { label: "Data readiness", formula: "score established by the Data Hub quality gateway", inputs: `${files.length} active source files`, result: `${readiness}%` }], "label", ["Records"]);
  }
  if (/phase|eyfs|primary|secondary|post-16|\bks[1-4]\b|key.stage/.test(lower) && !/borderline|gender|boys|girls/.test(lower)) {
    const phases = [
      ["FS / EYFS", (s: StudentRecord) => s.yearGroup <= 0],
      ["Primary", (s: StudentRecord) => s.yearGroup >= 1 && s.yearGroup <= 6],
      ["Secondary", (s: StudentRecord) => s.yearGroup >= 7 && s.yearGroup <= 11],
      ["Post-16", (s: StudentRecord) => s.yearGroup >= 12],
    ] as const;
    const data = phases.map(([label, test]) => {
      const group = students.filter(test);
      return { label, Attainment: pct(group.filter((s) => termTwo(s) >= 5).length, group.length), "Below Expected": pct(group.filter((s) => termTwo(s) < 5).length, group.length) };
    });
    const populated = data.filter((item) => phases.some(([label, test]) => label === item.label && students.some(test)));
    const strongest = [...populated].sort((a, b) => Number(b.Attainment) - Number(a.Attainment))[0];
    return makeResult(students, dataset, "Phase attainment against DSIB benchmark", populated,
      [strongest ? `${strongest.label} is the strongest evidenced phase at ${strongest.Attainment}% at/above expected.` : "No phase has evidence in this session.", "These are current-cycle distributions; they do not predict future marks.", "A phase with no records has no evidenced rating."], students,
      "The question requests current attainment grouped by school phase.", "All records grouped into FS / EYFS, Primary, Secondary, and Post-16",
      phases.flatMap(([label, test]) => { const group = students.filter(test); const attained = group.filter((s) => termTwo(s) >= 5).length; return [share(`${label} at or above expected`, attained, group.length), share(`${label} below expected`, group.length - attained, group.length)]; }), "label", ["Attainment", "Below Expected"]);
  }
  if (/send|determination|inclusion|wave 2|wave 3/.test(lower)) {
    const send = students.filter((s) => s.senStatus || (s.inclusionSend && s.inclusionSend !== "None"));
    const nonSend = students.filter((s) => !send.includes(s));
    if (!send.length || (!nonSend.length && !/attendance|absence/.test(lower))) return clarificationResult("I cannot compare SEND and non-SEND pupils because one of those cohorts has no records in the loaded data.", students.length, dataset);
    if (/math|science/.test(lower)) {
      const subject = /math/.test(lower) ? "math" : "science";
      const label = subject === "math" ? "Mathematics" : "Science";
      const sendScores = send.map((s) => subjectScore(s, subject));
      const peerScores = nonSend.map((s) => subjectScore(s, subject));
      const sendMean = round(avg(sendScores));
      const peerMean = round(avg(peerScores));
      return makeResult(students, dataset, `${label} attainment by inclusion status`, [{ label: "SEND", Average: sendMean }, { label: "Non-SEND", Average: peerMean }],
        [`SEND pupils average Grade ${sendMean} in current ${label} evidence.`, `Non-SEND pupils average Grade ${peerMean}; the observed difference is ${round(peerMean - sendMean)} grades.`, "The comparison is based on the current loaded cohort."], [...send, ...nonSend],
        `The question requests observed ${label} grades by inclusion status.`, "All SEND pupils compared with all non-SEND pupils",
        [mean(`SEND ${label} mean`, sendScores), mean(`Non-SEND ${label} mean`, peerScores), { label: "Peer difference", formula: "non-SEND mean - SEND mean", inputs: `${peerMean} - ${sendMean}`, result: `${round(peerMean - sendMean)} grades` }], "label", ["Average"]);
    }
    if (/english|literacy/.test(lower)) {
      const sendMean = round(avg(send.map((s) => subjectScore(s, "english"))));
      const peerMean = round(avg(nonSend.map((s) => subjectScore(s, "english"))));
      return makeResult(students, dataset, "English attainment by inclusion status", [{ label: "SEND", Average: sendMean }, { label: "Non-SEND", Average: peerMean }],
        [`SEND pupils average Grade ${sendMean} in current English evidence.`, `Non-SEND pupils average Grade ${peerMean}; the observed difference is ${round(peerMean - sendMean)} grades.`, "The comparison is based on the current loaded cohort."], [...send, ...nonSend],
        "The question requests observed English grades by inclusion status.", "All SEND pupils compared with all non-SEND pupils",
        [mean("SEND English mean", send.map((s) => subjectScore(s, "english"))), mean("Non-SEND English mean", nonSend.map((s) => subjectScore(s, "english"))), { label: "Peer difference", formula: "non-SEND mean − SEND mean", inputs: `${peerMean} − ${sendMean}`, result: `${round(peerMean - sendMean)} grades` }], "label", ["Average"]);
    }
    if (/absence|attendance/.test(lower)) {
      const risk = send.filter((s) => s.attendanceRate < 90);
      if (!risk.length) return clarificationResult("No SEND pupils have attendance below 90% in the loaded data, so there is no absence cohort to compare.", students.length, dataset);
      const data = [{ label: "SEND <90%", Attainment: pct(risk.filter((s) => termTwo(s) >= 5).length, risk.length) }, { label: "All SEND", Attainment: pct(send.filter((s) => termTwo(s) >= 5).length, send.length) }];
      return makeResult(students, dataset, "SEND persistent absence attainment impact", data,
      [`${risk.length} Students of Determination are below 90% attendance.`, `Their at/above-expected rate is ${data[0].Attainment}% versus ${data[1].Attainment}% across all SEND pupils.`, "This overlap belongs in inclusion and personal-development evidence."], send,
        "The question combines SEND status with attendance below 90%.", "All SEND pupils, including those below 90% attendance",
        [numberStep("SEND persistent absence", risk.length, "SEND status AND attendance < 90%"), share("SEND absent cohort at or above expected", risk.filter((s) => termTwo(s) >= 5).length, risk.length), share("All SEND at or above expected", send.filter((s) => termTwo(s) >= 5).length, send.length)]);
    }
    const sendDelta = round(avg(send.map((s) => termTwo(s) - termOne(s))));
    const nonDelta = round(avg(nonSend.map((s) => termTwo(s) - termOne(s))));
    return makeResult(students, dataset, "Current-cycle progress delta by inclusion cohort", [{ label: "SEND", Progress: sendDelta }, { label: "Non-SEND", Progress: nonDelta }],
      [`SEND pupils record a ${sendDelta >= 0 ? "+" : ""}${sendDelta} grade progress delta.`, `Non-SEND pupils record a ${nonDelta >= 0 ? "+" : ""}${nonDelta} grade progress delta.`, `The evidenced inclusion gap is ${round(sendDelta - nonDelta)} grades.`], [...send, ...nonSend],
      "The question compares observed Term 1 to Term 2 progress by inclusion status.", "SEND pupils compared with all non-SEND peers",
      [mean("SEND progress delta", send.map((s) => termTwo(s) - termOne(s))), mean("Non-SEND progress delta", nonSend.map((s) => termTwo(s) - termOne(s))), { label: "Progress gap", formula: "SEND mean progress − non-SEND mean progress", inputs: `${sendDelta} − ${nonDelta}`, result: `${round(sendDelta - nonDelta)} grades` }], "label", ["Progress"]);
  }
  if (/borderline|58%|62%|boundary/.test(lower)) {
    const secondary = students.filter((s) => s.yearGroup >= 7 && s.yearGroup <= 11);
    const borderline = secondary.filter((s) => { const mark = subjectScore(s, "math"); return mark > 9 ? mark >= 58 && mark <= 62 : mark >= 5 && mark <= 5.6; });
    const secure = secondary.filter((s) => subjectScore(s, "math") >= 5.6).length;
    return makeResult(students, dataset, "Secondary Mathematics boundary tracking", [{ label: "Borderline", Count: borderline.length }, { label: "Secure Grade 5+", Count: secure }],
      [`${borderline.length} pupils sit in the configured Mathematics boundary window.`, "Open the local records to inspect the pupils behind both counts.", "Boundary flags use current marks only; no future score is predicted."], secondary,
      "The question requests pupils near the current Mathematics boundary.", "Secondary pupils assessed for Math grade 5–5.6, or percentage mark 58–62 when available",
      [numberStep("Borderline pupils", borderline.length, "count Secondary pupils inside the stated mark window"), numberStep("Above boundary", secure, "count Secondary pupils with Mathematics grade ≥ 5.6")], "label", ["Count"]);
  }
  if (/gender|boys|girls|male|female/.test(lower)) {
    const year = lower.match(/(?:year|y)\s*(\d{1,2})/);
    const stage = /ks3/.test(lower) ? [7, 9] : /ks4/.test(lower) ? [10, 11] : null;
    const cohort = students.filter((s) => year ? s.yearGroup === Number(year[1]) : stage ? s.yearGroup >= stage[0] && s.yearGroup <= stage[1] : true);
    const subject: "math" | "science" | "english" = /math/.test(lower) ? "math" : /english/.test(lower) ? "english" : "science";
    const boys = cohort.filter((s) => s.gender === "Male");
    const girls = cohort.filter((s) => s.gender === "Female");
    if (!boys.length || !girls.length) return clarificationResult("I cannot calculate a gender gap for this year or stage because one of the groups has no records.", students.length, dataset);
    const boysAvg = round(avg(boys.map((s) => subjectScore(s, subject))));
    const girlsAvg = round(avg(girls.map((s) => subjectScore(s, subject))));
    return makeResult(students, dataset, `${subject[0].toUpperCase() + subject.slice(1)} attainment by gender`, [{ label: "Boys", Average: boysAvg }, { label: "Girls", Average: girlsAvg }],
      [`Boys average Grade ${boysAvg}; girls average Grade ${girlsAvg} in the selected cohort.`, `The observed gender gap is ${round(Math.abs(girlsAvg - boysAvg))} grades.`, "The comparison uses current records only."], [...boys, ...girls],
      `The question requests ${subject} grade averages grouped by gender${year ? ` for Year ${year[1]}` : stage ? ` for ${/ks3/.test(lower) ? "KS3" : "KS4"}` : ""}.`, "Pupils with Male or Female gender value in the selected year or stage",
      [mean(`Boys ${subject} mean`, boys.map((s) => subjectScore(s, subject))), mean(`Girls ${subject} mean`, girls.map((s) => subjectScore(s, subject))), { label: "Absolute gender gap", formula: "absolute value of girls mean − boys mean", inputs: `|${girlsAvg} − ${boysAvg}|`, result: `${round(Math.abs(girlsAvg - boysAvg))} grades` }], "label", ["Average"]);
  }
  if (/attendance|absence|below 85|below 90/.test(lower)) {
    const statedThreshold = lower.match(/\b(?:below|under)\s+(\d{1,3})\s*%?/);
    const threshold = statedThreshold && Number(statedThreshold[1]) > 0 && Number(statedThreshold[1]) <= 100 ? Number(statedThreshold[1]) : 90;
    const risk = students.filter((s) => s.attendanceRate < threshold);
    const rest = students.filter((s) => s.attendanceRate >= threshold);
    if (!risk.length || !rest.length) return clarificationResult(`I cannot compare attendance groups at ${threshold}% because one of the groups has no records.`, students.length, dataset);
    const riskRate = pct(risk.filter((s) => termTwo(s) >= 5).length, risk.length);
    const restRate = pct(rest.filter((s) => termTwo(s) >= 5).length, rest.length);
    return makeResult(students, dataset, `Attainment by attendance threshold (${threshold}%)`, [{ label: `Below ${threshold}%`, Attainment: riskRate }, { label: `At least ${threshold}%`, Attainment: restRate }],
      [`${risk.length} of ${students.length} pupils have attendance below ${threshold}%.`, `Their at/above-expected attainment rate is ${riskRate}% versus ${restRate}% for peers at or above ${threshold}%.`, "This is an observed association, not a causal claim."], [...risk, ...rest],
      `The question requests an observed comparison using the ${threshold}% attendance threshold.`, `Pupils below and at or above ${threshold}% attendance`,
      [share("Attendance risk prevalence", risk.length, students.length), share("Below threshold attainment", risk.filter((s) => termTwo(s) >= 5).length, risk.length), share("At or above threshold attainment", rest.filter((s) => termTwo(s) >= 5).length, rest.length)]);
  }
  if (/emirati|national/.test(lower)) {
    const national = students.filter((s) => s.emiratiStatus);
    const peers = students.filter((s) => !s.emiratiStatus);
    if (!national.length || !peers.length) return clarificationResult("I cannot compare Emirati and other pupils because one of those cohorts has no records.", students.length, dataset);
    const nationalRate = pct(national.filter((s) => termTwo(s) >= 5).length, national.length);
    const peersRate = pct(peers.filter((s) => termTwo(s) >= 5).length, peers.length);
    return makeResult(students, dataset, "Emirati cohort attainment", [{ label: "Emirati", Attainment: nationalRate }, { label: "Other pupils", Attainment: peersRate }],
      [`${national.length} Emirati pupils are in the active cohort.`, `Their at/above-expected rate is ${nationalRate}% versus ${peersRate}% for other pupils.`, `The observed gap is ${round(nationalRate - peersRate)} percentage points.`], [...national, ...peers],
      "The question requests attainment by Emirati status.", "Pupils marked Emirati in the committed dataset",
      [share("Emirati attainment", national.filter((s) => termTwo(s) >= 5).length, national.length), share("Other pupil attainment", peers.filter((s) => termTwo(s) >= 5).length, peers.length), { label: "Attainment gap", formula: "Emirati rate − other pupil rate", inputs: `${nationalRate}% − ${peersRate}%`, result: `${round(nationalRate - peersRate)} percentage points` }]);
  }
  if (!/attainment|benchmark|subject|math|science|english|core|school|dsib|grade/.test(lower)) {
    const noReference = /roll|student|pupil|reference|mark/.test(lower);
    const message = noReference
      ? "No matching pupil reference was found in the active files. Check the exact roll or student ID and ask again."
      : "I could not map that question to a verified calculation. Ask about attainment, attendance, SEND, gender, Emirati pupils, phases, or data quality.";
    return {
      intent: { intentType: "general", filters: [], clarificationNeeded: true, clarificationPrompt: message },
      kpis: [], table: table([]), chart: null, highlightedStudents: [],
      filterDescription: "No calculation was run", sourceDataset: dataset, explanation: message,
      suggestedActions: [message],
      verification: { interpretation: "The local query rules could not identify a supported calculation.", cohortRule: "No filter was applied", totalRecords: students.length, matchedRecords: 0, steps: [], evidence: table([]) },
    };
  }
  const subjects = [["English", "english"], ["Mathematics", "math"], ["Science", "science"]] as const;
  const requested = subjects.filter(([label, subject]) => lower.includes(subject) || lower.includes(label.toLowerCase()));
  const selected = requested.length === 1 && !/whole.school|core subjects|across/.test(lower) ? requested : subjects;
  const data = selected.map(([label, subject]) => ({ label, Attainment: pct(students.filter((s) => subjectScore(s, subject) >= 5).length, students.length), "Below Expected": pct(students.filter((s) => subjectScore(s, subject) < 5).length, students.length) }));
  return makeResult(students, dataset, "Core attainment against the 75% DSIB benchmark", data,
    [`${data.filter((s) => s.Attainment >= 75).length} of ${data.length} assessed subject${data.length === 1 ? "" : "s"} meet the 75% DSIB reference.`, `The strongest assessed subject is ${[...data].sort((a, b) => b.Attainment - a.Attainment)[0].label}.`, "All percentages are reproducible from the anonymized evidence ledger."], students,
    "The question requests current core subject attainment against the 75% reference.", "All committed pupils, assessed separately in English, Mathematics, and Science",
    selected.flatMap(([label, subject]) => { const attained = students.filter((s) => subjectScore(s, subject) >= 5).length; return [share(`${label} at or above expected`, attained, students.length), share(`${label} below expected`, students.length - attained, students.length)]; }), "label", ["Attainment", "Below Expected"]);
}
