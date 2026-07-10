"use client";

import { useState, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, ArrowLeft, Cpu, HardDrive, Loader2, CheckCircle, AlertCircle, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomSelect } from "@/components/ui/CustomSelect";

type UploadStage =
  | 'idle'
  | 'uploading'       // binary transfer to AMD
  | 'volatility'      // backend running plugins
  | 'gemma'           // Gemma inferencing
  | 'complete'        // findings written to Supabase
  | 'error';

const STAGE_LABELS: Record<UploadStage, string> = {
  idle: '',
  uploading:  'Uploading evidence to AMD processing environment...',
  volatility: 'Unicorn Engine: Running Volatility 3 plugins (pslist, netscan, malfind, cmdline)...',
  gemma:      'Gemma 3 on ROCm: Generating structured threat report...',
  complete:   'Analysis complete. Loading your workspace...',
  error:      'An error occurred. See console for details.',
};

export default function CaseIntakePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caseDesignation, setCaseDesignation] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [leadInvestigator, setLeadInvestigator] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [osProfile, setOsProfile] = useState("windows");
  const [analysisDepth, setAnalysisDepth] = useState("standard");

  const [stage, setStage] = useState<UploadStage>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const isProcessing = stage !== 'idle' && stage !== 'complete' && stage !== 'error';
  const amdBackendUrl = process.env.NEXT_PUBLIC_AMD_BACKEND_URL || "http://localhost:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInitialize = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one .vmem file before initialising.");
      return;
    }

    setStage('uploading');
    setProgress(10);
    setErrorMsg("");

    try {
      // Build multipart form
      const formData = new FormData();
      formData.append("case_number", caseDesignation || "Inzex-Alpha");
      formData.append("examiner_name", leadInvestigator || "Investigator");
      formData.append("org", "Inzex Forensics");
      formData.append("classification", referenceId || "UNCLASSIFIED");
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });

      // Upload — note: fetch does NOT support progress natively for uploads.
      // We show deterministic stage labels while the server works.
      setProgress(30);

      const resp = await fetch(`${amdBackendUrl}/analyze`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header — browser sets it with boundary
      });

      setStage('volatility');
      setProgress(55);

      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(`Backend returned ${resp.status}: ${detail}`);
      }

      setStage('gemma');
      setProgress(80);

      const data = await resp.json() as {
        case_id: string;
        status: string;
        findings_count: number;
        threat_narrative: string;
      };

      setStage('complete');
      setProgress(100);

      // Short pause so the user can see "complete" before redirect
      await new Promise(r => setTimeout(r, 1200));
      router.push(`/workspace/${data.case_id}`);

    } catch (err: any) {
      console.error("Analysis failed:", err);
      setStage('error');
      setErrorMsg(err?.message ?? "Unknown error");
    }
  };

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
        <h1 className="text-xl font-medium tracking-tight text-white m-0">Case Intake &amp; Intelligence Setup</h1>
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
                  <Input value={caseDesignation} onChange={(e) => setCaseDesignation(e.target.value)} type="text" placeholder="e.g. OP-MIDNIGHT-SUN" className="bg-[#121215] border-white/5 shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Reference ID</label>
                  <Input value={referenceId} onChange={(e) => setReferenceId(e.target.value)} type="text" placeholder="e.g. INC-2026-0881" className="bg-[#121215] border-white/5 shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Lead Investigator</label>
                <Input value={leadInvestigator} onChange={(e) => setLeadInvestigator(e.target.value)} type="text" placeholder="Analyst ID or Full Name" className="bg-[#121215] border-white/5 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Source */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-sm relative z-30">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] rounded-t-2xl">
              <h2 className="text-base font-semibold text-white">Evidence Payload</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Upload the raw memory dump directly to the AMD processing environment.{' '}
                <span className="text-[#9D00FF]/80">Raw evidence never touches Supabase storage.</span>
              </p>
            </div>
            <div className="p-6">
              <div
                className="upload-zone group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">
                  {selectedFiles.length > 0
                    ? <CheckCircle className="h-6 w-6 text-[#9D00FF]" />
                    : <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                  }
                </div>
                {selectedFiles.length > 0 ? (
                  <div className="w-full mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/10 group/file hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <HardDrive className="h-4 w-4 text-[#D6A6FF] shrink-0" />
                          <span className="text-sm font-medium text-zinc-200 truncate">{f.name}</span>
                          <span className="text-xs text-zinc-500 shrink-0">({(f.size / 1e6).toFixed(1)} MB)</span>
                        </div>
                        <button onClick={(e) => removeFile(i, e)} className="text-zinc-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors opacity-0 group-hover/file:opacity-100">
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 text-xs font-medium text-[#D6A6FF] hover:text-white bg-[#9D00FF]/5 hover:bg-[#9D00FF]/15 rounded-xl transition-colors border border-[#9D00FF]/20" onClick={() => fileInputRef.current?.click()}>
                      <Plus className="h-3 w-3" /> Add additional payload
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium mb-1 text-zinc-300">Click to upload or drag and drop</div>
                    <div className="text-xs text-zinc-500">Supports .raw, .mem, .img, .vmem (Recommended size: &lt; 4GB)</div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".vmem,.mem,.raw,.img"
                  className="hidden"
                  onChange={handleFileChange}
                />
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
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Symbol Operating System Hint</label>
                  <CustomSelect
                    value={osProfile}
                    onChange={setOsProfile}
                    options={[
                      { label: "Automatic Detection (Recommended)", value: "auto" },
                      { label: "Windows (x86/x64)", value: "windows" },
                      { label: "Linux (x64)", value: "linux" },
                      { label: "macOS (x64)", value: "macos" }
                    ]}
                  />
                </div>
                <div className="relative z-50">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Analysis Depth</label>
                  <CustomSelect
                    value={analysisDepth}
                    onChange={setAnalysisDepth}
                    options={[
                      { label: "Quick Scan (pslist, pstree)", value: "quick" },
                      { label: "Standard Scan (+netscan, cmdline)", value: "standard" },
                      { label: "Deep Forensic Scan (+malfind, vadinfo)", value: "deep" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar — visible only when processing */}
          {stage !== 'idle' && (
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                {stage === 'error'
                  ? <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                  : stage === 'complete'
                  ? <CheckCircle className="h-5 w-5 text-[#10b981] shrink-0" />
                  : <Loader2 className="h-5 w-5 text-[#9D00FF] animate-spin shrink-0" />
                }
                <p className={`text-sm font-medium ${stage === 'error' ? 'text-red-400' : stage === 'complete' ? 'text-[#10b981]' : 'text-zinc-300'}`}>
                  {STAGE_LABELS[stage]}
                </p>
              </div>

              {/* Progress bar */}
              {stage !== 'error' && (
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4D0080] to-[#9D00FF] transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {stage === 'error' && errorMsg && (
                <p className="text-xs text-red-400/70 mt-2 font-mono break-all">{errorMsg}</p>
              )}

              <p className="text-[10px] text-zinc-600 mt-3">
                ⏱ Large memory dumps take 2–5 minutes. Do not close this tab.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleInitialize}
              disabled={isProcessing}
              variant="primary"
              size="lg"
              className="shadow-[0_0_20px_rgba(157,0,255,0.15)] hover:shadow-[0_0_30px_rgba(157,0,255,0.3)] bg-[#9D00FF]/20 hover:bg-[#9D00FF]/30 border border-[#9D00FF]/50 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                "Initialize Analysis Sequence"
              )}
            </Button>
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
              <div className="text-sm font-medium text-zinc-300">AMD ROCm GPU</div>
              <div className="ml-auto text-[10px] text-[#10b981] font-mono tracking-widest uppercase">Active</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
              <div className="text-sm font-medium text-zinc-300">vLLM 0.16.0</div>
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
              <span className="text-[#D6A6FF] font-medium block mb-2 text-base">Gemma 4 (12B) Ready</span>
              Model is loaded in VRAM to parse unstructured Volatility output and autonomously extract threat actor IOCs in real-time.
            </div>
          </div>

          <div className="bg-[#0a0a0c] border border-[#9D00FF]/10 rounded-2xl p-5 text-[11px] text-zinc-500 leading-relaxed">
            <span className="text-[#9D00FF] font-semibold block mb-1">🔒 Evidence Privacy</span>
            Raw evidence never leaves the AMD processing environment. Files are processed in an isolated temp directory and permanently deleted after analysis. Only the structured findings report is persisted.
          </div>
        </div>
      </div>
    </div>
  );
}
