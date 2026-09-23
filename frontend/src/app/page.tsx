"use client";

import React from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Hero } from "@/components/hero/Hero";
import { ProductDemo } from "@/components/demo/ProductDemo";
import { ScrollStory } from "@/components/story/ScrollStory";
import { Features } from "@/components/features/Features";
import { HowItWorks } from "@/components/how-it-works/HowItWorks";
import { TeacherTestimonials } from "@/components/testimonials/TeacherTestimonials";
import { ExecutiveWorkspaces } from "@/components/audience/ExecutiveWorkspaces";
import { Pricing } from "@/components/pricing/Pricing";
import { CTASection } from "@/components/cta/CTASection";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen relative selection:bg-orange-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section (Mock 2 Layout with Ask. Analyze. Act. and Interactive Dashboard Card) */}
      <Hero />

      {/* Section 2: Mock 1 Style (Interact with data in your own language) */}
      <ProductDemo />


      {/* 4-Step Story: From data overload to clarity (Fig 1 - 4) */}
      <ScrollStory />

      {/* Core Platform Capabilities */}
      <Features />

      {/* 4-Step Simple Process */}
      <HowItWorks />

      {/* Educator & Teacher Testimonials Marquee */}
      <TeacherTestimonials />

      {/* Role-specific workspaces for the four accountable leaders */}
      <ExecutiveWorkspaces />

      {/* Annual Campus Licensing */}
      <Pricing />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
