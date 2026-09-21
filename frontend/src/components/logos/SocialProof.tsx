"use client";

import React from "react";
import { motion } from "framer-motion";

export function SocialProof() {
  const logos = [
    { name: "Spotify", symbol: "🟢 Spotify" },
    { name: "Notion", symbol: "📓 Notion" },
    { name: "Stripe", symbol: "💳 Stripe" },
    { name: "Shopify", symbol: "🛍️ Shopify" },
    { name: "Figma", symbol: "🎨 Figma" },
    { name: "Adobe", symbol: "⚡ Adobe" },
  ];

  const stats = [
    { value: "10M+", label: "Warehouse queries answered" },
    { value: "< 800ms", label: "Median semantic calculation time" },
    { value: "99.94%", label: "Zero-hallucination accuracy rate" },
    { value: "60s", label: "Average time to first insight" },
  ];

  return (
    <section className="py-16 relative border-b border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-[#080A0F]/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
          TRUSTED BY MODERN DATA & GROWTH TEAMS WORLDWIDE
        </p>

        {/* Company Logos Row */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 dark:opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 font-bold text-base sm:text-lg text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <span>{logo.symbol}</span>
            </div>
          ))}
        </div>

        {/* Trust Stats Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-10 border-t border-slate-200/60 dark:border-white/5">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
