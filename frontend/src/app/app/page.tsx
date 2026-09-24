"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { StudentRecord } from "@/types/student-data";
import { Button } from "@/components/ui/Button";
import { SlideOverPanel } from "@/components/inspection/SlideOverPanel";
import { buildInspectionFlanks, ScreeningEvidence } from "@/lib/engine/screening";
import { AlertTriangle, ArrowRight, BarChart3, Database, FileSpreadsheet, Lock, ShieldCheck, Target, TrendingUp, Upload } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const pct = (part: number, total: number) => total ? Math.round((part / total) * 1000) / 10 : 0;
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Math.round(value * 10) / 10;
const score = (student: StudentRecord) => average([
  student.term2MathGrade ?? student.mathGrade,
  student.term2ScienceGrade ?? student.scienceGrade,
  student.term2EnglishGrade ?? student.englishGrade,
]);
const expected = (student: StudentRecord) => score(student) >= 5;
const hasCoreResult = (student: StudentRecord) => score(student) > 0;
const sendStatus = (student: StudentRecord) => student.senStatus || Boolean(student.inclusionSend && student.inclusionSend !== "None");
const progress = (student: StudentRecord) => {
  if ([student.term1MathGrade, student.term1ScienceGrade, student.term1EnglishGrade, student.term2MathGrade, student.term2ScienceGrade, student.term2EnglishGrade].some((value) => value === undefined || value === null)) return null;
  return score(student) - average([student.term1MathGrade!, student.term1ScienceGrade!, student.term1EnglishGrade!]);
};
const observedProgress = (students: StudentRecord[]) => students.map(progress).filter((value): value is number => value !== null);

type Insight = { label: string; title: string; detail: string; tone: "red" | "amber" | "green" | "orange"; query: string };
type ChartRow = Record<string, string | number>;
type ChartBar = { key: string; color: string; stackId?: string };

function ChartPanel({ title, subtitle, data, bars, query, onAsk, percent = true, reference = false, empty, legend = false }: {
  title: string; subtitle: string; data: ChartRow[]; bars: ChartBar[]; query: string; onAsk: (query: string) => void;
  percent?: boolean; reference?: boolean; empty?: string; legend?: boolean;
}) {
  return <section className="min-w-0 rounded-2xl border border-[#E3DED4] bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><h3 className="text-[16px] font-extrabold">{title}</h3><p className="mt-1 text-[12px] leading-relaxed text-[#5C5852]">{subtitle}</p></div><BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" /></div>
    {data.length ? <div className="mt-4 h-[220px] min-w-0" aria-label={title}><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={data} margin={{ top: 14, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#EAE4DB" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#645E55" }} interval={0} /><YAxis domain={percent ? [0, 100] : ["auto", "auto"]} tick={{ fontSize: 11, fill: "#645E55" }} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E3DED4", fontSize: 12 }} />{bars.map((bar) => <Bar key={bar.key} dataKey={bar.key} fill={bar.color} stackId={bar.stackId} radius={[5, 5, 0, 0]} />)}{reference && <ReferenceLine y={75} stroke="#2563EB" strokeDasharray="5 5" label={{ value: "Internal 75%", fill: "#2563EB", fontSize: 10 }} />}{legend && <Legend wrapperStyle={{ fontSize: 10 }} />}</BarChart></ResponsiveContainer></div> : <div className="mt-4 flex h-[220px] items-center justify-center rounded-xl border border-dashed border-[#DDD6CA] bg-[#FBF9F5] px-6 text-center text-sm text-[#5C5852]">{empty || "This comparison needs more data in the active files."}</div>}
    {data.length ? <button onClick={() => onAsk(query)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 hover:underline">Explore this result in Ask Inside <ArrowRight className="h-3.5 w-3.5" /></button> : <Link href="/app/data" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 hover:underline">Check source files <ArrowRight className="h-3.5 w-3.5" /></Link>}
  </section>;
}

function deriveHomeInsights(students: StudentRecord[], attainment: number): Insight[] {
  const insights: Insight[] = [];
  const send = students.filter(sendStatus);
  const peers = students.filter((student) => !sendStatus(student));
  if (send.length && peers.length) {
    const sendEnglish = round(average(send.map((student) => student.term2EnglishGrade ?? student.englishGrade)));
    const peerEnglish = round(average(peers.map((student) => student.term2EnglishGrade ?? student.englishGrade)));
    const gap = round(peerEnglish - sendEnglish);
    if (Math.abs(gap) >= 0.3) insights.push({ label: "Inclusion", title: "English attainment gap", detail: `SEND pupils average Grade ${sendEnglish.toFixed(1)}; peers average Grade ${peerEnglish.toFixed(1)}.`, tone: gap > 0 ? "amber" : "green", query: "Compare SEND and non-SEND English attainment." });
  }
  const absent = students.filter((student) => student.attendanceRate < 90);
  const attending = students.filter((student) => student.attendanceRate >= 90);
  if (absent.length && attending.length) {
    const absentRate = pct(absent.filter(expected).length, absent.filter(hasCoreResult).length);
    const attendingRate = pct(attending.filter(expected).length, attending.filter(hasCoreResult).length);
    insights.push({ label: "Attendance", title: `${Math.abs(attendingRate - absentRate).toFixed(1)} point attainment difference`, detail: `Pupils below 90% attendance attain at ${absentRate}%; pupils at or above 90% attain at ${attendingRate}%.`, tone: absentRate < attendingRate ? "red" : "green", query: "How does persistent absence relate to current attainment?" });
  }
  const national = students.filter((student) => student.emiratiStatus);
  if (national.length) {
    const rate = pct(national.filter(expected).length, national.filter(hasCoreResult).length);
    insights.push({ label: "UAE national cohort", title: `${rate}% Emirati attainment`, detail: `${national.length} pupils compared with ${attainment}% for the whole school.`, tone: rate < attainment ? "amber" : "green", query: "Compare Emirati student attainment with the whole-school cohort." });
  }
  const boys = students.filter((student) => student.gender === "Male");
  const girls = students.filter((student) => student.gender === "Female");
  if (boys.length && girls.length) {
    const boysScience = round(average(boys.map((student) => student.term2ScienceGrade ?? student.scienceGrade)));
    const girlsScience = round(average(girls.map((student) => student.term2ScienceGrade ?? student.scienceGrade)));
    if (Math.abs(girlsScience - boysScience) >= 0.3) insights.push({ label: "Cohort gap", title: `${Math.abs(girlsScience - boysScience).toFixed(1)} grade Science gender gap`, detail: `Boys average Grade ${boysScience.toFixed(1)}; girls average Grade ${girlsScience.toFixed(1)}.`, tone: "amber", query: "Show the current Science attainment gap by gender." });
  }
  return insights;
}

function deriveInspectionQuestions(students: StudentRecord[]): string[] {
  const questions: string[] = [];
  const emirati = students.filter((student) => student.emiratiStatus && score(student) > 0);
  const girls = emirati.filter((student) => student.gender === "Female");
  const boys = emirati.filter((student) => student.gender === "Male");
  if (girls.length >= 5 && boys.length >= 5) {
    const gap = pct(girls.filter(expected).length, girls.length) - pct(boys.filter(expected).length, boys.length);
    if (gap > 12) questions.push(`Emirati boys' attainment is ${gap.toFixed(1)} points below girls' (${boys.length} boys, ${girls.length} girls). Review subject-level evidence and the intervention plan.`);
  }
  for (const [label, grade] of [["English", "englishGrade"], ["Maths", "mathGrade"], ["Science", "scienceGrade"]] as const) {
    const ks2 = students.filter((student) => student.yearGroup >= 3 && student.yearGroup <= 6 && student[grade] > 0);
    const ks3 = students.filter((student) => student.yearGroup >= 7 && student.yearGroup <= 9 && student[grade] > 0);
    if (ks2.length < 5 || ks3.length < 5) continue;
    const gap = pct(ks2.filter((student) => student[grade] >= 5).length, ks2.length) - pct(ks3.filter((student) => student[grade] >= 5).length, ks3.length);
    if (gap > 10) questions.push(`${label} attainment is ${gap.toFixed(1)} points lower in current KS3 than current KS2. This is a cross-sectional comparison, not a tracked pupil decline; review transition evidence.`);
  }
  const assessed = students.filter((student) => score(student) > 0);
  const changes = observedProgress(students);
  if (assessed.length && changes.length && pct(assessed.filter(expected).length, assessed.length) >= 75 && average(changes) < 0)
    questions.push(`Current attainment meets the school's 75% reference, but the measured two-term grade change is ${round(average(changes))}. Review starting points and challenge for higher attainers.`);
  return questions.slice(0, 3);
}

export default function AppHomePage() {
  const { students, activeFiles, readinessScore, sessionDeleted, sessionMinutesRemaining, setPrefilledQuery, loadSampleDataset } = useSessionData();
  const router = useRouter();
  const [screeningEvidence, setScreeningEvidence] = useState<ScreeningEvidence | null>(null);
  const ask = (query: string) => { setPrefilledQuery(query); router.push("/app/ask"); };

  if (sessionDeleted || !students.length) return <div className="mx-auto max-w-xl py-20 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-emerald-700" /><h1 className="mt-4 text-2xl font-extrabold">{sessionDeleted ? "Session data purged" : "Upload data to see your insights"}</h1><p className="mt-2 text-[14px] text-[#5C5852]">Add your school files in the Data Hub. Home will calculate current metrics and flag patterns automatically after the quality check.</p><div className="mt-6 flex justify-center gap-2"><Link href="/app/data"><Button variant="primary" icon={<Upload className="h-4 w-4" />}>Upload school data</Button></Link><Button onClick={loadSampleDataset} variant="secondary">Load demo cohort</Button></div></div>;

  const total = students.length;
  const assessed = students.filter(hasCoreResult);
  const attainment = pct(assessed.filter(expected).length, assessed.length);
  const send = students.filter(sendStatus);
  const peers = students.filter((student) => !sendStatus(student));
  const sendProgress = observedProgress(send);
  const peerProgress = observedProgress(peers);
  const sendDelta = average(sendProgress);
  const peerDelta = average(peerProgress);
  const severe = students.filter((student) => student.attendanceRate < 85);
  const borderlineAbsence = students.filter((student) => student.attendanceRate >= 85 && student.attendanceRate < 90);
  const persistent = students.filter((student) => student.attendanceRate < 90);
  const attending = students.filter((student) => student.attendanceRate >= 90);
  const emirati = students.filter((student) => student.emiratiStatus);
  const otherNationals = students.filter((student) => !student.emiratiStatus);
  const emiratiAssessed = emirati.filter(hasCoreResult);
  const emiratiAttainment = pct(emiratiAssessed.filter(expected).length, emiratiAssessed.length);

  const stages = [["KS1", 1, 2], ["KS2", 3, 6], ["KS3", 7, 9], ["KS4", 10, 11], ["Post-16", 12, 14]] as const;
  const stageRows = stages.map(([label, from, to]) => {
    const cohort = assessed.filter((student) => student.yearGroup >= from && student.yearGroup <= to);
    const reached = cohort.filter(expected).length;
    return { label, count: cohort.length, "At / above": pct(reached, cohort.length), "Below": pct(cohort.length - reached, cohort.length) };
  }).filter((stage) => stage.count > 0);
  const strongest = [...stageRows].sort((a, b) => b["At / above"] - a["At / above"])[0];
  const weakest = [...stageRows].sort((a, b) => a["At / above"] - b["At / above"])[0];
  const subjectRows = [
    { label: "English", students: assessed.filter((student) => (student.term2EnglishGrade ?? student.englishGrade) >= 5).length },
    { label: "Maths", students: assessed.filter((student) => (student.term2MathGrade ?? student.mathGrade) >= 5).length },
    { label: "Science", students: assessed.filter((student) => (student.term2ScienceGrade ?? student.scienceGrade) >= 5).length },
  ].map((subject) => ({ label: subject.label, "At / above": pct(subject.students, assessed.length) }));
  const attendanceMix = [
    { label: "Below 85%", Share: pct(severe.length, total) },
    { label: "85–89%", Share: pct(borderlineAbsence.length, total) },
    { label: "90%+", Share: pct(attending.length, total) },
  ];
  const attendanceOutcome = persistent.length && attending.length ? [
    { label: "Below 90%", Attainment: pct(persistent.filter(expected).length, persistent.filter(hasCoreResult).length) },
    { label: "90%+", Attainment: pct(attending.filter(expected).length, attending.filter(hasCoreResult).length) },
  ] : [];
  const progressRows = sendProgress.length && peerProgress.length ? [
    { label: "SEND", "Grade change": round(sendDelta) },
    { label: "Other", "Grade change": round(peerDelta) },
  ] : [];
  const nationalRows = emirati.length && otherNationals.length ? [
    { label: "Emirati", Attainment: emiratiAttainment },
    { label: "Other", Attainment: pct(otherNationals.filter(expected).length, otherNationals.filter(hasCoreResult).length) },
  ] : [];

  const kpis = [
    { label: "Whole-School Attainment", value: assessed.length ? `${attainment}%` : "No core results", detail: `${assessed.length} assessed pupils · school Grade 5 reference, not an official grade`, icon: Target, query: "Compare whole-school attainment across English, Math, and Science.", tone: "orange" },
    { label: "Inclusion Progress Delta", value: sendProgress.length ? `${sendDelta >= 0 ? "+" : ""}${sendDelta.toFixed(2)} grades` : "No two-term data", detail: `${sendProgress.length} Students of Determination with two term results`, icon: TrendingUp, query: "Show attainment and progress deltas for Students of Determination compared to non-SEND peers.", tone: "emerald" },
    { label: "Persistent Absence Rate", value: `${pct(persistent.length, total)}%`, detail: `${persistent.length} pupils below 90% attendance`, icon: AlertTriangle, query: "Identify Students of Determination flagged for Persistent Absence and calculate attainment impact.", tone: "red" },
  ];
  const watchlist: Insight[] = [
    severe.length ? { label: "Red flag · Intervention", title: `${severe.length} pupils below 85% attendance`, detail: "The most urgent attendance threshold in the current cohort.", tone: "red", query: "Show all pupils below 85% attendance and the measured attainment impact." } : weakest && weakest["At / above"] < 75 ? { label: "Red flag · Stage", title: `${weakest.label} is below the 75% reference`, detail: `${weakest["At / above"]}% of ${weakest.count} pupils are at or above expected.`, tone: "red", query: `Show current ${weakest.label} attainment against the 75% reference.` } : { label: "Red flag · Review", title: "No urgent threshold breach found", detail: "Keep reviewing the loaded data as new assessments arrive.", tone: "red", query: "Show the current attendance and attainment risk profile." },
    emirati.length ? { label: "Amber notice · Emirati cohort", title: `${emiratiAttainment}% Emirati attainment`, detail: `${emirati.length} national pupils measured against the whole-school cohort.`, tone: "amber", query: "Compare Emirati student attainment with the whole-school cohort." } : { label: "Amber notice · Data coverage", title: "Emirati cohort not identified", detail: "Check whether national status is present in the current source files.", tone: "amber", query: "Verify data quality and mapped cohort fields." },
    strongest ? { label: "Green strength · Key Stage", title: `${strongest.label} is the strongest measured stage`, detail: `${strongest["At / above"]}% of ${strongest.count} pupils are at or above expected.`, tone: "green", query: `Show current ${strongest.label} attainment against the 75% reference.` } : { label: "Green strength · Evidence", title: "No Key Stage comparison available", detail: "Year group data is needed to identify a measured strength.", tone: "green", query: "Verify data quality and mapped year groups." },
  ];
  const autoInsights = deriveHomeInsights(students, attainment).filter((insight) => insight.label !== "UAE national cohort");
  if (readinessScore < 100) autoInsights.push({ label: "Data quality", title: `${readinessScore}% Data Hub readiness`, detail: "Review outstanding mapping or repair notes before using this evidence externally.", tone: "amber", query: "Verify data quality and mapped pupil records." });
  const insights = [...watchlist, ...autoInsights];
  const inspectionQuestions = deriveInspectionQuestions(students);
  const flanks = buildInspectionFlanks(students);
  const toneClass = (tone: Insight["tone"]) => tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-emerald-500" : "bg-orange-500";

  return <div className="space-y-6 pb-16">
    <section className="flex flex-col gap-4 rounded-3xl border border-orange-200 bg-orange-50/70 p-6 shadow-sm sm:p-7 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-600">Executive evidence cockpit</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Whole-school inspection readiness</h1><p className="mt-2 text-sm text-[#5C5852]">A visual summary of {total} current pupil records from {activeFiles.length} source file{activeFiles.length === 1 ? "" : "s"}.</p></div><div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-xs font-bold text-emerald-800"><Lock className="mr-2 inline h-4 w-4" />Ephemeral RAM only | {sessionMinutesRemaining}m session</div></section>
    <section className="rounded-2xl border border-orange-200 bg-white p-5"><h2 className="text-lg font-extrabold">Potential inspection lines of enquiry</h2><p className="mt-1 text-xs text-[#5C5852]">Locally calculated prompts for leadership review, aligned to the UAE framework's attainment, progress and group-equality themes. The 12-, 10- and 75-point triggers are Inside screening rules, not official UAE thresholds.</p>{inspectionQuestions.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{inspectionQuestions.map((question) => <li key={question}>{question}</li>)}</ul> : <p className="mt-3 text-sm">No signal from these three screening rules. This does not constitute an inspection clearance.</p>}<a href="https://www.moe.gov.ae/documents/en/frameworkbooken.pdf" target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-orange-700 underline">Official UAE School Inspection Framework</a></section>
    <section className="rounded-2xl border border-[#E3DED4] bg-white p-5 shadow-sm"><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">Inspection Flank Scanner</p><h2 className="mt-1 text-xl font-extrabold">Leadership screening checks</h2><p className="mt-1 text-xs text-[#5C5852]">Leadership pre-inspection screening checks based on selected attainment, progress, demographic, and attendance indicators. These Inside thresholds are not KHDA, DSIB, or ADEK formulas.</p>{flanks.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{flanks.map((finding) => <article key={finding.id} className={`rounded-xl border p-4 ${finding.tone === "red" ? "border-red-200 bg-red-50" : finding.tone === "orange" ? "border-orange-200 bg-orange-50" : "border-amber-200 bg-amber-50"}`}><p className="text-xs font-extrabold uppercase tracking-wider">{finding.title}</p><p className="mt-2 text-sm font-semibold">{finding.summary}</p><p className="mt-2 text-xs leading-relaxed text-[#5C5852]">Leadership talking point: {finding.talkingPoint}</p><button type="button" onClick={() => setScreeningEvidence(finding)} className="mt-3 rounded-lg border border-[#D6D0C4] bg-white px-3 py-2 text-xs font-extrabold text-orange-700 hover:bg-[#FBF9F5]">Show Evidence</button></article>)}</div> : <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">No Inside screening thresholds triggered in the current dataset.</p>}</section>
    <section className="flex flex-col gap-3 rounded-2xl border border-[#E3DED4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-orange-600"><Database className="h-4 w-4" />Current data · {readinessScore}% ready</p><div className="mt-2 flex flex-wrap gap-2">{activeFiles.map((file) => <span key={file.id} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-[#F9F6F0] px-3 py-1.5 text-xs font-semibold"><FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-orange-600" /><span className="break-all">{file.name}</span></span>)}</div></div><Link href="/app/data" className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-700 hover:bg-orange-100"><Upload className="h-4 w-4" />Upload or replace files</Link></section>
    <div className="grid gap-4 lg:grid-cols-3">{kpis.map(({ label, value, detail, icon: Icon, query, tone }) => <article key={label} className="rounded-2xl border border-[#E3DED4] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs text-[#5C5852]">{detail}</p></div><span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border " + (tone === "emerald" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-orange-200 bg-orange-50 text-orange-600")}><Icon className="h-5 w-5" /></span></div><button onClick={() => ask(query)} className="mt-4 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-600">Ask Inside <ArrowRight className="h-3.5 w-3.5" /></button></article>)}</div>
    <section><div className="mb-4"><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">Current evidence</p><h2 className="mt-1 text-xl font-extrabold">Performance at a glance</h2><p className="mt-1 text-xs text-[#5C5852]">All charts update when the active dataset changes. The blue line is a school-defined 75% comparison reference, not an official UAE inspection threshold.</p></div><div className="grid gap-4 lg:grid-cols-2">
      <ChartPanel title="Attainment by Key Stage" subtitle="At or above expected versus below expected, by phase." data={stageRows} bars={[{ key: "At / above", color: "#F97316", stackId: "stage" }, { key: "Below", color: "#DDD7CC", stackId: "stage" }]} reference legend query="Show current attainment by Key Stage against the 75% reference." onAsk={ask} />
      <ChartPanel title="Core subject attainment" subtitle="Share of pupils at or above Grade 5 in each core subject." data={subjectRows} bars={[{ key: "At / above", color: "#F97316" }]} reference query="Compare whole-school attainment across English, Math, and Science against the 75% reference." onAsk={ask} />
      <ChartPanel title="Attendance profile" subtitle="Pupils grouped by their current attendance percentage." data={attendanceMix} bars={[{ key: "Share", color: "#E9A246" }]} query="Show current attendance groups and persistent absence." onAsk={ask} />
      <ChartPanel title="Attainment and attendance" subtitle="Observed attainment for pupils below and above 90% attendance." data={attendanceOutcome} bars={[{ key: "Attainment", color: "#EA7155" }]} reference empty="Both attendance groups are needed for this comparison." query="How does persistent absence relate to current attainment?" onAsk={ask} />
      <ChartPanel title="Inclusion progress" subtitle="Average core grade change from Term 1 to Term 2." data={progressRows} bars={[{ key: "Grade change", color: "#279879" }]} percent={false} empty="Two-term marks for SEND pupils and peers are needed for this comparison." query="Compare observed SEND and non-SEND progress." onAsk={ask} />
      <ChartPanel title="Emirati cohort attainment" subtitle="Current attainment of Emirati pupils and other pupils." data={nationalRows} bars={[{ key: "Attainment", color: "#3E80BC" }]} reference empty="Emirati status and a comparison group are needed in the current data." query="Compare Emirati student attainment with the whole-school cohort." onAsk={ask} />
    </div></section>
    <section className="overflow-hidden rounded-2xl border border-[#E3DED4] bg-white shadow-sm"><div className="border-b border-[#E3DED4] bg-[#F9F6F0] px-5 py-4"><span className="inline-flex rounded-t-xl border-x border-t border-orange-200 bg-white px-4 py-2 text-sm font-extrabold text-orange-700">Important Insights</span><p className="mt-2 text-xs text-[#5C5852]">The most relevant findings from the loaded data, with a link to inspect each calculation.</p></div><ul className="divide-y divide-[#EEE9E1]">{insights.map((item) => <li key={item.label + item.title} className="flex gap-3 px-5 py-4"><span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${toneClass(item.tone)}`} /><div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#817B71]">{item.label}</p><p className="mt-1 text-sm font-extrabold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-[#5C5852]">{item.detail}</p></div><button onClick={() => ask(item.query)} className="self-center rounded-lg px-2 py-1 text-[11px] font-extrabold text-orange-700 hover:bg-orange-50">Ask Inside <ArrowRight className="inline h-3.5 w-3.5" /></button></li>)}</ul></section>
    <SlideOverPanel evidence={screeningEvidence} onClose={() => setScreeningEvidence(null)} />
  </div>;
}
