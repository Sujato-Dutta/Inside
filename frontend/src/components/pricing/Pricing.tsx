"use client";

import React from "react";
import Image from "next/image";
import { PricingSection, Plan } from "@/components/ui/pricing";
import { useTheme } from "@/context/ThemeContext";

const INSIDE_PLANS: Plan[] = [
  {
    name: "Starter",
    info: "For individual teachers and solo educators",
    price: {
      monthly: 14,
      yearly: 11,
    },
    features: [
      {
        text: "Connect up to 5 data files (Excel, CSV, Sheets)",
        tooltip: "Upload or live-link Google Sheets, Excel spreadsheets, and CSV exports",
      },
      {
        text: "300 natural language queries / month",
        tooltip: "Ask plain-English questions about student attendance, grades, and trends",
      },
      {
        text: "Instant visual chart generation",
        tooltip: "Automatic bar graphs, pie breakdowns, and attendance metrics",
      },
      {
        text: "One-click PDF progress summaries",
        tooltip: "Export publication-ready reports for students, parents, and colleagues",
      },
      {
        text: "Standard analysis response time",
        tooltip: "Insights and charts generated in under 3 seconds",
      },
      {
        text: "Email educator support",
        tooltip: "Dedicated email assistance within 24 hours",
      },
    ],
    btn: {
      text: "Start Free 14-Day Trial",
      href: "/app",
    },
    highlighted: false,
  },
  {
    name: "Pro",
    info: "For department chairs, principals, and active school teams",
    price: {
      monthly: 29,
      yearly: 24,
    },
    features: [
      {
        text: "Unlimited data sources (Warehouses, SQL, Sheets, CSV)",
        tooltip: "Connect Postgres, Snowflake, Google Sheets, or school SIS databases",
      },
      {
        text: "Unlimited natural language analysis queries",
        tooltip: "No monthly query caps or token limitations",
      },
      {
        text: "Advanced student cohort anomaly detection",
        tooltip: "Automatically identify at-risk students and sudden attendance drops",
      },
      {
        text: "Inspection-ready official progress dossiers",
        tooltip: "Generate polished audit packages for checking officers and leadership",
      },
      {
        text: "Multi-teacher shared team workspace",
        tooltip: "Collaborate with colleagues on shared datasets and benchmarks",
      },
      {
        text: "Priority AI processing engine",
        tooltip: "Instant sub-second analysis engine",
      },
      {
        text: "24/7 dedicated educator chat support",
        tooltip: "Direct access to our senior education support team",
      },
    ],
    btn: {
      text: "Get Started with Pro",
      href: "/app",
    },
    highlighted: true,
  },
  {
    name: "Institution",
    info: "For whole schools, academy trusts, and university departments",
    price: {
      monthly: 79,
      yearly: 65,
    },
    features: [
      {
        text: "Full school campus license & unlimited faculty seats",
        tooltip: "Deploy Inside across your entire teaching and administrative staff",
      },
      {
        text: "Direct SIS & database integration",
        tooltip: "Connect PowerSchool, Infinite Campus, or custom institutional databases",
      },
      {
        text: "Strict FERPA & student data privacy compliance",
        tooltip: "Zero-data training, SOC-2 verified, and encrypted at rest",
      },
      {
        text: "Custom institutional dashboard models",
        tooltip: "Tailored semantic metrics and grading scales built for your school",
      },
      {
        text: "Dedicated staff onboarding & faculty training",
        tooltip: "Personalized live workshops for your teaching faculty",
      },
      {
        text: "Custom SLA & 99.9% uptime guarantee",
        tooltip: "Enterprise-grade reliability and dedicated account manager",
      },
    ],
    btn: {
      text: "Contact School Team",
      href: "#workflow-demo",
    },
    highlighted: false,
  },
];

export function Pricing() {
  const { theme } = useTheme();

  return (
    <section
      id="pricing"
      className="py-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingSection
          plans={INSIDE_PLANS}
          heading={
            <>
              Plans that scale with your{" "}
              <span className="text-amber-gradient">classrooms and teams.</span>
            </>
          }
          description="Start free for 14 days. No credit card required. Cancel or upgrade anytime."
        />
      </div>
    </section>
  );
}

export default Pricing;
