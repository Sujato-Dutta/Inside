"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 border border-transparent transition-all",
        primary:
          "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 border border-transparent transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[#E3DED4] bg-white hover:bg-orange-50/80 hover:border-orange-400 text-[#1C1A17] shadow-xs transition-colors",
        secondary:
          "bg-white border border-[#E3DED4] text-[#1C1A17] hover:bg-orange-50/80 hover:text-orange-600 shadow-xs transition-colors",
        ghost:
          "hover:bg-orange-50/80 text-[#5C5852] hover:text-orange-600 transition-colors",
        link:
          "text-orange-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        md: "h-10 rounded-xl px-5 text-sm",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const glowClass = glow
      ? "shadow-md shadow-orange-500/30 border-orange-500/40"
      : "";

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), glowClass)}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), glowClass)}
        ref={ref}
        {...props}
      >
        {children}
        {icon && <span className="ml-2 inline-flex items-center">{icon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
