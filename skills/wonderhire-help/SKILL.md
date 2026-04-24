---
name: wonderhire-help
description: Use when the user runs /wh-help or asks for a quick-reference of Wonderhire standards skills. One-shot display — not a persistent mode.
---

# Wonderhire Standards — Quick Reference

**Tier 1 — always-on (injected every session):**

- `wonderhire-standing-rules` — no silent deploy; maintain worktree context; confirm before merge.
- `wonderhire-build-test-lint-gate` — `yarn build && yarn test && yarn lint:fix` before "done".

**Tier 2 — description-activated (task-scoped):**

- `trpc-procedure` — router modules, Zod inputs, consistent errors.
- `bdd-router-tests` — `.feature` + `.steps.ts` per procedure.
- `knex-migration` — ULID PKs, snake_case, timestamps, FKs.
- `react-tsx-component` — function components, Props at bottom, Tailwind-only.
- `supabase-auth` — session context, `*ProtectedRoute`, profile-completion gates.
- `tanstack-trpc-query` — `useQuery` / `useMutation` patterns, cache invalidation.
- `sst-infra` — stage-based, `af-south-1`, SST secrets.
- `naming-imports-exports` — camel/Pascal/kebab/snake, named exports, `~` alias.
- `code-quality` — DRY, SRP, early returns, no `any`, Zod at boundaries.

**Companion:**

- `wonderhire-commit` — Conventional Commits + branch/stage confirm.
- `wonderhire-review` — audit current diff against every skill above.

**Slash commands (Claude Code):**

- `/wh-help` — this card.
- `/wh-commit` — generate a Conventional Commit for staged changes.
- `/wh-review` — review current branch / staged diff.

**Stop:** `stop wonderhire` or `normal mode` clears session activation.
