# Human Review Workspace (`human_review_workspace.html`)

## Overview
This is the core dashboard of the Inzex Forensics platform. It embodies the "Human-in-the-Loop" philosophy, ensuring that AI-generated inferences from Gemma 3 are always auditable against the raw Volatility 3 forensic data.

## Layout & Components
1. **Left Panel - Analysis Stages:**
   - Displays a timeline of Volatility 3 plugins executed (e.g., `windows.pslist`, `windows.malfind`).
   - Acts as a navigation menu to filter the findings.

2. **Center Panel - Raw Volatility 3 Output:**
   - Mimics a terminal environment, displaying raw command-line output from Volatility 3.
   - Highlights specific "hit lines" (e.g., an injected PE header hex dump).
   - Draws an SVG spline connecting the selected hit line to the Gemma 3 panel on the right.

3. **Right Panel - Gemma 3 AI Inference:**
   - Displays the AI's conclusion based on the raw data (e.g., MITRE ATT&CK mapping, Confidence Score).
   - Provides the rationale for the flag.
   - Contains crucial `Approve / Add to Report` and `Reject / Dismiss` action buttons.

## Data Flow
- Receives structured JSON from the Python/Gemma backend.
- Reads `Findings` from Supabase to populate the UI.
- Actions taken on the right panel update the finding status in the database.
