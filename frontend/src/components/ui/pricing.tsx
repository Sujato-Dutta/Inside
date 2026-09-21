"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle as CheckCircleIcon, Star as StarIcon } from "lucide-react";
import Link from "next/link";
import { motion, Transition } from "framer-motion";

export type FREQUENCY = "monthly" | "yearly";
export const frequencies: FREQUENCY[] = ["monthly", "yearly"];

export interface Plan {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    text: string;
    tooltip?: string;
  }[];
  btn: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

export interface PricingSectionProps extends React.ComponentProps<"div"> {
  plans: Plan[];
  heading: string;
  description?: string;
}

export function PricingSection({
  plans,
  heading,
  description,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center space-y-8 p-4",
          props.className
        )}
        {...props}
      >
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1A17] leading-tight">
            {heading}
          </h2>
          {description && (
            <p className="text-[18px] sm:text-[20px] text-[#5C5852] max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <PricingFrequencyToggle
          frequency={frequency}
          setFrequency={setFrequency}
        />

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 items-stretch pt-2">
          {plans.map((plan) => (
            <PricingCard plan={plan} key={plan.name} frequency={frequency} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export type PricingFrequencyToggleProps = React.ComponentProps<"div"> & {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
  frequency,
  setFrequency,
  ...props
}: PricingFrequencyToggleProps) {
  return (
    <div
      className={cn(
        "bg-white mx-auto flex w-fit rounded-full border border-[#E3DED4] p-1.5 shadow-xs",
        props.className
      )}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          key={freq}
          type="button"
          onClick={() => setFrequency(freq)}
          className={cn(
            "relative px-5 py-2 text-[13px] sm:text-[15px] font-semibold capitalize rounded-full transition-colors z-10",
            frequency === freq
              ? "text-white"
              : "text-[#5C5852] hover:text-[#1C1A17]"
          )}
        >
          <span className="relative z-20">{freq}</span>
          {frequency === freq && (
            <motion.span
              layoutId="pricing-frequency-pill"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-0 z-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 shadow-xs"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export type PricingCardProps = React.ComponentProps<"div"> & {
  plan: Plan;
  frequency?: FREQUENCY;
};

export function PricingCard({
  plan,
  className,
  frequency = frequencies[0],
  ...props
}: PricingCardProps) {
  const isYearly = frequency === "yearly";
  const displayPrice = plan.price[frequency];

  return (
    <div
      key={plan.name}
      className={cn(
        "relative flex w-full flex-col rounded-3xl border transition-all duration-300",
        "bg-white shadow-sm",
        plan.highlighted
          ? "border-2 border-orange-500 shadow-md md:scale-[1.02] z-10"
          : "border-[#E3DED4] hover:border-orange-500/40",
        className
      )}
      {...props}
    >
      {/* Card Header */}
      <div
        className={cn(
          "rounded-t-3xl border-b border-[#E3DED4] p-6 sm:p-7 relative",
          plan.highlighted && "bg-orange-50/50"
        )}
      >
        <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold shadow-xs">
              <StarIcon className="h-3 w-3 fill-current" />
              Most Popular
            </span>
          )}
          {isYearly && (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-bold">
              Save {Math.round(((plan.price.monthly * 12 - plan.price.yearly * 12) / (plan.price.monthly * 12)) * 100)}%
            </span>
          )}
        </div>

        <div className="text-2xl font-extrabold text-[#1C1A17]">
          {plan.name}
        </div>
        <p className="text-[15.5px] sm:text-[16px] text-[#5C5852] font-medium min-h-[38px] mt-1.5 leading-snug">
          {plan.info}
        </p>

        <h3 className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#1C1A17] tracking-tight">
            ${displayPrice}
          </span>
          <span className="text-[15px] sm:text-[15.5px] font-medium text-[#5C5852]">
            {plan.name !== "Free" ? (frequency === "monthly" ? "/ month" : "/ month (billed yearly)") : ""}
          </span>
        </h3>
        {isYearly && (
          <span className="text-[14px] text-orange-600 font-bold block mt-1">
            Billed annually at ${plan.price.yearly * 12} / year
          </span>
        )}
      </div>

      {/* Feature Checklist */}
      <div
        className={cn(
          "space-y-3.5 p-6 sm:p-7 text-[15px] flex-1",
          plan.highlighted && "bg-orange-50/20"
        )}
      >
        <div className="text-[13.5px] font-bold uppercase tracking-wider text-[#5C5852] mb-2">
          Included Features:
        </div>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <CheckCircleIcon className="text-orange-500 h-4 w-4 shrink-0 mt-0.5" />
            {feature.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[15.5px] sm:text-[16px] text-[#1C1A17] leading-snug cursor-help border-b border-dotted border-[#E3DED4]">
                    {feature.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-[15.5px] sm:text-[16px] text-[#1C1A17] leading-snug">
                {feature.text}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Button footer */}
      <div
        className={cn(
          "mt-auto w-full p-6 sm:p-7 pt-2 border-t border-[#E3DED4]",
          plan.highlighted && "bg-orange-50/50"
        )}
      >
        <Button
          className="w-full"
          variant={plan.highlighted ? "default" : "outline"}
          size="lg"
          asChild
        >
          <Link href={plan.btn.href}>{plan.btn.text}</Link>
        </Button>
      </div>
    </div>
  );
}

export type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: 5,
    ease: "linear",
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn("absolute aspect-square bg-orange-500", className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay: delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
