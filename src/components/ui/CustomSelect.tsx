"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = "Select...", className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-[#0a0a0c]/80 px-4 py-2 text-sm text-[#FAFAFA] transition-all duration-300",
          isOpen ? "border-[#9D00FF] bg-[#121215] shadow-[0_0_10px_rgba(157,0,255,0.2)]" : "border-[#202026] hover:border-[#52525B]"
        )}
      >
        <span className={selectedOption ? "text-[#FAFAFA]" : "text-[#52525B]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-[#A1A1AA]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#202026] bg-[#0a0a0c]/95 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors",
                    value === option.value
                      ? "bg-[#9D00FF]/10 text-[#9D00FF]"
                      : "text-[#FAFAFA] hover:bg-[#121215] hover:text-white"
                  )}
                >
                  {value === option.value && (
                    <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
