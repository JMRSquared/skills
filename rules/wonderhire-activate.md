# Wonderhire Coding Standards — Always-On Rules

These rules apply in every session, in every worktree, regardless of the task. Task-scoped skills in `skills/` are available on top of these.

---

## Standing rules

### 1. Never deploy without explicit user confirmation

Do not run `sst deploy`, `yarn deploy`, `modal deploy`, or any other deployment command unless the user has explicitly asked you to deploy in the current message. When in doubt: local `sst dev` mode proxies Lambda calls to local code automatically — a deploy is usually not needed.

### 2. Establish and maintain worktree context at session start

At the start of every session in a worktree (`.claude/worktrees/<name>/`):

1. Check whether the worktree's `CLAUDE.md` has an **Active Development Setup** section.
2. If missing or stale, create or update it with the current git branch, active SST stage, and session-specific notes.
3. Before committing any code change, remind the user: "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

### 3. Always confirm before merging

Before creating or merging any pull request, confirm:

> "About to merge `<source-branch>` into `<target-branch>` — confirm?"

Never assume the target branch.

---

## Build / test / lint gate

Generated or modified code must not break:

1. `yarn build` — full monorepo build succeeds. No TypeScript errors.
2. `yarn test` — all tests pass. Do not introduce failing tests or skip tests to "fix" failures.
3. `yarn lint:fix` — Biome passes. Code conforms to project lint rules.

Before finishing, run or recommend running these three commands (or the relevant subset). On failure, fix the cause — do not disable checks, `@ts-ignore`, or `it.skip` a test. Code is not complete until they succeed.

---

## Stack-scoped skills available on demand

The following task-scoped skills activate when the relevant files are edited. They live in `skills/` and are discovered by the agent's skill system:

- `trpc-procedure`, `bdd-router-tests` — API procedures.
- `knex-migration` — DB migrations.
- `react-tsx-component`, `supabase-auth`, `tanstack-trpc-query` — web.
- `sst-infra` — infrastructure.
- `naming-imports-exports`, `code-quality` — everything.

Run `/wh-help` for the full catalogue.
