# jmrsquared Coding Standards — Always-On Rules

These rules apply in every session, in every worktree, regardless of the task. Task-scoped skills in `skills/` are available on top of these.

---

## Standing rules

### 1. Never deploy without explicit user confirmation

Do not run any deploy command (`sst deploy`, `vercel deploy`, `flyctl deploy`, `yarn deploy`, `modal deploy`, `gcloud run deploy`, etc.) unless the user has explicitly asked you to deploy in the current message. When in doubt: a local dev mode (e.g. `sst dev`, `next dev`, `vite dev`) is usually sufficient — a deploy is rarely needed during iteration.

### 2. Establish and maintain worktree context at session start

At the start of every session in a worktree:

1. Check whether the worktree's `CLAUDE.md` (or equivalent agent context file) has an **Active Development Setup** section.
2. If missing or stale, create or update it with the current git branch, active deployment stage, and session-specific notes.
3. Before committing any code change, remind the user: "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

### 3. Always confirm before merging

Before creating or merging any pull request, confirm:

> "About to merge `<source-branch>` into `<target-branch>` — confirm?"

Never assume the target branch.

---

## Build / test / lint gate

Generated or modified code must not break:

1. `yarn build` — full build succeeds. No TypeScript errors.
2. `yarn test` — all tests pass. Do not introduce failing tests or skip tests to "fix" failures.
3. `yarn lint:fix` — linting passes. Code conforms to project lint rules.

Before finishing, run or recommend running these three commands (or the relevant subset). On failure, fix the cause — do not disable checks, `@ts-ignore`, or `it.skip` a test. Code is not complete until they succeed.

---

## Stack-scoped skills available on demand

The following task-scoped skills activate when the relevant files are edited. They live in `skills/` and are discovered by the agent's skill system:

- `trpc-procedure`, `bdd-router-tests` — API procedures.
- `knex-migration` — DB migrations.
- `react-tsx-component`, `better-auth`, `supabase`, `supabase-auth`, `tanstack-trpc-query` — web.
- `sst-infra` — infrastructure.
- `naming-imports-exports`, `code-quality` — everything.

Run `/jmr-help` for the full catalogue.
