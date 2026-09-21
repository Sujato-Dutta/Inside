"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Download,
  Share2,
  Check,
  UploadCloud,
  FileUp,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function Features() {
  const { theme } = useTheme();

  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden bg-white border-t border-[#E3DED4] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] leading-tight">
            Just ask.{" "}
            <span className="text-amber-gradient">Inside does the rest.</span>
          </h2>
          <p className="text-[18px] sm:text-[20px] text-[#5C5852] leading-relaxed max-w-2xl mx-auto">
            No formulas. No complicated dashboards. Connect your data, ask what
            you need, and get answers you can actually use.
          </p>
        </div>

        {/* Bento Grid: 2 Large Cards on Top, 3 Medium Cards Below */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          {/* ========================================================= */}
          {/* CARD 1 (LARGE): Ask anything, naturally. */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white border border-[#E3DED4] hover:border-[#f97316]/60 shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2 mb-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
                Ask anything, naturally.
              </h3>
              <p className="text-[16px] sm:text-[17px] text-[#5C5852] leading-relaxed">
                No formulas. No filters. Just ask.
              </p>
            </div>

            {/* Mini-Product Demo: Interactive Chat & Instant Answer */}
            <div className="flex-1 flex flex-col justify-center">
              <ChatQueryDemo />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2 (LARGE): See what matters instantly. */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white border border-[#E3DED4] hover:border-[#f97316]/60 shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2 mb-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
                See what matters instantly.
              </h3>
              <p className="text-[16px] sm:text-[17px] text-[#5C5852] leading-relaxed">
                Raw rows transform into a color-coded marks chart and a clear 2-line explanation.
              </p>
            </div>

            {/* Mini-Product Demo: Raw Rows Transforming into Color-Coded Marks Chart + Insight */}
            <div className="flex-1 flex flex-col justify-center">
              <RowToChartDemo />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 3 (MEDIUM): Know before problems grow. */}
          {/* ========================================================= */}
          <div className="md:col-span-1 lg:col-span-4 rounded-3xl p-6 sm:p-7 bg-white border border-[#E3DED4] hover:border-[#f97316]/60 shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-1.5 mb-4">
              <h4 className="text-[20px] sm:text-[22px] font-extrabold text-[#1C1A17] tracking-tight">
                Know before problems grow.
              </h4>
              <p className="text-[15px] sm:text-[16px] text-[#5C5852] leading-relaxed">
                Notice persistent attendance dips weeks before official reports.
              </p>
            </div>

            {/* Mini-Product Demo: Animated subtle notification */}
            <div className="my-auto pt-2">
              <EarlyAlertDemo />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 4 (MEDIUM): Bring your existing data. */}
          {/* ========================================================= */}
          <div className="md:col-span-1 lg:col-span-4 rounded-3xl p-6 sm:p-7 bg-white border border-[#E3DED4] hover:border-[#f97316]/60 shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-1.5 mb-4">
              <h4 className="text-[20px] sm:text-[22px] font-extrabold text-[#1C1A17] tracking-tight">
                Bring your existing data.
              </h4>
              <p className="text-[15px] sm:text-[16px] text-[#5C5852] leading-relaxed">
                Click upload, choose your Excel spreadsheet, and start analyzing.
              </p>
            </div>

            {/* Mini-Product Demo: Mouse clicks upload -> chooses Excel -> file uploads */}
            <div className="my-auto pt-2">
              <DataDropDemo />
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 5 (MEDIUM): Share the answer, not the spreadsheet. */}
          {/* ========================================================= */}
          <div className="md:col-span-2 lg:col-span-4 rounded-3xl p-6 sm:p-7 bg-white border border-[#E3DED4] hover:border-[#f97316]/60 shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-1.5 mb-4">
              <h4 className="text-[20px] sm:text-[22px] font-extrabold text-[#1C1A17] tracking-tight">
                Share the answer, not the spreadsheet.
              </h4>
              <p className="text-[15px] sm:text-[16px] text-[#5C5852] leading-relaxed">
                Click to create a 1-page executive summary with charts and clear details.
              </p>
            </div>

            {/* Mini-Product Demo: Mouse clicks Create executive summary -> 1-page PDF appears */}
            <div className="my-auto pt-2">
              <ReportShareDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================= */
/* SHARED COMPONENT: Realistic Animated Mouse Cursor                         */
/* ========================================================================= */
function AnimatedCursor({
  left,
  top,
  clicking,
  visible = true,
}: {
  left: string;
  top: string;
  clicking: boolean;
  visible?: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        left,
        top,
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
      }}
      transition={{
        left: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
        top: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.3 },
        scale: { duration: 0.25 },
      }}
      className="pointer-events-none absolute z-50 -ml-1 -mt-1"
      style={{
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
      }}
    >
      <motion.div
        animate={{ scale: clicking ? 0.75 : 1 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="1.5"
          className="transform -rotate-12"
        >
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
        {clicking && (
          <motion.span
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-orange-500 pointer-events-none"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/* ========================================================================= */
/* MINI-PRODUCT DEMO 1: Chat query typing -> send -> answer appears           */
/* ========================================================================= */
function ChatQueryDemo() {
  const fullText = "Which students dropped below 90% attendance this month?";
  const [displayText, setDisplayText] = useState("");
  const [stage, setStage] = useState<"typing" | "sent" | "result">("typing");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const runLoop = () => {
      setStage("typing");
      setDisplayText("");
      charIndex = 0;

      const typeInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          timeout = setTimeout(() => {
            setStage("sent");
            timeout = setTimeout(() => {
              setStage("result");
              timeout = setTimeout(() => {
                runLoop();
              }, 7500); // Extended hold time by 3 seconds
            }, 800);
          }, 700);
        }
      }, 50);
    };

    runLoop();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-4 sm:p-5 space-y-3.5 shadow-xs">
      {/* Search Input Bar with animated typing */}
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-white border border-[#E3DED4] shadow-xs min-h-[50px] sm:min-h-[54px]">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-1.5">
          <Sparkles className="w-4 h-4 text-[#f97316] shrink-0" />
          <span className="text-[14px] sm:text-[15.5px] font-medium text-[#1C1A17] leading-snug break-words">
            {displayText}
            {stage === "typing" && (
              <span className="inline-block w-1.5 h-4 bg-[#f97316] ml-0.5 animate-pulse align-middle" />
            )}
          </span>
        </div>
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
            stage === "sent"
              ? "bg-[#9E3D1A] text-white scale-90"
              : "bg-[#f97316] text-white shadow-xs"
          }`}
        >
          <Send className="w-4 h-4" />
        </div>
      </div>

      {/* Answer Container */}
      <div className="min-h-[145px] sm:min-h-[155px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === "result" ? (
            <motion.div
              key="result-box"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="w-full p-3.5 sm:p-4 rounded-xl bg-white border border-[#E3DED4] shadow-md space-y-3"
            >
              <div className="flex items-center justify-between text-[14px] sm:text-[14.5px]">
                <span className="font-bold text-[#1C1A17] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-ping" />
                  Inside found 4 students in Year 10 below 90%:
                </span>
                <span className="text-[12.5px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-md shrink-0">
                  Active
                </span>
              </div>

              {/* Student pill breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#FFF7ED] border border-[#E3DED4] text-center">
                  <p className="font-bold text-[14px] text-[#1C1A17]">Liam D.</p>
                  <p className="text-[13.5px] font-extrabold text-[#f97316] mt-0.5">86.4%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF7ED] border border-[#E3DED4] text-center">
                  <p className="font-bold text-[14px] text-[#1C1A17]">Maya P.</p>
                  <p className="text-[13.5px] font-extrabold text-[#f97316] mt-0.5">87.1%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF7ED] border border-[#E3DED4] text-center">
                  <p className="font-bold text-[14px] text-[#1C1A17]">Lucas W.</p>
                  <p className="text-[13.5px] font-extrabold text-[#f97316] mt-0.5">88.5%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FFF7ED] border border-[#E3DED4] text-center">
                  <p className="font-bold text-[14px] text-[#1C1A17]">Sophie C.</p>
                  <p className="text-[13.5px] font-extrabold text-[#f97316] mt-0.5">89.0%</p>
                </div>
              </div>

              <div className="text-[13px] sm:text-[13.5px] text-[#5C5852] flex items-center justify-between gap-2 pt-2 border-t border-[#E3DED4]">
                <span className="truncate">Action: 2 parent check-in notes drafted</span>
                <span className="font-bold text-[#f97316] hover:underline cursor-pointer shrink-0 whitespace-nowrap">
                  Review &amp; Send &rarr;
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[14.5px] text-[#5C5852] flex items-center gap-2 py-4"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-pulse" />
              <span>Analyzing student attendance dataset...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MINI-PRODUCT DEMO 2: Rows -> % Marks Scored Chart (Green/Yellow/Orange/Red)*/
/* ========================================================================= */
function RowToChartDemo() {
  const [phase, setPhase] = useState<"rows" | "transform" | "chart">("rows");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const runCycle = () => {
      setPhase("rows");
      timer = setTimeout(() => {
        setPhase("transform");
        timer = setTimeout(() => {
          setPhase("chart");
          timer = setTimeout(() => {
            runCycle();
          }, 7500); // Extended hold time by 3 seconds
        }, 1800);
      }, 4500);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, []);

  // Exact color scheme requested:
  // 90%+ green, 70%+ yellow, below that orange, below 40% red
  const gradeBands = [
    {
      label: "90%+",
      count: "38%",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      height: "85%",
      sub: "38 students",
    },
    {
      label: "70%+",
      count: "46%",
      color: "bg-yellow-400",
      textColor: "text-yellow-600 dark:text-yellow-400",
      height: "100%",
      sub: "46 students",
    },
    {
      label: "40-69%",
      count: "12%",
      color: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      height: "42%",
      sub: "12 students",
    },
    {
      label: "<40%",
      count: "4%",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      height: "22%",
      sub: "4 students",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-4 sm:p-5 shadow-xs min-h-[220px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {phase === "rows" || phase === "transform" ? (
          <motion.div
            key="rows-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="space-y-2 font-mono text-[13.5px] sm:text-[14px]"
          >
            <div className="flex items-center justify-between pb-1.5 text-[#5C5852] text-[12.5px] uppercase font-bold border-b border-[#E3DED4] font-sans">
              <span>Student ID</span>
              <span>Assessment</span>
              <span>Raw Score</span>
              <span>% Marks</span>
            </div>
            {[
              {
                id: "STU-1042",
                subject: "Term 2 Algebra",
                raw: "94 / 100",
                score: "94%",
                band: "90%+",
                color: "text-emerald-700",
                badgeBg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-700",
              },
              {
                id: "STU-1088",
                subject: "Term 2 Biology",
                raw: "76 / 100",
                score: "76%",
                band: "70%+",
                color: "text-amber-700",
                badgeBg: "bg-amber-500/10 border-amber-500/40 text-amber-700",
              },
              {
                id: "STU-1102",
                subject: "Term 2 History",
                raw: "58 / 100",
                score: "58%",
                band: "40-69%",
                color: "text-[#f97316]",
                badgeBg: "bg-[#f97316]/10 border-[#f97316]/40 text-[#f97316]",
              },
              {
                id: "STU-1145",
                subject: "Term 2 Physics",
                raw: "34 / 100",
                score: "34%",
                band: "<40%",
                color: "text-red-700",
                badgeBg: "bg-red-500/10 border-red-500/40 text-red-700",
              },
            ].map((row) => (
              <motion.div
                key={row.id}
                animate={{
                  scale: phase === "transform" ? 1.01 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between p-2 rounded-lg text-[#1C1A17] transition-all ${
                  phase === "transform"
                    ? `border ${row.badgeBg}`
                    : "bg-white border border-[#E3DED4]"
                }`}
              >
                <span className="font-bold text-[#1C1A17]">{row.id}</span>
                <span>{row.subject}</span>
                <span>{row.raw}</span>
                <span className={`font-extrabold ${row.color}`}>{row.score}</span>
              </motion.div>
            ))}

            <div className="text-[13.5px] sm:text-[14px] text-center text-[#f97316] font-sans font-semibold pt-1">
              {phase === "transform" ? (
                <span className="animate-pulse">
                  Grouping 100 assessment rows into % marks bands...
                </span>
              ) : (
                <span className="text-[#5C5852] font-normal">
                  Showing 4 of 100 student assessment records
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chart-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {/* Color-coded percentage marks bars */}
            <div className="bg-white rounded-xl border border-[#E3DED4] p-3.5">
              <div className="flex items-center justify-between text-[13.5px] font-bold text-[#5C5852] mb-2 border-b border-[#E3DED4] pb-1.5">
                <span>% Marks Scored Distribution</span>
                <span className="text-[12.5px] text-[#8C877E]">100 Cohort Students</span>
              </div>

              <div className="flex items-end justify-between gap-3 h-28 px-2 pt-1">
                {gradeBands.map((band) => (
                  <div key={band.label} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className={`text-[13px] sm:text-[14px] font-extrabold mb-1 ${band.textColor}`}>
                      {band.count}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: band.height }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className={`w-full rounded-t-md ${band.color} shadow-xs`}
                    />
                    <span className="text-[12.5px] sm:text-[13.5px] mt-1.5 font-bold text-[#1C1A17] whitespace-nowrap">
                      {band.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Line AI Explanation */}
            <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#E3DED4] space-y-1">
              <p className="text-[14.5px] sm:text-[15.5px] font-extrabold text-[#1C1A17] leading-snug">
                84% of cohort scored 70%+ benchmark attainment (Yellow & Green).
              </p>
              <p className="text-[13.5px] sm:text-[14px] text-[#5C5852] font-medium leading-snug">
                4 students scored below 40% (Red) requiring targeted intervention.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========================================================================= */
/* MINI-PRODUCT DEMO 3: Animated Line Chart (Attendance Trajectory Dip)       */
/* ========================================================================= */
function EarlyAlertDemo() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 7500);
    return () => clearInterval(interval);
  }, []);

  const dataPoints = [
    { week: "W1", value: "95%", x: 25, y: 16, status: "normal" },
    { week: "W2", value: "93%", x: 85, y: 22, status: "normal" },
    { week: "W3", value: "88%", x: 145, y: 44, status: "warning" },
    { week: "W4", value: "84%", x: 205, y: 58, status: "alert" },
    { week: "W5", value: "81%", x: 265, y: 68, status: "alert" },
  ];

  const linePath =
    "M 25 16 C 55 16, 55 22, 85 22 C 115 22, 115 44, 145 44 C 175 44, 175 58, 205 58 C 235 58, 235 68, 265 68";
  const areaPath = `${linePath} L 265 82 L 25 82 Z`;

  return (
    <div className="w-full rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-3.5 space-y-2 shadow-xs">
      {/* Top Signal Bar */}
      <div className="flex items-center justify-between text-[13.5px] sm:text-[14px] font-bold text-[#1C1A17]">
        <span className="flex items-center gap-1.5 text-[#f97316]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-ping" />
          Early Alert: Attendance Dip
        </span>
        <span className="text-[12.5px] font-bold text-rose-700 bg-rose-500/10 px-2 py-0.5 rounded">
          Week 3 Dip
        </span>
      </div>

      {/* Line Chart Container */}
      <div className="relative min-h-[175px] sm:h-[185px] rounded-xl bg-white border border-[#E3DED4] p-3 flex flex-col justify-between overflow-hidden select-none">
        {/* Benchmark 90% indicator header */}
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#5C5852]">
          <span>Year 8 Attendance</span>
          <span className="text-[#f97316] font-bold">
            90% Target Benchmark
          </span>
        </div>

        {/* SVG Line Chart */}
        <div className="relative w-full flex-1">
          <svg
            key={cycle}
            viewBox="0 0 290 85"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="alertLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 90% Benchmark Reference Dotted Line (y = 36) */}
            <line
              x1="20"
              y1="36"
              x2="270"
              y2="36"
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-[#E3DED4]"
              strokeWidth="1.5"
            />

            {/* Area Fill */}
            <motion.path
              d={areaPath}
              fill="url(#alertLineGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />

            {/* Animated Line Path */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />

            {/* Points on Line */}
            {dataPoints.map((pt, i) => (
              <g key={pt.week}>
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.status === "alert" ? 4.5 : 3.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.25, duration: 0.3 }}
                  className={
                    pt.status === "alert"
                      ? "fill-rose-500 stroke-white dark:stroke-[#0D0F18] stroke-2"
                      : pt.status === "warning"
                      ? "fill-amber-500 stroke-white dark:stroke-[#0D0F18] stroke-2"
                      : "fill-emerald-500 stroke-white dark:stroke-[#0D0F18] stroke-2"
                  }
                />
                {/* Pulsing ring on the final dipped point */}
                {pt.status === "alert" && i === dataPoints.length - 1 && (
                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    r={8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      delay: 1.4,
                    }}
                  />
                )}
              </g>
            ))}

            {/* X-axis Labels */}
            {dataPoints.map((pt) => (
              <text
                key={pt.week}
                x={pt.x}
                y="82"
                textAnchor="middle"
                className="text-[12px] fill-slate-500 dark:fill-slate-400 font-bold"
              >
                {pt.week}
              </text>
            ))}
          </svg>

          {/* Floating Warning Tooltip pinned near Week 3 */}
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="absolute top-3 left-[48%] -translate-x-1/2 px-2.5 py-0.5 rounded bg-orange-600 text-white text-[12px] font-extrabold shadow-sm flex items-center gap-1 pointer-events-none"
          >
            <span>Dipped &lt;90%</span>
          </motion.div>
        </div>

        {/* Chart Bottom Label */}
        <div className="flex items-center justify-between text-[13px] pt-1 border-t border-[#E3DED4]">
          <span className="text-[#5C5852] font-medium">
            5 students trending down
          </span>
          <span className="text-[#f97316] font-bold">
            Flagged 21 days early
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MINI-PRODUCT DEMO 4: Mouse Clicks Upload -> Chooses Excel -> Uploaded     */
/* ========================================================================= */
function DataDropDemo() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  // Step 0: Mouse approaches upload button
  // Step 1: Mouse clicks upload button
  // Step 2: File picker opens, mouse clicks Excel file
  // Step 3: Mouse hides, progress bar fills
  // Step 4: Upload successful

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setStep(0); // Mouse starts bottom-left, glides to upload button
      timeout = setTimeout(() => {
        setStep(1); // Clicks upload button
        timeout = setTimeout(() => {
          setStep(2); // File picker appears, mouse clicks Excel file
          timeout = setTimeout(() => {
            setStep(3); // Uploading
            timeout = setTimeout(() => {
              setStep(4); // Upload success
              timeout = setTimeout(() => {
                cycle(); // Repeat loop
              }, 6200); // Extended hold time by 3 seconds
            }, 1400);
          }, 1600);
        }, 1200);
      }, 1400);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-3.5 space-y-2.5 shadow-xs">
      {/* Upload Zone / Screen with relative positioning for cursor */}
      <div className="relative min-h-[175px] sm:h-[185px] rounded-xl bg-white border border-[#E3DED4] p-3.5 flex flex-col justify-center overflow-hidden">
        {/* Animated Mouse Cursor placed INSIDE the upload screen container */}
        <AnimatedCursor
          left={
            step === 0
              ? "20%"
              : step === 1
              ? "50%"
              : step === 2
              ? "50%"
              : "65%"
          }
          top={
            step === 0
              ? "80%"
              : step === 1
              ? "52%"
              : step === 2
              ? "62%"
              : "90%"
          }
          clicking={step === 1 || step === 2}
          visible={step <= 2}
        />

        <AnimatePresence mode="wait">
          {step === 0 || step === 1 ? (
            <motion.div
              key="btn-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-2 py-1 select-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#FFF7ED] text-[#f97316] flex items-center justify-center border border-[#E3DED4]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-[14.5px] font-bold transition-all flex items-center gap-2 ${
                  step === 1
                    ? "bg-[#9E3D1A] text-white scale-95 shadow-inner"
                    : "bg-[#f97316] text-white shadow-xs"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Upload Spreadsheet</span>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="picker-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#E3DED4] space-y-1.5 select-none"
            >
              <div className="flex items-center justify-between text-[12px] font-bold text-[#5C5852] uppercase tracking-wider">
                <span>Select Spreadsheet</span>
                <span className="text-[#f97316] font-bold">Ready</span>
              </div>
              <div
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white border-2 border-[#f97316] shadow-xs"
              >
                <div className="w-7 h-7 rounded bg-emerald-700 text-white font-black text-[12px] flex items-center justify-center shrink-0 shadow-xs">
                  XLS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-[#1C1A17] truncate">
                    Term2_Student_Scores.xlsx
                  </p>
                  <p className="text-[12.5px] text-[#5C5852]">
                    1.4 MB • 320 records
                  </p>
                </div>
                <span className="text-[13px] font-bold text-[#f97316]">
                  Select
                </span>
              </div>
            </motion.div>
          ) : step === 3 ? (
            <motion.div
              key="uploading-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5 p-2 select-none"
            >
              <div className="flex items-center justify-between text-[14.5px] font-bold text-[#1C1A17]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-spin" />
                  Uploading spreadsheet...
                </span>
                <span className="text-[#f97316] font-extrabold">100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3DED4] overflow-hidden">
                <motion.div
                  initial={{ width: "15%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="h-full bg-[#f97316] rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 w-full select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Check className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-[#1C1A17] truncate">
                  Term2_Student_Scores.xlsx
                </p>
                <p className="text-[13px] font-extrabold text-emerald-700">
                  Uploaded (320 student records ready)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* MINI-PRODUCT DEMO 5: Mouse Clicks Create Summary -> 1-Page PDF Created    */
/* ========================================================================= */
function ReportShareDemo() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setStep(0); // Move cursor to button
      timeout = setTimeout(() => {
        setStep(1); // Click button
        timeout = setTimeout(() => {
          setStep(2); // Generating
          timeout = setTimeout(() => {
            setStep(3); // 1-page PDF created
            timeout = setTimeout(() => {
              cycle(); // Restart loop
            }, 7200);
          }, 1100);
        }, 1200);
      }, 1400);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-3.5 space-y-2.5 shadow-xs">
      {/* Container with relative positioning for cursor */}
      <div className="relative min-h-[175px] sm:h-[185px] rounded-xl bg-white border border-[#E3DED4] p-2.5 sm:p-3 flex flex-col justify-center overflow-hidden">
        {/* Animated Mouse Cursor placed INSIDE the demo container */}
        <AnimatedCursor
          left={
            step === 0
              ? "20%"
              : step === 1
              ? "50%"
              : "50%"
          }
          top={
            step === 0
              ? "80%"
              : step === 1
              ? "48%"
              : "48%"
          }
          clicking={step === 1}
          visible={step <= 1}
        />

        <AnimatePresence mode="wait">
          {step === 0 || step === 1 ? (
            <motion.div
              key="btn-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-2 select-none"
            >
              <div
                className={`px-4 py-2.5 rounded-xl text-[14.5px] font-bold transition-all flex items-center gap-2 ${
                  step === 1
                    ? "bg-[#9E3D1A] text-white scale-95 shadow-inner"
                    : "bg-[#f97316] text-white shadow-xs"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Create executive summary</span>
              </div>
              <span className="text-[13px] text-[#5C5852]">Click to format 1-page PDF</span>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="creating-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-[14.5px] text-[#f97316] font-bold gap-2 select-none"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Formatting 1-page executive brief...</span>
            </motion.div>
          ) : (
            /* 1-Page PDF with charts and important textual details */
            <motion.div
              key="pdf-screen"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full rounded-lg bg-white border border-[#E3DED4] p-2 sm:p-2.5 flex flex-col justify-between select-none shadow-xs"
            >
              {/* PDF Document Header Bar */}
              <div className="flex items-center justify-between border-b border-[#E3DED4] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-black bg-[#f97316] text-white px-1.5 py-0.5 rounded">
                    PDF
                  </span>
                  <span className="text-[13px] sm:text-[13.5px] font-extrabold text-[#1C1A17] truncate">
                    Executive_Summary.pdf
                  </span>
                </div>
                <span className="text-[11px] sm:text-[11.5px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">
                  1 Page Brief
                </span>
              </div>

              {/* Charts / Diagrams & Key Metrics in PDF */}
              <div className="grid grid-cols-12 gap-2 items-center py-1">
                {/* Mini Diagram: Marks Distribution bar chart */}
                <div className="col-span-4 bg-[#FFF7ED] p-1.5 rounded-lg border border-[#E3DED4] flex flex-col justify-between h-12">
                  <div className="flex items-end justify-between gap-1 h-6 px-0.5">
                    <div className="w-2 h-[85%] bg-emerald-600 rounded-t-sm" />
                    <div className="w-2 h-[100%] bg-amber-500 rounded-t-sm" />
                    <div className="w-2 h-[42%] bg-[#f97316] rounded-t-sm" />
                    <div className="w-2 h-[22%] bg-red-600 rounded-t-sm" />
                  </div>
                  <span className="text-[9.5px] font-bold text-[#5C5852] text-center truncate">
                    Attainment Chart
                  </span>
                </div>

                {/* Important Textual Details */}
                <div className="col-span-8 space-y-0.5 text-[12px] sm:text-[12.5px] leading-tight">
                  <p className="font-extrabold text-[#1C1A17] truncate">
                    Attainment: 91.4% • Benchmark: 84%
                  </p>
                  <p className="text-[#5C5852] font-medium truncate">
                    • Median score rose +4.8% post-tutoring
                  </p>
                  <p className="text-[#5C5852] font-medium truncate">
                    • 4 students identified for targeted support
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1.5 pb-0.5 border-t border-[#E3DED4]">
                <div className="px-2.5 py-1 rounded-md bg-[#FFF7ED] border border-[#E3DED4] text-[12px] font-bold text-[#1C1A17] flex items-center gap-1 shadow-xs">
                  <Share2 className="w-3 h-3 text-[#f97316]" />
                  <span>Share</span>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-[#f97316] text-[12px] font-bold text-white flex items-center gap-1 shadow-xs">
                  <Download className="w-3 h-3" />
                  <span>Download PDF</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
