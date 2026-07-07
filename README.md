# Inzex Forensics

Autonomous Digital Forensics & Incident Response (DFIR) Platform. 
Built for the AMD Developer Hackathon (Unicorn Track).

## Architecture
- **Frontend:** Next.js (App Router), Vanilla CSS.
- **Backend:** Supabase (Auth, Postgres).
- **Inference & Processing:** Python backend running Volatility 3 on AMD hardware to parse raw memory dumps (`.raw`, `.vmem`), subsequently analyzed by Google's Gemma 3 model.

## Getting Started
First, install the dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
