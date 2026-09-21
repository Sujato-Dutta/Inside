"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function CTASection() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 border border-[#E3DED4] shadow-sm bg-white text-[#1C1A17] transition-colors duration-300">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] leading-tight">
              Ready to turn student data into your{" "}
              <span className="text-amber-gradient">biggest superpower?</span>
            </h2>

            <p className="text-[18px] sm:text-[20px] text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              Connect your student data, ask plain-English questions, and receive
              inspection-ready reports, trends, and charts without manual spreadsheets.
            </p>

            {/* Email Signup Form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-orange-50/50 border border-[#E3DED4] max-w-md mx-auto text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-[#1C1A17]">
                  Welcome to Inside!
                </h4>
                <p className="text-[15px] text-[#5C5852]">
                  Your educator demo session is ready for{" "}
                  <span className="font-mono text-orange-600 font-semibold">{email}</span>.
                </p>
                <div className="pt-3">
                  <Link href="/app">
                    <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                      Enter App as Instructor
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your school email..."
                  className="w-full sm:w-72 px-4 py-3.5 rounded-xl bg-[#F5F2EB] border border-[#E3DED4] text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-[16px]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shrink-0"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started Free
                </Button>
              </form>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[15px] sm:text-[15.5px] text-[#5C5852] font-semibold">
              <span>✓ 14-day educator trial</span>
              <span>•</span>
              <span>✓ Zero credit card required</span>
              <span>•</span>
              <span>✓ FERPA student privacy compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
