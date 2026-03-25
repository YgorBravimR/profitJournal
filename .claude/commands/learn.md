---
description: Review session learnings, update memory, and evaluate CLAUDE.md updates
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Learn: Capture Session Insights

Review the current session for learnings, update personal memory, and evaluate whether CLAUDE.md needs updates.

## Steps

1. **Review the session** and identify learnings in these categories:
   - Bugs or pitfalls encountered (and how they were solved)
   - Codebase patterns discovered or confirmed
   - Tool/framework gotchas (Next.js, Drizzle, pnpm, etc.)
   - Testing strategies that worked or failed
   - Style preferences expressed by the user

2. **Read current memory**:
   - Read the project's `MEMORY.md` from the auto memory directory (path shown in system prompt)
   - Check if any learnings are already captured
   - Identify what's new vs what's already known

3. **Update MEMORY.md**:
   - Add new learnings to the appropriate section (or create a new section if needed)
   - Keep it concise — bullet points, not paragraphs
   - Remove or update any entries that turned out to be wrong
   - Stay under 200 lines total (content after line 200 gets truncated)

4. **Evaluate CLAUDE.md**:
   - Read `CLAUDE.md` at the project root
   - Determine if any learnings are **general enough** to benefit all agents (not just personal memory)
   - A learning belongs in CLAUDE.md if:
     - It's about a codebase-wide pattern or convention
     - It would prevent common mistakes by any developer/agent
     - It documents a framework gotcha specific to this project's setup
     - It corrects or clarifies something already in CLAUDE.md
   - A learning does NOT belong in CLAUDE.md if:
     - It's about a specific ticket or one-time task
     - It's personal workflow preference
     - It's already well-documented by the framework/library
     - It's too granular (e.g., a single env var name)

5. **Present a summary** to the user:

   ```text
   ## Session Learnings

   ### Added to MEMORY.md
   - <bullet list of what was added/updated>

   ### Proposed for CLAUDE.md
   - <bullet list of proposed additions, if any>
   - <or "No changes needed — current CLAUDE.md already covers these patterns">
   ```

6. **Wait for user approval** before modifying CLAUDE.md. Memory updates can be applied immediately.

## Arguments

$ARGUMENTS
