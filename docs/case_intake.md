# Case Intake Form (`case_intake.html`)

## Overview
The Case Intake form is the entry point for starting a new Digital Forensics and Incident Response (DFIR) case in Inzex Forensics. It handles the initial upload of raw memory dumps and collects necessary metadata for the investigation.

## Features
- **Case Metadata:** Collects Case Number, Date, Title, Summary, Investigator Name, and Organization.
- **OS Profiling:** Allows selection of the target OS Profile (Windows, Linux, macOS) for Volatility 3 to use.
- **Evidence Upload:** Drag-and-drop zone specifically designed for large memory dumps (`.raw`, `.vmem`, `.mem`).
- **Visuals:** Follows the dark, high-contrast TraceForge/Inzex design language using Inter and Space Mono.

## Data Flow (Future Next.js Integration)
- The form data will be pushed to the Supabase `Cases` table.
- The uploaded file will be stored or streamed directly to the AMD Hardware backend for Volatility 3 processing.
- Upon submission, it will navigate the user to the `human_review_workspace.html` while analysis runs in the background.
