# Developer Log

**2026-07-07 17:15 +0500**
- Refactored PCAP mockup HTML files into the Memory Forensics domain for Inzex Forensics.
- Updated `case_intake.html` for memory dump uploads (.raw, .vmem) and case metadata.
- Created `human_review_workspace.html` featuring a side-by-side view of Volatility 3 plugin output and Gemma 3 AI inference, including Approve/Reject actions for human-in-the-loop review.
- Created `memory_browser.html` for manual inspection of process memory structures and hex dumps.
- Initialized `.env`, `claude.md`, and component documentation in `docs/`.

**2026-07-07 17:30 +0500**
- Initialized Next.js App Router project and converted all static HTML mockups into React components (`src/app/page.tsx`, `src/app/case-intake/page.tsx`, `src/app/workspace/page.tsx`, `src/app/memory-browser/page.tsx`).
- Stripped Tailwind configuration to enforce pure Vanilla CSS per project requirements.
- Cleaned up root directory by deleting legacy `.html` mockups and default Next.js boilerplate assets (SVGs).

**2026-07-08 (Current Session)**
- **Authentication & Global Layout:** Integrated Supabase Auth for Email/Password and Google OAuth. Built a global, sticky `Navbar` with functional User Profile dropdowns, and enforced correct post-auth routing (redirecting to `/` rather than `/history`).
- **UI/UX Polishing & Layout Fixes:** Resolved severe layout issues including global `overflow: hidden` scroll blocking, fixed text-wrapping on the main Hero gradient heading (`whitespace-nowrap`), and repaired z-index/clipping issues on dropdown menus.
- **Case Intake (`/case-intake`) Overhaul:** Completely rebuilt the intake form into a premium, segmented SaaS interface with a frosted glass upload zone. Wired all inputs to React `useState` to generate a strict JSON payload matching the `inzex_engine.py` wrapper API (utilizing Volatility 3 symbol hints and specific plugin depth maps). Conditionally hid the marketing Navbar for this route.
- **Memory Browser (`/memory-browser`) Refactor:** Converted the mock table into a highly technical, stateful component. Implemented an interactive Plugin Selector. Enforced strict Volatility 3 schema accuracy by separating `windows.pslist` (PID, PPID, CreateTime) from `windows.malfind` (Detail panel, PAGE_EXECUTE_READWRITE anomaly, MZ Hex Dump, and Gemma 3 process injection citations).
- **React Runtime Fix:** Corrected a critical "Rendered fewer hooks than expected" crash by reordering `usePathname` early returns in `Navbar.tsx` below `useEffect` declarations.
- **Database & Backend Architecture:** Established strict Supabase PostgreSQL schema (`cases`, `evidence`, `findings` with JSONB), generated corresponding TypeScript interfaces (`database.ts`), and implemented `getFindingsForCase` Server Action.
- **Python Worker Node:** Created `inzex_engine.py` (stateless AMD worker) to handle DB polling, execute Volatility 3 via subprocess, and generate threat inferences via Fireworks AI (Gemma 3) API.
