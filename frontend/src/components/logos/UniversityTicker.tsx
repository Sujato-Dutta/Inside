"use client";

import React from "react";
import Image from "next/image";

interface University {
  name: string;
  logo: string;
  className: string;
}

const UNIVERSITIES: University[] = [
  {
    name: "MIT",
    logo: "/universities/mit.svg",
    className: "h-9 sm:h-10 w-auto",
  },
  {
    name: "Stanford",
    logo: "/universities/stanford.svg",
    className: "h-11 sm:h-12 w-auto",
  },
  {
    name: "UC Berkeley",
    logo: "/universities/berkeley.svg",
    className: "h-11 sm:h-12 w-auto",
  },
  {
    name: "Harvard",
    logo: "/universities/harvard.svg",
    className: "h-11 sm:h-12 w-auto",
  },
  {
    name: "Oxford",
    logo: "/universities/oxford.svg",
    className: "h-11 sm:h-12 w-auto",
  },
  {
    name: "Cambridge",
    logo: "/universities/cambridge.svg",
    className: "h-11 sm:h-12 w-auto",
  },
  {
    name: "ETH Zurich",
    logo: "/universities/eth.svg",
    className: "h-7 sm:h-8 w-auto opacity-85",
  },
];

export function UniversityTicker() {
  // Quadruple list to ensure uninterrupted infinite marquee scroll across all screen widths
  const displayList = [
    ...UNIVERSITIES,
    ...UNIVERSITIES,
    ...UNIVERSITIES,
    ...UNIVERSITIES,
  ];

  return (
    <section className="pt-6 pb-8 sm:pt-8 sm:pb-10 relative bg-[#F5F2EB]">
      {/* Label placed ABOVE the sliding bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5 text-center">
        <p className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[#5C5852]">
          Trusted by universities worldwide
        </p>
      </div>

      {/* The distinct horizontal sliding bar */}
      <div className="py-6 sm:py-7 relative overflow-hidden bg-white border-y border-[#E3DED4] shadow-xs">
        {/* Infinite Marquee Track with edge fade masks */}
        <div className="relative w-full overflow-hidden">
          {/* Left edge fade gradient */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-white to-transparent z-10" />

          {/* Right edge fade gradient */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Sliding flex row: logos floating with smooth continuous motion */}
          <div className="animate-marquee-logos flex items-center gap-16 sm:gap-24 py-2">
            {displayList.map((uni, idx) => (
              <div
                key={`${uni.name}-${idx}`}
                className="shrink-0 flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-default select-none"
                title={uni.name}
              >
                <Image
                  src={uni.logo}
                  alt={`${uni.name} logo`}
                  width={120}
                  height={50}
                  className={`object-contain transition-all ${uni.className}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
