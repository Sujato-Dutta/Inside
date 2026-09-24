"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ScreeningEvidence } from "@/lib/engine/screening";

export function SlideOverPanel({ evidence, onClose }: { evidence: ScreeningEvidence | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState("");
  const openedAt = useMemo(() => evidence ? new Date().toLocaleString() : "", [evidence]);
  const rows = useMemo(() => evidence?.rows.filter((row) =>
    row.studentRef.toLowerCase().includes(search.trim().toLowerCase()) || String(row.yearGroup).includes(search.trim())
  ) || [], [evidence, search]);

  useEffect(() => { setSearch(""); }, [evidence?.id]);

  useEffect(() => {
    if (!evidence) return;
    closeRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [evidence, onClose]);

  if (!evidence) return null;
  return <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
    <button type="button" className="absolute inset-0 bg-[#17253B]/45" onClick={onClose} aria-label="Close evidence panel" />
    <aside role="dialog" aria-modal="true" aria-label="Why was this flagged?" className="relative flex h-full w-full max-w-2xl flex-col bg-[#FCFAF6] shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#E3DED4] bg-white px-5 py-5 sm:px-7"><div><p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">In-memory audit trail</p><h2 className="mt-1 text-xl font-extrabold">Why was this flagged?</h2><p className="mt-1 text-sm text-[#5C5852]">{evidence.title}</p></div><button ref={closeRef} type="button" onClick={onClose} className="rounded-lg border border-[#E3DED4] p-2 hover:bg-[#F5F2EB]" aria-label="Close evidence panel"><X className="h-5 w-5" /></button></div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="text-xs font-bold uppercase text-orange-800">Rule applied</p><p className="mt-2 text-sm leading-relaxed">{evidence.rule}</p><p className="mt-3 text-xs text-[#5C5852]">Inside-defined screening rule; not an official KHDA, DSIB, or ADEK formula.</p></section>
        <section><h3 className="text-sm font-extrabold">Cohort impact</h3><p className="mt-2 text-sm leading-relaxed">{evidence.cohortImpact}</p><p className="mt-2 text-sm text-[#5C5852]">{evidence.talkingPoint}</p></section>
        <section><h3 className="text-sm font-extrabold">Step-by-step math</h3><ol className="mt-2 space-y-2">{evidence.steps.map((step, index) => <li key={step} className="rounded-xl border border-[#E3DED4] bg-white p-3 font-mono text-xs"><span className="mr-2 font-bold text-orange-700">{index + 1}.</span>{step}</li>)}</ol></section>
        <section><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-extrabold">Affected cohort records</h3><p className="mt-1 text-xs text-[#5C5852]">{rows.length} of {evidence.rows.length} local records · source references are visible only here</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter reference or year" aria-label="Filter evidence records" className="rounded-lg border border-[#D6D0C4] bg-white px-3 py-2 text-xs" /></div>
          <div className="mt-3 max-h-[380px] overflow-auto rounded-xl border border-[#E3DED4] bg-white"><table className="w-full min-w-[590px] text-left text-xs"><thead className="sticky top-0 bg-[#F5F2EB]"><tr>{["Student_Ref", "Year_Group", "CAT4_SAS", "Current_Mark", "Attendance_%"].map((heading) => <th key={heading} className="border-b border-[#E3DED4] px-3 py-2 font-extrabold">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.studentRef}-${index}`} className="border-b border-[#EEE9E1] last:border-0"><td className="px-3 py-2 font-mono">{row.studentRef}</td><td className="px-3 py-2">{row.yearGroup === 0 ? "FS" : `Y${row.yearGroup}`}</td><td className="px-3 py-2">{row.cat4Sas ?? "—"}</td><td className="px-3 py-2">{row.currentMark ?? "—"}</td><td className="px-3 py-2">{row.attendance === null ? "—" : `${row.attendance}%`}</td></tr>)}</tbody></table>{!rows.length && <p className="p-4 text-xs text-[#5C5852]">No local records match this filter.</p>}</div>
        </section>
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900"><h3 className="font-extrabold">In-memory audit trail</h3><p className="mt-2">Data source: in-memory session extract</p><p>Processing: local browser memory (Array.filter and arithmetic)</p><p>External transmission for this check: none</p><p>Opened at local system time: {openedAt}</p></section>
      </div>
    </aside>
  </div>;
}
