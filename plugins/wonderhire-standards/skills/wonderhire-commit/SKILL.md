---
name: wonderhire-commit
description: Use when the user asks to generate a commit message, run /wh-commit, or after staging changes in the Wonderhire repo. Produces Conventional Commit messages and echoes the branch/stage confirmation from wonderhire-standing-rules §2 before committing.
---

# Wonderhire Commit Workflow

Produce Conventional Commits messages and respect the standing-rule pre-commit confirmation.

## Before committing

Echo to the user:

> "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

`<branch>` = `git branch --show-current`. `<stage>` comes from the worktree's Active Development Setup section. Wait for `yes` (or explicit alternative) before running `git commit`.

## Message format

```
<type>(<scope>): <subject>

<body>
```

- **Type:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`.
- **Scope:** optional, usually the package or feature (`api`, `web`, `db`, `infra`, `auth`, `candidates`).
- **Subject:** imperative, lower-case, ≤72 characters, no trailing period.
- **Body:** wrap at ~72 chars. Explain the *why*; the *what* is in the diff. Omit the body for trivial changes.

## Good examples

```
feat(candidates): add JEM import batch endpoint

Imports run in chunks of 100 to keep under the Lambda payload limit,
and use the same ULID scheme as manual creates so downstream scoring
doesn't special-case imports.
```

```
fix(auth): handle expired Supabase session on cold start

Cold starts were racing the tRPC profile query against session refresh
and redirecting authenticated users to /login. Gate on sessionLoaded
before running the redirect effect.
```

## What to avoid

- `chore: stuff`
- `fix: bug`
- `update: misc`
- Trailing periods on the subject.
- Capitalised subjects (`feat: Add candidate endpoint` — wrong).
- Putting "why" in the subject instead of the body.

## What "done" looks like

- Branch/stage confirmation sent and acknowledged.
- Commit runs cleanly (no hook failure). If a hook fails, fix the root cause and make a new commit — do not `--amend` the previous commit or pass `--no-verify`.
- Message follows the Conventional Commits format.
