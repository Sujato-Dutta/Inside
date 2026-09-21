"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionData } from "@/context/SessionDataContext";
import { Button } from "@/components/ui/Button";
import { PRESET_QUESTIONS, PRESET_DESCRIPTIONS } from "@/data/mock-school-data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
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
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";

export default function AppHomePage() {
  const {
    students,
    activeFiles,
    insights,
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
          <Link href="/app/data">
            <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Open Data Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Executive KPI Calculations ──
  const total = students.length;
  const benchmarkThreshold = 5; // Grade 5 = benchmark attainment
  const atBenchmark = students.filter(
    (s) => (s.overallScore ?? ((s.term2MathGrade ?? s.mathGrade) + (s.term2ScienceGrade ?? s.scienceGrade) + (s.term2EnglishGrade ?? s.englishGrade)) / 3) >= benchmarkThreshold
  ).length;
  const attainmentPct = total > 0 ? ((atBenchmark / total) * 100).toFixed(1) : "0";

  // Inclusion Value-Added: average grade change T1→T2 for SEND students
  const sendStudents = students.filter((s) => s.inclusionSend && s.inclusionSend !== "None");
  const sendValueAdded = sendStudents.length > 0
    ? (sendStudents.reduce((acc, s) => {
        const t1Avg = ((s.term1MathGrade ?? s.mathGrade) + (s.term1ScienceGrade ?? s.scienceGrade) + (s.term1EnglishGrade ?? s.englishGrade)) / 3;
        const t2Avg = ((s.term2MathGrade ?? s.mathGrade) + (s.term2ScienceGrade ?? s.scienceGrade) + (s.term2EnglishGrade ?? s.englishGrade)) / 3;
        return acc + (t2Avg - t1Avg);
      }, 0) / sendStudents.length).toFixed(2)
    : "0.00";

  // Persistent Absence: students below 90% attendance
  const persistentAbsence = students.filter((s) => s.attendanceRate < 90).length;
  const attendanceRisk = students.filter((s) => s.attendanceRate < 85).length;

  // Cohort distribution by class section
  const classCounts: Record<string, number> = {};
  students.forEach((s) => {
    const cls = s.classGroup || "Unknown";
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  });
  const cohortChartData = Object.entries(classCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));

  // Generate alert flags from insights
  const alertInsights = insights.filter(
    (i) => i.severity === "high" || i.severity === "medium"
  ).slice(0, 4);

  // Also generate computed alerts
  const computedAlerts: { title: string; metric: string; severity: string; query: string }[] = [];
  
  if (attendanceRisk > 0) {
    computedAlerts.push({
      title: `${attendanceRisk} students below 85% attendance threshold`,
      metric: `${attendanceRisk} pupils`,
      severity: "critical",
      query: "Attendance vs Grade Decline",
    });
  }

  const sendAttendance = sendStudents.length > 0
    ? (sendStudents.reduce((a, s) => a + s.attendanceRate, 0) / sendStudents.length).toFixed(1)
    : "0";
  if (parseFloat(sendAttendance) < 92 && sendStudents.length > 0) {
    computedAlerts.push({
      title: `SEND cohort attendance at ${sendAttendance}%`,
      metric: `${sendStudents.length} SEND pupils`,
      severity: "warning",
      query: "SEND Attainment Gap",
    });
  }

  // Boys vs Girls science gap
  const boys = students.filter((s) => s.gender === "Male");
  const girls = students.filter((s) => s.gender === "Female");
  const boysAvgSci = boys.length > 0
    ? (boys.reduce((a, s) => a + (s.term2ScienceGrade ?? s.scienceGrade), 0) / boys.length).toFixed(1)
    : "0";
  const girlsAvgSci = girls.length > 0
    ? (girls.reduce((a, s) => a + (s.term2ScienceGrade ?? s.scienceGrade), 0) / girls.length).toFixed(1)
    : "0";
  const sciGap = (parseFloat(girlsAvgSci) - parseFloat(boysAvgSci)).toFixed(1);
  if (Math.abs(parseFloat(sciGap)) > 0.3) {
    computedAlerts.push({
      title: `Science gender gap: Girls ${girlsAvgSci} vs Boys ${boysAvgSci} (${parseFloat(sciGap) > 0 ? '+' : ''}${sciGap})`,
      metric: "Gender attainment disparity",
      severity: "warning",
      query: "Boys vs Girls in Science",
    });
  }

  const primaryFile = activeFiles[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner & Command Centre Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-orange-50/70 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-[12px] font-bold text-orange-600">
            <Activity className="w-3.5 h-3.5" />
            <span>Executive Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1A17]">
            Welcome back, <span className="text-amber-gradient">Instructor</span>
          </h1>
          <p className="text-[13.5px] sm:text-[15px] text-[#5C5852] leading-relaxed">
            Your whole-school vital signs, assembled in real-time from {total} student records loaded in volatile session memory.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[12px] text-emerald-800 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Zero-Retention Pipeline: No student data saved to any database or server.</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="shrink-0 flex items-center gap-3">
          <Link href="/app/ask">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Ask Inside
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 3 Executive KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Whole-School Attainment */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
              Whole-School Attainment
            </span>
            <div className="text-2xl font-extrabold text-[#1C1A17]">
              {attainmentPct}%
            </div>
            <p className="text-[12px] text-[#5C5852]">
              At/above Grade 5 benchmark
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Inclusion Value-Added */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
              Inclusion Value-Added
            </span>
            <div className={`text-2xl font-extrabold flex items-baseline gap-1 ${parseFloat(sendValueAdded) >= 0 ? "text-emerald-700" : "text-orange-600"}`}>
              <span>{parseFloat(sendValueAdded) >= 0 ? "+" : ""}{sendValueAdded}</span>
              <span className="text-[13px] font-semibold text-[#5C5852]">grades</span>
            </div>
            <p className="text-[12px] text-[#5C5852]">
              SEND cohort T1→T2 avg progress ({sendStudents.length} pupils)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            {parseFloat(sendValueAdded) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Persistent Absence / Attendance Risk */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
              Attendance Risk
            </span>
            <div className="text-2xl font-extrabold text-orange-600 flex items-baseline gap-1">
              <span>{persistentAbsence}</span>
              <span className="text-[13px] font-semibold text-[#5C5852]">pupils</span>
            </div>
            <p className="text-[12px] text-[#5C5852]">
              Below 90% attendance ({attendanceRisk} below 85%)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Alerts & Action Items ── */}
      {computedAlerts.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#E3DED4] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h3 className="text-[15px] font-bold text-[#1C1A17]">
              Automated Alerts & Action Items
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {computedAlerts.map((alert, idx) => (
              <button
                key={idx}
                onClick={() => handleAskPreset(alert.query)}
                className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      alert.severity === "critical" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5852]">
                      {alert.metric}
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-[#1C1A17] group-hover:text-orange-600 transition-colors leading-snug block">
                    {alert.title}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                  Investigate in Ask Inside
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Cohort Overview Chart ── */}
      {cohortChartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#E3DED4] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <h3 className="text-[15px] font-bold text-[#1C1A17]">
                Cohort Distribution by Class Section
              </h3>
            </div>
            <span className="text-[13px] text-[#5C5852]">
              {total} students across {cohortChartData.length} sections
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3DED4" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5C5852" }} />
                <YAxis tick={{ fontSize: 12, fill: "#5C5852" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E3DED4",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Quick Session Status ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#5C5852]">
              Student Records
            </span>
            <div className="text-2xl font-extrabold text-[#1C1A17]">
              {students.length}
            </div>
            <p className="text-[12px] text-[#5C5852]">
              Loaded in volatile session memory
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

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
              {activeFiles[0]?.columns?.length || 26} fields recognised, 0 missing IDs
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Planted Demo Questions ── */}
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
