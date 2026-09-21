"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTheme } from "@/context/ThemeContext";
import {
  MessageSquare,
  BarChart3,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  Coins,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export function Hero() {
  const { theme } = useTheme();

  // Interactive sample scenarios for the Mock 2 card (strictly AI school data analysis related)
  const scenarios = [
    {
      id: "academic-growth",
      question: "What drove our student attainment growth this year?",
      title: "Student Attainment & Progress",
      period: "Academic Year",
      amount: "91.4%",
      growth: "↑ 18%",
      comparison: "vs. previous academic year",
      bars: [
        { label: "Term 1", value: 45, height: "32%", active: false },
        { label: "Term 2", value: 65, height: "52%", active: false },
        { label: "Term 3", value: 85, height: "72%", active: false },
        { label: "Term 4", value: 124, height: "100%", active: true, tag: "91.4%" },
      ],
      insight:
        "Attainment rose 18% across school cohorts, driven by targeted intervention in Year 10 STEM, a 14% improvement in attendance rates, and early identification of support-tier students.",
      metrics: [
        { label: "STEM proficiency", value: "+24%", icon: TrendingUp },
        { label: "Attendance rate", value: "94.6%", icon: Users },
        { label: "Intervention success", value: "89%", icon: ShieldCheck },
      ],
    },
    {
      id: "attendance-risk",
      question: "Which student cohorts show the highest attendance gains?",
      title: "Cohort Attendance & Retention",
      period: "Termly",
      amount: "96.2%",
      growth: "↑ 8%",
      comparison: "vs. last term",
      bars: [
        { label: "Year 7", value: 40, height: "35%", active: false },
        { label: "Year 8", value: 60, height: "55%", active: false },
        { label: "Year 9", value: 80, height: "75%", active: false },
        { label: "Year 10", value: 115, height: "100%", active: true, tag: "96.2%" },
      ],
      insight:
        "Year 10 attendance improved to 96.2% following morning check-in nudges, reducing persistent absenteeism by 31% and lifting overall core exam readiness.",
      metrics: [
        { label: "Persistent absence drop", value: "-31%", icon: TrendingUp },
        { label: "On-time arrival rate", value: "95%", icon: Users },
        { label: "SEN support response", value: "98%", icon: ShieldCheck },
      ],
    },
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const current = scenarios[activeScenarioIdx];

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden bg-[#F5F2EB]"
    >
      {/* Ambient warm orange radiant floor glow */}
      <div className="absolute bottom-10 right-1/4 w-[650px] h-[320px] bg-orange-500/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE: Mock 2 Style Headline & Value Props */}
          <div className="lg:col-span-5 space-y-7">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="w-8 h-[2px] bg-orange-500 inline-block" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Your data. Our analysis.
              </span>
            </motion.div>

            {/* Master Headline from Mock 2 */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1C1A17] dark:text-white leading-[1.05]"
            >
              Ask. <br />
              <span className="text-amber-gradient">Analyze.</span> <br />
              Act.
            </motion.h1>

            {/* Subtitle from Mock 2 */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#5C5852] dark:text-[#A8A29E] leading-relaxed max-w-md"
            >
              Inside is the personal AI student data analyst that turns plain-English
              questions into dashboards, explanations, and decisions.
            </motion.p>

            {/* Dual CTAs from Mock 2 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <Link href="/app">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setContactModalOpen(true)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Contact us
              </Button>
            </motion.div>

            {/* 3 Value Propositions from Mock 2 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E3DED4] dark:border-white/10"
            >
              <div className="space-y-1.5">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <h4 className="text-[13.5px] sm:text-[14px] font-bold text-[#1C1A17] dark:text-white leading-snug">
                  Plain-English <br />
                  <span className="text-[#5C5852] dark:text-[#A8A29E] font-normal">questions</span>
                </h4>
              </div>

              <div className="space-y-1.5">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <h4 className="text-[13.5px] sm:text-[14px] font-bold text-[#1C1A17] dark:text-white leading-snug">
                  Dashboards <br />
                  <span className="text-[#5C5852] dark:text-[#A8A29E] font-normal">in seconds</span>
                </h4>
              </div>

              <div className="space-y-1.5">
                <Zap className="w-5 h-5 text-orange-500" />
                <h4 className="text-[13.5px] sm:text-[14px] font-bold text-[#1C1A17] dark:text-white leading-snug">
                  Clear insights. <br />
                  <span className="text-[#5C5852] dark:text-[#A8A29E] font-normal">Real decisions.</span>
                </h4>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Mock 2 Interactive Dashboard Perspective Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Main Mock 2 Card Container (Solid Paper White / Obsidian, Newsprint Border, Natural Shadow) */}
              <div className="relative rounded-3xl bg-white dark:bg-[#1E1C19] text-[#1C1A17] dark:text-white p-6 sm:p-8 border border-[#E3DED4] dark:border-white/10 shadow-xl">
                {/* Top Input Bar inside Card (from Mock 2) */}
                <div className="mb-6 p-2.5 sm:p-3 rounded-2xl bg-[#F5F2EB] dark:bg-[#151413] border border-[#E3DED4] dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 pl-2 sm:pl-3 flex-1 min-w-0">
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-[15px] sm:text-[16.5px] font-medium text-[#1C1A17] dark:text-white leading-snug break-words">
                      {current.question}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setActiveScenarioIdx((prev) => (prev === 0 ? 1 : 0))
                    }
                    className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 transition-transform hover:scale-105 active:scale-95"
                    title="Click to try next question"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Split Content: Left Chart + Right Key Insight (from Mock 2) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: School Attainment & Progress Chart */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14.5px] font-semibold text-[#5C5852] dark:text-[#A8A29E]">
                        {current.title}
                      </span>
                      <div className="flex items-center gap-1 text-[13.5px] text-[#1C1A17] dark:text-white font-medium bg-[#F5F2EB] dark:bg-[#151413] px-2.5 py-1 rounded-lg border border-[#E3DED4] dark:border-white/10">
                        <span>{current.period}</span>
                        <ChevronDown className="w-3 h-3 text-[#5C5852] dark:text-[#A8A29E]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#1C1A17] dark:text-white tracking-tight">
                          {current.amount}
                        </span>
                        <span className="text-[13px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-500/20">
                          {current.growth}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-[#5C5852] dark:text-[#A8A29E] mt-0.5">
                        {current.comparison}
                      </p>
                    </div>

                    {/* Bar Chart Representation with clean orange active bar */}
                    <div className="pt-8 relative">
                      {/* Bar columns */}
                      <div className="flex items-end justify-between gap-3 sm:gap-4 h-36 px-2">
                        {current.bars.map((bar) => (
                          <div
                            key={bar.label}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                          >
                            {/* Bar container with relative positioning for the floating tag */}
                            <div className="w-full relative flex items-end justify-center" style={{ height: "100%" }}>
                              {/* Floating tag if active */}
                              {bar.tag && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold bg-[#1C1A17] text-white dark:bg-white dark:text-[#1C1A17] px-2 py-0.5 rounded-md border border-[#E3DED4] dark:border-white/20 shadow-xs z-10">
                                  {bar.tag}
                                </div>
                              )}
                              <div
                                className={`w-full rounded-t-lg transition-all duration-300 ${
                                  bar.active
                                    ? "bg-gradient-to-t from-orange-500 to-amber-500 shadow-sm shadow-orange-500/30"
                                    : "bg-[#E3DED4] dark:bg-white/10 group-hover:bg-[#D6D0C4] dark:group-hover:bg-white/20"
                                }`}
                                style={{ height: bar.height }}
                              />
                            </div>
                            <span
                              className={`text-[13px] font-medium mt-2 ${
                                bar.active ? "text-orange-600 dark:text-orange-400 font-bold" : "text-[#5C5852] dark:text-[#A8A29E]"
                              }`}
                            >
                              {bar.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Insight Box & 3 Metrics (from Mock 2) */}
                  <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-orange-600 dark:text-orange-400 mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Key Insight</span>
                      </div>
                      <p className="text-[14.5px] sm:text-[15px] text-[#1C1A17] dark:text-white leading-relaxed">
                        {current.insight}
                      </p>
                    </div>

                    {/* 3 Metric rows with icons & chevrons from Mock 2 */}
                    <div className="space-y-2.5 pt-2 border-t border-orange-200/50 dark:border-orange-500/20">
                      {current.metrics.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-[14px] sm:text-[14.5px] py-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 text-[#5C5852] dark:text-[#A8A29E] group-hover:text-[#1C1A17] dark:group-hover:text-white">
                              <Icon className="w-4 h-4 text-orange-500" />
                              <span>{item.label}</span>
                            </div>
                            <span className="font-bold text-[#1C1A17] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 flex items-center gap-1">
                              {item.value} <span className="text-[12px] text-[#8C877E] dark:text-[#A8A29E]">&gt;</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll To Explore Indicator (from Mock 2) */}
        <div className="mt-16 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C877E] dark:text-[#A8A29E]">
            Scroll to explore
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-orange-500 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Contact Us Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setContactSubmitted(false);
        }}
        title="Contact the Inside Education Team"
      >
        {contactSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#1C1A17]">
              Message Received!
            </h4>
            <p className="text-[15px] text-[#5C5852] max-w-sm mx-auto">
              Thank you for reaching out. Our education partnerships team will contact you within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setContactSubmitted(true);
            }}
            className="space-y-4"
          >
            <p className="text-[15px] text-[#5C5852]">
              Have questions about integrating with your school data stack or custom district pilots? Send us a note.
            </p>
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1A17] mb-1">
                Your Email
              </label>
              <input
                required
                type="email"
                placeholder="educator@school.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-[15px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1A17] mb-1">
                How can we help your school?
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell us about your school, data tools, or what questions you'd like answered..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-[15px] resize-none"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </Modal>
    </section>
  );
}
