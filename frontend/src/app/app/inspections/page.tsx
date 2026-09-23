"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { calculateInspectionRubric } from "@/lib/engine/calculator";
import { RubricIndicator } from "@/lib/engine/types";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Calculator, FileText, ShieldCheck } from "lucide-react";

const COLORS: Record<string, string> = {
  Outstanding: "border-sky-200 bg-sky-50 text-sky-800",
  "Very Good": "border-emerald-200 bg-emerald-50 text-emerald-800",
  Good: "border-amber-200 bg-amber-50 text-amber-800",
  Acceptable: "border-orange-200 bg-orange-50 text-orange-800",
  Weak: "border-red-200 bg-red-50 text-red-800",
  "Very Weak": "border-rose-300 bg-rose-100 text-rose-900",
};
const ROWS = [
  ["1.1 Attainment", "Students' Achievement"],
  ["1.2 Learning Progress", "Students' Progress"],
  ["1.3 Learning Skills", "Learning Skills"],
  ["1.4 Students of Determination", "Inclusion / SEND"],
  ["2.1 Personal Development", "Personal Development"],
] as const;
const PHASES = [
  ["FS / EYFS", (year: number) => year <= 0],
  ["Primary", (year: number) => year >= 1 && year <= 6],
  ["Secondary", (year: number) => year >= 7 && year <= 11],
  ["Post-16", (year: number) => year >= 12],
] as const;
const boundaries = [85, 75, 65, 55, 45];
const isBorderline = (value: number) => boundaries.some((boundary) => Math.abs(value - boundary) <= 2);

export default function InspectionsPage() {
  const { students, setPrefilledReportTemplate } = useSessionData();
  const router = useRouter();
  const [framework, setFramework] = useState("KHDA / DSIB");
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
  const exportSef = () => {
    setPrefilledReportTemplate("Full Inspection Evidence Pack");
    router.push("/app/reports");
  };

  return <div className="space-y-7 pb-16">
    <div className="flex flex-col gap-4 border-b border-[#E3DED4] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-600"><ShieldCheck className="h-3.5 w-3.5" />Statutory compliance engine</div><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Inspections</h1><p className="mt-1 max-w-2xl text-[14px] text-[#5C5852]">Click any phase cell to verify the exact local calculation and evidence range.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[12px] font-bold text-[#5C5852]" htmlFor="framework">Handbook</label>
        <select id="framework" value={framework} onChange={(event) => setFramework(event.target.value)} className="h-10 rounded-xl border border-[#E3DED4] bg-white px-3 text-[13px] font-bold"><option>KHDA / DSIB</option><option>ADEK</option></select>
        <Button variant="primary" onClick={exportSef} icon={<FileText className="h-4 w-4" />}>Compile SEF Export</Button>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Framework</p><p className="mt-2 text-xl font-extrabold">{framework}</p><p className="mt-1 text-[12px] text-[#5C5852]">Controlled statutory handbook</p></div>
      <div className="rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">Whole-school rating</p><p className="mt-2 text-xl font-extrabold">{matrix.whole.overallBand}</p><p className="mt-1 text-[12px] text-[#5C5852]">{students.length} records evaluated</p></div>
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
            return <td key={phase} className="p-2 text-center"><button disabled={!cell.count} onClick={() => setSelected({ row, phase })} className={"relative mx-auto min-h-16 w-full max-w-[132px] rounded-xl border p-2 transition " + (!cell.count ? "cursor-not-allowed border-[#E3DED4] bg-[#F5F2EB] text-[#8C877E]" : (COLORS[indicator?.band || "Acceptable"] + (activeCell ? " ring-2 ring-orange-400 ring-offset-2" : " hover:-translate-y-0.5")))}>
              <span className="block text-[11px] font-extrabold">{cell.count ? indicator?.band : "No evidence"}</span><span className="mt-1 block text-[11px] font-semibold">{cell.count ? `${indicator?.calculatedValue}${indicator?.unit}` : "0 records"}</span>
              {indicator && isBorderline(indicator.calculatedValue) && <span title="Within 2% of a statutory boundary" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white"><AlertTriangle className="h-3 w-3" /></span>}
            </button></td>;
          })}</tr>)}</tbody>
      </table></div>
    </section>

    <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">Verified statutory math audit trail</p><h2 className="mt-1 text-lg font-extrabold">{selected.phase} | {ROWS.find((row) => row[1] === selected.row)?.[0]}</h2></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">{active.count} records in evidence range</span></div>
      {active.indicator ? <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-[#E3DED4] bg-white p-4 font-mono text-[13px]"><Calculator className="mr-2 inline h-4 w-4 text-orange-600" />{active.indicator.formula}</div>
        <div className="grid gap-3 sm:grid-cols-4">{[
          ["Numerator", active.indicator.numerator],
          ["Denominator", active.indicator.denominator],
          ["Verified result", `${active.indicator.calculatedValue}${active.indicator.unit}`],
          ["Assigned tier", active.indicator.band],
        ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-[#E3DED4] bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852]">{label}</p><p className="mt-1 text-lg font-extrabold">{value}</p></div>)}</div>
        {isBorderline(active.indicator.calculatedValue) && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] font-semibold text-amber-900"><AlertTriangle className="h-4 w-4" />Borderline risk: this result is within 2 percentage points of a statutory threshold.</div>}
        <p className="text-[12px] text-[#5C5852]">{active.indicator.description}</p>
      </div> : <p className="mt-4 text-[13px] text-[#5C5852]">No pupil records are loaded for this phase; Inside does not infer a grade.</p>}
      <div className="mt-5 flex items-center gap-2 border-t border-orange-200 pt-4 text-[12px] font-bold text-emerald-800"><ShieldCheck className="h-4 w-4" />100% deterministic local memory execution. Zero stochastic estimation.</div>
    </section>
  </div>;
}
