"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  KeyRound,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function Security() {
  const securityPillars = [
    {
      icon: EyeOff,
      title: "Zero LLM Data Retention",
      desc: "Your raw rows never train model weights. Queries execute via transient ephemeral compute with zero permanent persistence.",
      badge: "Zero-Retention",
    },
    {
      icon: Lock,
      title: "Strict Read-Only Access",
      desc: "Inside never requests write, insert, drop, or schema-altering privileges. Your database records remain immutable.",
      badge: "Read-Only",
    },
    {
      icon: FileCheck,
      title: "SOC2 Type II & HIPAA Ready",
      desc: "Independently audited controls, continuous penetration testing, and enterprise-grade compliance governance.",
      badge: "Audited",
    },
    {
      icon: KeyRound,
      title: "Row & Column-Level Security",
      desc: "Inherits your existing database permission policies. Sales reps only see assigned accounts; executives see full rollups.",
      badge: "RBAC Enforced",
    },
    {
      icon: Server,
      title: "VPC & PrivateLink Deployment",
      desc: "Run Inside inside your own AWS, GCP, or Azure Virtual Private Cloud. Zero traffic traverses the public internet.",
      badge: "Isolated Cloud",
    },
    {
      icon: ShieldCheck,
      title: "End-to-End AES-256 Encryption",
      desc: "Military-grade encryption for tokens and transient schema metadata in transit (TLS 1.3) and at rest (AES-256).",
      badge: "Encrypted",
    },
  ];

  return (
    <section id="security" className="py-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="brand" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Enterprise Security First
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1C1A17]">
            Built for the most privacy-conscious data leaders.
          </h2>
          <p className="text-base sm:text-lg text-[#5C5852]">
            We know your business data is your most guarded asset. Inside is architected
            from day one with impenetrable enterprise isolation.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-7 rounded-3xl bg-white border border-[#E3DED4] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[12px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-[19px] font-bold text-[#1C1A17] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-[15px] text-[#5C5852] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E3DED4] flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Enforced by Default</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
