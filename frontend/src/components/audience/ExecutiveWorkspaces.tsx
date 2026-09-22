import React from "react";
import {
  Accessibility,
  BarChart3,
  Database,
  School,
} from "lucide-react";

const WORKSPACES = [
  {
    title: "Principal / Head",
    description:
      "See whole-school performance, statutory risks, and inspection readiness in one executive view.",
    icon: School,
    accent: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    title: "VP Academics",
    description:
      "Track attainment, progress, subject gaps, and borderline cohorts against UAE benchmarks.",
    icon: BarChart3,
    accent: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    title: "Head of Inclusion",
    description:
      "Evidence SEND progress, attendance overlap, and the impact of targeted support without exposing PII.",
    icon: Accessibility,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    title: "Data & Exams Manager",
    description:
      "Join fragmented school files, verify data quality, and produce a traceable audit trail before analysis.",
    icon: Database,
    accent: "bg-sky-50 text-sky-700 border-sky-200",
  },
];

export function ExecutiveWorkspaces() {
  return (
    <section
      id="who-its-for"
      className="relative overflow-hidden border-y border-[#E3DED4] bg-[#F5F2EB] py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-white px-3 py-1 text-[12px] font-bold uppercase tracking-[0.16em] text-orange-600 shadow-sm">
            Four executive workspaces
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-[#1C1A17] sm:text-5xl lg:text-6xl">
            One source of truth for the leaders who{" "}
            <span className="text-amber-gradient">carry inspection readiness.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[18px] leading-relaxed text-[#5C5852] sm:text-[20px]">
            Inside gives each accountable leader a focused view of the same verified evidence - so decisions stay aligned from classroom data to board reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSPACES.map(({ title, description, icon: Icon, accent }, index) => (
            <article
              key={title}
              className="group relative flex min-h-[260px] flex-col rounded-3xl border border-[#E3DED4] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md sm:p-7"
            >
              <div className="mb-8 flex items-center justify-between">
                <div
                  className={"flex h-12 w-12 items-center justify-center rounded-2xl border " + accent}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-[#8C877E]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#1C1A17]">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5C5852]">
                {description}
              </p>
              <div className="mt-auto pt-6">
                <div className="h-px w-full bg-[#E3DED4] transition-colors group-hover:bg-orange-200" />
                <p className="pt-4 text-[12px] font-bold uppercase tracking-[0.12em] text-orange-600">
                  Role-specific command view
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-4xl text-center text-[14px] italic leading-relaxed text-[#5C5852] sm:text-[15px]">
          Inspectors evaluate whole-school progress, not isolated classes. Inside equips the four desks responsible for defending institutional ratings with verified evidence across one secure platform.
        </p>
      </div>
    </section>
  );
}

export default ExecutiveWorkspaces;
