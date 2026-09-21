"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { Button } from "@/components/ui/button";
import { PRESET_QUESTIONS, PRESET_DESCRIPTIONS } from "@/data/mock-school-data";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  RotateCcw,
  Zap,
  Lock,
} from "lucide-react";

export default function AppHomePage() {
  const {
    students,
    activeFiles,
    readinessScore,
    sessionDeleted,
    sessionMinutesRemaining,
    setPrefilledQuery,
    loadSampleDataset,
  } = useSessionData();
  const router = useRouter();

  const handleAskPreset = (question: string) => {
    setPrefilledQuery(question);
    router.push("/app/ask");
  };

  if (sessionDeleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1C1A17]">
            Session Data Purged
          </h2>
          <p className="text-[14px] text-[#5C5852]">
            All student records, calculations, and active files have been deleted from memory. Zero residual student data is retained.
          </p>
        </div>
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="md" onClick={loadSampleDataset} icon={<RotateCcw className="w-4 h-4" />}>
            Load Demo Cohort Data
          </Button>
          <Link href="/app/ask">
            <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Open Ask Inside
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryFile = activeFiles[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner & Command Centre Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-orange-50/70 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-[12px] font-bold text-orange-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Session Command Centre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1A17]">
            Welcome back, <span className="text-amber-gradient">Instructor</span>
          </h1>
          <p className="text-[13.5px] sm:text-[15px] text-[#5C5852] leading-relaxed">
            Your active school session is ready. Ask plain-English questions, review automated findings, or generate governors briefings without spreadsheet wrestling.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[12px] text-emerald-800 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Session-Only Memory: Zero student data is saved to a database or permanently retained.</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0 flex items-center gap-3">
          <Link href="/app/ask">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Ask Inside
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Quick Status Cards: Dataset, Record Count, Readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Dataset */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
              Active Dataset
            </span>
            <div className="text-[15px] font-bold text-[#1C1A17] truncate" title={primaryFile?.name}>
              {primaryFile?.name || "inside_synthetic_school_data_500.csv"}
            </div>
            <p className="text-[12px] text-emerald-700 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ephemeral ({sessionMinutesRemaining}m left)</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Number of Records */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
              Student Records
            </span>
            <div className="text-2xl font-extrabold text-[#1C1A17]">
              {students.length}
            </div>
            <p className="text-[12px] text-[#5C5852]">
              Year 10 Synthetic Cohort (5 Sections)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Data Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
              Data Readiness
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 flex items-baseline gap-1">
              <span>{readinessScore}%</span>
              <span className="text-[13px] font-semibold text-[#5C5852]">Verified</span>
            </div>
            <p className="text-[12px] text-[#5C5852]">
              26 fields recognised, 0 missing IDs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Suggested Preset Questions */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3DED4] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <h3 className="text-[15px] font-bold text-[#1C1A17]">
              Planted Demo Questions for This Dataset
            </h3>
          </div>
          <span className="text-[13px] text-[#5C5852]">
            Click to run instantly in Ask Inside
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskPreset(q)}
              className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[14px] font-bold text-[#1C1A17] group-hover:text-orange-600 transition-colors leading-snug block">
                    "{q}"
                  </span>
                  <p className="text-[12px] text-[#5C5852] line-clamp-2">
                    {PRESET_DESCRIPTIONS[q] || "Instant deterministic analysis of active cohort records."}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C877E] group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Run analysis
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
