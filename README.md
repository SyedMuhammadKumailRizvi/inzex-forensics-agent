<div align="center">
  <img src="./public/logo.png" alt="Inzex Forensics Logo" width="120" />
  <h1>Inzex Forensics</h1>
  <p><b>Autonomous Digital Forensics & Incident Response (DFIR) Platform</b></p>
  <p>Built for the <strong>AMD Developer Hackathon (Unicorn Track)</strong></p>
</div>

---

## 🏆 Hackathon Context & Strategy
Inzex Forensics is an AI-gated memory forensics platform targeting B2B SaaS for cybersecurity consultants and Managed Service Providers (MSPs). 

This project was specifically engineered to meet the requirements of **Track 3 (Unicorn)** and target the **$2,000 Best AMD-Hosted Gemma Project Bounty**.

### Meeting the AMD Compute Mandate
To satisfy the automated pre-screening criteria, our architecture strictly relies on the **AMD Developer Cloud (ROCm 7.2 + vLLM 0.16.0 + PyTorch 2.9)** for heavy computation. 

Because the AMD Developer Cloud environment is ephemeral (limited to a strict 4-hour uptime window), **we developed a highly decoupled architecture.** The Next.js frontend and Supabase database act as our permanent, persistent cloud infrastructure, while the AMD Jupyter Notebook acts as a powerful, stateless worker node that polls for tasks, processes them natively, and shuts down.

*(Note: In accordance with Track 3 rules, no Docker container is used for the backend deployment).*

---

## 🏗️ The Decoupled Unicorn Architecture

Our architecture bridges large memory dump handling, AMD accelerated computational forensics, and real-time human review.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (NEXT.JS)                         │
│  UI: Server-Side Rendered Dashboard (Dark Mode / Cyberpunk Aesthetic)   │
│  Features: File Upload API, Human Review Workspace, AI Chat Interface   │
└──────┬───────────────────────────────────────────────────────────▲──────┘
       │ 1. Uploads .vmem via API &                                │ 6. Live updates:
       │    Submits user comments for                              │    Threat Reports
       │    re-evaluation                                          │    & AI Replies
       ▼                                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                      STATE & STORAGE TIER (SUPABASE)                    │
│  - Storage Bucket: cridex.vmem (Secure file hosting)                    │
│  - DB Tables: Cases, Findings, Finding_Threads (Chat context)           │
└──────┬───────────────────────────────────────────────────────────▲──────┘
       │ 2. AMD Worker polls for                                   │ 5. Writes JSON
       │    new files OR new user                                  │    analysis &
       │    comments to process                                    │    updated context
       ▼                                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│      🔥 THE UNICORN ENGINE (AMD DEVELOPER CLOUD - ROCm NOTEBOOK) 🔥     │
│  Python FastAPI app runs Volatility 3 (CPU) & Google Gemma 3 (GPU)      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Gemma 3 on ROCm (The Inference Engine)

To fulfill the requirements for the Gemma Bounty, **Gemma 3 is hosted locally on the AMD hardware**, rather than relying on a cloud API. 

The Python worker node extracts malicious artifacts from raw memory dumps using Volatility 3 (CPU bounded), and then pipes the raw hex/terminal output directly into the locally hosted Gemma 3 model (GPU bounded). The AI agent evaluates the evidence and outputs a highly confident, structured JSON report mapped to the MITRE ATT&CK framework.

### AMD Compute Evidence (vLLM on ROCm)
Below is the core snippet demonstrating how the backend initializes Gemma 3 natively on the AMD hardware using the ROCm-optimized vLLM server:

```python
import asyncio
from vllm import AsyncLLMEngine, AsyncEngineArgs

# Initialize Gemma 3 natively on AMD ROCm hardware
engine_args = AsyncEngineArgs(
    model="google/gemma-3-8b-it",
    tensor_parallel_size=1, # Adjust based on available AMD GPUs
    gpu_memory_utilization=0.90,
    enforce_eager=True # Required for specific ROCm configurations
)

# The Unicorn Engine
llm_engine = AsyncLLMEngine.from_engine_args(engine_args)

async def analyze_memory_forensics(volatility_output: str):
    prompt = f"Analyze this Volatility 3 hex dump and map to MITRE ATT&CK:\n{volatility_output}"
    # Generate forensic report via local Gemma 3
    results = await llm_engine.generate(prompt)
    return results
```

---

## 🚀 Running the Permanent Infrastructure (Frontend)

To run the Next.js dashboard locally while the AMD node is polling:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 📦 Required Deliverables

- [x] Public GitHub Repository
- [ ] Demo Video (Pending)
- [ ] Slide Deck PDF (Pending)
- [ ] Live Demo URL (Pending)
