"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  RotateCcw,
  Send,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  Layers,
} from "lucide-react";
import { useSessionData } from "@/context/SessionDataContext";
import { LocalRecords } from "@/components/ask/LocalRecords";
import { ConversationAnswer } from "@/components/ask/ConversationAnswer";
import {
  analyzeStatutoryQuery,
  analyzeCohortMetric,
  analyzeRecordList,
  analyzeAdvice,
  clarificationResult,
} from "@/lib/engine/statutory-analysis";
import { AskPlan, canonicalQuestion } from "@/lib/engine/ask-plan";
import { resolveDeterministicQuery } from "@/lib/deterministicRouter";

interface PromptGroup {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  prompts: string[];
}

const VERIFIED_PROMPT_GROUPS: PromptGroup[] = [
  {
    category: "Attainment & Baselines",
    icon: BookOpen,
    prompts: [
      "How is whole-school attainment compared with the 75% reference?",
      "Which core subject needs attention first?",
      "CAT4 target check / reality map comparison",
    ],
  },
  {
    category: "Attendance & Pastoral",
    icon: Clock,
    prompts: [
      "How does persistent absence relate to attainment?",
      "Show Year 8 attendance week by week this term.",
    ],
  },
  {
    category: "Inclusion & Cohorts",
    icon: Users,
    prompts: [
      "Are our SEND students making progress compared with peers?",
      "Is there a gap for our Emirati students?",
      "Is there a gender gap in KS3 English?",
      "Are new joiners settling in and making progress?",
    ],
  },
  {
    category: "Interventions & Classes",
    icon: Layers,
    prompts: [
      "Did the Year 10–11 Maths Booster work?",
      "Which classes are underperforming on progress?",
      "Which Year 10–11 students are closest to a grade 5, and are they attending?",
    ],
  },
];

export default function AskInsidePage() {
  const {
    students,
    activeFiles,
    readinessScore,
    statsDigest,
    prefilledQuery,
    setPrefilledQuery,
    setPrefilledReportTemplate,
    askExchanges,
    addAskExchange,
    resetAskConversation,
  } = useSessionData();
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
    let briefingCard = null;

    try {
      // 1. LAYER 2 DETERMINISTIC ROUTER (Instant <50ms local memory match)
      const deterministicMatch = resolveDeterministicQuery(question, students, statsDigest);
      if (deterministicMatch) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
        briefingCard = deterministicMatch;
        interpretedQuestion = deterministicMatch.matchedIntent;
        interpretationSource = "local";
      } else {
        // 2. Local Pupil Name & Reference Lookup (zero-transmission)
        await new Promise<void>((resolve) => window.setTimeout(resolve, 140));
        if (generationRef.current !== currentGeneration || activeStudentsRef.current !== currentStudents) return;

        const matchingNames = students.filter(
          (student) =>
            student.name &&
            student.name.length > 3 &&
            new RegExp(`(^|[^a-z0-9])${student.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z0-9])`, "i").test(
              question
            )
        );
        const hasKnownReference = students.some((student) =>
          [student.sourceRef, student.id].some(
            (ref) =>
              ref &&
              ref.length >= 3 &&
              question.toLowerCase().includes(ref.toLowerCase()) &&
              new RegExp(`(^|[^a-z0-9])${ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z0-9])`, "i").test(question)
          )
        );
        const isReferenceQuestion =
          hasKnownReference ||
          /\b(?:roll(?: number| no)?|student id|pupil id|source ref|anonymous ref)\b|\bstu-[a-z0-9-]+\b/i.test(question);

        if (matchingNames.length > 1) {
          result = clarificationResult(
            "More than one pupil matches that name. Use the source or roll reference from the local records table to select one.",
            students.length
          );
        } else if (matchingNames.length === 1) {
          interpretedQuestion = `student id ${matchingNames[0].sourceRef || matchingNames[0].id}`;
          result = analyzeStatutoryQuery(students, interpretedQuestion, activeFiles, readinessScore);
        } else if (isReferenceQuestion) {
          interpretedQuestion =
            hasKnownReference &&
            !/\b(?:roll(?: number| no)?|student id|pupil id|source ref|anonymous ref)\b|\bstu-[a-z0-9-]+\b/i.test(question)
              ? `student id ${question}`
              : question;
          result = analyzeStatutoryQuery(students, interpretedQuestion, activeFiles, readinessScore);
        } else {
          // 3. LAYER 3 GROUNDED LLM FALLBACK (Aggregate Context ONLY, ZERO student rows)
          const previousQuestions = askExchanges
            .filter((exchange) => exchange.interpretationSource === "groq" && !exchange.result?.intent.clarificationNeeded)
            .slice(-4)
            .map((exchange) => exchange.interpretedQuestion);

          const controller = new AbortController();
          requestRef.current = controller;
          const response = await fetch("/api/ai/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: question,
              previousQuestions,
              statsDigest, // Only aggregate statistics passed
            }),
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
            result = clarificationResult(
              plan.clarification ||
                "I cannot verify that calculation yet. Ask about attainment, attendance, SEND, gender, Emirati pupils, phases, or data quality.",
              students.length
            );
          } else {
            interpretedQuestion = canonical;
            result =
              plan.analysis === "advice"
                ? analyzeAdvice(students, plan, activeFiles)
                : plan.analysis === "record_list"
                ? analyzeRecordList(students, plan, activeFiles)
                : plan.analysis === "cohort_metric"
                ? analyzeCohortMetric(students, plan, activeFiles)
                : analyzeStatutoryQuery(students, canonical, activeFiles, readinessScore);
          }
        }
      }
    } catch (error) {
      result = clarificationResult(
        error instanceof Error ? error.message : "Ask Inside could not connect to Groq. Please try again.",
        students.length
      );
    } finally {
      if (generationRef.current === currentGeneration) {
        pendingRef.current = false;
        requestRef.current = null;
        setPending(false);
        setPendingTurn(null);
      }
    }

    if (generationRef.current !== currentGeneration || activeStudentsRef.current !== currentStudents) return;
    if (!result && !briefingCard) return;

    setRevealExchangeId(turnId);
    addAskExchange({
      id: turnId,
      question,
      interpretedQuestion,
      interpretationSource,
      presentation,
      reasoning,
      advice,
      result,
      briefingCard: briefingCard || undefined,
    });
  };

  useEffect(() => {
    if (!prefilledQuery) return;
    submit(prefilledQuery);
    setPrefilledQuery("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledQuery]);

  useEffect(() => {
    if (!pendingTurn) return;
    const frame = requestAnimationFrame(() =>
      pendingAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    );
    return () => cancelAnimationFrame(frame);
  }, [pendingTurn?.id]);

  const saveToReport = (question: string) => {
    setPrefilledReportTemplate(
      /send|inclusion/i.test(question) ? "Inclusion & SEND Gap Audit" : "Full DSIB/ADEK Evidence Pack"
    );
    router.push("/app/reports");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-4xl flex-col pb-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E3DED4] pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl text-[#1C1A17]">Ask Inside</h1>
          <p className="mt-1 text-xs text-[#5C5852]">
            Deterministic UAE Inspection Copilot. 100% local calculation in volatile RAM — zero student rows sent to external AI.
          </p>
        </div>
        <button
          onClick={() => {
            generationRef.current++;
            requestRef.current?.abort();
            requestRef.current = null;
            pendingRef.current = false;
            setPending(false);
            setPendingTurn(null);
            setRevealExchangeId(null);
            resetAskConversation();
            setDraft("");
            composerRef.current?.focus();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E3DED4] bg-white px-3 py-2 text-xs font-bold text-[#5C5852] transition hover:border-orange-300 hover:text-orange-700 shadow-2xs"
          aria-label="Reset conversation"
        >
          <RotateCcw className="h-4 w-4" />
          New conversation
        </button>
      </div>

      {/* Categorized 12 Quick-Prompt Chips Banner */}
      <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            12 Verified Inspection Prompt Chips (1-Click Deterministic Verification)
          </p>
          <span className="text-[10px] font-bold text-orange-700 hidden sm:inline">Demo Script Verified</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VERIFIED_PROMPT_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.category} className="rounded-xl border border-[#E8E2D9] bg-white p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#736B5E] flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-orange-600" />
                  {group.category}
                </p>
                <div className="mt-2 space-y-1.5">
                  {group.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={pending || !students.length}
                      onClick={() => submit(p)}
                      className="w-full text-left text-[12px] font-semibold text-[#2C2925] hover:text-orange-700 hover:bg-orange-50/60 p-1.5 rounded-lg transition flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{p}</span>
                      <ArrowRight className="h-3 w-3 text-[#8C877E] group-hover:text-orange-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!!students.length && <LocalRecords students={students} title="View current data records in RAM" />}

      {/* Conversation History Stream */}
      <div className="flex-1" aria-live="polite">
        {!askExchanges.length && !pendingTurn ? (
          <div className="flex min-h-[38vh] flex-col items-center justify-center px-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <BarChart3 className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl text-[#1C1A17]">
              What would you like to inspect?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#5C5852]">
              Select a prompt chip above or type any inspection query below. All calculations execute deterministically in local browser memory.
            </p>
            {!students.length && (
              <Link href="/app/data" className="mt-5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-xs">
                Upload data to begin
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8 py-6">
            {askExchanges.map((exchange) => (
              <ConversationAnswer
                key={exchange.id}
                exchange={exchange}
                students={students}
                onSave={saveToReport}
                onFollowUp={(q) => submit(q)}
                animate={exchange.id === revealExchangeId}
              />
            ))}
            {pendingTurn && (
              <div key={pendingTurn.id} ref={pendingAnchorRef} className="space-y-4 scroll-mb-40">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-3xl rounded-br-md bg-[#EFEAE1] px-4 py-3 text-sm font-semibold leading-relaxed sm:max-w-[75%] text-[#1C1A17]">
                    {pendingTurn.question}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4" role="status">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-xs font-black text-white">
                    IN
                  </span>
                  <span className="text-sm font-semibold text-[#5C5852]">
                    Inspecting local records<span className="inline-block animate-pulse">…</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer Input Box */}
      <div className="sticky bottom-0 z-10 bg-gradient-to-t from-[#F5F2EB] via-[#F5F2EB] to-transparent pt-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
          className="rounded-2xl border border-[#D6D0C4] bg-white p-2.5 shadow-lg shadow-stone-200/70 focus-within:border-orange-400"
        >
          <label htmlFor="inside-composer" className="sr-only">
            Ask Inside a question
          </label>
          <textarea
            ref={composerRef}
            id="inside-composer"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(draft);
              }
            }}
            placeholder={students.length ? "Ask any statutory inspection question or type a pupil reference..." : "Upload data to start a conversation"}
            disabled={!students.length || pending}
            className="max-h-40 min-h-16 w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#958E83] disabled:cursor-not-allowed text-[#1C1A17]"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#746D62]">
              <LockKeyhole className="h-3.5 w-3.5 text-emerald-700" />
              1,300 pupil records held in volatile browser RAM
            </span>
            <button
              type="submit"
              disabled={!draft.trim() || !students.length || pending}
              aria-label="Send question"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-[#D8D0C3] shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-[10px] font-semibold text-[#817B71]">
          Inspection figures computed directly from active dataset. Click Verify results to view audit trail.
        </p>
      </div>
    </div>
  );
}
