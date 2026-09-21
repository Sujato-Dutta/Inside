"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { ArrowRight, Menu, X, CheckCircle2 } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Live Demo", href: "#workflow-demo" },
    { label: "Story", href: "#story" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Educators", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#F5F2EB]/95 dark:bg-[#151413]/95 backdrop-blur-md border-b border-[#E3DED4] dark:border-white/10 shadow-xs"
            : "bg-[#F5F2EB]/70 dark:bg-[#151413]/70 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-[#E3DED4] dark:border-white/15 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Inside Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#1C1A17] dark:text-white">
                Inside
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600">
                SEE THROUGH THE NOISE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1C19] border border-[#E3DED4] dark:border-white/10 shadow-xs text-[14.5px] sm:text-[15px] font-medium text-[#5C5852] dark:text-[#A8A29E]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full hover:text-orange-600 hover:bg-orange-50/80 dark:hover:bg-orange-500/10 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Book a Demo */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDemoModalOpen(true)}
            >
              Book a Demo
            </Button>

            {/* Sign Up */}
            <Link href="/app">
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1C1A17]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E3DED4] dark:border-white/10 bg-white dark:bg-[#1E1C19] px-6 py-6 space-y-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#5C5852] dark:text-[#A8A29E] hover:text-orange-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-[#E3DED4] dark:border-white/10 flex flex-col gap-3">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
              >
                Book a Demo
              </Button>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Book Demo Modal for Schools & Educators */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => {
          setDemoModalOpen(false);
          setDemoSubmitted(false);
        }}
        title="Experience Inside for Your School"
      >
        {demoSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              Demo Walkthrough Scheduled!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              A member of our Education Data team will reach out with a personalized walkthrough configured for your school's student data.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDemoSubmitted(true);
            }}
            className="space-y-4"
          >
            <p className="text-[15px] text-[#5C5852]">
              See how Inside turns complex student spreadsheets into plain-English answers, visual trend charts, and inspection-ready progress dossiers.
            </p>
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1A17] mb-1">
                School or Institution Email
              </label>
              <input
                required
                type="email"
                placeholder="principal@school.edu or teacher@district.org"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-[15px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1A17] mb-1">
                School or Trust Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. St. Jude's Academy or Lincoln School District"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-[15px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1C1A17] mb-1">
                Primary Student Data System
              </label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-[#E3DED4] bg-white text-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-[15px]">
                <option>PowerSchool / SIS + CSVs</option>
                <option>Google Sheets + Excel Gradebooks</option>
                <option>Infinite Campus + State Assessments</option>
                <option>Arbor / SIMS / ScholarPack</option>
                <option>Canvas / Blackboard LMS</option>
                <option>Other School Database / CSV</option>
              </select>
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Schedule School Walkthrough
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
