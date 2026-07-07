"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const lines = [
  "[SYS] Initiating Volatility 3 Core...",
  "[SYS] Loading hardware-accelerated profile: windows.info.Info",
  "Offset (V)         PID   ProcessName      Threads  Handles",
  "0xfffffa800318...  4     System           121      533",
  "0xfffffa8004b2...  284   smss.exe         3        29",
  "0xfffffa8005d4...  368   csrss.exe        10       441",
  "0xfffffa8006e1...  424   wininit.exe      3        78",
  "[!] Anomalous execution detected at 0xfffffa8007a...",
  "[+] Extracting VAD node...",
  "[LLM] Gemma 3 evaluating unstructured string artifacts...",
  "[LLM] MATCH: Cobalt Strike Beacon (Confidence: 98%)",
  "[LLM] Extracted IOC: 192.168.1.105:443",
  "[SYS] Analysis cycle complete. Awaiting instruction."
];

export function MemoryDumpAnimation() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        const newLines = [...prev, lines[currentIndex]];
        if (newLines.length > 8) newLines.shift(); // Keep last 8 lines
        return newLines;
      });
      currentIndex++;
      if (currentIndex >= lines.length) {
        currentIndex = 0;
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg aspect-[4/3] z-10 group">
      {/* Intense Glowing Backdrop Shadow */}
      <motion.div 
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.05, 0.9] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#9D00FF]/40 blur-[70px] rounded-full pointer-events-none -z-10" 
      />
      
      <div className="relative w-full h-full rounded-2xl border border-white/10 bg-[#050506]/90 shadow-2xl overflow-hidden flex flex-col font-mono text-xs sm:text-sm">
        {/* Terminal Header */}
        <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-4 text-zinc-500 text-xs">inzex-engine-v3.exe — [ACTIVE]</div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 flex-1 overflow-hidden relative" ref={containerRef}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050506] z-10 pointer-events-none" />
          <div className="flex flex-col gap-2">
            {visibleLines.map((line, i) => {
              const isWarning = line.includes("[!]");
              const isLlm = line.includes("[LLM]");
              const isSys = line.includes("[SYS]");
              
              return (
                <motion.div
                  key={`${line}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    isWarning ? "text-amber-400" : 
                    isLlm ? "text-[#9D00FF]" : 
                    isSys ? "text-zinc-500" : "text-emerald-400"
                  }`}
                >
                  {line}
                </motion.div>
              );
            })}
            {/* Blinking Cursor */}
            <motion.div 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-[#9D00FF] mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
