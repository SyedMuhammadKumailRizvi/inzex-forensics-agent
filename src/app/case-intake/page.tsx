"use client";

import { useState } from "react";
import Link from 'next/link';
import { UploadCloud, ArrowLeft, Cpu, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function CaseIntakePage() {
  const [osProfile, setOsProfile] = useState("auto");
  const [analysisDepth, setAnalysisDepth] = useState("standard");
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="app pt-8 lg:pt-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Top Navbar Area */}
      <nav className="navbar mb-6 lg:mb-8 rounded-2xl flex items-center gap-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to System
          </Button>
        </Link>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-medium tracking-tight text-white m-0">Case Intake & Intelligence Setup</h1>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/history">
            <Button variant="outline" size="sm">Case History</Button>
          </Link>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Intake Form */}
        <div className="space-y-6">
          {/* Section 1: Investigation Parameters */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-sm relative z-20">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
              <h2 className="text-base font-semibold text-white">Investigation Parameters</h2>
              <p className="text-sm text-zinc-500 mt-1">Define case nomenclature and lead assignment before memory processing.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Case Designation</label>
                  <Input type="text" placeholder="e.g. OP-MIDNIGHT-SUN" className="bg-[#121215] border-white/5 shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Reference ID</label>
                  <Input type="text" placeholder="e.g. INC-2026-0881" className="bg-[#121215] border-white/5 shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Lead Investigator</label>
                <Input type="text" placeholder="Analyst ID or Full Name" className="bg-[#121215] border-white/5 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Source */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-sm relative z-30">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
              <h2 className="text-base font-semibold text-white">Evidence Payload</h2>
              <p className="text-sm text-zinc-500 mt-1">Provide the raw memory dump for Volatility 3 processing.</p>
            </div>
            <div className="p-6">
              <div className="upload-zone group">
                <div className="upload-icon">
                  <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-medium mb-1 text-zinc-300">Click to upload or drag and drop</div>
                <div className="text-xs text-zinc-500">Supports .raw, .mem, .img (Maximum size: 128GB)</div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" />
              </div>
            </div>
          </div>

          {/* Section 3: Analysis Config */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-sm relative z-40">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
              <h2 className="text-base font-semibold text-white">Execution Environment</h2>
              <p className="text-sm text-zinc-500 mt-1">Configure profile targeting and AI depth.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative z-50">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Target OS Profile</label>
                  <CustomSelect 
                    value={osProfile} 
                    onChange={setOsProfile}
                    options={[
                      { label: "Auto-Detect (Volatility 3)", value: "auto" },
                      { label: "Windows 10 / 11", value: "win10" },
                      { label: "Windows 7", value: "win7" },
                      { label: "Linux (Generic)", value: "linux" },
                      { label: "macOS", value: "mac" }
                    ]}
                  />
                </div>
                <div className="relative z-50">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Analysis Depth</label>
                  <CustomSelect 
                    value={analysisDepth} 
                    onChange={setAnalysisDepth}
                    options={[
                      { label: "Quick Triage (Maelstrom)", value: "quick" },
                      { label: "Standard Forensics", value: "standard" },
                      { label: "Deep Inspection (Gemma 3 Assisted)", value: "deep" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link href="/memory-browser">
              <Button variant="primary" size="lg" className="shadow-[0_0_20px_rgba(157,0,255,0.15)] hover:shadow-[0_0_30px_rgba(157,0,255,0.3)] bg-[#9D00FF]/20 hover:bg-[#9D00FF]/30 border border-[#9D00FF]/50 px-8">
                Initialize Analysis Sequence
              </Button>
            </Link>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-6 font-bold flex items-center gap-2">
              <Cpu className="h-3 w-3" /> Hardware Acceleration
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
              <div className="text-sm font-medium text-zinc-300">AMD Ryzen AI / NPU</div>
              <div className="ml-auto text-[10px] text-[#10b981] font-mono tracking-widest uppercase">Active</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
              <div className="text-sm font-medium text-zinc-300">Radeon RX GPU</div>
              <div className="ml-auto text-[10px] text-[#10b981] font-mono tracking-widest uppercase">Active</div>
            </div>
          </div>
          
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <HardDrive className="h-24 w-24" />
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-4 font-bold relative z-10">
              LLM Copilot Status
            </div>
            <div className="text-sm text-zinc-400 leading-relaxed relative z-10">
              <span className="text-[#D6A6FF] font-medium block mb-2 text-base">Gemma 3 (8B) Ready</span>
              Model is loaded in VRAM to parse unstructured Volatility output and autonomously extract threat actor IOCs in real-time.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
