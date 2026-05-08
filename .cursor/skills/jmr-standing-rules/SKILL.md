---
name: jmr-standing-rules
description: Always-applicable session rules for any AI assistant working in a project that uses jmrsquared-standards. Enforces deployment safety, worktree context tracking, and branch-merge confirmation. Loaded on every SessionStart by the Claude Code hook; injected as always-on rules into Cursor, Windsurf, Cline, Copilot, Codex, and Gemini.
---

# Standing Rules

These three rules apply in every session, in every worktree, regardless of the task. Never override without explicit user instruction in the current turn.

## 1. Never deploy without explicit user confirmation

Do not run any deploy command (`sst deploy`, `vercel deploy`, `flyctl deploy`, `yarn deploy`, `modal deploy`, `gcloud run deploy`, etc.) unless the user has explicitly asked you to deploy in the current message.

If a deploy feels necessary, explain why and ask first. When in doubt: a local dev mode (e.g. `sst dev`, `next dev`, `vite dev`) is usually sufficient — a deploy is rarely needed during iteration.

## 2. Establish and maintain worktree context at session start

At the start of every session in a worktree:

1. Check whether the worktree's `CLAUDE.md` (or equivalent agent context file) has an **Active Development Setup** section.
2. If missing or stale, create or update it with:
   - Current git branch (`git branch --show-current`)
   - Active deployment target / stage (ask the user if unknown)
   - Any other session-specific notes (feature being built, tests to run)
3. Before committing any code change, remind the user:
   > "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

## 3. Always confirm before merging

Before creating or merging any pull request, explicitly state and confirm:

> "About to merge `<source-branch>` into `<target-branch>` — confirm?"

Never assume the target branch. If the user says "push and merge" without specifying a target, ask which branch should be merged into which before proceeding.
