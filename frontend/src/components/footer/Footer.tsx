"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  const [newsEmail, setNewsEmail] = useState("");
  const [newsSubmitted, setNewsSubmitted] = useState(false);

  // Platform capabilities personalized to Inside's school data analysis
  const capabilityLinks = [
    { label: "Natural Language Queries", href: "#workflow-demo" },
    { label: "Attendance Dip Alerts", href: "#features" },
    { label: "Attainment Benchmark Charts", href: "#features" },
    { label: "1-Page Executive Dossiers", href: "#features" },
    { label: "Excel, CSV & SIS Ingestion", href: "#how-it-works" },
  ];

  // Tailored audience and workflow links
  const educatorLinks = [
    { label: "Classroom Teachers", href: "#story" },
    { label: "Department Heads & Principals", href: "#testimonials" },
    { label: "Checking Officers & Audit Prep", href: "#story" },
    { label: "Academic Progress Coordinators", href: "#features" },
    { label: "School & Faculty Pricing", href: "#pricing" },
  ];

  // Trust, privacy, and compliance links
  const trustLinks = [
    { label: "FERPA Student Privacy", href: "#pricing" },
    { label: "Zero-Data Training Guarantee", href: "#pricing" },
    { label: "SOC-2 Type II Certified", href: "#pricing" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="border-t border-[#E3DED4] bg-[#F5F2EB] pt-20 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-[#E3DED4]">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Inside Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-[#1C1A17]">
                Inside
              </span>
            </Link>

            <p className="text-[15px] sm:text-[15.5px] text-[#5C5852] max-w-md leading-relaxed">
              Inside is the personal AI student data analyst for educators, teachers, and school leaders.
              Turn complex student spreadsheets into plain-English answers, visual trend charts, and inspection-ready progress dossiers.
            </p>

            {/* Operational & FERPA Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[13px] font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[13px] font-semibold text-orange-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FERPA Compliant</span>
              </div>
            </div>

            {/* Newsletter: The Data-Smart Educator */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="text-[14px] font-bold text-[#1C1A17] uppercase tracking-wider">
                The Data-Smart Educator
              </div>
              <p className="text-[14px] text-[#5C5852]">
                Practical weekly insights on turning student data into classroom impact.
              </p>
              {newsSubmitted ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[14px] text-emerald-700 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are subscribed to educator updates!</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsEmail) setNewsSubmitted(true);
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="email"
                    required
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    placeholder="Enter your school email..."
                    className="flex-1 px-3.5 py-2 text-[14.5px] rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-[14px] font-bold rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 transition-all shadow-xs shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Capabilities Column */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#1C1A17]">
              Capabilities
            </h4>
            <ul className="space-y-2.5">
              {capabilityLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[14px] sm:text-[14.5px] text-[#5C5852] hover:text-orange-600 transition-colors font-normal inline-block"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Educators Column */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#1C1A17]">
              For Educators
            </h4>
            <ul className="space-y-2.5">
              {educatorLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[14px] sm:text-[14.5px] text-[#5C5852] hover:text-orange-600 transition-colors font-normal inline-block"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Compliance Column */}
          <div className="space-y-3.5">
            <h4 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#1C1A17]">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5">
              {trustLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[14px] sm:text-[14.5px] text-[#5C5852] hover:text-orange-600 transition-colors font-normal inline-block"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright, compliance note & social links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] sm:text-[14px] text-[#5C5852]">
          <div>
            © {new Date().getFullYear()} Inside Technologies, Inc. Built for educators and school leaders.
          </div>
          <div className="flex items-center gap-4 text-[#8C877E]">
            <a
              href="#"
              className="hover:text-orange-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-orange-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-orange-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

