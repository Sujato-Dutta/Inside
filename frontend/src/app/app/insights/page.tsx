"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileText,
  Users,
  ArrowRight,
  Filter,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function InsightsPage() {
  const {
    insights,
    students,
    openStudentModal,
    setPrefilledQuery,
    setPrefilledReportTemplate,
  } = useSessionData();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Attendance", "Attainment", "SEN Support", "Cohort Gap"];

  const filteredInsights =
    selectedCategory === "All"
      ? insights
      : insights.filter((i) => i.category === selectedCategory);

  const handleAskWhy = (title: string, category: string) => {
    const prompt = `Why is there an issue in ${title}? Provide root causes and recommended intervention.`;
    setPrefilledQuery(prompt);
    router.push("/app/ask");
  };

  const handleCreateReport = (templateType: string) => {
    setPrefilledReportTemplate(templateType || "Leadership Summary");
    router.push("/app/reports");
  };

  const uniqueFlaggedStudentCount = new Set(insights.flatMap((i) => i.affectedStudentIds)).size;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DED4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[13px] font-bold text-orange-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Anomaly Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
            Automated Insights
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#5C5852]">
            Understandable findings detected across attendance, attainment, and student support tiers.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold transition ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs"
                  : "bg-white border border-[#E3DED4] text-[#5C5852] hover:border-orange-500/40 hover:text-[#1C1A17]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E3DED4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
            Total Insights
          </span>
          <div className="text-2xl font-extrabold text-[#1C1A17] mt-1">
            {insights.length}
          </div>
          <span className="text-[12px] text-[#5C5852]">Session Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E3DED4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            High Priority Areas
          </span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">
            {insights.filter((i) => i.severity === "critical" || (i.severity as any) === "high").length}
          </div>
          <span className="text-[12px] text-[#5C5852]">Attendance & Gender Gaps</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E3DED4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Positive Highlights
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {insights.filter((i) => i.severity === "positive").length}
          </div>
          <span className="text-[12px] text-[#5C5852]">Attainment Momentum</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E3DED4] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
            Unique Pupils Flagged
          </span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">
            {uniqueFlaggedStudentCount} Pupils
          </div>
          <span className="text-[12px] text-[#5C5852]">Require Direct Support</span>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInsights.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-[#E3DED4] shadow-xs flex flex-col justify-between space-y-5 hover:border-orange-500/40 transition-colors"
          >
            <div className="space-y-3">
              {/* Category & Impact Metric */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    item.severity === "critical" || (item.severity as any) === "high"
                      ? "bg-red-50 text-red-700 border border-red-200 font-bold"
                      : item.severity === "positive"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                      : "bg-orange-50 text-orange-600 border border-orange-200 font-bold"
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-[13px] font-bold text-[#5C5852]">
                  {item.metric || (item as any).impactMetric}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold text-[#1C1A17] leading-snug">
                {item.title}
              </h3>

              {/* Summary / Description */}
              <p className="text-[13px] sm:text-[15px] text-[#5C5852] leading-relaxed">
                {item.description || (item as any).summary}
              </p>

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recommended Action
                </span>
                <p className="text-[13px] text-[#1C1A17] font-medium leading-relaxed">
                  {item.suggestedAction || (item as any).recommendedAction}
                </p>
              </div>
            </div>

            {/* Action Buttons: Ask Why, View Students, Create Report */}
            <div className="pt-3 border-t border-[#E3DED4] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAskWhy(item.title, item.category)}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-[13px] font-bold transition flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ask Why</span>
                </button>

                <button
                  onClick={() => openStudentModal(item.title, item.affectedStudentIds)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E3DED4] hover:bg-orange-50 text-[#1C1A17] text-[13px] font-semibold transition flex items-center gap-1 shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-orange-600" />
                  <span>View Students ({item.affectedStudentIds.length})</span>
                </button>
              </div>

              <button
                onClick={() => handleCreateReport((item as any).reportTemplate || (item as any).templateType)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[13px] font-bold transition flex items-center gap-1 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Create Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
