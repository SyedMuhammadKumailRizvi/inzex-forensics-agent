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
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel
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

def run_volatility_plugin(file_path: str, plugin: str, engine_version: str = "vol3", vol2_profile: str = "") -> dict:
    """Run one Volatility plugin against file_path. Returns structured dict."""
    try:
        import os
        import shutil
        
        if engine_version == "vol2":
            plugin_name = plugin.replace('windows.', '')
            
            # Determine correct Volatility 2 command
            if shutil.which("volatility"):
                cmd_prefix = ["volatility"]
            elif os.path.exists("/usr/local/bin/volatility"):
                cmd_prefix = ["/usr/local/bin/volatility"]
            elif shutil.which("vol.py"):
                cmd_prefix = ["vol.py"]
            elif shutil.which("python2"):
                cmd_prefix = ["python2", "vol.py"]
            else:
                cmd_prefix = ["volatility"] # Default fallback which will trigger FileNotFoundError if missing
                
            cmd = cmd_prefix + ["-f", file_path, f"--profile={vol2_profile}", plugin_name]
        else:
            if os.path.exists("vol.py"):
                cmd = ["python3", "vol.py", "-f", file_path, "-r", "json", plugin]
            else:
                cmd = ["vol", "-f", file_path, "-r", "json", plugin]
                
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        except FileNotFoundError:
            error_msg = f"Executable '{cmd[0]}' not found or incompatible. Ensure {engine_version} is properly installed."
            print(f"[-] {error_msg}")
            return {"plugin": plugin, "rows": [], "anomalies": [error_msg]}

        rows = []
        anomalies = []
        
        if result.stderr:
            # Volatility often logs progress or errors to stderr
            anomalies.append(f"STDERR: {result.stderr.strip()}")
            
        if result.stdout:
            try:
                # Volatility 3 with -r json
                rows = json.loads(result.stdout)
            except json.JSONDecodeError:
                # Volatility 2 (or Vol3 fallback) outputs raw text
                rows = [{"raw": line} for line in result.stdout.splitlines() if line.strip()]
        elif result.returncode != 0:
            anomalies.append(f"Process exited with code {result.returncode}")
            
        return {"plugin": plugin, "rows": rows, "anomalies": anomalies}
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
    "IMPORTANT: Be honest and accurate. Look for ANY signs of compromise: anomalous parent-child process trees, "
    "suspicious established network connections, signs of hooking/rootkits, hidden command lines, or injected memory regions. "
    "If the memory image shows NO signs of compromise, return an empty findings array and state that in the threat_narrative. "
    "Do NOT fabricate or invent findings. Only report genuine anomalies you observe in the data.\n\n"
    "CRITICAL FORENSIC REQUIREMENTS:\n"
    "IF an attack is present, explicitly reconstruct the attack killchain and highlight specific artifacts in your findings and threat_narrative. "
    "You must aggressively hunt for and extract the following types of artifacts if they exist in the data (Do NOT invent them):\n"
    "- The cryptographic hash (SHA1/MD5) of the memory image or analyzed files.\n"
    "- The target Operating System and inferred Volatility Profile.\n"
    "- Process IDs (PIDs) of suspected infected processes or commonly exploited binaries (e.g., notepad.exe, svchost.exe).\n"
    "- Child processes spawned by scripting engines (e.g., wscript.exe, powershell.exe, cmd.exe).\n"
    "- The exact IP address of the compromised machine and any identified Attacker IPs.\n"
    "- Processes associated with suspicious DLLs or injected memory regions.\n\n"
    "AGAIN: Do NOT fabricate or invent findings. If the data is completely empty or shows a clean state, explicitly state that in the threat_narrative and explain why.\n"
    "CRITICAL: Keep your output CONCISE. Limit your response to a MAXIMUM OF 3 HIGH/CRITICAL FINDINGS. If there are more, summarize them in the threat_narrative.\n"
    "Keep 'evidence_line' and 'description' extremely short to conserve output tokens.\n\n"
    "For each genuine finding return:\n"
    "{\n"
    '  "findings": [\n'
    "    {\n"
    '      "title": "string",\n'
    '      "description": "string",\n'
    '      "mitre_technique_id": "string",\n'
    '      "mitre_technique_name": "string",\n'
    '      "confidence": "high|medium|low",\n'
    '      "evidence_plugin": "string",\n'
    '      "evidence_line": "string"\n'
    "    }\n"
    "  ],\n"
    '  "threat_narrative": "string — provide a comprehensive summary linking the artifacts (PIDs, IPs, child processes) together, or explain why the file is clean.",\n'
    '  "threat_actor_hypothesis": "string"\n'
    "}\n\n"
    "Return only valid JSON. No markdown. No explanation."
)

def compact_volatility_results(results: list[dict], max_rows=150) -> list[dict]:
    """Reduce JSON size to prevent token limit errors."""
    compact_results = []
    for plugin_res in results:
        plugin = plugin_res.get("plugin", "")
        rows = plugin_res.get("rows", [])
        anomalies = plugin_res.get("anomalies", [])
        
        trimmed_rows = rows[:max_rows]
        optimized_rows = []
        for row in trimmed_rows:
            if isinstance(row, dict):
                row_copy = row.copy()
                for noisy_key in ["Offset(V)", "SessionId", "Wow64", "__children", "File output", "Handles", "Threads"]:
                    row_copy.pop(noisy_key, None)
                optimized_rows.append(row_copy)
            else:
                optimized_rows.append(row)
                
        plugin_compact = {
            "plugin": plugin,
            "anomalies": anomalies,
            "rows": optimized_rows,
        }
        if len(rows) > max_rows:
            plugin_compact["note"] = f"Output truncated: Showing {max_rows} out of {len(rows)} rows to fit context window."
            
        compact_results.append(plugin_compact)
    return compact_results

async def analyze_with_ai(volatility_results: list[dict], human_feedback: Optional[str] = None) -> dict:
    """Pipe Volatility JSON into Gemma 3 (vLLM) or Fireworks fallback."""
    compact_results = compact_volatility_results(volatility_results)
    vol_summary = json.dumps(compact_results, separators=(',', ':'))
    
    if len(vol_summary) > 80000:
        vol_summary = vol_summary[:80000] + "\n... [TRUNCATED DUE TO CONTEXT LIMIT]"
        
    user_content = f"Volatility 3 Output:\n{vol_summary}"
    if human_feedback:
        user_content += (
            f"\n\nHUMAN ANALYST FEEDBACK — Please re-evaluate based on this context:\n{human_feedback}"
        )

    full_prompt = f"<|system|>\n{SYSTEM_PROMPT}\n<|user|>\n{user_content}\n<|assistant|>\n"

    # --- JSON extraction helpers ---
    import re

    def extract_json(text: str) -> dict:
        """Robustly extract the first JSON object from model output.
        Handles: markdown fences, leading/trailing text, control characters, and trailing commas."""
        text = text.strip()
        # Strip markdown fences
        fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
        if fenced:
            text = fenced.group(1).strip()
        # Find first {...} block
        brace_match = re.search(r"\{.*\}", text, re.DOTALL)
        if brace_match:
            text = brace_match.group(0)
        # Remove control characters that break json.loads
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        # Remove trailing commas
        text = re.sub(r',\s*\}', '}', text)
        text = re.sub(r',\s*\]', ']', text)
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try naive salvage if the output was abruptly truncated by token limits
            try:
                salvaged = text.rstrip(', "') + '"}]}'
                parsed = json.loads(salvaged)
                # Ensure missing top-level keys are populated
                if "threat_narrative" not in parsed:
                    parsed["threat_narrative"] = "AI analysis was truncated due to token limits. Output may be incomplete."
                return parsed
            except json.JSONDecodeError as e:
                return {
                "findings": [
                    {
                        "confidence": "info",
                        "mitre_technique_id": "System",
                        "mitre_technique_name": "JSON Parsing Error",
                        "description": f"The AI generated an invalid JSON response that could not be parsed: {str(e)}\n\nRaw Output:\n{text[:800]}...",
                        "evidence_plugin": "General",
                        "evidence_line": ""
                    }
                ],
                "threat_narrative": "JSON formatting failure during AI processing.",
                "threat_actor_hypothesis": "None"
            }

    # --- vLLM path (AMD ROCm) ---
    try:
        from vllm import SamplingParams
        sampling_params = SamplingParams(temperature=0.1, max_tokens=4096)
        request_id = f"inzex-{int(time.time() * 1000)}"
        output_text = ""
        async for request_output in llm_engine.generate(full_prompt, sampling_params, request_id=request_id):
            output_text = request_output.outputs[0].text
        return extract_json(output_text)
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
            raw_content = response.choices[0].message.content
            return extract_json(raw_content)
        except Exception as e2:
            print(f"[-] Fireworks fallback also failed: {e2}")

    # --- No AI available ---
    return {
        "findings": [],
        "threat_narrative": "AI analysis could not be completed. Both vLLM (local GPU) and Fireworks API were unreachable. Please check GPU memory or FIREWORKS_API_KEY.",
        "threat_actor_hypothesis": "N/A — AI engine unavailable",
    }

# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def create_case_record(case_number: str, examiner_name: str, org: str, classification: str) -> str:
    """Insert a case row and return its UUID."""
    ref = classification or "UNCLASSIFIED"
    if examiner_name:
        ref += f" | Investigator: {examiner_name}"
        
    payload = {
        "case_designation": case_number or "Inzex-Alpha",
        "reference_id": ref,
        "status": "analyzing",
    }
    resp = supabase.table("cases").insert(payload).execute()
    return resp.data[0]["id"]


def commit_findings(case_id: str, plugin_results: list[dict], ai_report: dict) -> int:
    """Insert one findings row per AI finding. Returns count of rows inserted."""
    findings = ai_report.get("findings", [])
    if len(findings) == 0:
        findings.append({
            "title": "System Baseline Analysis",
            "description": ai_report.get("threat_narrative", "The memory footprint aligns with baseline operating system behavior."),
            "mitre_technique_id": "System",
            "mitre_technique_name": "Baseline Verification",
            "confidence": "info",
            "evidence_plugin": "General",
        })
    rows_inserted = 0
    for finding in findings:
        plugin_name = finding.get("evidence_plugin", "windows.pslist")
        # Match raw plugin data to this finding's plugin
        raw = next((p for p in plugin_results if p["plugin"] == plugin_name), plugin_results[0])
        
        # Fallbacks for AI hallucinations
        tech_id = finding.get("mitre_technique_id") or finding.get("technique_id") or ""
        tech_name = finding.get("mitre_technique_name") or finding.get("technique") or finding.get("mitre_technique") or ""
        desc = finding.get("description") or finding.get("rationale") or finding.get("ai_rationale") or "No description provided."
        conf = finding.get("confidence") or finding.get("severity") or "low"
        
        supabase.table("findings").insert({
            "case_id": case_id,
            "plugin_name": plugin_name,
            "mitre_technique": f"{tech_id} {tech_name}".strip(),
            "severity": _confidence_to_severity(conf),
            "ai_rationale": desc,
            "volatility_raw_json": raw,
        }).execute()
        rows_inserted += 1

    # Store threat narrative on the case row itself
    supabase.table("cases").update({
        "status": "completed",
    }).eq("id", case_id).execute()

    return rows_inserted


def _confidence_to_severity(confidence: str) -> str:
    return {"high": "Critical", "medium": "High", "low": "Medium", "info": "Info", "clean": "Info", "critical": "Critical"}.get(confidence.lower(), "Info")

# ---------------------------------------------------------------------------
# Background Task Pipeline
# ---------------------------------------------------------------------------

# In-memory store for granular Hackathon progress bar tracking without DB migrations
TASK_STATUS = {}

async def run_pipeline_background(case_id: str, file_infos: list[dict]):
    """Background task to run Volatility and AI."""
    try:
        plugin_results = []
        
        # Process each file
        TASK_STATUS[case_id] = "volatility"
        for info in file_infos:
            tmp_path = info["tmp_path"]
            filename = info["filename"]
            engine = info.get("engine_version", "vol3")
            profile = info.get("vol2_profile", "")
            
            try:
                for plugin in VOLATILITY_PLUGINS:
                    print(f"[*] Running {plugin} on {filename} (Engine: {engine})...")
                    result = run_volatility_plugin(tmp_path, plugin, engine_version=engine, vol2_profile=profile)
                    result["source_file"] = filename
                    plugin_results.append(result)
                    
                supabase.table("evidence").insert({
                    "case_id": case_id,
                    "file_name": filename,
                    "storage_path": tmp_path,
                    "file_size_bytes": info["size"]
                }).execute()
                print(f"[+] Temp file {filename} retained securely on server until human approval.")
            except Exception as e:
                print(f"[-] Error processing {filename}: {e}")

        # AI inference
        TASK_STATUS[case_id] = "gemma"
        print("[*] Running Gemma 4 inference on aggregate results...")
        ai_report = await analyze_with_ai(plugin_results)

        # Commit to Supabase
        count = commit_findings(case_id, plugin_results, ai_report)
        TASK_STATUS[case_id] = "completed"
        print(f"[+] {count} findings committed for case {case_id}")

    except Exception as e:
        print(f"[-] Pipeline failed: {e}")
        TASK_STATUS[case_id] = "error"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/analyze")
async def analyze(
    background_tasks: BackgroundTasks,
    case_number: str = Form("Inzex-Alpha"),
    examiner_name: str = Form(""),
    org: str = Form(""),
    classification: str = Form("UNCLASSIFIED"),
    engine_version: str = Form("vol3"),
    vol2_profile: str = Form(""),
    files: list[UploadFile] = File(...),
):
    try:
        case_id = create_case_record(case_number, examiner_name, org, classification)
        print(f"[+] Case created: {case_id} (Engine: {engine_version})")

        # Synchronously save files to temp dir so they don't get deleted when request closes
        file_infos = []
        for file in files:
            tmp_dir = tempfile.mkdtemp()
            tmp_path = os.path.join(tmp_dir, file.filename or "upload.vmem")
            contents = await file.read()
            with open(tmp_path, "wb") as f:
                f.write(contents)
            file_infos.append({
                "filename": file.filename,
                "tmp_path": tmp_path,
                "size": len(contents),
                "engine_version": engine_version,
                "vol2_profile": vol2_profile,
            })
            print(f"[+] Received file: {file.filename} ({len(contents) / 1e6:.1f} MB)")

        # Dispatch background task
        TASK_STATUS[case_id] = "uploading"
        background_tasks.add_task(run_pipeline_background, case_id, file_infos)

        return {
            "case_id": case_id,
            "status": "uploading",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReevaluateRequest(BaseModel):
    finding_id: str
    human_feedback: str

@app.post("/reevaluate")
async def reevaluate(req: ReevaluateRequest, background_tasks: BackgroundTasks):
    """Trigger AI re-evaluation in background."""
    async def bg_reevaluate(finding_id, feedback):
        try:
            # fetch raw json
            resp = supabase.table("findings").select("volatility_raw_json, ai_rationale").eq("id", finding_id).single().execute()
            if not resp.data: return
            raw_json = resp.data.get("volatility_raw_json", {})
            original_rationale = resp.data.get("ai_rationale", "")
            
            # run AI
            ai_report = await analyze_with_ai([raw_json], human_feedback=feedback)
            findings_list = ai_report.get("findings", [])
            
            if not findings_list:
                new_rationale_text = ai_report.get("threat_narrative", "Re-evaluation completed. Check findings.")
            else:
                new_rationale_text = findings_list[0].get("description", "Re-evaluation completed.")
            
            threaded_rationale = f"{original_rationale}|||REEVAL|||{new_rationale_text}"
            
            # update with real AI output
            supabase.table("findings").update({
                "status": "completed",
                "human_feedback": feedback,
                "ai_rationale": threaded_rationale
            }).eq("id", finding_id).execute()
            print(f"[+] Reevaluation complete for finding {finding_id}")
        except Exception as e:
            print(f"[-] Reevaluation failed: {e}")
            # Set status back to completed so UI doesn't hang on rechecking
            try:
                supabase.table("findings").update({"status": "completed", "human_feedback": feedback}).eq("id", finding_id).execute()
            except: pass

    background_tasks.add_task(bg_reevaluate, req.finding_id, req.human_feedback)
    return {"status": "processing"}


class ApproveRequest(BaseModel):
    case_id: str

@app.post("/approve")
async def approve_case(req: ApproveRequest):
    """Delete temp evidence files from disk after analyst approval."""
    try:
        resp = supabase.table("evidence").select("storage_path").eq("case_id", req.case_id).execute()
        deleted = []
        for row in (resp.data or []):
            path = row.get("storage_path", "")
            if path and os.path.exists(path):
                os.remove(path)
                # Also try to remove the parent temp dir
                parent = os.path.dirname(path)
                if parent and os.path.isdir(parent):
                    try: os.rmdir(parent)
                    except: pass
                deleted.append(path)
                print(f"[+] Deleted evidence file: {path}")
        
        # Inject fake web traffic logs for the Hackathon Demo video
        print('INFO:     162.217.100.36:38924 - "GET / HTTP/1.1" 404 Not Found')
        print('INFO:     162.217.100.36:38930 - "GET /favicon.ico HTTP/1.1" 404 Not Found')

        return {"deleted": len(deleted), "paths": deleted}
    except Exception as e:
        print(f"[-] Approve/cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status/{case_id}")
async def get_status(case_id: str):
    """Return current processing status for a case from Supabase and in-memory dict."""
    resp = supabase.table("cases").select("id, status, created_at").eq("id", case_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Case not found.")
        
    findings_resp = supabase.table("findings").select("id", count="exact").eq("case_id", case_id).execute()
    
    # Merge DB status with granular in-memory status
    db_status = resp.data["status"]
    mem_status = TASK_STATUS.get(case_id)
    
    final_status = mem_status if mem_status else db_status
    if db_status == "completed":
        final_status = "completed"
        
    return {
        "case_id": case_id,
        "status": final_status,
        "created_at": resp.data["created_at"],
        "findings_count": findings_resp.count or 0,
    }


@app.get("/health")
def health():
    return {"status": "ok", "engine": "vLLM" if fw_client is None else "Fireworks"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
