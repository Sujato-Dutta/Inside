"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSessionData } from "@/context/SessionDataContext";
import { StudentRecord } from "@/types/student-data";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Printer, Upload } from "lucide-react";

const TEMPLATES = ["Full DSIB/ADEK Evidence Pack", "Governors' Strategic Brief", "Inclusion & SEND Gap Audit"] as const;
type Template = (typeof TEMPLATES)[number];
const pct = (part: number, total: number) => total ? Math.round((part / total) * 1000) / 10 : 0;
const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const grade = (student: StudentRecord) => avg([student.term2MathGrade ?? student.mathGrade, student.term2ScienceGrade ?? student.scienceGrade, student.term2EnglishGrade ?? student.englishGrade]);
const progress = (student: StudentRecord) => {
  if ([student.term1MathGrade, student.term1ScienceGrade, student.term1EnglishGrade, student.term2MathGrade, student.term2ScienceGrade, student.term2EnglishGrade].some((value) => value === undefined || value === null)) return null;
  return grade(student) - avg([student.term1MathGrade!, student.term1ScienceGrade!, student.term1EnglishGrade!]);
};
const observedProgress = (students: StudentRecord[]) => students.map(progress).filter((value): value is number => value !== null);
const signed = (value: number, decimals = 1) => `${value > 0 ? "+" : ""}${value.toFixed(decimals)}`;

type RateRow = { label: string; count: number; reached: number; rate: number };
type Metrics = {
  total: number; assessedCount: number; attained: number; attainment: number;
  persistentCount: number; persistent: number; severeCount: number;
  absentAttainment: number; absentAttained: number; attendingAttainment: number; attendingCount: number; attendingAttained: number;
  sendCount: number; peerCount: number; sendAttained: number; peerAttained: number;
  sendRate: number; peerRate: number; sendDelta: number; peerDelta: number; sendProgressCount: number; peerProgressCount: number;
  sendAbsentCount: number; sendAbsentAttained: number; sendAbsentRate: number; sendPresentAttained: number; sendPresentRate: number;
  stages: RateRow[]; subjects: RateRow[];
};
type MetricCard = { label: string; value: string; note: string };
type Visual =
  | { kind: "bars"; title: string; rows: RateRow[]; benchmark?: number; note: string }
  | { kind: "metrics"; title: string; cards: MetricCard[]; note: string }
  | { kind: "steps"; title: string; items: { title: string; detail: string }[]; note: string }
  | { kind: "evidence"; title: string; rows: { label: string; value: string }[]; note: string }
  | { kind: "signoff"; title: string; fingerprint: string; note: string };
type BriefPage = {
  title: string; eyebrow: string; headline: string; intro: string;
  visual: Visual;
  insights: { label: string; text: string }[];
  recommendation?: string;
};

function buildMetrics(students: StudentRecord[]): Metrics {
  const total = students.length;
  const assessed = students.filter((student) => grade(student) > 0);
  const attained = assessed.filter((student) => grade(student) >= 5).length;
  const absent = students.filter((student) => student.attendanceRate < 90);
  const attending = students.filter((student) => student.attendanceRate >= 90);
  const send = students.filter((student) => student.senStatus || (student.inclusionSend && student.inclusionSend !== "None"));
  const peers = students.filter((student) => !student.senStatus && (!student.inclusionSend || student.inclusionSend === "None"));
  const sendAbsent = send.filter((student) => student.attendanceRate < 90);
  const sendPresent = send.filter((student) => student.attendanceRate >= 90);
  const sendProgress = observedProgress(send);
  const peerProgress = observedProgress(peers);
  const absentAttained = absent.filter((student) => grade(student) >= 5).length;
  const attendingAttained = attending.filter((student) => grade(student) >= 5).length;
  const sendAbsentAttained = sendAbsent.filter((student) => grade(student) >= 5).length;
  const sendPresentAttained = sendPresent.filter((student) => grade(student) >= 5).length;
  const stageDefs = [["KS1", 1, 2], ["KS2", 3, 6], ["KS3", 7, 9], ["KS4", 10, 11], ["Post-16", 12, 14]] as const;
  const stages = stageDefs.map(([label, from, to]) => {
    const cohort = assessed.filter((student) => student.yearGroup >= from && student.yearGroup <= to);
    const reached = cohort.filter((student) => grade(student) >= 5).length;
    return { label, count: cohort.length, reached, rate: pct(reached, cohort.length) };
  });
  const subjectDefs = [["English", (student: StudentRecord) => student.term2EnglishGrade ?? student.englishGrade], ["Mathematics", (student: StudentRecord) => student.term2MathGrade ?? student.mathGrade], ["Science", (student: StudentRecord) => student.term2ScienceGrade ?? student.scienceGrade]] as const;
  const subjects = subjectDefs.map(([label, current]) => {
    const reached = assessed.filter((student) => current(student) >= 5).length;
    return { label, count: assessed.length, reached, rate: pct(reached, assessed.length) };
  });
  return {
    total, assessedCount: assessed.length, attained, attainment: pct(attained, assessed.length),
    persistentCount: absent.length, persistent: pct(absent.length, total),
    severeCount: students.filter((student) => student.attendanceRate < 85).length,
    absentAttainment: pct(absentAttained, absent.filter((student) => grade(student) > 0).length), absentAttained,
    attendingAttainment: pct(attendingAttained, attending.filter((student) => grade(student) > 0).length), attendingAttained,
    attendingCount: attending.length,
    sendCount: send.length, peerCount: peers.length,
    sendAttained: send.filter((student) => grade(student) >= 5).length,
    peerAttained: peers.filter((student) => grade(student) >= 5).length,
    sendRate: pct(send.filter((student) => grade(student) >= 5).length, send.filter((student) => grade(student) > 0).length),
    peerRate: pct(peers.filter((student) => grade(student) >= 5).length, peers.filter((student) => grade(student) > 0).length),
    sendDelta: avg(sendProgress), peerDelta: avg(peerProgress),
    sendProgressCount: sendProgress.length, peerProgressCount: peerProgress.length,
    sendAbsentCount: sendAbsent.length, sendAbsentAttained, sendAbsentRate: pct(sendAbsentAttained, sendAbsent.length),
    sendPresentAttained, sendPresentRate: pct(sendPresentAttained, sendPresent.length),
    stages, subjects,
  };
}

function buildPages(template: Template, m: Metrics, sources: string[], readiness: number, hash: string): BriefPage[] {
  const populated = m.stages.filter((stage) => stage.count > 0);
  const strongest = [...populated].sort((a, b) => b.rate - a.rate)[0];
  const weakest = [...populated].sort((a, b) => a.rate - b.rate)[0];
  const sendGap = m.sendRate - m.peerRate;
  const progressGap = m.sendDelta - m.peerDelta;
  const sendProgress = m.sendProgressCount > 0;
  const progressComparison = sendProgress && m.peerProgressCount > 0;
  const attendanceGap = m.attendingAttainment - m.absentAttainment;
  const attainmentReading = m.attainment >= 75 ? "meets" : "is below";
  const phaseReading = weakest ? `${weakest.label} is the lowest measured stage at ${weakest.rate}%.` : "No Key Stage contains enough records for a comparison.";
  const sendReading = m.sendCount ? `${m.sendCount} SEND pupils are represented in this cohort.` : "No SEND pupils are identified in the current cohort.";
  const attendanceReading = m.persistentCount ? `${m.persistentCount} pupils have attendance below 90%.` : "No pupils are below the 90% attendance threshold.";
  const stageBars: Visual = { kind: "bars", title: "At or above expected, by Key Stage", rows: m.stages, benchmark: 75, note: "The marker shows the 75% reference. Empty stages are shown as no data." };
  const subjectBars: Visual = { kind: "bars", title: "Core subject attainment", rows: m.subjects, benchmark: 75, note: "Each bar uses the same current cohort, with Grade 5 or above counted as at expected." };
  const inclusionBars: Visual = { kind: "bars", title: "At or above expected, by inclusion status", rows: [{ label: "SEND", count: m.sendCount, reached: m.sendAttained, rate: m.sendRate }, { label: "Non-SEND", count: m.peerCount, reached: m.peerAttained, rate: m.peerRate }], benchmark: 75, note: "These are current attainment rates, not predicted outcomes." };
  const attendanceBars: Visual = { kind: "bars", title: "Attainment by attendance group", rows: [{ label: "Below 90%", count: m.persistentCount, reached: m.absentAttained, rate: m.absentAttainment }, { label: "90% or above", count: m.attendingCount, reached: m.attendingAttained, rate: m.attendingAttainment }], note: "An observed difference does not establish that attendance caused a grade change." };
  const progressCards: Visual = { kind: "metrics", title: "Observed progress, Term 1 to Term 2", cards: [
    { label: "SEND pupils", value: m.sendProgressCount ? signed(m.sendDelta, 2) : "No data", note: `${m.sendProgressCount} pupils with two term results` },
    { label: "Other pupils", value: m.peerProgressCount ? signed(m.peerDelta, 2) : "No data", note: `${m.peerProgressCount} pupils with two term results` },
    { label: "Difference", value: m.sendProgressCount && m.peerProgressCount ? signed(progressGap, 2) : "No data", note: "SEND mean minus other pupil mean" },
  ], note: "A positive value indicates an observed increase in the average core grade." };
  const assurance: Visual = { kind: "evidence", title: "Evidence and calculation record", rows: [
    { label: "Sources", value: sources.length ? sources.join(", ") : "Current session cohort" },
    { label: "Records", value: `${m.total} joined pupils` },
    { label: "Data readiness", value: `${readiness}% from the Data Hub` },
    { label: "Attainment method", value: `${m.attained} of ${m.assessedCount} pupils with core results reached Grade 5 or above` },
    { label: "Attendance method", value: `${m.persistentCount} of ${m.total} pupils were below 90% attendance` },
    { label: "Dataset fingerprint", value: hash },
  ], note: "This fingerprint identifies the active dataset used to make this briefing." };

  if (template === TEMPLATES[0]) return [
    { eyebrow: "Inspection evidence · 01", title: "Executive summary", headline: `${m.attainment}% of pupils are at or above the expected core grade.`, intro: `The current result ${attainmentReading} the school's internal 75% reference. This briefing brings together the strongest inspection signals from ${m.total} joined pupil records.`, visual: { kind: "metrics", title: "The school at a glance", cards: [{ label: "Attainment", value: `${m.attainment}%`, note: `${m.attained} of ${m.assessedCount} assessed pupils` }, { label: "Persistent absence", value: `${m.persistent}%`, note: `${m.persistentCount} pupils below 90%` }, { label: "SEND progress", value: sendProgress ? signed(m.sendDelta, 2) : "No data", note: `${m.sendProgressCount} pupils with two term results` }], note: "Every number is drawn from the current session, with no forecast added." }, insights: [{ label: "Attainment", text: `${m.attained} pupils reach the current Grade 5 equivalent.` }, { label: "Stage focus", text: phaseReading }], recommendation: weakest && weakest.rate < 75 ? `Review ${weakest.label} evidence first; it is the lowest measured stage.` : "Document the evidence supporting each stage before inspection." },
    { eyebrow: "Inspection evidence · 02", title: "Attainment by Key Stage", headline: weakest ? `${weakest.label} needs the closest review.` : "Stage coverage is limited.", intro: "The chart shows where current attainment is strongest and where the inspection conversation may need more evidence.", visual: stageBars, insights: [{ label: "Highest measured stage", text: strongest ? `${strongest.label}: ${strongest.rate}% across ${strongest.count} pupils.` : "No stage is populated." }, { label: "Lowest measured stage", text: phaseReading }], recommendation: weakest && weakest.rate < 75 ? `Check the subject mix and assessment evidence in ${weakest.label} before the next review.` : "Keep current stage evidence ready for the inspection narrative." },
    { eyebrow: "Inspection evidence · 03", title: "Core subject picture", headline: `${m.subjects.filter((subject) => subject.rate >= 75).length} of 3 core subjects meet the 75% reference.`, intro: "English, Mathematics, and Science are shown side by side, using the same pupil population and grade threshold.", visual: subjectBars, insights: [{ label: "Strongest subject", text: `${[...m.subjects].sort((a, b) => b.rate - a.rate)[0].label} has the highest current rate.` }, { label: "Evidence base", text: `${m.assessedCount} assessed pupils are included in each subject calculation.` }], recommendation: "Use the lowest subject bar to guide the next moderation or curriculum review." },
    { eyebrow: "Inspection evidence · 04", title: "Inclusion and progress", headline: sendProgress ? `SEND pupils show ${signed(m.sendDelta, 2)} grades of observed progress.` : "SEND progress needs two term results.", intro: "Progress is the change in each pupil's average core grade from Term 1 to Term 2, then averaged by group.", visual: progressCards, insights: [{ label: "SEND cohort", text: `${m.sendProgressCount} SEND pupils have complete two-term results.` }, { label: "Comparison", text: progressComparison ? `The SEND progress difference from peers is ${signed(progressGap, 2)} grades.` : "A peer comparison needs two-term results in both groups." }], recommendation: progressComparison && progressGap < 0 ? "Review support plans for pupils whose current progress trails peers." : "Keep individual support evidence alongside this cohort summary." },
    { eyebrow: "Inspection evidence · 05", title: "Attendance and risk", headline: `${m.persistent}% of pupils are persistently absent.`, intro: "The attendance threshold is below 90%. The comparison underneath shows observed attainment in both attendance groups.", visual: attendanceBars, insights: [{ label: "Pupils affected", text: attendanceReading }, { label: "Attainment difference", text: m.persistentCount && m.attendingCount ? `${Math.abs(attendanceGap).toFixed(1)} percentage points separate the two groups.` : "Both attendance groups are needed for a comparison." }], recommendation: m.persistentCount ? `Prioritize attendance review for the ${m.severeCount} pupils below 85%.` : "Continue monitoring attendance alongside current attainment." },
    { eyebrow: "Inspection evidence · 06", title: "Assurance and sign-off", headline: "The evidence is ready for a leadership review.", intro: "These are the sources, rules, and record counts behind the figures. Signatures can be added after the briefing is checked.", visual: assurance, insights: [{ label: "Method", text: "All measures were calculated locally from the committed cohort." }, { label: "Scope", text: "Names and source pupil IDs do not appear in this dossier." }], recommendation: "Principal and Chair of Governors: review the evidence and sign the printed copy if approved." },
  ];

  if (template === TEMPLATES[1]) return [
    { eyebrow: "Governors' briefing · 01", title: "Executive summary", headline: m.attainment >= 75 ? "The school meets the current attainment reference." : "Attainment is below the current reference.", intro: `${m.attainment}% of pupils meet the expected core grade, compared with the 75% reference. The next pages focus on the decisions this evidence may support.`, visual: { kind: "metrics", title: "Three figures for the board", cards: [{ label: "Current attainment", value: `${m.attainment}%`, note: `${m.attained} of ${m.assessedCount} assessed pupils` }, { label: "Gap to reference", value: signed(m.attainment - 75), note: "Percentage points against 75%" }, { label: "Persistent absence", value: `${m.persistent}%`, note: `${m.persistentCount} pupils` }], note: "These are observed current-cycle results, not projections." }, insights: [{ label: "Performance", text: `The attainment result ${attainmentReading} the reference.` }, { label: "Immediate watch", text: attendanceReading }], recommendation: weakest && weakest.rate < 75 ? `Ask leadership for a short improvement update on ${weakest.label} at the next board meeting.` : "Ask leadership to bring the supporting stage evidence to the next board meeting." },
    { eyebrow: "Governors' briefing · 02", title: "Where performance is strong", headline: strongest ? `${strongest.label} leads at ${strongest.rate}%.` : "A strongest stage cannot yet be identified.", intro: "This page isolates the strongest current Key Stage result so governors can see what is working in the loaded evidence.", visual: stageBars, insights: [{ label: "Cohort size", text: strongest ? `${strongest.count} pupils are represented in ${strongest.label}.` : "No populated stage is available." }, { label: "Whole school", text: `The overall rate is ${m.attainment}% across ${m.assessedCount} assessed pupils.` }], recommendation: strongest ? `Ask what practice in ${strongest.label} can be documented and shared across phases.` : "Request complete phase data before drawing a conclusion." },
    { eyebrow: "Governors' briefing · 03", title: "Where attention is needed", headline: phaseReading, intro: "The lowest current stage is a place to ask focused questions. It is not, on its own, a judgement about teaching quality.", visual: { kind: "metrics", title: "The size of the issue", cards: [{ label: "Lowest stage", value: weakest ? `${weakest.rate}%` : "No data", note: weakest ? `${weakest.label}, ${weakest.count} pupils` : "No populated stage" }, { label: "Whole school", value: `${m.attainment}%`, note: "All current pupils" }, { label: "Reference", value: "75%", note: "Attainment comparison line" }], note: "Stage rates should be read alongside cohort size and assessment coverage." }, insights: [{ label: "Question for leadership", text: weakest ? `What explains the ${weakest.label} result in the current evidence?` : "What data is missing by phase?" }, { label: "Coverage", text: `${populated.length} of 5 stages have records.` }], recommendation: weakest ? `Request a concise ${weakest.label} action update with measures of progress.` : "Request a complete phase breakdown." },
    { eyebrow: "Governors' briefing · 04", title: "Equity and inclusion", headline: progressComparison ? `SEND progress differs from peers by ${signed(progressGap, 2)} grades.` : "Two-term evidence is needed for a progress comparison.", intro: "The board can use this observed comparison to ask whether support is reaching the pupils who need it.", visual: progressCards, insights: [{ label: "Representation", text: `${m.sendProgressCount} SEND pupils and ${m.peerProgressCount} peers have two-term results.` }, { label: "Interpretation", text: "A cohort average does not replace review of individual support plans." }], recommendation: progressComparison && progressGap < 0 ? "Ask for an update on targeted support and its current-cycle evidence." : "Keep inclusion outcomes visible in the regular board review." },
    { eyebrow: "Governors' briefing · 05", title: "Board priorities", headline: "Three focused questions for the next meeting.", intro: "These actions are drawn from the current attainment, attendance, and inclusion picture.", visual: { kind: "steps", title: "Suggested agenda", items: [{ title: "1. Attainment", detail: weakest ? `Review ${weakest.label} at ${weakest.rate}% and agree what evidence will show improvement.` : "Confirm which phases need a complete data return." }, { title: "2. Attendance", detail: `Review support for ${m.persistentCount} pupils below 90% attendance.` }, { title: "3. Inclusion", detail: sendProgress ? `Review observed SEND progress of ${signed(m.sendDelta, 2)} grades with the Head of Inclusion.` : "Confirm whether two-term inclusion data is available." }], note: "These are review prompts, not automated decisions." }, insights: [{ label: "Ownership", text: "Assign one named leader and a review date to each agreed action." }, { label: "Follow-up", text: "Check the next data cycle against the same measures." }], recommendation: "Record decisions and owners in the governance minutes." },
    { eyebrow: "Governors' briefing · 06", title: "Decision record", headline: "Close the loop with an accountable decision.", intro: "Use this page to record that the briefing has been reviewed and to confirm any actions taken by the board.", visual: { kind: "signoff", title: "Governance acknowledgement", fingerprint: hash, note: "Signature fields are deliberately blank until an authorized leader signs the printed report." }, insights: [{ label: "Evidence", text: `${m.total} joined records from ${sources.length || 1} active source set${sources.length === 1 ? "" : "s"}.` }, { label: "Data check", text: `Data Hub readiness is ${readiness}%.` }], recommendation: "Minute any decisions separately; this briefing records the evidence reviewed." },
  ];

  return [
    { eyebrow: "Inclusion audit · 01", title: "Executive summary", headline: m.sendCount ? `${m.sendCount} SEND pupils are represented in this review.` : "No SEND pupils are identified in the current records.", intro: "This briefing looks at current attainment, observed progress, and attendance for Students of Determination alongside their peers.", visual: { kind: "metrics", title: "Inclusion at a glance", cards: [{ label: "SEND attainment", value: m.sendCount ? `${m.sendRate}%` : "No data", note: `${m.sendAttained} of ${m.sendCount} pupils` }, { label: "SEND progress", value: sendProgress ? signed(m.sendDelta, 2) : "No data", note: `${m.sendProgressCount} pupils with two term results` }, { label: "Below 90% attendance", value: String(m.sendAbsentCount), note: "Pupils in the SEND cohort" }], note: "Comparisons are made from current records only." }, insights: [{ label: "Attainment gap", text: m.sendCount && m.peerCount ? `The SEND rate is ${Math.abs(sendGap).toFixed(1)} points ${sendGap < 0 ? "below" : "above"} the peer rate.` : "Both cohorts are needed for a comparison." }, { label: "Progress gap", text: progressComparison ? `Observed progress differs by ${Math.abs(progressGap).toFixed(2)} grades.` : "Two-term results are needed for a progress comparison." }], recommendation: m.sendCount ? "Review these cohort signals alongside individual support plans." : "Check that SEND status is present in the uploaded files." },
    { eyebrow: "Inclusion audit · 02", title: "Current attainment gap", headline: m.sendCount && m.peerCount ? `${Math.abs(sendGap).toFixed(1)} points separate SEND pupils and peers.` : "An attainment gap cannot yet be calculated.", intro: "The same expected-grade threshold is applied to both groups. This view shows the size of the current difference.", visual: inclusionBars, insights: [{ label: "SEND pupils", text: `${m.sendAttained} of ${m.sendCount} are at or above expected.` }, { label: "Other pupils", text: `${m.peerAttained} of ${m.peerCount} are at or above expected.` }], recommendation: m.sendCount && m.peerCount && sendGap < 0 ? "Inspect subject and year-group patterns before choosing targeted support." : "Continue checking whether the current gap changes with the next assessment cycle." },
    { eyebrow: "Inclusion audit · 03", title: "Progress over two terms", headline: sendProgress ? `SEND pupils changed by ${signed(m.sendDelta, 2)} grades on average.` : "Progress needs two term results.", intro: "Inside compares each pupil's Term 2 core average with their Term 1 core average, then calculates the mean change for each group.", visual: progressCards, insights: [{ label: "SEND direction", text: sendProgress ? `The observed change is ${m.sendDelta >= 0 ? "positive" : "negative"} for ${m.sendProgressCount} SEND pupils.` : "No two-term SEND measure is available." }, { label: "Peer comparison", text: progressComparison ? `The SEND-to-peer difference is ${signed(progressGap, 2)} grades.` : "A peer comparison needs two-term results in both groups." }], recommendation: progressComparison && progressGap < 0 ? "Review which support plans correspond to the weaker observed progress." : "Document the practices behind the current progress pattern." },
    { eyebrow: "Inclusion audit · 04", title: "Attendance overlap", headline: `${m.sendAbsentCount} SEND pupils are below 90% attendance.`, intro: "Attendance and attainment are shown together to help the inclusion team identify pupils who may need a coordinated review.", visual: { kind: "bars", title: "Attainment within the SEND cohort", rows: [{ label: "Below 90% attendance", count: m.sendAbsentCount, reached: m.sendAbsentAttained, rate: m.sendAbsentRate }, { label: "90% or above", count: m.sendCount - m.sendAbsentCount, reached: m.sendPresentAttained, rate: m.sendPresentRate }], note: "An association between attendance and attainment does not prove cause." }, insights: [{ label: "Overlap", text: m.sendAbsentCount ? `${m.sendAbsentCount} of ${m.sendCount} SEND pupils are in the attendance risk group.` : "No SEND pupils are below the threshold." }, { label: "Observed attainment", text: m.sendAbsentCount ? `${m.sendAbsentRate}% of that group are at or above expected.` : "There is no risk group to compare." }], recommendation: m.sendAbsentCount ? "Coordinate attendance and support-plan reviews for the affected pupils." : "Keep attendance checks in the regular inclusion review." },
    { eyebrow: "Inclusion audit · 05", title: "Support priorities", headline: "Turn the evidence into a focused review.", intro: "The current data points to three practical checks for the inclusion team. These are prompts for professional judgement.", visual: { kind: "steps", title: "Recommended review sequence", items: [{ title: "1. Confirm the cohort", detail: `Check that all ${m.sendCount} identified SEND pupils have complete assessment and attendance records.` }, { title: "2. Review the gap", detail: m.sendCount && m.peerCount ? `Explore the ${Math.abs(sendGap).toFixed(1)} point attainment difference by subject and year group.` : "Add peer data before interpreting a gap." }, { title: "3. Join up support", detail: `Review attendance plans for the ${m.sendAbsentCount} SEND pupils below 90%.` }], note: "No individual support decision is made automatically by this report." }, insights: [{ label: "Current cycle", text: "Use the same definitions when checking the next data return." }, { label: "Individual context", text: "Pair cohort figures with the pupil's documented provision." }], recommendation: "Assign an owner and review date to each action selected by the Head of Inclusion." },
    { eyebrow: "Inclusion audit · 06", title: "Evidence and sign-off", headline: "A traceable record for the inclusion review.", intro: "The final page records the source set and calculation rules behind this audit. Signatures can be added after the team checks it.", visual: assurance, insights: [{ label: "Scope", text: sendReading }, { label: "Privacy", text: "Names and source pupil IDs are excluded from the printed report." }], recommendation: "Head of Inclusion and Principal: review the findings and sign the printed copy if approved." },
  ];
}

function VisualPanel({ visual }: { visual: Visual }) {
  return <section className="flex min-h-[300px] flex-col rounded-2xl border border-[#DEE3EA] bg-[#F8FAFC] p-5 sm:p-6">
    <h3 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#405168]">{visual.title}</h3>
    {visual.kind === "bars" && <div className="my-auto space-y-4 py-5">{visual.rows.map((row) => <div key={row.label}><div className="mb-1.5 flex items-baseline justify-between gap-3"><span className="text-sm font-bold text-[#17253B]">{row.label}</span><span className="text-sm font-black text-orange-700">{row.count ? `${row.rate}%` : "No data"}</span></div><div className="relative h-5 overflow-hidden rounded-full bg-[#E4E9F0]"><div className="absolute inset-y-0 left-0 rounded-full bg-orange-500" style={{ width: `${row.rate}%` }} />{visual.benchmark !== undefined && <div className="absolute inset-y-0 border-l-2 border-dashed border-[#2865A5]" style={{ left: `${visual.benchmark}%` }} />}</div><p className="mt-1 text-[11px] text-[#657185]">{row.reached} of {row.count} pupils</p></div>)}</div>}
    {visual.kind === "metrics" && <div className="my-auto grid gap-3 py-6 sm:grid-cols-3">{visual.cards.map((card) => <div key={card.label} className="flex min-h-40 flex-col justify-between rounded-xl bg-white p-5 shadow-sm"><p className="text-[11px] font-extrabold uppercase tracking-wide text-[#657185]">{card.label}</p><p className="text-3xl font-black tracking-tight text-[#17253B]">{card.value}</p><p className="text-xs leading-snug text-[#5C6470]">{card.note}</p></div>)}</div>}
    {visual.kind === "steps" && <div className="my-auto grid gap-3 py-5">{visual.items.map((item) => <div key={item.title} className="grid gap-1 rounded-xl bg-white px-5 py-4 sm:grid-cols-[9rem_1fr] sm:items-center"><p className="text-sm font-extrabold text-orange-700">{item.title}</p><p className="text-sm leading-relaxed text-[#354255]">{item.detail}</p></div>)}</div>}
    {visual.kind === "evidence" && <div className="my-auto grid gap-2 py-4">{visual.rows.map((row) => <div key={row.label} className="grid gap-1 border-b border-[#E0E6ED] py-2 last:border-0 sm:grid-cols-[9rem_1fr]"><p className="text-[11px] font-extrabold uppercase tracking-wide text-[#657185]">{row.label}</p><p className="break-all text-xs font-semibold leading-relaxed text-[#17253B]">{row.value}</p></div>)}</div>}
    {visual.kind === "signoff" && <div className="my-auto space-y-8 py-8"><div className="grid gap-6 sm:grid-cols-2"><div className="border-t-2 border-[#17253B] pt-4"><p className="text-base font-extrabold">Principal / Head</p><p className="mt-2 text-xs text-[#657185]">Signature and date</p></div><div className="border-t-2 border-[#17253B] pt-4"><p className="text-base font-extrabold">Chair of Governors</p><p className="mt-2 text-xs text-[#657185]">Signature and date</p></div></div><div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold uppercase text-[#657185]">Dataset fingerprint</p><p className="mt-1 break-all font-mono text-[10px] text-[#354255]">{visual.fingerprint}</p></div></div>}
    <p className="border-t border-[#DEE3EA] pt-3 text-xs leading-relaxed text-[#657185]">{visual.note}</p>
  </section>;
}

function ReportSheet({ content, page, total, template }: { content: BriefPage; page: number; total: number; template: Template }) {
  return <article className="inside-report-sheet flex min-h-[970px] flex-col overflow-hidden rounded-2xl border border-[#DAD3C7] bg-white shadow-lg shadow-stone-200/40">
    <div className="flex items-center justify-between bg-[#17253B] px-8 py-5 text-white sm:px-10"><span className="text-lg font-extrabold tracking-tight">Inside</span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#CCD7E5]">{template}</span></div>
    <div className="flex flex-1 flex-col gap-5 px-8 pb-9 pt-7 sm:px-10">
      <header className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-orange-700">{content.eyebrow}</p><h2 className="mt-2 text-[28px] font-black leading-tight tracking-tight text-[#17253B]">{content.title}</h2></div><span className="shrink-0 rounded-lg bg-[#F1F3F7] px-3 py-2 text-xs font-extrabold text-[#17253B]">{String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}</span></header>
      {page === 1 && <p className="rounded-lg bg-orange-50 px-4 py-2 text-xs text-orange-900">Grade 5 and 75% are school screening references, not official UAE inspection thresholds. Official judgements require wider framework evidence.</p>}
      <div className="rounded-2xl bg-[#17253B] px-6 py-6 text-white"><h3 className="max-w-[38rem] text-[25px] font-black leading-tight tracking-tight">{content.headline}</h3><p className="mt-3 max-w-[38rem] text-[13px] leading-relaxed text-[#DDE5F0]">{content.intro}</p></div>
      <div className="flex-1"><VisualPanel visual={content.visual} /></div>
      <div className="grid gap-3 sm:grid-cols-2">{content.insights.map((insight) => <div key={insight.label} className="rounded-xl border border-[#E6E0D6] bg-[#FBF8F2] px-4 py-4"><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">{insight.label}</p><p className="mt-2 text-[13px] leading-relaxed text-[#37332D]">{insight.text}</p></div>)}</div>
      {page === 6 && content.visual.kind === "evidence" && <div className="grid gap-5 pt-3 sm:grid-cols-2"><div className="border-t-2 border-[#17253B] pt-3"><p className="text-sm font-extrabold">Principal / Head</p><p className="mt-1 text-xs text-[#657185]">Signature and date</p></div><div className="border-t-2 border-[#17253B] pt-3"><p className="text-sm font-extrabold">{template === TEMPLATES[2] ? "Head of Inclusion" : "Chair of Governors"}</p><p className="mt-1 text-xs text-[#657185]">Signature and date</p></div></div>}
      {content.recommendation && <div className="border-l-4 border-orange-500 bg-orange-50 px-5 py-4"><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Recommended next step</p><p className="mt-1 text-[13px] leading-relaxed text-[#37332D]">{content.recommendation}</p></div>}
    </div>
  </article>;
}

export default function ReportsPage() {
  const { students, activeFiles, readinessScore, prefilledReportTemplate, setPrefilledReportTemplate } = useSessionData();
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [page, setPage] = useState(1);
  const [redact, setRedact] = useState(true);
  const [hash, setHash] = useState("SHA-256: calculating...");

  useEffect(() => {
    if (!prefilledReportTemplate) return;
    setTemplate(/send|inclusion/i.test(prefilledReportTemplate) ? TEMPLATES[2] : /governor/i.test(prefilledReportTemplate) ? TEMPLATES[1] : TEMPLATES[0]);
    setPage(1);
    setPrefilledReportTemplate("");
  }, [prefilledReportTemplate, setPrefilledReportTemplate]);

  useEffect(() => {
    let live = true;
    const payload = students.map((student) => [student.id, student.yearGroup, student.attendanceRate, student.mathGrade, student.scienceGrade, student.englishGrade, student.term1MathGrade, student.term1ScienceGrade, student.term1EnglishGrade, student.term2MathGrade, student.term2ScienceGrade, student.term2EnglishGrade, student.senStatus].join("|")).join(";");
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)).then((digest) => {
      if (live) setHash("SHA-256: " + Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase());
    });
    return () => { live = false; };
  }, [students]);

  const metrics = useMemo(() => buildMetrics(students), [students]);
  const pages = useMemo(() => buildPages(template, metrics, activeFiles.map((file) => file.name), readinessScore, hash), [template, metrics, activeFiles, readinessScore, hash]);

  const print = () => {
    const oldTitle = document.title;
    document.title = `Inside - ${template}`;
    window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true });
    window.print();
  };
  const exportCsv = () => {
    const escapeCell = (value: string | number) => {
      const raw = String(value);
      const safe = /^[=+\-@]/.test(raw) ? "'" + raw : raw;
      return '"' + safe.replace(/"/g, '""') + '"';
    };
    const headers = [...(redact ? [] : ["Anonymous Ref"]), "Year", "Section", "Attendance", "Math", "Science", "English", "SEND"];
    const rows = students.map((student) => [...(redact ? [] : [student.id]), student.yearGroup, student.classGroup, student.attendanceRate, student.mathGrade, student.scienceGrade, student.englishGrade, student.inclusionSend || "None"].map(escapeCell).join(","));
    const csv = [headers.map(escapeCell).join(","), ...rows].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "inside_verified_summary.csv"; link.click(); URL.revokeObjectURL(url);
  };

  if (!students.length) return <div className="mx-auto max-w-xl py-20 text-center"><FileText className="mx-auto h-12 w-12 text-orange-600" /><h1 className="mt-4 text-2xl font-extrabold">Add evidence before creating a report</h1><p className="mt-2 text-sm text-[#5C5852]">Upload and validate your school files in the Data Hub first.</p><Link href="/app/data" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white"><Upload className="h-4 w-4" />Open Data Hub</Link></div>;

  return <div className="space-y-7 pb-16">
    <div className="flex flex-col gap-4 border-b border-[#E3DED4] pb-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-600"><FileText className="h-3.5 w-3.5" />Executive report builder</div><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Reports</h1><p className="mt-1 text-sm text-[#5C5852]">Choose a briefing, review its six pages, then print or save the selected report as a PDF.</p></div><div className="flex flex-wrap gap-2"><Button variant="primary" onClick={print} icon={<Download className="h-4 w-4" />}>Save selected PDF</Button><Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export summary CSV</Button><Button variant="secondary" onClick={print} icon={<Printer className="h-4 w-4" />}>Print report</Button></div></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div><div className="inside-report-preview"><ReportSheet content={pages[page - 1]} page={page} total={pages.length} template={template} /></div><div className="inside-report-print" aria-hidden="true">{pages.map((content, index) => <ReportSheet key={`${template}-${index}`} content={content} page={index + 1} total={pages.length} template={template} />)}</div><div className="mt-4 flex items-center justify-between"><Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)} icon={<ChevronLeft className="h-4 w-4" />}>Previous</Button><span className="text-xs font-extrabold">Page {page} of {pages.length}</span><Button variant="secondary" disabled={page === pages.length} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>
      <aside className="space-y-4"><section className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Document focus</p><div className="mt-3 space-y-2">{TEMPLATES.map((item) => <label key={item} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${template === item ? "border-orange-300 bg-orange-50" : "border-[#E3DED4]"}`}><input type="radio" name="template" checked={template === item} onChange={() => { setTemplate(item); setPage(1); }} className="mt-0.5 accent-orange-600" />{item}</label>)}</div><p className="mt-3 text-xs leading-relaxed text-[#5C5852]">{template === TEMPLATES[0] ? "Attainment, subjects, inclusion, attendance, and inspection evidence." : template === TEMPLATES[1] ? "Board-level performance, priorities, and a decision record." : "SEND attainment, progress, attendance overlap, and support priorities."}</p></section>
        <section className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Pages in this report</p><div className="mt-3 space-y-1">{pages.map((content, index) => <button key={content.title} onClick={() => setPage(index + 1)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold ${page === index + 1 ? "bg-orange-50 text-orange-700" : "text-[#5C5852] hover:bg-[#F9F6F0]"}`}><span className="w-5 text-[10px] font-black">{String(index + 1).padStart(2, "0")}</span>{content.title}</button>)}</div></section>
        <section className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Circulation setting</p><label className="mt-3 flex items-start gap-2 text-xs font-semibold"><input type="checkbox" checked={redact} onChange={(event) => setRedact(event.target.checked)} className="mt-0.5 accent-orange-600" />Strip pupil references from exported summary</label></section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Ready for review</p>{["Locally calculated", "Selected six-page report", "Blank signature fields"].map((item) => <p key={item} className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" />{item}</p>)}</section>
        <p className="flex items-center gap-2 px-1 text-xs text-[#5C5852]"><Calendar className="h-4 w-4 text-orange-600" />{new Date().toLocaleDateString("en-GB")} · {metrics.total} current records</p>
        <Link href="/app/ask" className="inline-flex items-center gap-1 text-xs font-bold text-orange-700">Explore evidence in Ask Inside <ArrowRight className="h-3.5 w-3.5" /></Link>
      </aside>
    </div>
  </div>;
}
