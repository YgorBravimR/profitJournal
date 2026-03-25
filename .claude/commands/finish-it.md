---
description: Multi-agent review team — code quality, i18n, design, simplification, then commit
allowed-tools: Agent, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Read, Glob, Grep, Edit
---

# Finish It

Create an agent team to coordinate multiple agents reviewing the code:

## Phase 1: Review (launch ALL in parallel)

1. **@react-guidelines-enforcer** — Review against CLAUDE.md conventions and react-best-practices rules. Fix violations.
2. **@i18n-translator** — Audit for hardcoded strings that should be in translation files. Extract and add keys.
3. **@code-simplifier** — Look for simplifications, redundancy, and clarity improvements on recently changed code.

## Phase 2: Commit

After all reviewers complete, use **@git-commit-helper** to stage and commit all changes.

The commit message should be about the actual code changes in the diff — NOT about what the reviewers did.

Focus on: $ARGUMENTS
