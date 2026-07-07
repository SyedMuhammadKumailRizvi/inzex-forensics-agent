"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-xl overflow-hidden";
    
    const variants = {
      primary: "bg-[#9D00FF] text-white hover:bg-[#B333FF] shadow-[0_0_15px_rgba(157,0,255,0.3)] hover:shadow-[0_0_25px_rgba(157,0,255,0.6)] border border-[#9D00FF]",
      secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
      outline: "bg-transparent text-[#A1A1AA] hover:text-white border border-[#202026] hover:border-[#52525B] hover:bg-white/5 backdrop-blur-md",
      ghost: "bg-transparent text-[#A1A1AA] hover:text-white hover:bg-white/5",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Shine effect for primary button */}
        {variant === "primary" && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
        )}
        
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
