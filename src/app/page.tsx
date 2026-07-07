"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Activity, MessageSquare, Database, TerminalSquare, Layers, ShieldCheck, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MemoryDumpAnimation } from "@/components/ui/MemoryDumpAnimation";
import { FallingViruses } from "@/components/ui/FallingViruses";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col bg-[#030305]">
      {/* Dynamic Background Elements */}
      <FallingViruses />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#9D00FF]/5 via-[#030305]/0 to-[#030305]/0 pointer-events-none z-[-10]" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-4 pt-20 pb-20 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-left"
          >
            <h1 className="text-6xl md:text-7xl lg:text-[5rem] font-black tracking-tight mb-8 text-white leading-[1.05]">
              Autonomous <br />
              Digital Forensics <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D00FF] via-[#D6A6FF] to-[#9D00FF] bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">
                & Incident Response
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-12 leading-relaxed font-light">
              Accelerate threat hunting using the <span className="text-zinc-200 font-medium">AMD Developer Cloud</span>. Parse raw memory dumps into actionable intelligence instantly with our decoupled Unicorn Architecture.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Link href="/case-intake">
                <Button variant="primary" size="lg" className="group w-full sm:w-auto text-base px-8 py-6 shadow-[0_0_20px_rgba(157,0,255,0.25)] hover:shadow-[0_0_40px_rgba(157,0,255,0.6)] transition-all duration-300 border border-[#9D00FF]/50 bg-[#9D00FF]/10 hover:bg-[#9D00FF]/20 backdrop-blur-md">
                  Start Investigation 
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/feedback">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 border-white/10 hover:border-white/30 hover:bg-white/5 text-zinc-300 transition-colors duration-300 backdrop-blur-md">
                  <MessageSquare className="mr-2 h-5 w-5 opacity-70" /> Leave Feedback
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Animation Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end"
          >
            <MemoryDumpAnimation />
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32"
        >
          {/* Card 1 */}
          <div className="relative text-left group bg-[#0a0a0c] p-8 rounded-2xl overflow-hidden border border-white/5 animate-[borderPulse_4s_ease-in-out_infinite]">
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6 text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">AMD Developer Cloud</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Powered by high-performance ROCm 7.2 and vLLM 0.16.0 instances for incredibly rapid AI inference without local bottlenecks.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative text-left group bg-[#0a0a0c] p-8 rounded-2xl overflow-hidden border border-white/5 animate-[borderPulse_4s_ease-in-out_infinite_1s]">
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Gemma 3 Intelligence</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Automated IOC extraction and structured JSON threat reporting using state-of-the-art local LLMs on AMD hardware.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative text-left group bg-[#0a0a0c] p-8 rounded-2xl overflow-hidden border border-white/5 animate-[borderPulse_4s_ease-in-out_infinite_2s]">
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <TerminalSquare className="h-6 w-6 text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Volatility 3 Integration</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Native Python execution uncovers deeply hidden malware by seamlessly parsing raw memory dump structures.</p>
            </div>
          </div>
        </motion.div>

        {/* The Decoupled Unicorn Architecture (Matches README.md exactly) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full mt-40 mb-20"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">The Decoupled Unicorn Architecture</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Bridging large memory dump handling, AMD accelerated computational forensics, and real-time human review.</p>
          </div>

          {/* Diagram Container */}
          <div className="w-full max-w-4xl mx-auto font-mono text-sm">
            
            {/* TIER 1: CLIENT */}
            <div className="flex justify-center mb-8">
              <div className="w-full md:w-2/3 border border-zinc-700 bg-[#0a0a0c] p-6 rounded-lg text-center relative shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Layers className="h-5 w-5 text-[#9D00FF]" />
                  <h3 className="font-bold text-white uppercase tracking-wider">Client Tier (Next.js)</h3>
                </div>
                <p className="text-zinc-500 text-xs">UI: Server-Side Rendered Dashboard</p>
                <p className="text-zinc-500 text-xs">Features: File Upload API, Human Review Workspace, AI Chat</p>
              </div>
            </div>

            {/* FLOW LINES 1 (Client <-> Supabase) */}
            <div className="flex justify-between w-full md:w-2/3 mx-auto px-8 mb-8 relative">
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-16 bg-zinc-700 relative">
                  <ArrowDown className="absolute -bottom-2 -left-[11px] h-6 w-6 text-zinc-500" />
                </div>
                <div className="absolute top-2 left-[-60px] md:left-[-20px] text-[10px] text-zinc-500 text-right w-32">
                  1. Uploads .vmem & <br/> Submits comments
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-[1px] h-16 bg-zinc-700 relative">
                  <ArrowUp className="absolute -top-2 -left-[11px] h-6 w-6 text-[#9D00FF]" />
                </div>
                <div className="absolute top-2 right-[-60px] md:right-[-20px] text-[10px] text-[#9D00FF] text-left w-32">
                  6. Live updates: <br/> Threat Reports & <br/> AI Replies
                </div>
              </div>
            </div>

            {/* TIER 2: SUPABASE */}
            <div className="flex justify-center mb-8">
              <div className="w-full md:w-2/3 border border-zinc-700 bg-[#0a0a0c] p-6 rounded-lg text-center shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Database className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white uppercase tracking-wider">State & Storage Tier (Supabase)</h3>
                </div>
                <p className="text-zinc-500 text-xs">Storage Bucket: cridex.vmem</p>
                <p className="text-zinc-500 text-xs">DB Tables: Cases, Findings, Finding_Threads</p>
              </div>
            </div>

            {/* FLOW LINES 2 (Supabase <-> AMD Engine) */}
            <div className="flex justify-between w-full md:w-2/3 mx-auto px-8 mb-8 relative">
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-16 bg-zinc-700 relative">
                  <ArrowDown className="absolute -bottom-2 -left-[11px] h-6 w-6 text-zinc-500" />
                </div>
                <div className="absolute top-2 left-[-60px] md:left-[-20px] text-[10px] text-zinc-500 text-right w-32">
                  2. AMD Worker polls <br/> for new files or <br/> comments
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-[1px] h-16 bg-zinc-700 relative">
                  <ArrowUp className="absolute -top-2 -left-[11px] h-6 w-6 text-emerald-500" />
                </div>
                <div className="absolute top-2 right-[-60px] md:right-[-20px] text-[10px] text-emerald-500 text-left w-32">
                  5. Writes JSON <br/> analysis & updated <br/> context
                </div>
              </div>
            </div>

            {/* TIER 3: UNICORN ENGINE */}
            <div className="flex justify-center">
              <div className="w-full md:w-2/3 border border-[#9D00FF]/50 bg-[#9D00FF]/5 p-6 rounded-lg text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9D00FF] to-transparent" />
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ShieldCheck className="h-6 w-6 text-[#9D00FF]" />
                  <h3 className="font-bold text-white uppercase tracking-wider">The Unicorn Engine</h3>
                </div>
                <p className="text-[#9D00FF]/80 text-xs font-semibold mb-1">AMD DEVELOPER CLOUD (ROCm NOTEBOOK)</p>
                <p className="text-zinc-500 text-xs">Python FastAPI app runs Volatility 3 (CPU) & Google Gemma 3 (GPU)</p>
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
