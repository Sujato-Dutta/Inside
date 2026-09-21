"use client";

import React from "react";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const teacherTestimonials = [
  {
    author: {
      name: "Sarah Jenkins",
      handle: "@sjenkins_math",
      role: "High School Math Teacher",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop&crop=face",
    },
    text: "Inside transformed my weekly attendance and grade tracking. Instead of spending Sundays wrestling with spreadsheets, I ask one question and get ready-to-present student progress charts in seconds.",
  },
  {
    author: {
      name: "Marcus Chen",
      handle: "@mchen_stem",
      role: "Science Department Chair",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "Preparing for checking officers used to take our entire faculty two full weeks. With Inside, we pulled attendance correlation and cohort performance reports in under 5 minutes with complete confidence.",
  },
  {
    author: {
      name: "Elena Rodriguez",
      handle: "@elena_k12",
      role: "Middle School Principal",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    },
    text: "Our teachers are not data scientists, but they do not need to be. Inside lets anyone ask plain-English questions about student assessments and see exactly which students need immediate intervention.",
  },
  {
    author: {
      name: "David Miller",
      handle: "@dmiller_ed",
      role: "Academic Progress Coordinator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Connecting our school's student attendance files to Inside took literally one click. The instant visual breakdowns and insights have fundamentally elevated our parent-teacher conferences.",
  },
  {
    author: {
      name: "Priya Patel",
      handle: "@priya_history",
      role: "AP History Educator",
      avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&h=150&fit=crop&crop=face",
    },
    text: "I can finally spot student attendance drops before they become failing grades. Inside delivers executive-level clarity without me writing a single formula or complex search query.",
  },
];

export function TeacherTestimonials() {
  return (
    <TestimonialsSection
      title={
        <>
          Loved by educators{" "}
          <span className="text-amber-gradient">and teachers worldwide.</span>
        </>
      }
      description="Join thousands of teachers, principals, and academic leaders who turn student data into clear answers with Inside."
      testimonials={teacherTestimonials}
    />
  );
}

export default TeacherTestimonials;
