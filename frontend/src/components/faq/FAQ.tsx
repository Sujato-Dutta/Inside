"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FAQS } from "@/data/demo-data";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <Badge variant="brand" icon={<HelpCircle className="w-3.5 h-3.5" />}>
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1C1A17]">
            Everything you need to know.
          </h2>
          <p className="text-base sm:text-lg text-[#5C5852]">
            Have a question not answered here? Reach out directly to our engineering team.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-white border border-[#E3DED4] shadow-xs overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-[17px] font-bold text-[#1C1A17]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-[#F5F2EB] text-[#5C5852] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orange-600 bg-orange-50" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-[15px] text-[#5C5852] leading-relaxed border-t border-[#E3DED4]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
