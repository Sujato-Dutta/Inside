"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ProductDemo() {
  const { theme } = useTheme();

  // 4 Data sources with real image logos from assets
  const dataSources = [
    { id: "csv", title: "CSV", logo: "/csv.png" },
    { id: "excel", title: "Excel", logo: "/excel.png" },
    { id: "sheets", title: "Google Sheets", logo: "/sheets.webp" },
    { id: "sql", title: "SQL Database", logo: "/sql.png" },
  ];

  const fullQuestion =
    "What was the no. of students having attendance less than 85% last semester?";

  // Intersection observer: only start animation when user scrolls into Section 2
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const [hasStarted, setHasStarted] = useState(false);

  // 20s animation cycle:
  // scratch -> typing -> sending -> output -> repeat
  const [stage, setStage] = useState<"scratch" | "typing" | "sending" | "output">("scratch");
  const [typedText, setTypedText] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);

  // References for measuring exact DOM element positions
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const pieCardRef = useRef<HTMLDivElement>(null);
  const insightCardRef = useRef<HTMLDivElement>(null);

  const [paths, setPaths] = useState<{
    sourceLines: string[];
    pieLine: string;
    insightLine: string;
  }>({
    sourceLines: [],
    pieLine: "",
    insightLine: "",
  });

  // Calculate pixel-perfect curved conduit paths
  const updateConduitPaths = () => {
    if (!containerRef.current || !inputRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const inputRect = inputRef.current.getBoundingClientRect();

    const targetX = inputRect.left - containerRect.left;
    const targetY = inputRect.top + inputRect.height / 2 - containerRect.top;

    // 4 Conduits from Left Data Sources to Center Chatbox
    const newSourceLines: string[] = [];
    sourceRefs.current.forEach((el) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const startX = rect.right - containerRect.left;
        const startY = rect.top + rect.height / 2 - containerRect.top;

        const deltaX = targetX - startX;
        const cp1X = startX + deltaX * 0.45;
        const cp1Y = startY;
        const cp2X = startX + deltaX * 0.55;
        const cp2Y = targetY;

        newSourceLines.push(
          `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`
        );
      }
    });

    // Right output conduits: Connect to BOTH Pie Chart and AI Insight Tab
    let newPieLine = "";
    let newInsightLine = "";
    const startOutX = inputRect.right - containerRect.left;
    const startOutY = inputRect.top + inputRect.height / 2 - containerRect.top;

    // Line to Pie Chart
    if (pieCardRef.current) {
      const pieRect = pieCardRef.current.getBoundingClientRect();
      const endPieX = pieRect.left - containerRect.left;
      const endPieY = pieRect.top + pieRect.height / 2 - containerRect.top;

      const deltaX = endPieX - startOutX;
      const cp1X = startOutX + deltaX * 0.45;
      const cp1Y = startOutY;
      const cp2X = startOutX + deltaX * 0.55;
      const cp2Y = endPieY;

      newPieLine = `M ${startOutX} ${startOutY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endPieX} ${endPieY}`;
    }

    // Line to AI Insight Tab
    if (insightCardRef.current) {
      const insightRect = insightCardRef.current.getBoundingClientRect();
      const endInsightX = insightRect.left - containerRect.left;
      const endInsightY = insightRect.top + insightRect.height / 2 - containerRect.top;

      const deltaX = endInsightX - startOutX;
      const cp1X = startOutX + deltaX * 0.45;
      const cp1Y = startOutY;
      const cp2X = startOutX + deltaX * 0.55;
      const cp2Y = endInsightY;

      newInsightLine = `M ${startOutX} ${startOutY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endInsightX} ${endInsightY}`;
    }

    setPaths({
      sourceLines: newSourceLines,
      pieLine: newPieLine,
      insightLine: newInsightLine,
    });
  };

  useEffect(() => {
    updateConduitPaths();
    window.addEventListener("resize", updateConduitPaths);
    const interval = setInterval(updateConduitPaths, 400);
    return () => {
      window.removeEventListener("resize", updateConduitPaths);
      clearInterval(interval);
    };
  }, [stage]);

  // Start the animation only when scrolled into view
  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true);
    }
  }, [isInView, hasStarted]);

  // 20-Second Whole Animation Cycle (Runs only when user has scrolled to the section)
  useEffect(() => {
    if (!hasStarted) return;

    let timer: NodeJS.Timeout;
    let typeInterval: NodeJS.Timeout;

    const runCycle = () => {
      // Phase 1: Scratch (0s)
      setStage("scratch");
      setTypedText("");
      setButtonPressed(false);

      // Phase 2: Start typing question at 0.8s
      timer = setTimeout(() => {
        setStage("typing");
        let idx = 0;
        typeInterval = setInterval(() => {
          if (idx <= fullQuestion.length) {
            setTypedText(fullQuestion.slice(0, idx));
            idx++;
          } else {
            clearInterval(typeInterval);

            // Phase 3: Press glowing arrow button at ~5.2s
            timer = setTimeout(() => {
              setStage("sending");
              setButtonPressed(true);

              // Phase 4: Output appears at ~5.9s (Pie chart + AI insight)
              timer = setTimeout(() => {
                setStage("output");
                setButtonPressed(false);

                // Phase 5: Reset at 20s (loop continuously)
                timer = setTimeout(() => {
                  runCycle();
                }, 14100);
              }, 700);
            }, 500);
          }
        }, 38);
      }, 800);
    };

    runCycle();

    return () => {
      clearTimeout(timer);
      clearInterval(typeInterval);
    };
  }, [hasStarted]);

  // Pie chart data: Red for <85% (42), Green for >=85% (268)
  const pieData = [
    { name: "Attendance < 85%", value: 42, color: "#ef4444" },
    { name: "Attendance ≥ 85%", value: 268, color: "#10b981" },
  ];

  return (
    <section
      ref={sectionRef}
      id="workflow-demo"
      className="pt-24 pb-0 relative overflow-hidden bg-[#F5F2EB] text-[#1C1A17] border-t border-[#E3DED4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center space-y-4">
        {/* Section Heading & Subheading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] dark:text-white">
          Interact with data in{" "}
          <span className="text-amber-gradient">your own language</span>
        </h2>
        <p className="text-[18px] sm:text-[20px] text-[#5C5852] dark:text-[#A8A29E] leading-relaxed max-w-2xl mx-auto">
          Connect your spreadsheets and school databases, then query in plain English with instant visual answers.
        </p>
      </div>

      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[380px] lg:min-h-[410px]"
      >
        {/* SVG CONDUIT LAYER (Orange connectors, ambient flow) */}
        <svg
          fill="none"
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          {/* Dotted orange conduits from ALL 4 data source boxes into center box */}
          {paths.sourceLines.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className="animate-conduit opacity-85"
            />
          ))}

          {/* Dotted orange conduit to Pie Chart Card */}
          {stage === "output" && paths.pieLine && (
            <path
              d={paths.pieLine}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className="animate-conduit opacity-85"
            />
          )}

          {/* Dotted orange conduit to AI Insight Tab */}
          {stage === "output" && paths.insightLine && (
            <path
              d={paths.insightLine}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className="animate-conduit opacity-85"
            />
          )}
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: 4 Data Sources with real asset logos */}
          <div className="lg:col-span-3 flex flex-col gap-4 z-20">
            {dataSources.map((source, index) => (
              <div
                key={source.id}
                ref={(el) => {
                  sourceRefs.current[index] = el;
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E1C19] border border-[#E3DED4] dark:border-white/10 shadow-sm flex items-center gap-3.5 transition-all duration-300 hover:border-orange-500/50"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] dark:bg-[#151413] p-1.5 flex items-center justify-center border border-[#E3DED4] dark:border-white/10 shrink-0 shadow-xs">
                  <Image
                    src={source.logo}
                    alt={source.title}
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
                <span className="text-[17px] font-bold text-[#1C1A17] dark:text-white tracking-wide">
                  {source.title}
                </span>
              </div>
            ))}
          </div>

          {/* CENTER: Natural Language Query */}
          <div className="lg:col-span-5 flex flex-col items-center z-20">
            {/* Logo Emblem */}
            <div className="relative mb-5">
              <div className="relative w-16 h-16 rounded-2xl p-1 bg-orange-50/50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 shadow-sm">
                <div className="w-full h-full relative rounded-xl overflow-hidden bg-white dark:bg-[#1E1C19] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Inside Logo"
                    fill
                    className="object-cover scale-110"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Central Box */}
            <div
              ref={inputRef}
              className="w-full rounded-3xl bg-white dark:bg-[#1E1C19] p-6 border border-[#E3DED4] dark:border-white/10 shadow-sm"
            >
              <div className="text-[14px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Natural Language Query
              </div>

              {/* Chat Input with typewriter text */}
              <div className="relative flex items-center">
                <div className="w-full min-h-[64px] px-4 py-3.5 rounded-2xl bg-[#F5F2EB] dark:bg-[#151413] border border-[#E3DED4] dark:border-white/10 text-[#1C1A17] dark:text-white font-medium text-[17px] sm:text-[18px] flex items-center pr-14 leading-relaxed">
                  <span className="text-[#1C1A17] dark:text-white">
                    {typedText}
                    {stage === "typing" && (
                      <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" />
                    )}
                  </span>
                  {!hasStarted && (
                    <span className="text-[#5C5852] dark:text-[#A8A29E] text-[15px]">
                      Scroll to begin...
                    </span>
                  )}
                </div>

                <button
                  className={`absolute right-2.5 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition-all duration-200 shadow-md shadow-orange-500/25 ${
                    buttonPressed
                      ? "scale-90 brightness-110"
                      : "hover:scale-105"
                  }`}
                  aria-label="Submit Query"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Output */}
          <div
            ref={outputRef}
            className="lg:col-span-4 flex flex-col gap-4 z-20 min-h-[360px] justify-center"
          >
            <AnimatePresence mode="wait">
              {stage === "output" && (
                <motion.div
                  key="output-panel"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  {/* 1. Only One Pie Chart (Red & Green) */}
                  <div
                    ref={pieCardRef}
                    className="p-6 rounded-3xl bg-white dark:bg-[#1E1C19] border border-[#E3DED4] dark:border-white/10 shadow-sm flex flex-col items-center"
                  >
                    <h4 className="text-[18px] font-bold text-[#1C1A17] dark:text-white mb-2 self-start">
                      Attendance Distribution
                    </h4>

                    <div className="w-full h-44 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                            animationDuration={1200}
                          >
                            {pieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: theme === "dark" ? "#1E1C19" : "#FFFFFF",
                              borderColor: theme === "dark" ? "rgba(255,255,255,0.15)" : "#E3DED4",
                              borderRadius: "10px",
                              color: theme === "dark" ? "#FFFFFF" : "#1C1A17",
                              fontSize: "14px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-5 text-[15px] font-semibold mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                        <span className="text-red-600 dark:text-red-400">&lt; 85% (42)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ≥ 85% (268)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Only One AI Insight Box */}
                  <div
                    ref={insightCardRef}
                    className="p-5 rounded-3xl bg-white dark:bg-[#1E1C19] border border-[#E3DED4] dark:border-white/10 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-orange-600 dark:text-orange-400 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Insight</span>
                    </div>
                    <p className="text-[16px] text-[#5C5852] dark:text-[#A8A29E] leading-relaxed">
                      <strong className="text-[#1C1A17] dark:text-white font-extrabold">42 students</strong>{" "}
                      had attendance below 85% last semester, while{" "}
                      <strong className="text-[#1C1A17] dark:text-white font-extrabold">
                        268 students
                      </strong>{" "}
                      maintained 85% or higher attendance.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
