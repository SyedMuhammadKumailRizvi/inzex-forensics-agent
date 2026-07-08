# Case Intake Form (`/case-intake`)

## Overview
The Case Intake form is the entry point for starting a new Digital Forensics and Incident Response (DFIR) case in Inzex Forensics. It handles the initial upload of raw memory dumps and collects necessary metadata for the investigation.

## Features
- **Case Metadata:** Collects Case Designation, Date, Reference ID, Investigator Name, and OS Hint.
- **OS Profiling:** Allows selection of the target OS Hint (windows, linux, mac) for Volatility 3 to use.
- **Evidence Upload:** Drag-and-drop zone specifically designed for large memory dumps (`.raw`, `.vmem`, `.mem`).
- **Visuals:** Follows a premium SaaS frosted glass aesthetic.

## Data Flow
- The form data is pushed securely via Supabase Auth to the `cases` and `evidence` tables.
- The uploaded file is stored in a Supabase Storage bucket, triggering the AMD Python backend worker.
- Upon submission, it navigates the user while analysis runs autonomously in the background.
