# Agent Documentation Instructions

When working on the Inzex Forensics project, please adhere to the following documentation guidelines:

1. **Maintain Component Docs:** Every time a new UI component, page, or feature is built or modified, update the corresponding markdown file in the `docs/` directory. If creating a new component, create a new doc file for it.
2. **Update README.md:** Ensure `README.md` reflects the current state of the application architecture, how to run it locally, and recent major feature additions.
3. **Log Actions:** Use `dev_log.md` to append a summary of any session's work. Include a timestamp and a brief explanation of what was achieved.
4. **Architectural Alignment:** Keep the Next.js frontend, Supabase schema, and Python backend documented so the data flow remains clear (Memory Dump -> Volatility 3 -> Gemma 3 -> JSON Report -> Supabase -> Next.js UI).
