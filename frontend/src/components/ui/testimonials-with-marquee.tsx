"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className={cn(
        "py-20 sm:py-28 relative overflow-hidden bg-[#F5F2EB] border-b border-[#E3DED4] transition-colors duration-300",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center sm:gap-14 px-4 sm:px-6 lg:px-8">
        {/* Header without small badges */}
        <div className="flex flex-col items-center gap-4 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] leading-tight">
            {title}
          </h2>
          <p className="text-[18px] sm:text-[20px] text-[#5C5852] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Marquee Carousel (Speed matched to university logos) */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4">
          <div className="flex overflow-hidden p-2 w-full">
            <div className="animate-marquee-testimonials flex items-stretch gap-6">
              {[
                ...testimonials,
                ...testimonials,
                ...testimonials,
                ...testimonials,
              ].map((testimonial, i) => (
                <TestimonialCard
                  key={`${testimonial.author.name}-${i}`}
                  {...testimonial}
                />
              ))}
            </div>
          </div>

          {/* Left and right fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 sm:w-44 bg-gradient-to-r from-[#F5F2EB] to-transparent sm:block z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 sm:w-44 bg-gradient-to-l from-[#F5F2EB] to-transparent sm:block z-10" />
        </div>
      </div>
    </section>
  );
}
