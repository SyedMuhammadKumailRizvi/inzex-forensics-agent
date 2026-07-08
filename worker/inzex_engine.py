import os
import subprocess
import json
import time
from supabase import create_client, Client
from fireworks.client import Fireworks

# Init Clients
supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
fw_client = Fireworks(api_key=os.environ.get("FIREWORKS_API_KEY"))

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

def analyze_with_gemma(raw_vol_json):
    """Feeds raw forensic JSON telemetry to Gemma 3 via Fireworks AI"""
    prompt = f"You are an expert DFIR analyst. Analyze this raw Volatility 3 JSON output for malicious indicators. Map any anomalies to MITRE ATT&CK techniques and provide an AI Rationale:\n{json.dumps(raw_vol_json)}"
    
    try:
        response = fw_client.chat.completions.create(
            model="accounts/fireworks/models/gemma2-9b-it", # Fallback target for Gemma testing
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[-] Fireworks AI execution failed: {e}")
        return None

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
            print(f"[-] Error during polling cycle: {e}")
            
        time.sleep(10) # Poll every 10 seconds

if __name__ == "__main__":
    poll_for_new_cases()
