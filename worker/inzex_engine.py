import os
import subprocess
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from fireworks.client import Fireworks

# Load .env.local from the parent directory (Next.js root)
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Init Clients (Mapping to the Next.js .env.local variable names)
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Make Fireworks optional for testing
fw_client = None
if FIREWORKS_API_KEY:
    fw_client = Fireworks(api_key=FIREWORKS_API_KEY)
else:
    print("[!] FIREWORKS_API_KEY not found. AI Inference will be mocked.")

def run_volatility_analysis(file_path, plugin_name="windows.pslist"):
    """Runs Volatility 3 CLI tool via subprocess and returns raw JSON data"""
    try:
        # Note: adjust the path to vol.py if necessary for your environment
        cmd = ["python3", "vol.py", "-f", file_path, plugin_name, "--json"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except Exception as e:
        print(f"[-] Volatility execution failed: {e}")
        return None

def analyze_with_gemma(raw_vol_json, human_feedback=None):
    """Feeds raw forensic JSON telemetry to Gemma 3 via Fireworks AI"""
    if not fw_client:
        return "MOCK AI RATIONALE: Process injection detected in memory regions with PAGE_EXECUTE_READWRITE permissions (Simulated because Fireworks API key is missing)."

    prompt = f"You are an expert DFIR analyst. Analyze this raw Volatility 3 JSON output for malicious indicators. Map any anomalies to MITRE ATT&CK techniques and provide an AI Rationale:\n{json.dumps(raw_vol_json)}"
    
    if human_feedback:
        prompt += f"\n\nTHE HUMAN ANALYST HAS CHALLENGED YOUR PREVIOUS FINDING WITH THIS FEEDBACK: '{human_feedback}'. Please re-evaluate the data based on this feedback and provide an updated rationale."
    
    try:
        response = fw_client.chat.completions.create(
            model="accounts/fireworks/models/gemma2-9b-it", # Fallback target for Gemma testing
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[-] Fireworks AI execution failed: {e}")
        return "ERROR: AI Inference failed."

def commit_finding_to_supabase(case_id, plugin, technique, rationale, raw_json):
    """Pushes the payload directly into our public.findings database table"""
    payload = {
        "case_id": case_id,
        "plugin_name": plugin,
        "mitre_technique": technique,
        "severity": "High",
        "ai_rationale": rationale,
        "volatility_raw_json": raw_json, # Written directly as native JSONB
    }
    
    try:
        # Insert the finding
        supabase.table("findings").insert(payload).execute()
        # Mark case as completed
        supabase.table("cases").update({"status": "completed"}).eq("id", case_id).execute()
        print(f"[+] Successfully committed finding and completed case {case_id}")
    except Exception as e:
        print(f"[-] Database commit failed: {e}")

def poll_for_new_cases():
    """Polls the database for cases that need analysis"""
    print("[*] Worker started, polling for pending cases...")
    while True:
        try:
            # Query for pending cases
            response = supabase.table("cases").select("*").eq("status", "pending").execute()
            cases = response.data
            
            for case in cases:
                case_id = case["id"]
                print(f"[*] Processing case: {case_id}")
                
                # Mark as analyzing
                supabase.table("cases").update({"status": "analyzing"}).eq("id", case_id).execute()
                
                # In a real scenario, you'd fetch the evidence file path from the evidence table here
                # evidence_resp = supabase.table("evidence").select("*").eq("case_id", case_id).execute()
                # file_path = evidence_resp.data[0]["storage_path"]
                
                # Mock file path for demonstration
                file_path = "mock_dump.vmem" 
                
                raw_json = run_volatility_analysis(file_path)
                
                if raw_json:
                    rationale = analyze_with_gemma(raw_json)
                    technique = "T1055 Process Injection" # Ideally parsed from Gemma's output
                    commit_finding_to_supabase(case_id, "windows.pslist", technique, rationale, raw_json)
                else:
                    print(f"[-] Failed to extract volatility data for case {case_id}")
                    supabase.table("cases").update({"status": "pending"}).eq("id", case_id).execute()
                    
        except Exception as e:
            print(f"[-] Error during pending cases polling cycle: {e}")
            
        try:
            # Query for rechecking findings
            recheck_resp = supabase.table("findings").select("*").eq("status", "rechecking").execute()
            recheck_findings = recheck_resp.data
            
            for finding in recheck_findings:
                finding_id = finding["id"]
                case_id = finding["case_id"]
                feedback = finding["human_feedback"]
                raw_json = finding["volatility_raw_json"]
                
                print(f"[*] Re-evaluating finding: {finding_id} based on human feedback.")
                
                new_rationale = analyze_with_gemma(raw_json, human_feedback=feedback)
                
                # Update the finding
                supabase.table("findings").update({
                    "status": "pending",
                    "ai_rationale": new_rationale,
                    "human_feedback": None # clear it after processing
                }).eq("id", finding_id).execute()
                
                # Mark case as completed again
                supabase.table("cases").update({"status": "completed"}).eq("id", case_id).execute()
                print(f"[+] Successfully re-evaluated finding {finding_id}")
                
        except Exception as e:
            print(f"[-] Error during rechecking polling cycle: {e}")
            
        time.sleep(10) # Poll every 10 seconds

if __name__ == "__main__":
    poll_for_new_cases()
