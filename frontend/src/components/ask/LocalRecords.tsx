"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Database, LockKeyhole, Search } from "lucide-react";
import type { StudentRecord } from "@/types/student-data";

const PAGE_SIZE = 25;
const PRIMARY_FIELDS: (keyof StudentRecord)[] = [
  "sourceRef", "id", "name", "yearGroup", "classGroup", "gender", "attendanceRate",
  "mathGrade", "englishGrade", "scienceGrade", "term1MathGrade", "term2MathGrade",
  "term1EnglishGrade", "term2EnglishGrade", "term1ScienceGrade", "term2ScienceGrade",
  "senStatus", "inclusionSend", "emiratiStatus",
];

const LABELS: Partial<Record<keyof StudentRecord, string>> = {
  sourceRef: "Source / roll reference", id: "Inside reference", name: "Pupil name",
  yearGroup: "Year", classGroup: "Class", attendanceRate: "Attendance %",
  mathGrade: "Math", englishGrade: "English", scienceGrade: "Science",
  term1MathGrade: "Math T1", term2MathGrade: "Math T2",
  term1EnglishGrade: "English T1", term2EnglishGrade: "English T2",
  term1ScienceGrade: "Science T1", term2ScienceGrade: "Science T2",
  senStatus: "SEND", inclusionSend: "Inclusion", emiratiStatus: "Emirati",
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function LocalRecords({ students, recordIds, title }: { students: StudentRecord[]; recordIds?: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const records = useMemo(() => {
    if (!recordIds) return students;
    const ids = new Set(recordIds);
    return students.filter((student) => ids.has(student.id));
  }, [students, recordIds]);
  const fields = useMemo(() => {
    const present = new Set(records.flatMap((record) => Object.keys(record)));
    return [...PRIMARY_FIELDS, ...Array.from(present).filter((field) => !PRIMARY_FIELDS.includes(field as keyof StudentRecord))]
      .filter((field) => present.has(field)) as (keyof StudentRecord)[];
  }, [records]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? records.filter((record) => fields.some((field) => displayValue(record[field]).toLowerCase().includes(term))) : records;
  }, [records, fields, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return <section className="mt-5 overflow-hidden rounded-2xl border border-[#E3DED4] bg-white">
    <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FBF9F5]">
      <span className="flex items-center gap-2 text-sm font-extrabold"><Database className="h-4 w-4 text-orange-600" />{title} <span className="font-semibold text-[#726C62]">({records.length})</span></span>
      <ChevronDown className={`h-4 w-4 text-[#726C62] transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="border-t border-[#E3DED4]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-[#5C5852]"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />Actual source records are visible only in this browser session. Nothing in this table is sent to Groq.</p>
        <label className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E3DED4] px-3 py-2 text-xs"><Search className="h-3.5 w-3.5 text-[#817B71]" /><span className="sr-only">Search local records</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search these records" className="w-44 bg-transparent outline-none placeholder:text-[#958E83]" /></label>
      </div>
      <div className="max-h-[28rem] overflow-auto"><table className="w-full min-w-max border-collapse text-left text-xs"><thead className="sticky top-0 z-10 bg-[#F9F6F0]"><tr>{fields.map((field) => <th key={field} className="whitespace-nowrap border-b border-[#E3DED4] px-3 py-2.5 font-extrabold">{LABELS[field] || field}</th>)}</tr></thead><tbody>{visible.map((record, index) => <tr key={`${record.id}-${safePage * PAGE_SIZE + index}`} className="border-b border-[#EEE9E1] last:border-0 hover:bg-orange-50/40">{fields.map((field) => <td key={field} className="max-w-56 whitespace-nowrap px-3 py-2.5">{displayValue(record[field])}</td>)}</tr>)}</tbody></table>{!visible.length && <p className="p-5 text-sm text-[#726C62]">No records match this search.</p>}</div>
      <div className="flex items-center justify-between gap-3 border-t border-[#E3DED4] px-4 py-3 text-xs text-[#5C5852]"><span>{filtered.length ? `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}` : "0"} of {filtered.length} records</span><div className="flex items-center gap-2"><button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-[#E3DED4] px-2.5 py-1.5 font-bold disabled:opacity-40">Previous</button><button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-[#E3DED4] px-2.5 py-1.5 font-bold disabled:opacity-40">Next</button></div></div>
    </div>}
  </section>;
}
