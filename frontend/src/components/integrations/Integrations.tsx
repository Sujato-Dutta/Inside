"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Server,
  Cloud,
  Building2,
  Users,
  Table2,
  CreditCard,
  Cpu,
  Zap,
  HardDrive,
  FileText,
  MessageSquare,
  GitFork,
  BarChart3,
  Layers,
  FileSpreadsheet,
  Search,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { INTEGRATIONS_LIST } from "@/data/demo-data";

export function Integrations() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Warehouse",
    "CRM",
    "Spreadsheets",
    "Payments",
    "Productivity",
    "Analytics",
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Database":
        return Database;
      case "Server":
        return Server;
      case "Cloud":
        return Cloud;
      case "Building2":
        return Building2;
      case "Users":
        return Users;
      case "Table2":
        return Table2;
      case "CreditCard":
        return CreditCard;
      case "Cpu":
        return Cpu;
      case "Zap":
        return Zap;
      case "HardDrive":
        return HardDrive;
      case "FileText":
        return FileText;
      case "MessageSquare":
        return MessageSquare;
      case "GitFork":
        return GitFork;
      case "BarChart3":
        return BarChart3;
      case "Layers":
        return Layers;
      default:
        return FileSpreadsheet;
    }
  };

  const filteredIntegrations = INTEGRATIONS_LIST.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="integrations" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="brand">Ecosystem & Connectivity</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Connects to your entire modern data stack.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Native integrations with leading cloud warehouses, transactional databases,
            SaaS tools, and spreadsheets.
          </p>

          {/* Search & Category Filter Controls */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connectors (e.g. Snowflake, Stripe)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#121520] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-orange-500/10 hover:text-orange-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredIntegrations.map((item, idx) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                    {item.status}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Connector Notice */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <span>Don't see your specific warehouse or proprietary schema?</span>
            <a
              href="#pricing"
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Request Custom Connector <Plus className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
