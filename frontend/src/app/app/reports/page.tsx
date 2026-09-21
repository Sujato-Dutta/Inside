"use client";

import React, { useState, useEffect } from "react";
import { useSessionData } from "@/context/SessionDataContext";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { calculateReportMetrics } from "@/lib/engine/calculator";

export default function ReportsPage() {
  const { students, prefilledReportTemplate, setPrefilledReportTemplate } = useSessionData();

  const templates = [
    "Full Inspection Evidence Pack",
    "Governors' Brief",
    "Inclusion & SEND Gap Audit",
  ];

  // Map new template names to existing calculator template types
  const templateCalcMap: Record<string, string> = {
    "Full Inspection Evidence Pack": "Leadership Summary",
    "Governors' Brief": "Student Progress",
    "Inclusion & SEND Gap Audit": "Attainment Gap",
  };

  // Map prefilled template from other pages to the closest new template
  const resolveTemplate = (prefilled: string): string => {
    if (templates.includes(prefilled)) return prefilled;
    if (prefilled.toLowerCase().includes("attendance") || prefilled.toLowerCase().includes("inspection"))
      return "Full Inspection Evidence Pack";
    if (prefilled.toLowerCase().includes("send") || prefilled.toLowerCase().includes("gap") || prefilled.toLowerCase().includes("inclusion"))
      return "Inclusion & SEND Gap Audit";
    return "Governors' Brief";
  };

  const [activeTemplate, setActiveTemplate] = useState<string>(
    resolveTemplate(prefilledReportTemplate || "Full Inspection Evidence Pack")
  );
  const [includeChart, setIncludeChart] = useState<boolean>(true);

  const calcKey = templateCalcMap[activeTemplate] || "Leadership Summary";
  const calculated = calculateReportMetrics(students, calcKey);

  // Override title & summary to match the new dossier names
  const dossierMeta: Record<string, { title: string; subtitle: string }> = {
    "Full Inspection Evidence Pack": {
      title: "Full Inspection Evidence Pack",
      subtitle: "Comprehensive statutory submission aligned to DSIB/ADEK quality standards",
    },
    "Governors' Brief": {
      title: "Governors' Strategic Briefing",
      subtitle: "High-level board summary covering academic performance and strategic priorities",
    },
    "Inclusion & SEND Gap Audit": {
      title: "Inclusion & SEND Gap Audit",
      subtitle: "Specialized documentation for Head of Inclusion covering statutory progress benchmarks",
    },
  };

  useEffect(() => {
    if (prefilledReportTemplate) {
      setActiveTemplate(resolveTemplate(prefilledReportTemplate));
      setPrefilledReportTemplate("");
    }
  }, [prefilledReportTemplate]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = "Student ID,Name,Gender,Year Group,Class Group,Attendance %,CAT4 Mean,T1 English,T2 English,T1 Math,T2 Math,T1 Science,T2 Science,Grade Drop,Inclusion SEND,Risk Level\n";
    const rows = students
      .map(
        (s) =>
          `${s.id},"${s.name}",${s.gender || ""},${s.yearGroup},${s.classGroup || ""},${s.attendanceRate}%,${s.cat4Mean || ""},${s.term1EnglishGrade ?? s.englishGrade},${s.term2EnglishGrade ?? s.englishGrade},${s.term1MathGrade ?? s.mathGrade},${s.term2MathGrade ?? s.mathGrade},${s.term1ScienceGrade ?? s.scienceGrade},${s.term2ScienceGrade ?? s.scienceGrade},${s.gradeDrop ?? 0},${s.inclusionSend || "None"},${s.riskLevel}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeTemplate.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const meta = dossierMeta[activeTemplate] || dossierMeta["Full Inspection Evidence Pack"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DED4] print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[13px] font-bold text-orange-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Dossier Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
            Reports
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#5C5852]">
            Preview and download formal inspection packs, inclusion audits, and governor briefs — entirely within the browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrintPdf} icon={<Printer className="w-3.5 h-3.5" />}>
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Dossier Type Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
        {templates.map((tmpl) => (
          <button
            key={tmpl}
            onClick={() => setActiveTemplate(tmpl)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition ${
              activeTemplate === tmpl
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs font-bold"
                : "bg-white border border-[#E3DED4] text-[#5C5852] hover:border-orange-500/40 hover:text-[#1C1A17]"
            }`}
          >
            {tmpl}
          </button>
        ))}
      </div>

      {/* Printable Paper Document Sheet */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#E3DED4] shadow-md p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="border-b border-[#E3DED4] pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#1C1A17] tracking-tight">
                INSIDE
              </span>
              <span className="text-[11px] font-bold text-orange-600 uppercase px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200">
                Verified Report
              </span>
            </div>
            <span className="text-[12px] text-[#5C5852] font-semibold">
              Session Isolated • Zero-Retention
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
              {meta.title}
            </h2>
            <p className="text-[13px] text-[#5C5852]">{meta.subtitle}</p>
            <div className="flex items-center gap-4 text-[13px] text-[#5C5852] pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-orange-600" />
                Active Cohort ({students.length} Enrolled Pupils)
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {calculated.keyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E3DED4] space-y-1"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
                {metric.label}
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1C1A17]">
                {metric.value}
              </div>
              <span className="text-[11px] font-bold text-orange-600">
                {metric.status}
              </span>
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-bold text-[#1C1A17] uppercase tracking-wider">
            Executive Brief
          </h3>
          <p className="text-[14.5px] sm:text-[15.5px] text-[#1C1A17] leading-relaxed font-normal bg-[#FAF6F0]/60 p-4 sm:p-5 rounded-2xl border border-[#E3DED4]">
            {calculated.executiveSummary}
          </p>
        </div>

        {/* Embedded Chart */}
        {calculated.breakdown && calculated.breakdown.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#E3DED4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-[#1C1A17]">
                Cohort Attainment Breakdown
              </span>
              <span className="text-[12px] font-semibold text-[#5C5852]">
                Verified Source Figures
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculated.breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" />
                  <XAxis dataKey="label" stroke="#5C5852" fontSize={12} />
                  <YAxis stroke="#5C5852" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E3DED4",
                      borderRadius: "12px",
                      color: "#1C1A17",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leadership Recommendations */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[15px] font-bold text-[#1C1A17] uppercase tracking-wider">
            Actionable Recommendations for Leadership
          </h3>
          <ul className="space-y-2.5">
            {calculated.recommendations.map((rec, rIdx) => (
              <li
                key={rIdx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#E3DED4] text-[13.5px] sm:text-[14.5px] text-[#1C1A17] font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200 text-xs font-bold">
                  {rIdx + 1}
                </div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Document Footer */}
        <div className="border-t border-[#E3DED4] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12px] text-[#5C5852]">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Session Verified: No student information stored or shared with public LLMs.</span>
          </div>
          <div className="text-right font-medium">
            Generated via Inside • Confidential School Record
          </div>
        </div>
      </div>
    </div>
  );
}
