"use client";

import React, { useState, useMemo } from "react";
import { useSessionData } from "@/context/SessionDataContext";
import { calculateInspectionRubric } from "@/lib/engine/calculator";
import { RubricIndicator } from "@/lib/engine/types";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  FileText,
  Target,
  Users,
  TrendingUp,
  BookOpen,
  Heart,
} from "lucide-react";

const BAND_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Outstanding: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Very Good": { bg: "bg-emerald-50/60", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-400" },
  Good: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Acceptable: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Weak: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  "Very Weak": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

const BAND_ORDER = ["Outstanding", "Very Good", "Good", "Acceptable", "Weak", "Very Weak"];

const INDICATOR_ICONS: Record<string, React.ReactNode> = {
  "Students' Achievement": <Target className="w-4 h-4" />,
  "Students' Progress": <TrendingUp className="w-4 h-4" />,
  "Inclusion / SEND": <Users className="w-4 h-4" />,
  "Learning Skills": <BookOpen className="w-4 h-4" />,
  "Personal Development": <Heart className="w-4 h-4" />,
};

export default function InspectionsPage() {
  const { students } = useSessionData();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const rubric = useMemo(() => calculateInspectionRubric(students), [students]);

  const overallColor = BAND_COLORS[rubric.overallBand] || BAND_COLORS["Acceptable"];

  const toggleRow = (name: string) => {
    setExpandedRow((prev) => (prev === name ? null : name));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DED4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[13px] font-bold text-orange-600 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Statutory Compliance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
            Inspections
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#5C5852]">
            Calculated scores mapped against official 6-level inspection bands. Click any row to reveal the verified math trail.
          </p>
        </div>

        {/* Overall Rating Badge */}
        <div className={`px-5 py-3 rounded-2xl ${overallColor.bg} border ${overallColor.border} text-center`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852] block">
            Overall Rating
          </span>
          <span className={`text-xl font-extrabold ${overallColor.text} block mt-0.5`}>
            {rubric.overallBand}
          </span>
          <span className="text-[12px] text-[#5C5852] font-medium">
            {rubric.studentCount} students assessed
          </span>
        </div>
      </div>

      {/* ── Rubric Scorecard Matrix ── */}
      <div className="rounded-3xl bg-white border border-[#E3DED4] shadow-sm overflow-hidden">
        {/* Matrix Header */}
        <div className="grid grid-cols-8 gap-0 bg-orange-50/50 border-b border-orange-200 px-4 py-3">
          <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-orange-600" />
            Quality Indicator
          </div>
          {BAND_ORDER.map((band) => (
            <div key={band} className="text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
              {band}
            </div>
          ))}
        </div>

        {/* Indicator Rows */}
        {rubric.indicators.map((indicator) => {
          const isExpanded = expandedRow === indicator.name;
          const bandColor = BAND_COLORS[indicator.band] || BAND_COLORS["Acceptable"];

          return (
            <div key={indicator.name} className="border-b border-[#E3DED4] last:border-b-0">
              {/* Main Row */}
              <button
                onClick={() => toggleRow(indicator.name)}
                className="w-full grid grid-cols-8 gap-0 px-4 py-4 items-center hover:bg-orange-50/30 transition-colors text-left"
              >
                {/* Indicator Name */}
                <div className="col-span-2 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                    {INDICATOR_ICONS[indicator.name] || <Target className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-[13px] sm:text-[14px] font-bold text-[#1C1A17] block leading-tight">
                      {indicator.name}
                    </span>
                    <span className="text-[11px] text-[#5C5852] font-medium">
                      {indicator.calculatedValue}{indicator.unit}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#8C877E] shrink-0 ml-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8C877E] shrink-0 ml-auto" />
                  )}
                </div>

                {/* Band Cells */}
                {BAND_ORDER.map((band) => {
                  const isActive = indicator.band === band;
                  const cellColor = BAND_COLORS[band];
                  return (
                    <div key={band} className="flex justify-center">
                      {isActive ? (
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${cellColor.bg} border-2 ${cellColor.border} flex items-center justify-center shadow-xs`}>
                          <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${cellColor.text}`} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F5F2EB]/50 border border-[#E3DED4] flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#E3DED4]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </button>

              {/* Expanded Math Trail */}
              {isExpanded && (
                <div className="px-4 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="ml-10 p-5 rounded-2xl bg-[#FAF6F0] border border-[#E3DED4] space-y-4">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-orange-600">
                      <Calculator className="w-4 h-4" />
                      <span>Verified Math Trail</span>
                    </div>

                    {/* Formula */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
                        Formula
                      </span>
                      <div className="px-4 py-2.5 rounded-xl bg-white border border-[#E3DED4] font-mono text-[13px] text-[#1C1A17]">
                        {indicator.formula}
                      </div>
                    </div>

                    {/* Calculation */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-[#E3DED4]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852] block">
                          Numerator
                        </span>
                        <span className="text-lg font-extrabold text-[#1C1A17]">
                          {indicator.numerator}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#E3DED4]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852] block">
                          Denominator
                        </span>
                        <span className="text-lg font-extrabold text-[#1C1A17]">
                          {indicator.denominator}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#E3DED4]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852] block">
                          Result
                        </span>
                        <span className="text-lg font-extrabold text-[#1C1A17]">
                          {indicator.calculatedValue}{indicator.unit}
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl ${bandColor.bg} border ${bandColor.border}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5852] block">
                          Band Assigned
                        </span>
                        <span className={`text-lg font-extrabold ${bandColor.text}`}>
                          {indicator.band}
                        </span>
                      </div>
                    </div>

                    {/* Band Thresholds Reference */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
                        Threshold Reference
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {BAND_ORDER.map((band) => {
                          const bc = BAND_COLORS[band];
                          const isMatch = indicator.band === band;
                          return (
                            <span
                              key={band}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                isMatch
                                  ? `${bc.bg} ${bc.text} ${bc.border} ring-2 ring-offset-1 ring-orange-300`
                                  : "bg-white border-[#E3DED4] text-[#5C5852]"
                              }`}
                            >
                              {band}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[13px] text-[#5C5852] leading-relaxed bg-white p-3 rounded-xl border border-[#E3DED4]">
                      {indicator.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer Notice ── */}
      <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-[13px] text-[#5C5852]">
          <span className="font-bold text-[#1C1A17]">Strict Deterministic Grading:</span>{" "}
          All scores above are calculated from raw session data using fixed threshold formulas. No LLM, no estimation, no hallucination.
          Band assignments follow standardised evaluation framework criteria.
        </div>
      </div>
    </div>
  );
}
