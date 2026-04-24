---
name: wonderhire-standing-rules
description: Always-applicable session rules for any AI assistant working in the Wonderhire monorepo. Enforces deployment safety, worktree context tracking, and branch-merge confirmation. Loaded on every SessionStart by the Claude Code hook; injected as always-on rules into Cursor, Windsurf, Cline, Copilot, Codex, and Gemini.
---

# Wonderhire Standing Rules

These three rules apply in every session, in every worktree, regardless of the task. Never override without explicit user instruction in the current turn.

## 1. Never deploy without explicit user confirmation

Do not run `sst deploy`, `yarn deploy`, `modal deploy`, or any other deployment command unless the user has explicitly asked you to deploy in the current message.

If a deploy feels necessary, explain why and ask first. When in doubt: local `sst dev` mode proxies Lambda calls to local code automatically — a deploy is usually not needed.

## 2. Establish and maintain worktree context at session start

At the start of every session in a worktree (`.claude/worktrees/<name>/`):

1. Check whether the worktree's `CLAUDE.md` has an **Active Development Setup** section.
2. If missing or stale, create or update it with:
   - Current git branch (`git branch --show-current`)
   - Active SST stage (ask the user if unknown)
   - Any other session-specific notes (feature being built, tests to run)
3. Before committing any code change, remind the user:
   > "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

## 3. Always confirm before merging

Before creating or merging any pull request, explicitly state and confirm:

> "About to merge `<source-branch>` into `<target-branch>` — confirm?"

Never assume the target branch. If the user says "push and merge" without specifying a target, ask which branch should be merged into which before proceeding.
