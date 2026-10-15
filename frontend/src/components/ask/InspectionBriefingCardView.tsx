"use client";

import React, { useState } from "react";
import { InspectionBriefingCard } from "@/lib/deterministicRouter";
import { useSessionData } from "@/context/SessionDataContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Database,
  CheckCircle2,
} from "lucide-react";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B"];

export function FormattedMarkdown({ text }: { text: string }) {
  if (!text) return null;
  // Splits on **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-extrabold text-[#1C1A17]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function InspectionBriefingCardView({
  card,
  onFollowUpClick,
}: {
  card: InspectionBriefingCard;
  onFollowUpClick?: (question: string) => void;
}) {
  const { maskStudentNames, getStudentDisplayName } = useSessionData();
  const [tableExpanded, setTableExpanded] = useState(true);

  const exportEvidenceCsv = () => {
    if (!card.evidenceTable?.rows?.length) return;
    const headerRow = card.evidenceTable.headers.join(",");
    const rows = card.evidenceTable.rows.map((row) =>
      row
        .map((cell, idx) => {
          // If idx is student name (index 1), respect masking
          if (idx === 1 && maskStudentNames) {
            return `"${String(row[0])}"`;
          }
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = [headerRow, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_${card.matchedIntent.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 rounded-3xl border border-[#E3DED4] bg-white p-5 sm:p-7 shadow-sm transition-all">
      {/* Top Header Badge & Matched Intent */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3DED4] pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-700">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
            Verified Inspection Verdict
          </span>
          <span className="text-[12px] font-bold text-[#5C5852]">•</span>
          <span className="text-[12px] font-semibold text-[#5C5852]">{card.matchedIntent}</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          100% Deterministic (Browser RAM)
        </span>
      </div>

      {/* Headline Verdict */}
      <div className="rounded-2xl border-l-4 border-l-orange-500 bg-[#FBF9F5] p-4.5 sm:p-5">
        <p className="text-[15px] sm:text-[16px] leading-relaxed text-[#1C1A17] font-medium">
          <FormattedMarkdown text={card.headlineVerdict} />
        </p>
      </div>

      {/* KPI Cards Grid */}
      {!!card.kpis?.length && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {card.kpis.map((kpi, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#E8E2D9] bg-[#FDFCFB] p-4 shadow-2xs"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B655B]">
                {kpi.label}
              </p>
              <p className="mt-1.5 text-2xl font-black text-[#1C1A17]">{kpi.value}</p>
              {kpi.change && (
                <p
                  className={`mt-1 text-[11px] font-bold flex items-center gap-1 ${
                    kpi.isPositive ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {kpi.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {kpi.change}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Key Breakdown Bullet Points */}
      {!!card.breakdownBullets?.length && (
        <div className="rounded-2xl border border-[#E8E2D9] bg-white p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700">
            Cohort Statistical Breakdown
          </p>
          <ul className="mt-3 space-y-2.5">
            {card.breakdownBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#3D3A35] leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>
                  <FormattedMarkdown text={bullet} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inspector Talking Point Box */}
      {card.inspectorTalkingPoint && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4.5 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
            <Lightbulb className="h-4 w-4 text-amber-700" />
            DSIB / ADEK Senior Leadership Team (SLT) Talking Point
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-amber-950 font-medium">
            &ldquo;{card.inspectorTalkingPoint}&rdquo;
          </p>
        </div>
      )}

      {/* Inline Chart (if present) */}
      {card.chart && !!card.chart.data?.length && (
        <div className="rounded-2xl border border-[#E8E2D9] bg-[#FDFCFB] p-5">
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-wider text-[#5C5852]">
            {card.chart.title}
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {card.chart.type === "line" ? (
                <LineChart data={card.chart.data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#ECE7DE" strokeDasharray="3 3" />
                  <XAxis dataKey={card.chart.xKey || "name"} tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {(card.chart.yKeys || ["value"]).map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  ))}
                  <ReferenceLine y={95} stroke="#10B981" strokeDasharray="3 3" label={{ value: "95% Target", fill: "#10B981", fontSize: 10 }} />
                </LineChart>
              ) : card.chart.type === "donut" ? (
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Pie
                    data={card.chart.data}
                    dataKey={card.chart.yKeys?.[0] || "value"}
                    nameKey={card.chart.xKey || "name"}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {card.chart.data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={card.chart.data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#ECE7DE" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey={card.chart.xKey || "subject"} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  {(card.chart.yKeys || ["percentage"]).map((key, i) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={i === 0 ? "#F97316" : "#3B82F6"}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                  <ReferenceLine y={75} stroke="#2563EB" strokeDasharray="4 4" label={{ value: "75% Ref", fill: "#2563EB", fontSize: 10 }} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Collapsible / Inline Evidence Table */}
      {card.evidenceTable && !!card.evidenceTable.rows?.length && (
        <div className="overflow-hidden rounded-2xl border border-[#E3DED4] bg-white shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E3DED4] bg-[#F9F6F0] px-4 py-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-orange-600" />
              <p className="text-[12px] font-extrabold text-[#1C1A17]">
                {card.evidenceTable.title}{" "}
                <span className="font-normal text-[#6B655B]">
                  ({card.evidenceTable.totalMatchingCount} total matching records in RAM)
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportEvidenceCsv}
                className="inline-flex items-center gap-1 rounded-lg border border-[#D6D0C4] bg-white px-2.5 py-1 text-[11px] font-bold text-[#5C5852] hover:bg-[#FBF9F5] hover:text-[#1C1A17]"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setTableExpanded((prev) => !prev)}
                className="rounded-lg p-1 text-[#5C5852] hover:bg-white"
                aria-label={tableExpanded ? "Collapse evidence table" : "Expand evidence table"}
              >
                {tableExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {tableExpanded && (
            <div className="max-h-80 overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[700px] text-left text-[11px]">
                <thead className="sticky top-0 bg-[#F4EFE6] text-[#5C5852] border-b border-[#E3DED4]">
                  <tr>
                    {card.evidenceTable.headers.map((header, idx) => (
                      <th key={idx} className="p-2.5 font-extrabold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DB]">
                  {card.evidenceTable.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-orange-50/40">
                      {row.map((cell, cellIdx) => {
                        let displayVal = String(cell);
                        // If cellIdx is student name (index 1), check name masking
                        if (cellIdx === 1 && maskStudentNames) {
                          displayVal = String(row[0] || "Anonymous");
                        }
                        return (
                          <td key={cellIdx} className="p-2.5 font-medium text-[#2C2925]">
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Suggested SLT Actions */}
      {!!card.suggestedActions?.length && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            Suggested SLT Action &amp; Moderation Steps
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-emerald-950">
            {card.suggestedActions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up Questions */}
      {!!card.followUps?.length && (
        <div className="border-t border-[#E8E2D9] pt-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B655B]">
            Recommended Follow-Up Lines of Enquiry
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {card.followUps.map((fu, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onFollowUpClick?.(fu)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D6D0C4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5C5852] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                <span>{fu}</span>
                <ArrowRight className="h-3 w-3 text-orange-600" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
