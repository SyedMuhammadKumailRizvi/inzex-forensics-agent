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

### 🛡️ Robust Token Management & Auto-Recovery
Memory forensics tools like Volatility produce massive datasets (often >8MB of JSON). To prevent AI context window limits from crashing the pipeline, the Unicorn Engine employs:
- **Dynamic Context Pruning:** Automatically strips noisy Volatility metadata (e.g., `Offset(V)`, `Wow64`) and trims row limits before piping into Gemma 4.
- **Graceful JSON Salvaging:** If Gemma 4 identifies too many injected memory regions and hits the hard output token limit, the backend intercepts the resulting `JSONDecodeError`, naively salvages the partial output string by force-closing the JSON tree, and preserves all generated findings instead of discarding the analysis.

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

To minimize idle GPU costs, we have fully automated the backend deployment. You can spin up a fresh AMD Developer Cloud instance and configure it in minutes using the provided setup script.

**1. Clone the repository on your remote AMD server:**
```bash
git clone https://github.com/SyedMuhammadKumailRizvi/inzex-forensics-agent.git
cd inzex-forensics-agent/worker
```

**2. Run the automated setup script:**
```bash
chmod +x setup_server.sh
./setup_server.sh
```
This script automatically installs Docker, pulls the AMD `rocm/vllm-dev` image, downloads Volatility 3, and configures `cloudflared`.

**3. Start the FastAPI server inside the container:**
The setup script will output a `docker run` command. Copy and run it to enter the GPU-accelerated container, then start the server:
```bash
pip install -r /app/requirements.txt
uvicorn inzex_engine:app --host 0.0.0.0 --port 8000
```

**4. Expose the port using Cloudflare:**
In a new terminal window on the host, run:
```bash
cloudflared tunnel --url http://localhost:8000 > tunnel.log 2>&1 &
grep -o 'https://.*\.trycloudflare\.com' tunnel.log
```
> **⚠️ Important Cloudflare & Netlify Limitation:** Cloudflare Tunnels strictly reject HTTP requests larger than 100MB. If you are accessing the backend via a Cloudflare Tunnel or the frontend via Netlify, you cannot upload full multi-gigabyte memory dumps. To test the complete AI pipeline, please use the provided `dummy_evidence.vmem` (1MB) included in the root of this repository.

*Note: Ensure you update your frontend `.env.local` (and the environment variables in Netlify or Vercel) with the resulting Cloudflare Tunnel URL as `NEXT_PUBLIC_AMD_BACKEND_URL`.*

## 📦 Required Deliverables

- [x] Public GitHub Repository
- [ ] Demo Video (Pending)
- [ ] Slide Deck PDF (Pending)
- [x] Live Demo URL: [https://inzexdemo.netlify.app](https://inzexdemo.netlify.app) *(Note: the AMD ROCm backend is actively running, so you can test live using `dummy_evidence.vmem`)*
