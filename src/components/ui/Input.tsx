"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B] transition-colors group-focus-within:text-[#9D00FF]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border border-[#202026] bg-[#0a0a0c]/80 px-4 py-2 text-sm text-[#FAFAFA] transition-all duration-300",
            "placeholder:text-[#52525B] focus:border-white/20 focus:bg-[#121215] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-11" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#9D00FF]/0 to-[#4D0080]/0 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-20" />
      </div>
    );
  }
);
Input.displayName = "Input";
