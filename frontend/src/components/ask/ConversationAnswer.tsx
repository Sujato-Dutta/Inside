"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AskExchange } from "@/context/SessionDataContext";
import type { StudentRecord } from "@/types/student-data";
import { LocalRecords } from "./LocalRecords";

export function ConversationAnswer({ exchange, students, onSave, animate }: { exchange: AskExchange; students: StudentRecord[]; onSave: (question: string) => void; animate: boolean }) {
  const { result } = exchange;
  const paragraphs = useMemo(() => [exchange.presentation, ...result.suggestedActions].filter((item): item is string => Boolean(item)), [exchange.presentation, result.suggestedActions]);
  const totalChars = paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0);
  const [visibleChars, setVisibleChars] = useState(animate ? 0 : totalChars);
  useEffect(() => {
    if (!animate) { setVisibleChars(totalChars); return; }
    setVisibleChars(0);
    const timer = window.setInterval(() => setVisibleChars((current) => {
      const next = Math.min(totalChars, current + 24);
      if (next >= totalChars) window.clearInterval(timer);
      return next;
    }), 18);
    return () => window.clearInterval(timer);
  }, [animate, totalChars]);
  const complete = visibleChars >= totalChars;
  const chart = result.chart;
  const showChart = Boolean(chart && (chart.data.length > 1 || chart.yKeys.length > 1));
  const percentChart = Boolean(chart && /attainment|absence|benchmark|phase/i.test(chart.title));
  const showBenchmark = Boolean(chart && /attainment|benchmark|phase/i.test(chart.title));
  let offset = 0;

  return <div className="space-y-5">
    <div className="flex justify-end"><p className="max-w-[85%] rounded-3xl rounded-br-md bg-[#EFEAE1] px-4 py-3 text-sm font-semibold leading-relaxed sm:max-w-[75%]">{exchange.question}</p></div>
    <article className="flex gap-3 sm:gap-4"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-xs font-black text-white">IN</span><div className="min-w-0 flex-1">
      <div className="space-y-3 text-sm leading-relaxed text-[#37332D]">{paragraphs.map((paragraph, index) => {
        const shown = Math.max(0, Math.min(paragraph.length, visibleChars - offset));
        offset += paragraph.length;
        return shown > 0 ? <p key={`${index}-${paragraph}`}>{paragraph.slice(0, shown)}{!complete && shown < paragraph.length && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-600 align-middle" aria-hidden="true" />}</p> : null;
      })}{!complete && visibleChars === 0 && <span className="inline-block h-4 w-0.5 animate-pulse bg-orange-600 align-middle" aria-label="Inside is answering" />}</div>
      {complete && <>
        {result.intent.intentType === "student_lookup" && !!result.table.rows.length && <div className="mt-4"><div className="max-h-96 overflow-auto"><table className="w-full min-w-max border-collapse text-left text-xs"><thead className="sticky top-0 bg-[#F9F6F0]"><tr>{result.table.headers.map((header) => <th key={header} className="border-b border-[#D6D0C4] px-3 py-2.5 font-extrabold">{header}</th>)}</tr></thead><tbody>{result.table.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-[#E9E3D9] last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-nowrap px-3 py-2.5">{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-2 text-xs text-[#726C62]">Names and marks in this table are read only from your browser session. They are not sent to Groq.</p></div>}
        {showChart && chart && <div className="mt-5"><p className="mb-2 text-xs font-semibold text-[#5C5852]">{chart.title}</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart.data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#EAE5DC" strokeDasharray="3 3" vertical={false} /><XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} /><YAxis domain={percentChart ? [0, 100] : ["auto", "auto"]} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />{chart.yKeys.map((key, index) => <Bar key={key} dataKey={key} fill={index ? "#D8D0C3" : "#F97316"} radius={[5, 5, 0, 0]} />)}{showBenchmark && <ReferenceLine y={75} stroke="#2563EB" strokeDasharray="4 4" />}</BarChart></ResponsiveContainer></div></div>}
        {!!exchange.advice?.length && <div className="mt-4 text-sm leading-relaxed text-[#37332D]"><p>Possible next steps, offered as general advice rather than conclusions from pupil records:</p><ul className="mt-2 list-disc space-y-1.5 pl-5">{exchange.advice.map((idea) => <li key={idea}>{idea}</li>)}</ul></div>}
        {!result.intent.clarificationNeeded && <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-bold"><Link href={`/app/ask/verify/${exchange.id}`} className="inline-flex items-center gap-1.5 rounded-lg text-orange-700 underline-offset-4 hover:underline"><ShieldCheck className="h-4 w-4" />Verify results <ArrowRight className="h-3.5 w-3.5" /></Link><Link href="/app/data" className="text-[#5C5852] hover:text-orange-700">View source files</Link><button onClick={() => onSave(exchange.interpretedQuestion)} className="inline-flex items-center gap-1.5 text-[#5C5852] hover:text-orange-700"><FileText className="h-4 w-4" />Save to Inspection Brief</button></div>}
        {!!result.verification?.localRecordIds?.length && <LocalRecords students={students} recordIds={result.verification.localRecordIds} title="View records used in this answer" />}
      </>}
    </div></article>
  </div>;
}
