import os
import json
import subprocess
import tempfile
import time
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Environment — load .env.local from parent directory (Next.js root) or current dir
# ---------------------------------------------------------------------------
env_path_parent = Path(__file__).resolve().parent.parent / '.env.local'
env_path_current = Path(__file__).resolve().parent / '.env.local'

if env_path_parent.exists():
    load_dotenv(dotenv_path=env_path_parent)
elif env_path_current.exists():
    load_dotenv(dotenv_path=env_path_current)
else:
    load_dotenv() # Fallback to standard python-dotenv search

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

llm_engine = None
fw_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global llm_engine, fw_client
    
    # ---------------------------------------------------------------------------
    # AMD ROCm / vLLM ENGINE INITIALIZATION
    # ---------------------------------------------------------------------------
    from vllm import AsyncLLMEngine, AsyncEngineArgs
    
    try:
        engine_args = AsyncEngineArgs(
            model="google/gemma-4-12B-it",
            tensor_parallel_size=1,
            gpu_memory_utilization=0.90,
            enforce_eager=True
        )
        llm_engine = AsyncLLMEngine.from_engine_args(engine_args)
        print("[+] vLLM engine loaded. Using local Gemma 4 on AMD ROCm.")
    except Exception as e:
        print(f"[-] vLLM unavailable ({e}).")
        if FIREWORKS_API_KEY:
            from fireworks.client import Fireworks
            fw_client = Fireworks(api_key=FIREWORKS_API_KEY)
            print("[!] Falling back to Fireworks AI.")
        else:
            print("[!] Both vLLM and Fireworks unavailable. AI rationale will be mocked.")
            
    yield
    # Cleanup on shutdown if needed
    
# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(title="Inzex Unicorn Engine", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Volatility 3 — run a single plugin and return structured dict
# ---------------------------------------------------------------------------
VOLATILITY_PLUGINS = [
    "windows.pslist",
    "windows.netscan",
    "windows.malfind",
    "windows.cmdline",
]

def run_volatility_plugin(file_path: str, plugin: str) -> dict:
    """Run one Volatility 3 plugin against file_path. Returns structured dict."""
    try:
        cmd = ["python3", "vol.py", "-f", file_path, plugin, "--json"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        rows = []
        if result.stdout:
            try:
                rows = json.loads(result.stdout)
            except json.JSONDecodeError:
                # Some plugins return line-delimited output — keep as raw lines
                rows = [{"raw": line} for line in result.stdout.splitlines() if line.strip()]
        return {"plugin": plugin, "rows": rows, "anomalies": []}
    except subprocess.TimeoutExpired:
        print(f"[-] Plugin {plugin} timed out.")
        return {"plugin": plugin, "rows": [], "anomalies": ["TIMEOUT"]}
    except Exception as e:
        print(f"[-] Plugin {plugin} failed: {e}")
        return {"plugin": plugin, "rows": [], "anomalies": [str(e)]}

# ---------------------------------------------------------------------------
# Gemma 3 / AI Inference
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a Senior SOC Analyst performing memory forensics. "
    "Analyze the following Volatility 3 output and produce a structured incident report.\n\n"
    "For each finding return:\n"
    "{\n"
    '  "findings": [\n'
    "    {\n"
    '      "title": "string",\n'
    '      "description": "string",\n'
    '      "mitre_technique_id": "T1055",\n'
    '      "mitre_technique_name": "Process Injection",\n'
    '      "confidence": "high|medium|low",\n'
    '      "evidence_plugin": "windows.malfind",\n'
    '      "evidence_line": "exact line from volatility output"\n'
    "    }\n"
    "  ],\n"
    '  "threat_narrative": "string",\n'
    '  "threat_actor_hypothesis": "string"\n'
    "}\n\n"
    "Return only valid JSON. No markdown. No explanation."
)

async def analyze_with_ai(volatility_results: list[dict], human_feedback: Optional[str] = None) -> dict:
    """Pipe Volatility JSON into Gemma 3 (vLLM) or Fireworks fallback."""
    vol_summary = json.dumps(volatility_results, indent=2)
    user_content = f"Volatility 3 Output:\n{vol_summary}"
    if human_feedback:
        user_content += (
            f"\n\nHUMAN ANALYST FEEDBACK — Please re-evaluate based on this context:\n{human_feedback}"
        )

    full_prompt = f"<|system|>\n{SYSTEM_PROMPT}\n<|user|>\n{user_content}\n<|assistant|>\n"

    # --- vLLM path (AMD ROCm) ---
    try:
        from vllm import SamplingParams
        sampling_params = SamplingParams(temperature=0.1, max_tokens=4096)
        request_id = f"inzex-{int(time.time() * 1000)}"
        output_text = ""
        async for request_output in llm_engine.generate(full_prompt, sampling_params, request_id=request_id):
            output_text = request_output.outputs[0].text
        return json.loads(output_text)
    except Exception as e:
        print(f"[-] vLLM inference failed ({e}). Trying fallback.")

    # --- Fireworks fallback ---
    if fw_client:
        try:
            response = fw_client.chat.completions.create(
                model="accounts/fireworks/models/gemma2-9b-it",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                max_tokens=4096,
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e2:
            print(f"[-] Fireworks fallback also failed: {e2}")

    # --- Mock (no AI available) ---
    return {
        "findings": [
            {
                "title": "MOCK: Process Injection Detected",
                "description": "AI inference unavailable — mock finding inserted for pipeline testing.",
                "mitre_technique_id": "T1055",
                "mitre_technique_name": "Process Injection",
                "confidence": "low",
                "evidence_plugin": "windows.malfind",
                "evidence_line": "N/A",
            }
        ],
        "threat_narrative": "MOCK NARRATIVE — No AI engine available during this run.",
        "threat_actor_hypothesis": "Unknown",
    }

# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def create_case_record(case_number: str, examiner_name: str, org: str, classification: str) -> str:
    """Insert a case row and return its UUID."""
    payload = {
        "case_designation": case_number or "Inzex-Alpha",
        "reference_id": classification or "UNCLASSIFIED",
        "status": "analyzing",
    }
    resp = supabase.table("cases").insert(payload).execute()
    return resp.data[0]["id"]


def commit_findings(case_id: str, plugin_results: list[dict], ai_report: dict) -> int:
    """Insert one findings row per AI finding. Returns count of rows inserted."""
    findings = ai_report.get("findings", [])
    rows_inserted = 0
    for finding in findings:
        plugin_name = finding.get("evidence_plugin", "windows.pslist")
        # Match raw plugin data to this finding's plugin
        raw = next((p for p in plugin_results if p["plugin"] == plugin_name), plugin_results[0])
        supabase.table("findings").insert({
            "case_id": case_id,
            "plugin_name": plugin_name,
            "mitre_technique": f"{finding.get('mitre_technique_id', '')} {finding.get('mitre_technique_name', '')}".strip(),
            "severity": _confidence_to_severity(finding.get("confidence", "low")),
            "ai_rationale": finding.get("description", ""),
            "volatility_raw_json": raw,
        }).execute()
        rows_inserted += 1

    # Store threat narrative on the case row itself
    supabase.table("cases").update({
        "status": "completed",
    }).eq("id", case_id).execute()

    return rows_inserted


def _confidence_to_severity(confidence: str) -> str:
    return {"high": "Critical", "medium": "High", "low": "Medium"}.get(confidence.lower(), "Medium")

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/analyze")
async def analyze(
    case_number: str = Form("Inzex-Alpha"),
    examiner_name: str = Form(""),
    org: str = Form(""),
    classification: str = Form("UNCLASSIFIED"),
    files: list[UploadFile] = File(...),
):
    """
    Full pipeline endpoint:
      1. Save uploaded .vmem files to temp dir
      2. Run Volatility 3 plugins on each
      3. Delete temp files
      4. Inference Gemma 4 via vLLM (or Fireworks fallback) on aggregate
      5. Write findings to Supabase
      6. Return case_id
    """
    try:
        # 1. Create Supabase case record
        case_id = create_case_record(case_number, examiner_name, org, classification)
        print(f"[+] Case created: {case_id}")

        plugin_results = []
        
        # Process each file
        for file in files:
            tmp_dir = tempfile.mkdtemp()
            tmp_path = os.path.join(tmp_dir, file.filename or "upload.vmem")
            
            try:
                contents = await file.read()
                with open(tmp_path, "wb") as f:
                    f.write(contents)
                print(f"[+] Received file: {file.filename} ({len(contents) / 1e6:.1f} MB)")

                # 2. Run Volatility plugins sequentially
                for plugin in VOLATILITY_PLUGINS:
                    print(f"[*] Running {plugin} on {file.filename}...")
                    result = run_volatility_plugin(tmp_path, plugin)
                    # Add source file context for AI
                    result["source_file"] = file.filename
                    plugin_results.append(result)
            finally:
                # 3. Delete temp file immediately
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                if os.path.exists(tmp_dir):
                    os.rmdir(tmp_dir)
                print(f"[+] Temp file {file.filename} deleted. Evidence never persisted beyond processing.")

        # 4. AI inference on aggregate results
        print("[*] Running Gemma 4 inference on aggregate results...")
        ai_report = await analyze_with_ai(plugin_results)

        # 5. Commit to Supabase
        count = commit_findings(case_id, plugin_results, ai_report)
        print(f"[+] {count} findings committed for case {case_id}")

        return {
            "case_id": case_id,
            "status": "completed",
            "findings_count": count,
            "threat_narrative": ai_report.get("threat_narrative", ""),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status/{case_id}")
async def get_status(case_id: str):
    """Return current processing status for a case from Supabase."""
    resp = supabase.table("cases").select("id, status, created_at").eq("id", case_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Case not found.")
    findings_resp = supabase.table("findings").select("id", count="exact").eq("case_id", case_id).execute()
    return {
        "case_id": case_id,
        "status": resp.data["status"],
        "created_at": resp.data["created_at"],
        "findings_count": findings_resp.count or 0,
    }


@app.get("/health")
def health():
    return {"status": "ok", "engine": "vLLM" if fw_client is None else "Fireworks"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
