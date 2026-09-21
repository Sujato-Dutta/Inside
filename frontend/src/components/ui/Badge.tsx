"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "neutral" | "success" | "warning";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "brand",
  className,
  icon,
}: BadgeProps) {
  const variantStyles = {
    brand:
      "bg-orange-500/10 text-orange-600 border border-orange-500/25 font-semibold",
    neutral:
      "bg-white text-[#5C5852] border border-[#E3DED4]",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
