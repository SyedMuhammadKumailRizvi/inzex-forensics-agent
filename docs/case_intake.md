# Case Intake Form (`/case-intake`)

## Overview
The Case Intake form is the entry point for starting a new Digital Forensics and Incident Response (DFIR) case in Inzex Forensics. It handles the initial upload of raw memory dumps and collects necessary metadata for the investigation.

## Features
- **Case Metadata:** Collects Case Designation, Date, Reference ID, Investigator Name, and OS Hint.
- **OS Profiling:** Allows selection of the target OS Hint (windows, linux, mac) for Volatility 3 to use.
- **Evidence Upload:** Drag-and-drop zone with multi-file support specifically designed for large memory dumps (`.raw`, `.vmem`, `.mem`).
- **Visuals:** Follows a premium SaaS frosted glass aesthetic.

## Data Flow
- The form data and binary payload are posted securely and directly via multipart form-data to the AMD Python backend worker.
- Files never touch Supabase Storage. They remain on the isolated backend environment.
- The UI actively polls `/status/{case_id}` to animate the progress bar through the backend processing stages (uploading, volatility, gemma).
- Upon completion, the user is navigated to their analysis workspace automatically.
