"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  Table,
  Award,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface StoryStep {
  id: number;
  number: string;
  title: string;
  quote: string;   // Clean quote text displayed ONLY inside the image
  summary: string;
  image: string;
  alt: string;
  icon: React.ElementType;
}

export function ScrollStory() {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const steps: StoryStep[] = [
    {
      id: 1,
      number: "01",
      title: "Overwhelmed",
      quote: "Too much data. Too little time.",
      summary: "Drowning in endless binders, assessment notes, and manual reports.",
      image: "/Fig1.png",
      alt: "Teacher overwhelmed with student paperwork and spreadsheets",
      icon: Clock,
    },
    {
      id: 2,
      number: "02",
      title: "Discovery",
      quote: "There has to be an easier way.",
      summary: "Discovering Inside, a personal AI analyst that simplifies everything.",
      image: "/Fig2.png",
      alt: "Colleagues discovering Inside on a laptop together",
      icon: Sparkles,
    },
    {
      id: 3,
      number: "03",
      title: "Connect & Ask",
      quote: "Bring your data. Ask naturally.",
      summary: "Connecting data sources in one click and asking plain-English questions.",
      image: "/Fig3.png",
      alt: "Teacher typing a natural language question into Inside with data sources connected",
      icon: Table,
    },
    {
      id: 4,
      number: "04",
      title: "Act with confidence",
      quote: "From insight to impact.",
      summary: "Presenting clear, verified progress reports to checking officers with pride.",
      image: "/Fig4.png",
      alt: "Teacher presenting the Inside report confidently to checking officers",
      icon: Award,
    },
  ];

  // Auto-play timer (cycles smoothly every 5.5 seconds, restarts on manual tap)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeStep, steps.length]);

  const current = steps[activeStep];

  return (
    <section
      id="story"
      className="pt-16 sm:pt-20 pb-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Subheading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] dark:text-white">
            From data overload <span className="text-amber-gradient">to clarity.</span>
          </h2>
          <p className="text-[18px] sm:text-[20px] text-[#5C5852] dark:text-[#A8A29E] leading-relaxed">
            Inside helps you move from scattered information and endless spreadsheets to
            clear answers, useful insights, and confident action.
          </p>
        </div>

        {/* SIDE-BY-SIDE: Vertical Rotating Task Step Bar Beside Image Rotation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: Vertical Interactive Step Bar */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 relative">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setActiveStep(idx);
                  }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative border overflow-hidden ${
                    isActive
                      ? "bg-white dark:bg-[#1E1C19] border-orange-500 shadow-sm scale-[1.01]"
                      : "bg-white/80 dark:bg-[#1E1C19]/80 border-[#E3DED4] dark:border-white/10 hover:border-orange-500/40 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-[15px] font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs"
                          : "bg-[#F5F2EB] dark:bg-[#151413] border border-[#E3DED4] dark:border-white/10 text-[#5C5852] dark:text-[#A8A29E]"
                      }`}
                    >
                      {step.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[19px] font-bold text-[#1C1A17] dark:text-white truncate">
                          {step.title}
                        </h3>
                        {isActive && (
                          <span className="text-[15px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 shrink-0">
                            Active <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      {/* Informative summary */}
                      <p className="text-[16px] text-[#5C5852] dark:text-[#A8A29E] mt-1 leading-relaxed">
                        {step.summary}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Cinematic Image Canvas */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#E3DED4] dark:border-white/10 bg-white dark:bg-[#1E1C19] shadow-md aspect-[4/3] sm:aspect-[16/11]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={current.image}
                    alt={current.alt}
                    fill
                    className="object-cover object-center"
                    priority
                  />

                  {/* Soft bottom vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17]/80 via-[#1C1A17]/20 to-transparent pointer-events-none" />

                  {/* Bottom Image Caption Pill */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between p-4 rounded-2xl bg-[#1C1A17]/85 backdrop-blur-md border border-[#E3DED4]/20 text-[#F5F2EB]">
                    <div className="flex items-center gap-3 text-[17px] sm:text-[18px] font-medium tracking-wide">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="italic">&ldquo;{current.quote}&rdquo;</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
