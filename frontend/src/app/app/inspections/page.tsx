"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { calculateInspectionRubric } from "@/lib/engine/calculator";
import { RubricIndicator } from "@/lib/engine/types";
import { Button } from "@/components/ui/Button";
import { SlideOverPanel } from "@/components/inspection/SlideOverPanel";
import { buildCat4RealityMap, ScreeningEvidence } from "@/lib/engine/screening";
import { ArrowRight, Calculator, FileText, ShieldCheck } from "lucide-react";

const ROWS = [
  ["1.1 Attainment", "Students' Achievement"],
  ["1.2 Learning Progress", "Students' Progress"],
  ["1.3 Learning Skills", "Learning Skills"],
  ["Inclusion / Students of Determination", "Inclusion / SEND"],
  ["2.1 Personal Development", "Personal Development"],
] as const;
const PHASES = [
  ["FS / EYFS", (year: number) => year <= 0],
  ["Primary", (year: number) => year >= 1 && year <= 6],
  ["Secondary", (year: number) => year >= 7 && year <= 11],
  ["Post-16", (year: number) => year >= 12],
] as const;
const PREPARATION: Record<string, { question: string; evidence: string; ask?: string }> = {
  "Students' Achievement": { question: "How do leaders check that current core attainment is supported by assessment evidence?", evidence: "Current core assessment results and the cohort breakdown shown above.", ask: "Compare whole-school attainment across English, Mathematics, and Science." },
  "Students' Progress": { question: "How are leaders monitoring change between the two assessment terms?", evidence: "Paired Term 1 and Term 2 assessment results for the measured pupils." },
  "Learning Skills": { question: "What other evidence helps leaders understand learning skills beyond this internal proxy?", evidence: "Missing-assignment and behaviour records, alongside existing lesson review evidence." },
  "Inclusion / SEND": { question: "How do leaders know whether support is helping the measured SEND cohort make progress?", evidence: "Paired assessment results and existing support-plan review evidence for this cohort.", ask: "Compare SEND and non-SEND observed progress." },
  "Personal Development": { question: "How do leaders review attendance alongside the wider personal development evidence?", evidence: "Current attendance records and existing pastoral review evidence.", ask: "How does persistent absence relate to current attainment?" },
};
export default function InspectionsPage() {
  const { students, setPrefilledQuery, setPrefilledReportTemplate } = useSessionData();
  const router = useRouter();
  const [uplift, setUplift] = useState(0);
  const [passGrade, setPassGrade] = useState(5);
  const [evidence, setEvidence] = useState<ScreeningEvidence | null>(null);
  const cat4Comparisons = useMemo(() => buildCat4RealityMap(students, passGrade), [students, passGrade]);
  const matrix = useMemo(() => {
    const phases = Object.fromEntries(PHASES.map(([label, test]) => {
      const cohort = students.filter((student) => test(student.yearGroup));
      return [label, { count: cohort.length, rubric: calculateInspectionRubric(cohort) }];
    }));
    return { phases, whole: calculateInspectionRubric(students) };
  }, [students]);
  const [selected, setSelected] = useState<{ row: string; phase: string }>({ row: ROWS[0][1], phase: "Whole School" });

  const getIndicator = (row: string, phase: string): { indicator?: RubricIndicator; count: number } => {
    if (phase === "Whole School") return { indicator: matrix.whole.indicators.find((item) => item.name === row), count: students.length };
    const entry = matrix.phases[phase];
    return { indicator: entry?.rubric.indicators.find((item: RubricIndicator) => item.name === row), count: entry?.count || 0 };
  };
  const active = getIndicator(selected.row, selected.phase);
  const preparation = PREPARATION[selected.row];
  const simulated = active.indicator?.denominator ? Math.round(Math.min(100, (active.indicator.numerator + uplift) / active.indicator.denominator * 100) * 10) / 10 : null;
  const exportSef = () => {
    setPrefilledReportTemplate("Full DSIB/ADEK Evidence Pack");
    router.push("/app/reports");
  };

  return <div className="space-y-7 pb-16">
    <div className="flex flex-col gap-4 border-b border-[#E3DED4] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-600"><ShieldCheck className="h-3.5 w-3.5" />UAE framework evidence review</div><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Inspections</h1><p className="mt-1 max-w-2xl text-[14px] text-[#5C5852]">Local indicators mapped to UAE inspection themes. Inspectors make official judgements using wider evidence, not a single percentage.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={exportSef} icon={<FileText className="h-4 w-4" />}>Compile SEF Export</Button>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Framework</p><p className="mt-2 text-xl font-extrabold">UAE unified</p><p className="mt-1 text-[12px] text-[#5C5852]">Evidence themes used in Dubai and Abu Dhabi; not an authority-issued rating</p></div>
      <div className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Official rating</p><p className="mt-2 text-xl font-extrabold">Not assessed</p><p className="mt-1 text-[12px] text-[#5C5852]">{students.length} local records available; no automated inspection grade</p></div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Calculation mode</p><p className="mt-2 text-xl font-extrabold text-emerald-900">Deterministic</p><p className="mt-1 text-[12px] text-emerald-800">Zero LLM-generated grades</p></div>
    </div>

    <section className="overflow-hidden rounded-3xl border border-[#E3DED4] bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[12px]">
        <thead className="border-b border-[#E3DED4] bg-[#F9F6F0]"><tr><th className="p-4 text-[11px] font-extrabold uppercase tracking-wider text-[#5C5852]">Quality indicator</th>{[...PHASES.map(([label]) => label), "Whole School"].map((phase) => <th key={phase} className="p-4 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#5C5852]">{phase}</th>)}</tr></thead>
        <tbody>{ROWS.map(([label, row]) => <tr key={row} className="border-b border-[#E3DED4] last:border-0"><th className="p-4"><span className="block font-extrabold">{label}</span><span className="mt-1 block text-[11px] font-medium text-[#5C5852]">{row}</span></th>
          {[...PHASES.map(([phase]) => phase), "Whole School"].map((phase) => {
            const cell = getIndicator(row, phase);
            const indicator = cell.indicator;
            const activeCell = selected.row === row && selected.phase === phase;
            return <td key={phase} className="p-2 text-center"><button disabled={!cell.count} onClick={() => { setSelected({ row, phase }); setUplift(0); }} className={"relative mx-auto min-h-16 w-full max-w-[132px] rounded-xl border p-2 transition " + (!cell.count ? "cursor-not-allowed border-[#E3DED4] bg-[#F5F2EB] text-[#8C877E]" : ("border-orange-200 bg-orange-50 text-orange-900" + (activeCell ? " ring-2 ring-orange-400 ring-offset-2" : " hover:-translate-y-0.5")))}>
              <span className="block text-[11px] font-extrabold">{indicator?.denominator ? "Evidence only" : "No evidence"}</span><span className="mt-1 block text-[11px] font-semibold">{indicator?.denominator ? `${indicator.calculatedValue}${indicator.unit}` : "0 assessed"}</span>
            </button></td>;
          })}</tr>)}</tbody>
      </table></div>
    </section>
    {cat4Comparisons.length > 0 && <section className="rounded-3xl border border-[#E3DED4] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">CAT4 Reality Map (Baseline Comparison Index)</p><h2 className="mt-1 text-xl font-extrabold">Cognitive baseline alongside internal marks</h2><p className="mt-1 max-w-2xl text-xs text-[#5C5852]">Screening indicator comparing internal grades to cognitive baseline; not a causal or predicted grade measure. These are Inside-defined categories, not official inspection formulas.</p></div><label className="text-xs font-bold text-[#5C5852]">Pass mark (Grade 5+ by default)<input type="number" min={0} max={9} step={0.5} value={passGrade} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) setPassGrade(Math.max(0, Math.min(9, value))); }} className="mt-1 block w-24 rounded-lg border border-[#D6D0C4] px-3 py-2 text-sm" /></label></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">{cat4Comparisons.map((item) => <article key={item.subject} className="rounded-2xl border border-[#E8E2D9] bg-[#FBF9F5] p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-extrabold">{item.subject === "math" ? "Maths" : item.subject[0].toUpperCase() + item.subject.slice(1)}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.evidence.tone === "neutral" ? "bg-emerald-50 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{item.evidence.tone === "neutral" ? "No threshold triggered" : "Screening threshold triggered"}</span></div><p className="mt-2 text-xs text-[#5C5852]">CAT4-eligible cohort: <strong>{item.cohort}</strong> students</p><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><p className="text-lg font-extrabold">{item.passRate}%</p><p className="text-[10px] text-[#5C5852]">Grade {passGrade}+</p></div><div><p className="text-lg font-extrabold">{item.baselineRate}%</p><p className="text-[10px] text-[#5C5852]">SAS ≥ 90</p></div><div><p className="text-lg font-extrabold">{item.variance >= 0 ? "+" : ""}{item.variance} pp</p><p className="text-[10px] text-[#5C5852]">Variance</p></div></div><p className="mt-3 text-[11px] text-[#5C5852]">Higher ≥112: {item.higher} · Expected 90–111: {item.expected} · Lower &lt;90: {item.lower}</p><p className="mt-2 text-xs leading-relaxed">{item.evidence.summary}</p><button type="button" onClick={() => setEvidence(item.evidence)} className="mt-3 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-extrabold text-orange-700 hover:bg-orange-50">Show Evidence</button></article>)}</div>
    </section>}

    <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">Local calculation audit trail</p><h2 className="mt-1 text-lg font-extrabold">{selected.phase} | {ROWS.find((row) => row[1] === selected.row)?.[0]}</h2></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">{active.count} pupil records in phase</span></div>
      {active.indicator ? <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-[#E3DED4] bg-white p-4 font-mono text-[13px]"><Calculator className="mr-2 inline h-4 w-4 text-orange-600" />{active.indicator.formula}</div>
        <div className="grid gap-3 sm:grid-cols-4">{[
          ["Numerator", active.indicator.numerator],
          ["Denominator", active.indicator.denominator],
          ["Verified result", `${active.indicator.calculatedValue}${active.indicator.unit}`],
          ["Official judgement", "Not determined"],
        ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-[#E3DED4] bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852]">{label}</p><p className="mt-1 text-lg font-extrabold">{value}</p></div>)}</div>
        {selected.row === "Students' Achievement" && active.indicator.denominator > 0 && <div className="rounded-xl border border-[#E3DED4] bg-white p-4"><p className="text-[12px] font-bold">What-if: pupils reaching the measured reference (+1 grade step)</p><div className="mt-2 flex items-center gap-3"><button type="button" onClick={() => setUplift(Math.max(0, uplift - 1))} className="rounded-lg border px-3 py-1" aria-label="Decrease simulated pupils">−</button><span>{uplift}</span><button type="button" onClick={() => setUplift(Math.min(10, active.indicator!.denominator - active.indicator!.numerator, uplift + 1))} className="rounded-lg border px-3 py-1" aria-label="Increase simulated pupils">+</button><span className="text-xs text-[#5C5852]">up to 10; no pupil data is changed</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><p>Actual: {active.indicator.calculatedValue}% · official grade not determined</p><p>Scenario: {simulated}% · official grade not determined</p></div></div>}
        <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800">Why this theme appears</p><p className="mt-1 text-[12px] text-[#5C5852]">{active.indicator.description}</p></div>
        {active.indicator.denominator > 0 && preparation && <div className="grid gap-3 border-t border-orange-200 pt-4 sm:grid-cols-2">
          <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800">Possible inspection question</p><p className="mt-1 text-sm leading-relaxed">{preparation.question}</p><p className="mt-1 text-[11px] text-[#5C5852]">A leadership preparation prompt based on this theme, not a predicted inspector question.</p></div>
          <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800">Useful evidence to have available</p><p className="mt-1 text-sm leading-relaxed">{preparation.evidence}</p>{preparation.ask && <button type="button" onClick={() => { setPrefilledQuery(preparation.ask!); router.push("/app/ask"); }} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline">Ask Inside about this <ArrowRight className="h-3.5 w-3.5" /></button>}</div>
        </div>}
      </div> : <p className="mt-4 text-[13px] text-[#5C5852]">No pupil records are loaded for this phase; Inside does not infer a grade.</p>}
      <div className="mt-5 flex items-center gap-2 border-t border-orange-200 pt-4 text-[12px] font-bold text-emerald-800"><ShieldCheck className="h-4 w-4" />Deterministic local evidence only. <a className="underline" href="https://www.moe.gov.ae/documents/en/frameworkbooken.pdf" target="_blank" rel="noreferrer">Read the official UAE School Inspection Framework</a>.</div>
    </section>
    <SlideOverPanel evidence={evidence} onClose={() => setEvidence(null)} />
  </div>;
}
