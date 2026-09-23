"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calculator, Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { useSessionData } from "@/context/SessionDataContext";

function VerificationContent() {
  const { id } = useParams<{ id: string }>();
  const { askExchanges, activeFiles } = useSessionData();
  const exchange = askExchanges.find((item) => item.id === id);

  if (!exchange) return <div className="mx-auto max-w-2xl py-20 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-orange-600" /><h1 className="mt-4 text-2xl font-extrabold">This verification is no longer in memory</h1><p className="mt-2 text-sm text-[#5C5852]">Answers exist only in the current browser session. A new conversation or data load clears them.</p><Link href="/app/ask" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" />Back to Ask Inside</Link></div>;

  const { result } = exchange;
  const proof = result.verification;
  if (!proof) return <div className="mx-auto max-w-2xl py-20 text-center"><h1 className="text-2xl font-extrabold">Verification is unavailable for this answer</h1><Link href="/app/ask" className="mt-5 inline-block text-sm font-bold text-orange-700">Back to Ask Inside</Link></div>;
  return <div className="mx-auto max-w-5xl space-y-6 pb-16">
    <Link href="/app/ask" className="inline-flex items-center gap-2 text-sm font-bold text-orange-700 hover:underline"><ArrowLeft className="h-4 w-4" />Back to conversation</Link>
    <header className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white p-6 sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" />Verified in this browser</div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Calculation record</h1>
      <p className="mt-2 text-sm text-[#5C5852]">{exchange.interpretationSource === "local" ? "The pupil reference was matched in this browser." : "Groq selected the analysis type from question text."} Every figure below was calculated from the active data in this browser. This page shows reproducible arithmetic, not model internal reasoning.</p>
      <div className="mt-6 rounded-2xl border border-[#E3DED4] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-[#817B71]">Question</p><p className="mt-1 text-base font-semibold">{exchange.question}</p>{exchange.interpretedQuestion !== exchange.question && <p className="mt-3 text-xs text-[#5C5852]">Conversation context used: {exchange.interpretedQuestion}</p>}</div>
    </header>

    <div className="grid gap-4 sm:grid-cols-3">{[
      ["Records in active dataset", proof.totalRecords],
      ["Records used in calculation", proof.matchedRecords],
      ["Calculation steps", proof.steps.length],
    ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-[#E3DED4] bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-[#726C62]">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p></div>)}</div>

    <section className="rounded-3xl border border-[#E3DED4] bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Calculator className="h-5 w-5 text-orange-600" />How the question was interpreted</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wide text-[#817B71]">Analysis rule</dt><dd className="mt-1 text-sm leading-relaxed">{proof.interpretation}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#817B71]">Cohort filter</dt><dd className="mt-1 text-sm leading-relaxed">{proof.cohortRule}</dd></div></dl><p className="mt-4 flex items-start gap-2 text-xs text-[#5C5852]"><Database className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />Sources: {activeFiles.map((file) => file.name).join(" + ") || result.sourceDataset}. Source rows were joined and normalized by the Data Hub before analysis.</p></section>

    <section className="rounded-3xl border border-[#E3DED4] bg-white p-6"><h2 className="text-lg font-extrabold">Reproducible arithmetic</h2><p className="mt-1 text-xs text-[#5C5852]">Percentages are rounded to one decimal. Grade averages are rounded to one decimal for display.</p><div className="mt-5 space-y-3">{proof.steps.map((step, index) => <div key={`${step.label}-${index}`} className="grid gap-3 rounded-2xl border border-[#E3DED4] bg-[#FBF9F5] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="text-sm font-extrabold">{index + 1}. {step.label}</p><p className="mt-1 text-xs text-[#5C5852]">{step.formula}</p><p className="mt-2 font-mono text-xs text-[#5C5852]">Inputs: {step.inputs}</p></div><p className="rounded-xl bg-white px-3 py-2 font-mono text-sm font-bold text-orange-700">{step.result}</p></div>)}</div></section>

    <section className="overflow-hidden rounded-3xl border border-[#E3DED4] bg-white"><div className="border-b border-[#E3DED4] px-6 py-5"><h2 className="text-lg font-extrabold">Complete anonymized evidence ledger</h2><p className="mt-1 text-xs text-[#5C5852]">{proof.evidence.rows.length} selected records. Source identifiers and names are excluded.</p></div><div className="max-h-[32rem] overflow-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="sticky top-0 bg-[#F9F6F0]"><tr>{proof.evidence.headers.map((header) => <th key={header} className="border-b border-[#E3DED4] px-4 py-3 font-extrabold">{header}</th>)}</tr></thead><tbody>{proof.evidence.rows.map((row, index) => <tr key={index} className="border-b border-[#EEE9E0] last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table>{!proof.evidence.rows.length && <p className="p-6 text-sm text-[#5C5852]">No pupils matched this filter.</p>}</div></section>
    <p className="flex items-center gap-2 text-xs font-semibold text-emerald-800"><LockKeyhole className="h-4 w-4" />This record disappears when the session is reset, data is replaced, or the tab is closed.</p>
  </div>;
}

export default function VerificationPage() {
  return <Suspense fallback={<div className="py-16 text-center text-sm text-[#5C5852]">Loading calculation record...</div>}><VerificationContent /></Suspense>;
}
