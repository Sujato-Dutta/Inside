"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, FileText, LockKeyhole, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSessionData } from "@/context/SessionDataContext";
import { analyzeStatutoryQuery } from "@/lib/engine/statutory-analysis";

const STARTERS = [
  "How does whole-school attainment compare with the 75% DSIB reference?",
  "What is the progress gap between SEND pupils and their peers?",
  "How does persistent absence relate to current attainment?",
  "Are our source files mapped and free of duplicate pupil references?",
];

function withConversationContext(question: string, previous?: string) {
  if (!previous || !/^(and\b|what about\b|how about\b|for\b|those\b|same\b)/i.test(question)) return question;
  const hasSubject = /math|science|english/i.test(question);
  const hasTopic = /attendance|absence|send|inclusion|gender|boys|girls|emirati|national|duplicate|mapping|quality|boundary|borderline|phase|attainment|progress/i.test(question);
  if (hasTopic && !/boys|girls|gender/i.test(question)) return question;
  const base = previous.replace(/\b(?:year|y)\s*\d{1,2}\b|\bks[1-4]\b|\b(?:primary|secondary|post-16)\b/gi, "").trim();
  const inheritedSubject = !hasSubject ? previous.match(/\b(math(?:ematics)?|science|english)\b/i)?.[0] : undefined;
  return `${hasTopic ? "" : base} ${inheritedSubject || ""} ${question}`.trim();
}

export default function AskInsidePage() {
  const { students, activeFiles, readinessScore, prefilledQuery, setPrefilledQuery, setPrefilledReportTemplate, askExchanges, addAskExchange, resetAskConversation } = useSessionData();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const submit = (value: string) => {
    const question = value.trim();
    if (!question || !students.length) return;
    const interpretedQuestion = withConversationContext(question, askExchanges.at(-1)?.interpretedQuestion);
    const result = analyzeStatutoryQuery(students, interpretedQuestion, activeFiles, readinessScore);
    addAskExchange({ id: crypto.randomUUID(), question, interpretedQuestion, result });
    setDraft("");
  };

  useEffect(() => {
    if (!prefilledQuery) return;
    submit(prefilledQuery);
    setPrefilledQuery("");
  // A Home deep link is consumed once when it arrives.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledQuery]);

  useEffect(() => { if (askExchanges.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [askExchanges.length]);

  const saveToReport = (question: string) => {
    setPrefilledReportTemplate(/send|inclusion/i.test(question) ? "Inclusion & SEND Gap Audit" : "Full Inspection Evidence Pack");
    router.push("/app/reports");
  };

  return <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-4xl flex-col pb-4">
    <div className="flex items-center justify-between border-b border-[#E3DED4] pb-4">
      <div><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Ask Inside</h1><p className="mt-1 text-xs text-[#5C5852]">Questions and calculations stay in this browser session.</p></div>
      <button onClick={() => { resetAskConversation(); setDraft(""); composerRef.current?.focus(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E3DED4] bg-white px-3 py-2 text-xs font-bold text-[#5C5852] transition hover:border-orange-300 hover:text-orange-700" aria-label="Reset conversation"><RotateCcw className="h-4 w-4" />New conversation</button>
    </div>

    <div className="flex-1" aria-live="polite">
      {!askExchanges.length ? <div className="flex min-h-[52vh] flex-col items-center justify-center px-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><BarChart3 className="h-6 w-6" /></span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">What would you like to understand?</h2>
        <p className="mt-2 max-w-xl text-sm text-[#5C5852]">Ask about your current school data. Inside will show the evidence behind each answer.</p>
        {!students.length && <Link href="/app/data" className="mt-5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white">Upload data to begin</Link>}
        <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">{STARTERS.map((prompt) => <button key={prompt} type="button" disabled={!students.length} onClick={() => submit(prompt)} className="flex min-h-24 items-start justify-between gap-3 rounded-2xl border border-[#E3DED4] bg-white p-4 text-left text-sm font-semibold leading-relaxed shadow-sm transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"><span>{prompt}</span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" /></button>)}</div>
      </div> : <div className="space-y-10 py-8">{askExchanges.map((exchange) => {
        const { result } = exchange;
        const percentChart = Boolean(result.chart && /attainment|absence|benchmark|phase/i.test(result.chart.title));
        return <div key={exchange.id} className="space-y-5">
          <div className="flex justify-end"><p className="max-w-[85%] rounded-3xl rounded-br-md bg-[#EFEAE1] px-4 py-3 text-sm font-semibold leading-relaxed sm:max-w-[75%]">{exchange.question}</p></div>
          <article className="flex gap-3 sm:gap-4"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-xs font-black text-white">IN</span><div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">Inside analysis</p>
            <h2 className="mt-1 text-lg font-extrabold">{result.chart?.title || "Analysis"}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#37332D]">{result.suggestedActions.map((finding) => <p key={finding}>{finding}</p>)}</div>
            <div className="mt-5 flex flex-wrap gap-2">{result.kpis.slice(0, 3).map((kpi) => <div key={kpi.label} className="rounded-xl border border-[#E3DED4] bg-white px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[#726C62]">{kpi.label}</p><p className="mt-1 text-base font-extrabold">{kpi.value}</p></div>)}</div>
            {result.chart && <div className="mt-5 rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="mb-3 text-xs font-bold text-[#5C5852]">{result.chart.title}</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.chart.data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#EAE5DC" strokeDasharray="3 3" vertical={false} /><XAxis dataKey={result.chart.xKey} tick={{ fontSize: 11 }} /><YAxis domain={percentChart ? [0, 100] : ["auto", "auto"]} tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />{result.chart.yKeys.map((key, index) => <Bar key={key} dataKey={key} fill={index ? "#D8D0C3" : "#F97316"} radius={[5, 5, 0, 0]} />)}{percentChart && <ReferenceLine y={75} stroke="#2563EB" strokeDasharray="4 4" />}</BarChart></ResponsiveContainer></div></div>}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-bold"><Link href={`/app/ask/verify/${exchange.id}`} className="inline-flex items-center gap-1.5 rounded-lg text-orange-700 underline-offset-4 hover:underline"><ShieldCheck className="h-4 w-4" />Verify results <ArrowRight className="h-3.5 w-3.5" /></Link><button onClick={() => saveToReport(exchange.interpretedQuestion)} className="inline-flex items-center gap-1.5 text-[#5C5852] hover:text-orange-700"><FileText className="h-4 w-4" />Save to Inspection Brief</button></div>
          </div></article>
        </div>;
      })}<div ref={endRef} /></div>}
    </div>

    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-[#F5F2EB] via-[#F5F2EB] to-transparent pt-5">
      <form onSubmit={(event) => { event.preventDefault(); submit(draft); }} className="rounded-2xl border border-[#D6D0C4] bg-white p-2 shadow-lg shadow-stone-200/70 focus-within:border-orange-400">
        <label htmlFor="inside-composer" className="sr-only">Ask Inside a question</label>
        <textarea ref={composerRef} id="inside-composer" rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(draft); } }} placeholder={students.length ? "Ask a follow-up about your data..." : "Upload data to start a conversation"} disabled={!students.length} className="max-h-40 min-h-16 w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#958E83] disabled:cursor-not-allowed" />
        <div className="flex items-center justify-between px-2 pb-1"><span className="inline-flex items-center gap-1.5 text-[11px] text-[#746D62]"><LockKeyhole className="h-3.5 w-3.5" />Local evidence only</span><button type="submit" disabled={!draft.trim() || !students.length} aria-label="Send question" className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-[#D8D0C3]"><Send className="h-4 w-4" /></button></div>
      </form>
      <p className="mt-2 text-center text-[10px] text-[#817B71]">Figures are calculated from the active session. Use Verify results to inspect every step.</p>
    </div>
  </div>;
}
