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

The Next.js frontend and Supabase database act as permanent, persistent cloud infrastructure. The AMD ROCm instance runs a **synchronous FastAPI server** that accepts massive memory dump uploads, runs Volatility 3, inferences Gemma 4, and writes only the structured findings back to Supabase.

> **🔒 Evidence Privacy Guarantee**
> Raw memory dumps are processed in an isolated temp directory on the AMD instance and are permanently deleted immediately after Volatility 3 completes. Only the structured findings JSON is persisted to Supabase.

---

## 🏗️ The Decoupled Unicorn Architecture

Our architecture bridges large memory dump handling, AMD accelerated computational forensics, and interactive real-time human review.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (NEXT.JS)                         │
│   UI: Server-Side Rendered Dashboard (Dark Mode / Cyberpunk Aesthetic)  │
│   Features: Direct .vmem Upload, Threaded AI Q&A, Dark Theme PDF Export │
└──────┬─────────────────────────────────────────────────────────▲────────┘
       │ 1. POST /analyze (Direct IP bypass for large files)      │ 4. Streams findings
       │    multipart .vmem + case metadata                       │    from Supabase
       ▼                                                          │    via Realtime
┌─────────────────────────────────────────────────────────────────────────┐
│      🔥 THE UNICORN ENGINE (AMD DEVELOPER CLOUD — ROCm FastAPI) 🔥      │
│                                                                         │
│  [1] Save .vmem  →  temp dir (isolated, never hits cloud storage)       │
│  [2] Volatility 3 (CPU): pslist → netscan → malfind → cmdline           │
│  [3] os.unlink() — temp file deleted IMMEDIATELY after plugins finish   │
│  [4] Gemma 4 8B (ROCm GPU via vLLM): General Anomaly Detection (JSON)   │
│  [5] Write findings JSON to Supabase cases/findings tables              │
│  [6] POST /reevaluate — Live threaded Q&A with Gemma 4 on raw data      │
└──────────────────────────────────────────────────────────┬──────────────┘
                                                           │ 3. Writes structured
                                                           │    findings JSON only
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      STATE TIER (SUPABASE)                               │
│  DB Tables: cases, evidence, findings (status, human_feedback)          │
│  NO storage bucket — raw evidence never persisted here                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Gemma 4 on ROCm (The Inference Engine)

To fulfill the requirements for the Gemma Bounty, **Gemma 4 is hosted locally on the AMD hardware**, rather than relying on a cloud API. 

The Python worker node extracts malicious artifacts from raw memory dumps using Volatility 3 (CPU bounded), and then pipes the raw hex/terminal output directly into the locally hosted Gemma 4 model (GPU bounded). The AI acts as a **General Purpose Anomaly Detector**, scanning for injected regions, hooking, and anomalous networks. 

### Interactive Threaded Review
If the AI flags a finding (or if it reports a completely clean baseline), the analyst can select the finding in the Next.js UI and type a question (e.g. *"Look at the raw pslist. Are there any suspicious child processes of explorer.exe?"*). This triggers a `/reevaluate` POST request back to the AMD backend, which queries Gemma 4 against the raw JSON data and **threads the response** back to the UI.

---

## 🚀 Running the Platform (For Judges)

Because this repository is public, secrets are omitted. You need your own Supabase credentials and an AMD Developer Cloud instance.

### 1. Database Setup
1. Clone the repo and install frontend dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_AMD_BACKEND_URL` — Note: For large memory dumps (>100MB), Cloudflare Tunnels will fail. Use the direct public IP:Port of your AMD instance (e.g. `http://129.212.x.x:8000`).
   - `FIREWORKS_API_KEY` — optional fallback.
3. In your Supabase SQL Editor, run the migration files **in order**:
   ```
   supabase/migrations/01_cleanup.sql
   supabase/migrations/02_enums.sql
   supabase/migrations/03_tables.sql
   supabase/migrations/04_rls.sql
   supabase/migrations/05_feedback_loop.sql
   supabase/migrations/06_demo_rls.sql
   ```

### 2. Start the Frontend (Next.js)
```bash
npm run dev
```
Dashboard available at `http://localhost:3000`.

### 3. Deploy the Unicorn Engine (AMD FastAPI)

On your AMD Developer Cloud ROCm instance, copy the `worker/` directory and run:

```bash
# Install dependencies
pip install -r requirements.txt

# Start the engine (must run on port exposed to public IP for large files)
uvicorn inzex_engine:app --host 0.0.0.0 --port 8000
```

## 📦 Required Deliverables

- [x] Public GitHub Repository
- [ ] Demo Video (Pending)
- [ ] Slide Deck PDF (Pending)
- [ ] Live Demo URL (Pending)
