"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  LineChart,
  Boxes,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

export function UseCases() {
  const [activeTab, setActiveTab] = useState(0);

  const personas = [
    {
      id: "founders",
      role: "Founders & C-Suite",
      icon: Briefcase,
      headline: "Instant board metrics without bugging your data engineer.",
      description:
        "Know your real runway, burn multiple, and gross margin by customer cohort. Walk into investor meetings with instant, verifiable answers.",
      sampleQuestion:
        "What is our projected cash runway if net new ARR slows by 15% next quarter?",
      sampleMetrics: [
        { label: "Gross Margin", value: "81.4%", change: "+2.1%" },
        { label: "Burn Multiple", value: "1.1x", change: "Top quartile" },
        { label: "Cash Runway", value: "24.5 mo", change: "Safe threshold" },
      ],
      insights: [
        "Identifies unit economic leakage before it impacts cash reserves",
        "Generates automated executive digest ready for board reporting",
        "Zero dependency on bottlenecked data analysts",
      ],
    },
    {
      id: "growth",
      role: "Growth & Marketing",
      icon: TrendingUp,
      headline: "Real ROAS and cross-channel attribution that makes sense.",
      description:
        "Stitch paid ads, web analytics, and payment events together to reveal true blended CAC and payback period by acquisition channel.",
      sampleQuestion:
        "Which acquisition channels generate customer cohorts with highest 6-month LTV?",
      sampleMetrics: [
        { label: "Blended CAC", value: "$1,420", change: "-8.4%" },
        { label: "Payback Velocity", value: "5.8 mo", change: "-1.2 mo" },
        { label: "LTV / CAC", value: "4.8x", change: "+0.6x" },
      ],
      insights: [
        "Uncovers hidden drop-offs between ad clicks and Stripe activations",
        "Forecasts budget reallocations for highest marginal ROAS",
        "Discovers organic referral loops in product usage data",
      ],
    },
    {
      id: "revops",
      role: "Finance & RevOps",
      icon: LineChart,
      headline: "ARR waterfalls and expansion tracking with forensic accuracy.",
      description:
        "Deconstruct new logo ARR, expansion, contraction, and churn. Never spend another weekend manually reconciling Salesforce deals against Stripe invoices.",
      sampleQuestion:
        "Reconcile Q3 closed-won Salesforce opportunities against Stripe invoice collections.",
      sampleMetrics: [
        { label: "Net Revenue Retention", value: "118%", change: "+4% QoQ" },
        { label: "Expansion ARR", value: "$4.1M", change: "33% of total" },
        { label: "Sales Cycle Length", value: "28 days", change: "-4 days" },
      ],
      insights: [
        "Flags invoice discrepancies and unbilled ARR immediately",
        "Automates weekly revenue forecasting for revenue committee",
        "Pinpoints enterprise renewal risks 90 days before expiration",
      ],
    },
    {
      id: "product",
      role: "Product Managers",
      icon: Boxes,
      headline: "Understand feature stickiness and cohort engagement loops.",
      description:
        "Identify what high-retaining power users do during their first 7 days. Understand exactly which product behaviors drive long-term contracts.",
      sampleQuestion:
        "What common product milestones distinguish users who upgrade to Enterprise within 30 days?",
      sampleMetrics: [
        { label: "Activation Rate", value: "64.2%", change: "+7.8%" },
        { label: "7-Day Retention", value: "52.0%", change: "+3.5%" },
        { label: "Feature Adoption", value: "88%", change: "Target surpassed" },
      ],
      insights: [
        "Correlates specific workflow interactions with expansion velocity",
        "Replaces complicated Amplitude funnel setups with natural questions",
        "Spots newly introduced UX regressions immediately upon release",
      ],
    },
  ];

  const current = personas[activeTab];

  return (
    <section
      id="use-cases"
      className="py-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="brand">Tailored for High-Impact Teams</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1C1A17]">
            Superpowers for every department.
          </h2>
          <p className="text-base sm:text-lg text-[#5C5852]">
            Whether you lead finance, scale growth, or guide product strategy, Inside
            delivers deep clarity tailored to your goals.
          </p>

          {/* Persona Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {personas.map((p, idx) => {
              const TabIcon = p.icon;
              const isSelected = activeTab === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 text-[13px] sm:text-[15px] font-semibold px-4 py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 scale-[1.02]"
                      : "bg-white text-[#5C5852] border border-[#E3DED4] hover:border-orange-500/40 hover:text-[#1C1A17]"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {p.role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Spotlight Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-[#E3DED4] p-6 sm:p-10 bg-white shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-[13px] font-bold uppercase tracking-wider text-orange-600">
                    {current.role}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] mt-1">
                    {current.headline}
                  </h3>
                  <p className="text-base text-[#5C5852] mt-3 leading-relaxed">
                    {current.description}
                  </p>
                </div>

                {/* Natural Question Example */}
                <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200/60">
                  <div className="text-[12px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                    Example Conversational Inquiry
                  </div>
                  <p className="text-[15px] font-mono text-[#1C1A17] font-medium">
                    &ldquo;{current.sampleQuestion}&rdquo;
                  </p>
                </div>

                {/* Key Insights Checklist */}
                <div className="space-y-2.5">
                  {current.insights.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-[15px] text-[#1C1A17] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right KPI Preview */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="text-[13px] font-bold uppercase tracking-wider text-[#5C5852] px-1">
                  Synthesized Decision Benchmarks
                </div>
                {current.sampleMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-4 rounded-2xl border border-[#E3DED4] bg-orange-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[13px] text-[#5C5852]">
                        {metric.label}
                      </div>
                      <div className="text-2xl font-extrabold text-[#1C1A17] mt-0.5">
                        {metric.value}
                      </div>
                    </div>
                    <span className="text-[13px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {metric.change}
                    </span>
                  </div>
                ))}

                <Button
                  variant="primary"
                  size="md"
                  className="mt-2 w-full"
                  onClick={() => {
                    const el = document.getElementById("pricing");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore for {current.role.split(" ")[0]}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
