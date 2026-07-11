import os
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://ykuodpojspgbzzmoutoh.supabase.co")
key = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrdW9kcG9qc3BnYnp6bW91dG9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ0OTA4NCwiZXhwIjoyMDk5MDI1MDg0fQ.0Oxd1joKguOzxOiy59N9i4jPWK4YErEaytIAbH9iOGM")
supabase = create_client(url, key)

print("Wiping all cases from database...")
resp = supabase.table("cases").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
print("Database wiped successfully! Cascading deletes handled evidence and findings.")
