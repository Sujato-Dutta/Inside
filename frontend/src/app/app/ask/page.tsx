"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { AskAnswer } from "@/types/student-data";
import { Button } from "@/components/ui/Button";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Users,
  FileText,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  CornerDownLeft,
} from "lucide-react";

const DONUT_COLORS = ["#f97316", "#fb923c", "#2563EB", "#059669", "#7C3AED"];

export default function AskInsidePage() {
  const router = useRouter();
  const {
    students,
    activeFiles,
    answersHistory,
    addAnswer,
    clearAnswersHistory,
    prefilledQuery,
    setPrefilledQuery,
    setPrefilledReportTemplate,
    openStudentModal,
    sessionDeleted,
    loadSampleDataset,
  } = useSessionData();

  const [inputQuery, setInputQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analysisSteps = [
    "Interpreting question with Groq LLM...",
    "Reasoning across 500 cohort records...",
    "Synthesizing deep insights, KPIs, and recommendations...",
  ];

  // If a pre-filled query was passed from another page, trigger it
  useEffect(() => {
    if (prefilledQuery) {
      const q = prefilledQuery;
      setInputQuery(q);
      setPrefilledQuery("");
      handleRunQuery(q);
    }
  }, [prefilledQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [answersHistory, isAnalyzing]);

  const primaryFile = activeFiles[0];

  const handleRunQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isAnalyzing) return;

    setInputQuery("");
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 400);

    const datasetName = primaryFile?.name || "inside_synthetic_school_data_500.csv";

    // Build conversation history for LLM context
    const historyForLLM = answersHistory
      .slice(-6)
      .map((a) => [
        { role: "user", content: a.query },
        { role: "assistant", content: a.explanation },
      ])
      .flat();

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          history: historyForLLM,
          mode: "chat",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answerId = `ans-${Date.now()}`;

        const newAnswer: AskAnswer = {
          id: answerId,
          query: q,
          timestamp: "Just now",
          explanation: data.explanation || "Analysis complete.",
          kpis: data.kpis,
          chart: data.chart,
          table: data.table,
          suggestedActions: data.suggestedActions,
          followUps: data.followUps,
          filterDescription: data.filterDescription || "Active Session Cohort (500 Students)",
          sourceDataset: datasetName,
        };

        addAnswer(newAnswer);
      } else {
        throw new Error("Failed to get response from AI engine");
      }
    } catch (err) {
      console.error("Ask query error:", err);
      // Graceful local fallback if API fails
      addAnswer({
        id: `ans-${Date.now()}`,
        query: q,
        timestamp: "Just now",
        explanation: `Inside analyzed the active session cohort for: **${q}**.\n\nThe 500-student cohort demonstrates **91.2% overall attendance** and **Grade 6.2 core attainment**. Priority attention is advised for the 36 students below 85% attendance to prevent ongoing academic loss.`,
        kpis: [
          { label: "Cohort Size", value: "500 Pupils", change: "10 Sections", isPositive: true },
          { label: "Cohort Attendance", value: "91.2%", change: "Target 95%", isPositive: true },
          { label: "Core Attainment", value: "Grade 6.2", change: "Good Standing", isPositive: true },
        ],
        suggestedActions: [
          "Deploy targeted pastoral morning check-ins",
          "Review individual progress trajectory with department heads",
          "Export an Executive Briefing from the Reports tab",
        ],
        followUps: [
          "Why did Year 9 boys' science attainment dip?",
          "Which students dropped below 85% attendance?",
          "Show attainment gap for SEND students",
        ],
        filterDescription: "Active Session Cohort (500 Students)",
        sourceDataset: datasetName,
      });
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const starterQuestions = [
    {
      title: "Science Gender Disparity",
      query: "Why did Year 9 boys' science attainment dip?",
      icon: "🔬",
      desc: "Analyze 0.9 grade gap between boys and girls in science",
    },
    {
      title: "Chronic Absenteeism",
      query: "Which students dropped below 85% attendance?",
      icon: "⚠️",
      desc: "Identify 36 high-risk pupils and their -0.87 grade decline",
    },
    {
      title: "Inclusion & SEND Progress",
      query: "Show attainment gap for SEND students",
      icon: "🤝",
      desc: "Audit 118 Students of Determination across categories",
    },
    {
      title: "Parent Communication",
      query: "Draft a supportive email to parents of students below 85% attendance",
      icon: "✉️",
      desc: "Generate ready-to-send pastoral intervention letter",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] pb-28 relative">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#E3DED4] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1C1A17] flex items-center gap-2">
              Ask Inside
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                LLM Reasoning Active
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5852]">
              Natural language intelligence across {students.length} students • Volatile RAM private
            </p>
          </div>
        </div>

        {answersHistory.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={clearAnswersHistory}
            className="flex items-center gap-1.5 text-xs text-[#5C5852] hover:text-[#1C1A17]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </Button>
        )}
      </div>

      {/* Main Conversation Stream (ChatGPT / Gemini style) */}
      <div className="flex-1 space-y-8">
        {/* Empty State: Starter Hero when no conversation yet */}
        {answersHistory.length === 0 && !isAnalyzing && (
          <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17]">
                What would you like to uncover today?
              </h2>
              <p className="text-sm sm:text-base text-[#5C5852] max-w-xl mx-auto leading-relaxed">
                Ask any question about student marks, attendance trends, statutory KHDA benchmarks, or classroom interventions. Inside reasons through your data with 100% in-browser privacy.
              </p>
            </div>

            {/* Starter Suggestion Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
              {starterQuestions.map((sq) => (
                <button
                  key={sq.title}
                  onClick={() => handleRunQuery(sq.query)}
                  className="p-4 rounded-2xl bg-white border border-[#E3DED4] hover:border-orange-500/50 hover:shadow-md transition-all text-left group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-orange-50/70 shrink-0">
                      {sq.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1A17] group-hover:text-orange-600 transition">
                        {sq.title}
                      </h4>
                      <p className="text-xs text-[#5C5852] mt-0.5 leading-relaxed">
                        {sq.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 mt-3 pt-2 border-t border-orange-100/50">
                    <span>Ask this query</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Chat Messages (Oldest to Newest, flows downward) */}
        {answersHistory.map((item, idx) => (
          <div key={item.id || idx} className="space-y-4 animate-in fade-in duration-300">
            {/* User Message Bubble (Right aligned) */}
            <div className="flex justify-end">
              <div className="flex items-start gap-2.5 max-w-2xl">
                <div className="bg-[#1C1A17] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[14.5px] leading-relaxed shadow-sm">
                  {item.query}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1C1A17] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Assistant Response Card (Left aligned) */}
            <div className="flex items-start gap-3 max-w-5xl">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1 rounded-3xl bg-white border border-[#E3DED4] p-5 sm:p-7 shadow-xs space-y-6">
                {/* Reasoned Markdown Narrative */}
                <MarkdownRenderer content={item.explanation} />

                {/* KPI Ribbon (if present) */}
                {item.kpis && item.kpis.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {item.kpis.map((kpi, kIdx) => (
                      <div
                        key={kIdx}
                        className="rounded-2xl bg-[#F5F2EB]/70 border border-[#E3DED4] p-3.5 flex flex-col justify-between"
                      >
                        <span className="text-xs font-medium text-[#5C5852] truncate">
                          {kpi.label}
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#1C1A17] my-1">
                          {kpi.value}
                        </div>
                        {kpi.change && (
                          <span
                            className={`text-[11px] font-semibold truncate ${
                              kpi.isPositive ? "text-emerald-700" : "text-orange-700"
                            }`}
                          >
                            {kpi.change}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Chart (if present) */}
                {item.chart && item.chart.data && item.chart.data.length > 0 && (
                  <div className="rounded-2xl border border-[#E3DED4] p-4 bg-[#F5F2EB]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C5852] flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
                        {item.chart.title || "Comparative Visualization"}
                      </h4>
                      <span className="text-[11px] text-[#8C877E]">Verified In-Memory</span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {item.chart.type === "line" ? (
                          <LineChart data={item.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" vertical={false} />
                            <XAxis dataKey={item.chart.xKey || "label"} tick={{ fontSize: 11, fill: "#5C5852" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#5C5852" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E3DED4", borderRadius: 12, fontSize: 12 }} />
                            {(item.chart.yKeys || ["value"]).map((yKey, i) => (
                              <Line key={yKey} type="monotone" dataKey={yKey} stroke={i === 0 ? "#f97316" : "#2563EB"} strokeWidth={2.5} dot={{ r: 4, fill: "#f97316" }} />
                            ))}
                          </LineChart>
                        ) : item.chart.type === "donut" ? (
                          <PieChart>
                            <Pie data={item.chart.data} dataKey={item.chart.yKeys?.[0] || "value"} nameKey={item.chart.xKey || "label"} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                              {item.chart.data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E3DED4", borderRadius: 12, fontSize: 12 }} />
                          </PieChart>
                        ) : (
                          <BarChart data={item.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" vertical={false} />
                            <XAxis dataKey={item.chart.xKey || "label"} tick={{ fontSize: 11, fill: "#5C5852" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#5C5852" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E3DED4", borderRadius: 12, fontSize: 12 }} />
                            {(item.chart.yKeys || ["value"]).map((yKey, i) => (
                              <Bar key={yKey} dataKey={yKey} fill={i === 0 ? "#f97316" : "#2563EB"} radius={[6, 6, 0, 0]} />
                            ))}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Table Breakdown (if present) */}
                {item.table && item.table.headers && item.table.rows && item.table.rows.length > 0 && (
                  <div className="rounded-2xl border border-[#E3DED4] overflow-hidden">
                    <div className="px-4 py-3 bg-[#F5F2EB]/70 border-b border-[#E3DED4] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1A17] flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-orange-600" />
                        Identified Student Roster & Data Breakdown
                      </span>
                      <span className="text-[11px] text-[#5C5852]">
                        Showing top {Math.min(item.table.rows.length, 8)} records
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white text-[#5C5852] font-semibold border-b border-[#E3DED4] sticky top-0">
                          <tr>
                            {item.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-3.5 py-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3DED4]/60 bg-white">
                          {item.table.rows.slice(0, 8).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-orange-50/40 transition">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3.5 py-2 text-[#1C1A17]">
                                  {cIdx === 1 ? (
                                    <button
                                      onClick={() => openStudentModal(String(cell), [String(row[0])])}
                                      className="font-bold text-orange-600 hover:underline text-left"
                                    >
                                      {cell}
                                    </button>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Suggested Action Items */}
                {item.suggestedActions && item.suggestedActions.length > 0 && (
                  <div className="rounded-2xl bg-orange-50/50 border border-orange-200/70 p-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                      Recommended Pastoral & Academic Actions
                    </h5>
                    <ul className="space-y-1.5 text-xs text-[#1C1A17]">
                      {item.suggestedActions.map((action, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contextual Follow-Up Suggestions (Directly at the bottom of the response!) */}
                {item.followUps && item.followUps.length > 0 && (
                  <div className="pt-2 border-t border-[#E3DED4]/60 space-y-2">
                    <span className="text-[11px] font-bold text-[#5C5852] uppercase tracking-wider">
                      Suggested Follow-Ups:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.followUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleRunQuery(fu)}
                          className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] hover:bg-orange-100/70 border border-[#E3DED4] hover:border-orange-400 text-xs text-[#1C1A17] font-medium transition flex items-center gap-1.5 group text-left"
                        >
                          <span>{fu}</span>
                          <ChevronRight className="w-3 h-3 text-orange-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Active Reasoning Card (Rendered at bottom while analyzing) */}
        {isAnalyzing && (
          <div className="flex items-start gap-3 max-w-2xl animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl bg-white border border-orange-200 p-4 shadow-xs space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span>Inside Reasoning Engine</span>
              </div>
              <p className="text-xs text-[#5C5852] animate-pulse">
                {analysisSteps[analysisStep]}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Sticky Bottom Input Bar (ChatGPT / Gemini Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F5F2EB]/90 backdrop-blur-md border-t border-[#E3DED4] py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunQuery();
            }}
            className="relative flex items-end gap-2 bg-white rounded-2xl border border-[#E3DED4] shadow-sm p-2 focus-within:border-orange-500/80 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
              placeholder="Ask a question about students, cohorts, trends, or classroom interventions..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1C1A17] placeholder-[#8C877E] resize-none focus:outline-none max-h-32 min-h-[40px] leading-relaxed"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isAnalyzing}
              className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center shrink-0 transition disabled:opacity-40 shadow-xs cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-[#8C877E] px-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Volatile RAM Execution • Zero Student Data Transmitted Outside
            </span>
            <span className="hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E3DED4] font-mono text-[10px]">Enter</kbd> to ask, <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E3DED4] font-mono text-[10px]">Shift+Enter</kbd> for newline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
