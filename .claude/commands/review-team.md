---
description: Launch a multi-agent review team for code quality, i18n, design, and then commit
allowed-tools: Agent, Bash(git diff:*), Bash(git status:*), Read, Glob, Grep
---

# Review Team

Launch a coordinated multi-agent team to review and fix code, then commit the results.

## Phase 1: Parallel Review (launch all at once)

Spawn these agents in parallel:

1. **@react-guidelines-enforcer** — Review code against CLAUDE.md conventions and react-best-practices rules. Fix violations.
2. **@i18n-translator** — Audit for hardcoded strings that need translation. Extract and add to translation files.
3. **@code-simplifier** — Look for code simplifications, redundancy, and clarity improvements.

## Phase 2: Commit

After all reviewers complete, use **@git-commit-helper** to stage and commit all changes. The commit message should describe the code changes (what was fixed in the diff), NOT what the reviewers did.

## Important

- Each reviewer works independently — they should not conflict since they focus on different concerns
- If a reviewer finds no issues, that's fine — not every file needs changes
- The commit message should be about the actual code changes, not about the review process

Focus on: $ARGUMENTS
