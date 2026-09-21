"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileSpreadsheet,
  Send,
  Check,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function HowItWorks() {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // 3 Clear Steps tailored for non-technical buyers
  const steps = [
    {
      num: "01",
      title: "Bring your data",
      subtitle: "Upload Excel or CSV, or connect the tools you already use.",
      highlights: [
        "Drag and drop any spreadsheet in seconds",
        "Automatic column detection and cleaning",
        "Zero IT or database setup required",
      ],
    },
    {
      num: "02",
      title: "Ask what you want to know",
      subtitle: "Type your question exactly the way you'd ask a colleague.",
      highlights: [
        "Ask in normal, everyday conversational English",
        "Inside understands school terms, dates, and grades",
        "No formulas, pivot tables, or queries",
      ],
    },
    {
      num: "03",
      title: "Get clarity in seconds",
      subtitle: "Inside turns your data into clear answers, charts, and next steps.",
      highlights: [
        "Instant KPI summary cards and clear charts",
        "2-line plain English explanation of findings",
        "Automated AI insight synthesized from your numbers",
      ],
    },
  ];

  // Auto-cycle continuously every 6.5 seconds, restarts smoothly on manual tap
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [activeStep, steps.length]);

  return (
    <section
      id="how-it-works"
      className="py-24 relative overflow-hidden bg-[#F5F2EB] border-t border-[#E3DED4] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] leading-tight">
            From spreadsheet to insight in{" "}
            <span className="text-amber-gradient">three simple steps.</span>
          </h2>
          <p className="text-[18px] sm:text-[20px] text-[#5C5852] leading-relaxed max-w-2xl mx-auto">
            Getting useful answers from your data shouldn&apos;t take weeks or
            technical expertise. Inside gets you there in three simple steps.
          </p>
        </div>

        {/* Large Premium Interactive Card */}
        <div className="rounded-3xl bg-white border border-[#E3DED4] shadow-xl p-6 sm:p-10 lg:p-12 transition-all duration-300">
          {/* Top Step Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-10">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? "bg-[#FFF7ED] border-[#f97316] shadow-xs"
                      : "bg-white border-[#E3DED4] hover:border-[#f97316]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[14px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        isActive
                          ? "bg-[#f97316] text-white"
                          : "bg-[#E3DED4] text-[#5C5852]"
                      }`}
                    >
                      Step {step.num}
                    </span>
                    {isActive && (
                      <span className="text-[13.5px] font-bold text-[#f97316] flex items-center gap-1">
                        Active <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-[19px] sm:text-[21px] font-bold text-[#1C1A17]">
                    {step.title}
                  </h3>
                  <p className="text-[15px] sm:text-[15.5px] text-[#5C5852] mt-1 line-clamp-1">
                    {step.subtitle}
                  </p>

                  {/* Active Progress Bar Under Tab */}
                  {isActive && (
                    <motion.div
                      key={`progress-${activeStep}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6.5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1 bg-[#f97316]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Card Content: Left Details, Right Interactive Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Context and Value */}
            <div className="lg:col-span-5 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-copy-${activeStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF7ED] border border-[#f97316]/30 text-[#f97316] text-[13.5px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step {steps[activeStep].num} of 03
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C1A17] tracking-tight leading-tight">
                    {steps[activeStep].title}
                  </h3>

                  <p className="text-[16px] sm:text-[18px] text-[#5C5852] leading-relaxed">
                    {steps[activeStep].subtitle}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="space-y-3 pt-2">
                    {steps[activeStep].highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-[15.5px] sm:text-[16px] text-[#1C1A17] font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Dynamic Interactive Mini-Demo Window */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#F5F2EB] border border-[#E3DED4] p-5 sm:p-7 shadow-xs min-h-[380px] sm:min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && <BringDataShowcase key="step-0" />}
                  {activeStep === 1 && <AskQuestionShowcase key="step-1" />}
                  {activeStep === 2 && <GetClarityShowcase key="step-2" />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================= */
/* SHOWCASE 1: Bring your data (Excel gently drops into Inside -> Connected) */
/* ========================================================================= */
function BringDataShowcase() {
  const [phase, setPhase] = useState<"floating" | "dropped" | "connected">("floating");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setPhase("floating");
      timeout = setTimeout(() => {
        setPhase("dropped");
        timeout = setTimeout(() => {
          setPhase("connected");
          timeout = setTimeout(() => {
            cycle();
          }, 4500);
        }, 800);
      }, 900);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 w-full select-none"
    >
      <div className="flex items-center justify-between text-[14.5px] font-bold text-[#5C5852] border-b border-[#E3DED4] pb-2">
        <span className="flex items-center gap-2 text-[#1C1A17]">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          Instant File Ingestion
        </span>
        <span className="text-[13.5px] font-bold text-[#f97316]">
          Step 1: Connect
        </span>
      </div>

      {/* Drop Target Receptacle */}
      <div className="relative p-6 rounded-2xl bg-white border-2 border-dashed border-[#f97316]/40 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
        {/* Animated Falling Excel File */}
        <motion.div
          animate={
            phase === "floating"
              ? { y: -35, opacity: 0.75, scale: 0.95 }
              : phase === "dropped"
              ? { y: 0, opacity: 1, scale: 1.03 }
              : { y: 0, opacity: 1, scale: 1 }
          }
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
          className="w-full max-w-md p-4 rounded-xl bg-[#FFF7ED] border border-[#E3DED4] shadow-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              XLSX
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1C1A17] truncate">
                Term2_Student_Assessments.xlsx
              </p>
              <p className="text-[14px] text-[#5C5852]">
                1.4 MB • 320 student records
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {phase === "connected" ? (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-extrabold text-[14px] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Connected ✓
              </motion.span>
            ) : (
              <span className="text-[14px] text-[#8C877E] font-medium animate-pulse">
                Dropping in...
              </span>
            )}
          </div>
        </motion.div>

        {/* Ripple on connection */}
        {phase === "connected" && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute w-40 h-40 rounded-full border-2 border-emerald-500 pointer-events-none"
          />
        )}

        {/* Verified Data Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-2">
          <span className="px-3 py-1 rounded-md bg-[#FFF7ED] border border-[#E3DED4] text-[14px] font-semibold text-[#1C1A17]">
            ✓ Math Assessment (100 rows)
          </span>
          <span className="px-3 py-1 rounded-md bg-[#FFF7ED] border border-[#E3DED4] text-[14px] font-semibold text-[#1C1A17]">
            ✓ Science Assessment (110 rows)
          </span>
          <span className="px-3 py-1 rounded-md bg-[#FFF7ED] border border-[#E3DED4] text-[14px] font-semibold text-[#1C1A17]">
            ✓ English Cohort (110 rows)
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[14.5px] text-[#5C5852] px-1">
        <span>Connects with Excel, CSV, Google Sheets, or School SIS</span>
        <span className="font-bold text-emerald-700">
          Ready to query
        </span>
      </div>
    </motion.div>
  );
}

/* ========================================================================= */
/* SHOWCASE 2: Ask what you want to know (Cursor types question -> send pulses) */
/* ========================================================================= */
function AskQuestionShowcase() {
  const fullText = "Which students fell below 90% attendance this month?";
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [sendPulse, setSendPulse] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const runTypeCycle = () => {
      setIsTyping(true);
      setSendPulse(false);
      setDisplayText("");
      charIndex = 0;

      const interval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setSendPulse(true);
          timeout = setTimeout(() => {
            runTypeCycle();
          }, 4500);
        }
      }, 45);
    };

    runTypeCycle();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 w-full select-none"
    >
      <div className="flex items-center justify-between text-[14.5px] font-bold text-[#5C5852] border-b border-[#E3DED4] pb-2">
        <span className="flex items-center gap-2 text-[#1C1A17]">
          <Sparkles className="w-4 h-4 text-[#f97316]" />
          Conversational Prompt
        </span>
        <span className="text-[13.5px] font-bold text-[#f97316]">
          Step 2: Ask
        </span>
      </div>

      {/* Simulated Chat Field */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DED4] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5F2EB] border border-[#E3DED4] min-h-[56px] sm:min-h-[60px]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[15px] sm:text-[16.5px] font-medium text-[#1C1A17] leading-snug break-words">
              {displayText}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 bg-[#f97316] ml-0.5 animate-pulse align-middle" />
              )}
            </span>
          </div>

          <motion.div
            animate={
              sendPulse
                ? {
                    scale: [1, 1.15, 1],
                  }
                : {}
            }
            transition={{ duration: 0.4, repeat: sendPulse ? 2 : 0 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              sendPulse
                ? "bg-[#f97316] text-white shadow-xs"
                : "bg-[#E3DED4] text-[#5C5852]"
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Real-time Question Interpretation Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#E3DED4] space-y-2">
          <p className="text-[13.5px] font-bold text-[#f97316] uppercase tracking-wider">
            How Inside reads this question:
          </p>
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#E3DED4]">
              <span className="text-[12.5px] text-[#5C5852] block font-medium">Metric</span>
              <span className="font-bold text-[14.5px] text-[#1C1A17]">Attendance &lt; 90%</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E3DED4]">
              <span className="text-[12.5px] text-[#5C5852] block font-medium">Timeframe</span>
              <span className="font-bold text-[14.5px] text-[#1C1A17]">Current Month</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E3DED4]">
              <span className="text-[12.5px] text-[#5C5852] block font-medium">Cohort</span>
              <span className="font-bold text-[14.5px] text-[#1C1A17]">Year 10 (All)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ========================================================================= */
/* SHOWCASE 3: Get clarity in seconds (KPI -> Chart -> AI Insight)            */
/* ========================================================================= */
function GetClarityShowcase() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setStage(0);
      timeout = setTimeout(() => {
        setStage(1);
        timeout = setTimeout(() => {
          setStage(2);
          timeout = setTimeout(() => {
            cycle();
          }, 5000);
        }, 1200);
      }, 700);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, []);

  const students = [
    { name: "Liam D.", score: "86.4%", width: "72%", color: "bg-[#f97316]" },
    { name: "Maya P.", score: "87.1%", width: "75%", color: "bg-[#f97316]" },
    { name: "Lucas W.", score: "88.5%", width: "82%", color: "bg-[#A84D4D]" },
    { name: "Sophie C.", score: "89.0%", width: "85%", color: "bg-[#A84D4D]" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="space-y-3.5 w-full select-none"
    >
      <div className="flex items-center justify-between text-[14.5px] font-bold text-[#5C5852] border-b border-[#E3DED4] pb-2">
        <span className="flex items-center gap-2 text-[#1C1A17]">
          <FileCheck className="w-4 h-4 text-emerald-700" />
          Instant Answer & Synthesis
        </span>
        <span className="text-[13.5px] font-bold text-[#f97316]">
          Step 3: Clarity
        </span>
      </div>

      {/* 1. KPI Metric Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3.5 rounded-xl bg-white border border-[#E3DED4] flex items-center justify-between shadow-xs"
      >
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-[#8C877E]">
            Attendance Alert
          </span>
          <p className="text-[18px] sm:text-[19px] font-extrabold text-[#1C1A17]">
            4 Students Below 90% Threshold
          </p>
        </div>
        <div className="text-right">
          <span className="text-[12.5px] text-[#8C877E] block font-medium">Flagged Avg</span>
          <span className="text-[17px] font-extrabold text-[#f97316]">
            87.8%
          </span>
        </div>
      </motion.div>

      {/* 2. Chart Draws Progressively */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4 }}
          className="p-3.5 rounded-xl bg-white border border-[#E3DED4] space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between text-[13.5px] font-bold text-[#5C5852] border-b border-[#E3DED4] pb-1.5">
            <span>Student Breakdown</span>
            <span className="text-[#f97316] font-bold">Target: 90.0%</span>
          </div>

          <div className="space-y-2">
            {students.map((stu) => (
              <div key={stu.name} className="space-y-1">
                <div className="flex items-center justify-between text-[14px] sm:text-[14.5px] font-semibold text-[#1C1A17]">
                  <span>{stu.name}</span>
                  <span className="font-extrabold">{stu.score}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E3DED4] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stu.width }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${stu.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. AI Insight */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#E3DED4] space-y-1 text-xs"
        >
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#f97316] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Insight</span>
          </div>
          <p className="text-[15px] sm:text-[15.5px] font-extrabold text-[#1C1A17] leading-snug">
            Attendance dipped across 3 consecutive weeks leading into Term 2 tests.
          </p>
          <p className="text-[#5C5852] text-[13.5px] sm:text-[14px] font-medium leading-snug">
            Remaining 96% of cohort maintained attendance comfortably above benchmark.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
