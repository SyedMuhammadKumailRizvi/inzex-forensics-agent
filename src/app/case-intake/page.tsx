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
    <div className="app">
      {/* Top Navbar Area */}
      <nav className="navbar mb-12 rounded-2xl flex items-center gap-6">
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
        <div className="panel space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-1">Investigation Parameters</h2>
            <p className="text-sm text-zinc-400">Define case details before proceeding to memory analysis.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Case Designation</label>
              <Input type="text" placeholder="e.g. OP-MIDNIGHT-SUN" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Reference ID</label>
              <Input type="text" placeholder="e.g. INC-2026-0881" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Lead Investigator</label>
            <Input type="text" placeholder="Analyst ID or Name" />
          </div>

          <div className="h-px bg-white/5 my-4"></div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Evidence Source</h3>
            <p className="text-sm text-zinc-400 mb-4">Provide the raw memory dump for Volatility 3 processing.</p>
            
            {/* File Upload Zone */}
            <div className="upload-zone group">
              <div className="upload-icon group-hover:scale-110 transition-transform duration-500 relative z-10">
                <UploadCloud className="h-8 w-8 text-zinc-400 group-hover:text-[#9D00FF] transition-colors" />
              </div>
              <div className="text-lg font-medium mb-2 relative z-10 text-white">Drag & Drop Memory Dump</div>
              <div className="text-sm text-zinc-500 relative z-10">Supports .raw, .mem, .img (Max 128GB)</div>
              
              {/* Fake hidden input for actual functionality if needed */}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Target OS Profile</label>
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
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Analysis Depth</label>
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

          <div className="pt-4 flex justify-end">
            <Link href="/memory-browser">
              <Button variant="primary" size="lg">
                Initialize Analysis Sequence
              </Button>
            </Link>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="flex flex-col gap-6">
          <div className="panel">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6 font-mono font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Hardware Acceleration
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_10px_#9D00FF] animate-pulse"></div>
              <div className="text-sm font-medium">AMD Ryzen AI / NPU</div>
              <div className="ml-auto text-xs text-[#9D00FF] font-mono tracking-wider">ACTIVE</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_10px_#9D00FF] animate-pulse"></div>
              <div className="text-sm font-medium">Radeon RX GPU</div>
              <div className="ml-auto text-xs text-[#9D00FF] font-mono tracking-wider">ACTIVE</div>
            </div>
          </div>
          
          <div className="panel relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <HardDrive className="h-24 w-24" />
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono font-bold relative z-10">
              LLM Copilot Status
            </div>
            <div className="text-sm text-zinc-400 leading-relaxed relative z-10">
              <span className="text-[#D6A6FF] font-medium block mb-2">Gemma 3 (8B) Loaded</span>
              Model is ready in VRAM to parse unstructured Volatility output and autonomously extract threat actor IOCs in real-time.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
