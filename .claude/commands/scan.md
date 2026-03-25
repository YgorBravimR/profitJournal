---
description: Scan a page/feature for code quality, design, and UX issues — then fix them. Full diagnose→fix pipeline.
allowed-tools: Agent, Read, Glob, Grep, Edit, Write, Bash(pnpm tsc:*), Bash(pnpm build:*), Bash(git diff:*)
---

# Scan & Fix

Systematically scan a target area for issues across code quality, design, and UX — then fix everything in a coordinated sequence.

## Prerequisites

Check if `.impeccable.md` exists at the project root. If it does NOT exist, STOP and tell the user to run `/teach-impeccable` first — all design skills depend on it.

## Target

$ARGUMENTS

If no target is specified, ask the user which page or feature to scan. Do NOT scan the entire codebase at once — scope to a specific route, page, or feature area.

## Phase 1: Diagnose (parallel agents)

Launch these two agents IN PARALLEL to analyze the target:

### Agent 1: Code Quality Audit
Spawn a general-purpose agent with this task:
> Read the target files. Check against:
> 1. `CLAUDE.md` — code conventions (arrow functions, no default exports, no `any`, `import type`, typed functions, early returns, etc.)
> 2. `.claude/skills/react-best-practices/SKILL.md` and scan the key rules in `.claude/skills/react-best-practices/rules/` — React performance patterns
> 3. Check for hardcoded strings that should be in translation files (`messages/*.json`)
>
> Output a markdown report with: file, line, issue, severity (critical/high/medium/low), and which guideline it violates. Do NOT fix anything — report only.

### Agent 2: Design & UX Audit
Spawn a general-purpose agent with this task:
> Read `.impeccable.md` for design context, then read `.claude/skills/frontend-design/SKILL.md` for anti-patterns and design principles. Read the target files and check against:
> 1. `.claude/skills/audit/SKILL.md` — accessibility, performance, theming, responsive issues
> 2. `.claude/skills/critique/SKILL.md` — visual hierarchy, information architecture, emotional resonance
> 3. Check color usage, spacing consistency, typography hierarchy, animation opportunities
>
> Output a markdown report with: component/area, issue, severity, category (a11y/perf/theming/responsive/design), and recommended fix skill (`/arrange`, `/colorize`, `/typeset`, `/clarify`, `/harden`, `/animate`, etc.). Do NOT fix anything — report only.

## Phase 2: Review & Prioritize

After both agents complete:
1. Combine their findings into a single prioritized list
2. Present the combined report to the user as a table:
   | # | Severity | Category | File/Area | Issue | Fix |
3. Group by severity: Critical → High → Medium → Low
4. Ask the user: **"Fix all? Fix critical+high only? Or pick specific items?"**

## Phase 3: Fix (sequential, by category)

After user approval, apply fixes in this order (each step builds on the previous):

1. **Code conventions** — Fix `any` types, missing `import type`, default exports, function syntax
2. **Normalize** — Align to design system tokens (colors, spacing, typography from globals.css)
3. **Arrange** — Fix spacing, visual rhythm, hierarchy issues
4. **Typeset** — Fix typography hierarchy, sizing, weight
5. **Colorize** — Fix color usage, semantic color, contrast
6. **Clarify** — Fix UX copy, error messages, labels
7. **Harden** — Fix edge cases, overflow, error handling
8. **Accessibility** — Fix ARIA, keyboard nav, contrast, semantic HTML
9. **Animate** — Add purposeful motion where the audit identified opportunities
10. **i18n** — Extract any remaining hardcoded strings

For each category, read the corresponding skill SKILL.md for instructions before making changes.

## Phase 4: Verify

After all fixes:
1. Run `pnpm tsc --noEmit` to verify TypeScript compilation
2. Run `git diff --stat` to summarize all changes
3. Present a summary of what was fixed, organized by category

Do NOT commit — let the user decide when to commit.

## Important Rules

- **Never skip Phase 2** — the user must approve before fixes are applied
- **Fix one category at a time** — don't mix spacing fixes with color fixes in the same pass
- **Read the skill before fixing** — each category has specific patterns and anti-patterns
- **Preserve functionality** — fixes should improve quality without changing behavior
- **Check TypeScript after each category** — catch issues early, not at the end
