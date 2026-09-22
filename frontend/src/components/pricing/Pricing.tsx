"use client";

import React from "react";
import Link from "next/link";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SHARED_FEATURES = [
  "Complete 5-tab platform",
  "Unlimited AI cohort queries",
  "Full DSIB & ADEK engine",
  "1-click PDF dossiers",
  "Zero-retention security",
];

const CAMPUS_PLANS = [
  {
    tier: "Tier 1",
    name: "Leadership Core",
    price: "28,000",
    seats: "Up to 5 executive seats",
    button: "Select Core (5 Seats)",
    href: "/app",
    highlighted: false,
  },
  {
    tier: "Tier 2",
    name: "Standard Campus",
    price: "38,000",
    seats: "Up to 8 executive seats",
    button: "Request Campus Pilot",
    href: "#workflow-demo",
    highlighted: true,
  },
  {
    tier: "Tier 3",
    name: "All-Through / Group",
    price: "48,000",
    seats: "Up to 15 executive seats",
    button: "Select Group (15 Seats)",
    href: "/app",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-b border-[#E3DED4] bg-white py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-4xl rounded-full bg-orange-100/45 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.16em] text-orange-600">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Annual campus licence
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-[#1C1A17] sm:text-5xl lg:text-6xl">
            Predictable pricing.{" "}
            <span className="text-amber-gradient">No per-query surprises.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[18px] leading-relaxed text-[#5C5852] sm:text-[20px]">
            Every tier includes the complete platform. Pricing scales only with executive seat capacity.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {CAMPUS_PLANS.map((plan) => (
            <article
              key={plan.name}
              className={
                "relative flex flex-col rounded-3xl bg-white transition-all duration-300 " +
                (plan.highlighted
                  ? "border-2 border-orange-500 shadow-lg lg:-translate-y-2"
                  : "border border-[#E3DED4] shadow-sm hover:-translate-y-1 hover:border-orange-300 hover:shadow-md")
              }
            >
              {plan.highlighted && (
                <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Most popular for UAE SLTs
                </div>
              )}

              <div
                className={
                  "rounded-t-3xl border-b border-[#E3DED4] p-6 sm:p-7 " +
                  (plan.highlighted ? "bg-orange-50/60" : "bg-[#F9F6F0]")
                }
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-orange-600">
                  {plan.tier}
                </p>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1C1A17]">
                  {plan.name}
                </h3>
                <div className="mt-5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[18px] font-extrabold text-[#1C1A17]">AED</span>
                  <span className="text-4xl font-extrabold tracking-tight text-[#1C1A17] sm:text-5xl">
                    {plan.price}
                  </span>
                  <span className="text-[15px] font-semibold text-[#5C5852]">/ year</span>
                </div>
                <p className="mt-2 text-[14px] font-medium text-[#5C5852]">
                  Annual campus licence
                </p>
              </div>

              <div
                className={
                  "flex-1 space-y-3.5 p-6 sm:p-7 " +
                  (plan.highlighted ? "bg-orange-50/20" : "")
                }
              >
                {[plan.seats, ...SHARED_FEATURES].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-[15px] font-medium leading-snug text-[#1C1A17] sm:text-[16px]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={
                  "mt-auto border-t border-[#E3DED4] p-6 pt-5 sm:p-7 sm:pt-5 " +
                  (plan.highlighted ? "bg-orange-50/50" : "")
                }
              >
                <Button
                  asChild
                  className="w-full"
                  size="lg"
                  variant={plan.highlighted ? "primary" : "outline"}
                >
                  <Link href={plan.href}>{plan.button}</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-center gap-2 rounded-2xl border border-[#E3DED4] bg-[#F9F6F0] px-5 py-4 text-center sm:flex-row sm:gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <p className="text-[14px] font-medium leading-relaxed text-[#5C5852]">
            Identical capabilities across every tier, with UAE-ready DSIB/ADEK workflows and zero-retention data handling included.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
