"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, LockKeyhole, RotateCcw, Send } from "lucide-react";
import { useSessionData } from "@/context/SessionDataContext";
import { LocalRecords } from "@/components/ask/LocalRecords";
import { ConversationAnswer } from "@/components/ask/ConversationAnswer";
import { analyzeStatutoryQuery, analyzeCohortMetric, analyzeRecordList, analyzeAdvice, clarificationResult } from "@/lib/engine/statutory-analysis";
import { AskPlan, canonicalQuestion } from "@/lib/engine/ask-plan";

export default function AskInsidePage() {
  const { students, activeFiles, readinessScore, prefilledQuery, setPrefilledQuery, setPrefilledReportTemplate, askExchanges, addAskExchange, resetAskConversation } = useSessionData();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingTurn, setPendingTurn] = useState<{ id: string; question: string } | null>(null);
  const [revealExchangeId, setRevealExchangeId] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const activeStudentsRef = useRef(students);
  activeStudentsRef.current = students;
  const pendingAnchorRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const submit = async (value: string) => {
    const question = value.trim();
    if (!question || !students.length || pendingRef.current) return;
    const turnId = crypto.randomUUID();
    pendingRef.current = true;
    setPending(true);
    setPendingTurn({ id: turnId, question });
    const currentGeneration = generationRef.current;
    const currentStudents = students;
    setDraft("");
    let interpretedQuestion = question;
    let interpretationSource: "groq" | "local" = "local";
    let presentation = "";
    let reasoning = "";
    let advice: string[] = [];
    let result;
    try {
      // Allow the sent question and thinking state to paint, including for local lookups.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 160));
      if (generationRef.current !== currentGeneration || activeStudentsRef.current !== currentStudents) return;
      const matchingNames = students.filter((student) => student.name && student.name.length > 3 && new RegExp(`(^|[^a-z0-9])${student.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z0-9])`, "i").test(question));
      const hasKnownReference = students.some((student) => [student.sourceRef, student.id].some((ref) => ref && ref.length >= 3 && question.toLowerCase().includes(ref.toLowerCase()) && new RegExp(`(^|[^a-z0-9])${ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z0-9])`, "i").test(question)));
      const isReferenceQuestion = hasKnownReference || /\b(?:roll(?: number| no)?|student id|pupil id|source ref|anonymous ref)\b|\bstu-[a-z0-9-]+\b/i.test(question);
      if (matchingNames.length > 1) {
        result = clarificationResult("More than one pupil matches that name. Use the source or roll reference from the local records table to select one.", students.length);
      } else if (matchingNames.length === 1) {
        interpretedQuestion = `student id ${matchingNames[0].sourceRef || matchingNames[0].id}`;
        result = analyzeStatutoryQuery(students, interpretedQuestion, activeFiles, readinessScore);
      } else if (isReferenceQuestion) {
        interpretedQuestion = hasKnownReference && !/\b(?:roll(?: number| no)?|student id|pupil id|source ref|anonymous ref)\b|\bstu-[a-z0-9-]+\b/i.test(question) ? `student id ${question}` : question;
        result = analyzeStatutoryQuery(students, interpretedQuestion, activeFiles, readinessScore);
      } else {
        const previousQuestions = askExchanges.filter((exchange) => exchange.interpretationSource === "groq" && !exchange.result.intent.clarificationNeeded).slice(-4).map((exchange) => exchange.interpretedQuestion);
        const controller = new AbortController();
        requestRef.current = controller;
        const response = await fetch("/api/ai/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: question, previousQuestions }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Ask Inside could not connect to Groq. Please try again.");
        const plan = payload.plan as AskPlan;
        interpretationSource = "groq";
        presentation = plan.presentation;
        reasoning = plan.reasoning;
        advice = plan.analysis === "advice" ? plan.advice : [];
        const canonical = canonicalQuestion(plan);
        if (!canonical) {
          result = clarificationResult(plan.clarification || "I cannot verify that calculation yet. Ask about attainment, attendance, SEND, gender, Emirati pupils, phases, or data quality.", students.length);
        } else {
          interpretedQuestion = canonical;
          result = plan.analysis === "advice" ? analyzeAdvice(students, plan, activeFiles)
            : plan.analysis === "record_list" ? analyzeRecordList(students, plan, activeFiles)
            : plan.analysis === "cohort_metric" ? analyzeCohortMetric(students, plan, activeFiles)
            : analyzeStatutoryQuery(students, canonical, activeFiles, readinessScore);
        }
      }
    } catch (error) {
      result = clarificationResult(error instanceof Error ? error.message : "Ask Inside could not connect to Groq. Please try again.", students.length);
    } finally {
      if (generationRef.current === currentGeneration) {
        pendingRef.current = false;
        requestRef.current = null;
        setPending(false);
        setPendingTurn(null);
      }
    }
    if (generationRef.current !== currentGeneration || activeStudentsRef.current !== currentStudents || !result) return;
    setRevealExchangeId(turnId);
    addAskExchange({ id: turnId, question, interpretedQuestion, interpretationSource, presentation, reasoning, advice, result });
  };

  useEffect(() => {
    if (!prefilledQuery) return;
    submit(prefilledQuery);
    setPrefilledQuery("");
  // A Home deep link is consumed once when it arrives.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledQuery]);

  useEffect(() => {
    if (!pendingTurn) return;
    const frame = requestAnimationFrame(() => pendingAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" }));
    return () => cancelAnimationFrame(frame);
  }, [pendingTurn?.id]);

  const saveToReport = (question: string) => {
    setPrefilledReportTemplate(/send|inclusion/i.test(question) ? "Inclusion & SEND Gap Audit" : "Full Inspection Evidence Pack");
    router.push("/app/reports");
  };
  const starters = [
    "How does whole-school attainment compare with our 75% internal reference?",
    students.some((student) => student.senStatus || student.inclusionSend && student.inclusionSend !== "None")
      ? "What is the observed progress gap between SEND pupils and their peers?"
      : "Compare current attainment across English, Mathematics, and Science.",
    students.some((student) => student.attendanceRate < 90)
      ? "How does persistent absence relate to current attainment?"
      : "Are our source files mapped and free of duplicate pupil references?",
    students.some((student) => student.emiratiStatus)
      ? "How does Emirati pupil attainment compare with other pupils?"
      : "Which pupils have the lowest current core grades?",
  ];

  return <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-4xl flex-col pb-4">
    <div className="flex items-center justify-between border-b border-[#E3DED4] pb-4">
      <div><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Ask Inside</h1><p className="mt-1 text-xs text-[#5C5852]">Uploaded records stay in this browser. General question text goes to Groq; recognized pupil names and references are handled locally. Do not paste data tables or figures.</p></div>
      <button onClick={() => { generationRef.current++; requestRef.current?.abort(); requestRef.current = null; pendingRef.current = false; setPending(false); setPendingTurn(null); setRevealExchangeId(null); resetAskConversation(); setDraft(""); composerRef.current?.focus(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E3DED4] bg-white px-3 py-2 text-xs font-bold text-[#5C5852] transition hover:border-orange-300 hover:text-orange-700" aria-label="Reset conversation"><RotateCcw className="h-4 w-4" />New conversation</button>
    </div>

    {!!students.length && <LocalRecords students={students} title="View current data records" />}

    <div className="flex-1" aria-live="polite">
      {!askExchanges.length && !pendingTurn ? <div className="flex min-h-[52vh] flex-col items-center justify-center px-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><BarChart3 className="h-6 w-6" /></span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">What would you like to understand?</h2>
        <p className="mt-2 max-w-xl text-sm text-[#5C5852]">Ask about your current school data. Inside will show the evidence behind each answer.</p>
        {!students.length && <Link href="/app/data" className="mt-5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white">Upload data to begin</Link>}
        <p className="mt-7 text-[11px] font-bold uppercase tracking-wider text-[#817B71]">Suggested from current evidence</p>
        <div className="mt-3 grid w-full max-w-2xl gap-3 sm:grid-cols-2">{starters.map((prompt) => <button key={prompt} type="button" disabled={!students.length || pending} onClick={() => submit(prompt)} className="flex min-h-24 items-start justify-between gap-3 rounded-2xl border border-[#E3DED4] bg-white p-4 text-left text-sm font-semibold leading-relaxed shadow-sm transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"><span>{prompt}</span><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" /></button>)}</div>
      </div> : <div className="space-y-10 py-8">{askExchanges.map((exchange) => <ConversationAnswer key={exchange.id} exchange={exchange} students={students} onSave={saveToReport} animate={exchange.id === revealExchangeId} />)}{pendingTurn && <div key={pendingTurn.id} ref={pendingAnchorRef} className="space-y-5 scroll-mb-40">
        <div className="flex justify-end"><p className="max-w-[85%] rounded-3xl rounded-br-md bg-[#EFEAE1] px-4 py-3 text-sm font-semibold leading-relaxed sm:max-w-[75%]">{pendingTurn.question}</p></div>
        <div className="flex items-center gap-3 sm:gap-4" role="status"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-xs font-black text-white">IN</span><span className="text-sm text-[#5C5852]">Thinking<span className="inline-block animate-pulse">…</span></span></div>
      </div>}</div>}
    </div>

    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-[#F5F2EB] via-[#F5F2EB] to-transparent pt-5">
      <form onSubmit={(event) => { event.preventDefault(); submit(draft); }} className="rounded-2xl border border-[#D6D0C4] bg-white p-2 shadow-lg shadow-stone-200/70 focus-within:border-orange-400">
        <label htmlFor="inside-composer" className="sr-only">Ask Inside a question</label>
        <textarea ref={composerRef} id="inside-composer" rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(draft); } }} placeholder={students.length ? "Ask a follow-up about your data..." : "Upload data to start a conversation"} disabled={!students.length || pending} className="max-h-40 min-h-16 w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#958E83] disabled:cursor-not-allowed" />
        <div className="flex items-center justify-between px-2 pb-1"><span className="inline-flex items-center gap-1.5 text-[11px] text-[#746D62]"><LockKeyhole className="h-3.5 w-3.5" />Pupil rows remain local</span><button type="submit" disabled={!draft.trim() || !students.length || pending} aria-label="Send question" className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-[#D8D0C3]"><Send className="h-4 w-4" /></button></div>
      </form>
      <p className="mt-2 text-center text-[10px] text-[#817B71]">Figures are calculated from the active session. Use Verify results to inspect every step.</p>
    </div>
  </div>;
}
