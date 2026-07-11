# Memory Browser (`/memory-browser`)

## Overview
The Memory Browser provides a granular, manual view of the data extracted from the memory dump. While the AI highlights critical findings in the Human Review Workspace, analysts use the Memory Browser to investigate adjacent processes or deep-dive into hex dumps manually.

## Features
- **Process Table:** A scannable list of processes including PID, Parent PID, Virtual Offsets, Threads, and Handles.
- **Filtering:** A top filter bar simulating a query language (e.g., `Process == svchost.exe`).
- **AI Flag Integration:** Rows flagged by Gemma 4 are highlighted in red and feature a badge, seamlessly tying manual browsing with AI analysis.
- **Detail Panel:** Clicking a row opens a breakdown of process properties and raw hex dumps for the memory offset.

## Data Flow
- Operates on strict JSON payloads securely fetched using the `getFindingsForCase` Next.js server action.
- Directly maps the native `JSONB` data structure stored in the Supabase `findings` table into interactive React data tables.
