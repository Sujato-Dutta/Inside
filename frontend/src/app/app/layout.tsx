"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionDataProvider, useSessionData } from "@/context/SessionDataContext";
import { FloatingAssistant } from "@/components/assistant/FloatingAssistant";
import { StudentDetailsModal } from "@/components/modals/StudentDetailsModal";
import {
  Home,
  MessageSquare,
  ShieldCheck,
  FileText,
  Database,
  Clock,
  User,
  LogOut,
} from "lucide-react";

function AppNavbar() {
  const pathname = usePathname();
  const { sessionMinutesRemaining, activeFiles, students, sessionDeleted } = useSessionData();

  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "Ask Inside", href: "/app/ask", icon: MessageSquare },
    { label: "Inspections", href: "/app/inspections", icon: ShieldCheck },
    { label: "Reports", href: "/app/reports", icon: FileText },
    { label: "Data Hub", href: "/app/data", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3DED4] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Inside" fill className="object-cover" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[#1C1A17] leading-none">
                Inside
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-orange-600 mt-0.5">
                SEE THROUGH THE NOISE
              </span>
            </div>
          </Link>

          {/* Navigation Links — 5 Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-orange-50/70 p-1 rounded-full border border-orange-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                    isActive
                      ? "bg-white text-orange-600 shadow-xs font-bold border border-orange-200"
                      : "text-[#5C5852] hover:text-[#1C1A17] hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-600" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Session Pill, Profile */}
        <div className="flex items-center gap-3">
          {/* Privacy & Session Countdown Pill */}
          {!sessionDeleted && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Retention Active</span>
              <span className="text-[#8C877E]">•</span>
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3" />
                {sessionMinutesRemaining}m left
              </span>
            </div>
          )}

          {/* Instructor Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#E3DED4]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-[13px] shadow-xs">
              IN
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <div className="text-[13px] font-bold text-[#1C1A17] flex items-center gap-1">
                <span>Instructor</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              </div>
              <span className="text-[11px] text-[#5C5852]">
                Oakridge Academy
              </span>
            </div>
          </div>

          {/* Exit / Return to Landing Page */}
          <Link
            href="/"
            className="p-2 rounded-xl text-[#8C877E] hover:text-[#1C1A17] hover:bg-orange-50 transition-colors"
            title="Exit Demo / Return to landing page"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="hidden border-t border-[#E3DED4] bg-[#F9F6F0] md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[10px] font-bold uppercase tracking-wider text-[#5C5852] sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Database className="h-3.5 w-3.5" />
              Volatile RAM: {students.length} records
            </span>
            <span>{activeFiles.length} source file{activeFiles.length === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">
              DSIB / KHDA framework
            </span>
            <span>No cloud row storage</span>
          </div>
        </div>
      </div>

      {/* Mobile Subnav Bar */}
      <div className="flex md:hidden border-t border-[#E3DED4] bg-white px-2 py-1.5 overflow-x-auto justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-semibold ${
                isActive ? "text-orange-600 font-bold" : "text-[#5C5852]"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionDataProvider>
      <div className="min-h-screen bg-[#F5F2EB] text-[#1C1A17] transition-colors flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        <AppNavbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
        <FloatingAssistant />
        <StudentDetailsModal />
      </div>
    </SessionDataProvider>
  );
}
