---
name: jmr-help
description: Use when the user runs /jmr-help or asks for a quick-reference of jmrsquared standards skills. One-shot display — not a persistent mode.
---

# jmrsquared Standards — Quick Reference

**Tier 1 — always-on (injected every session):**

- `jmr-standing-rules` — no silent deploy; maintain worktree context; confirm before merge.
- `jmr-build-test-lint-gate` — `yarn build && yarn test && yarn lint:fix` before "done".

**Tier 2 — description-activated (task-scoped):**

- `trpc-procedure` — router modules, Zod inputs, consistent errors.
- `bdd-router-tests` — `.feature` + `.steps.ts` per procedure.
- `knex-migration` — ULID PKs, snake_case, timestamps, FKs.
- `kysley-db` — Kysely query builder usage, typed schema, safe raw SQL, transactions.
- `react-tsx-component` — function components, Props at bottom, Tailwind-only.
- `better-auth` — Better Auth config, adapters, server vs client, session APIs.
- `supabase` — RLS, keys, client vs service role, Storage, Realtime, Edge.
- `supabase-auth` — Supabase Auth + React context, guards, OAuth callback.
- `tanstack-trpc-query` — `useQuery` / `useMutation` patterns, cache invalidation.
- `react-native` — Expo RN components, Expo Router, FlatList perf, EAS / OTA discipline.
- `nativewind` — className-only styling, design tokens, dark / platform variants, `cssInterop`.
- `react-native-skia` — Canvas hierarchy, Reanimated-driven shared values, memoized paths / shaders.
- `sst-infra` — stage-based, single region, SST secrets.
- `naming-imports-exports` — camel/Pascal/kebab/snake, named exports, `~` alias.
- `code-quality` — DRY, SRP, early returns, no `any`, Zod at boundaries.

**Companion:**

- `jmr-commit` — [Gitmoji](https://gitmoji.dev/) + Conventional Commits + branch/stage confirm.
- `jmr-review` — audit current diff against every skill above.

**Slash commands (Claude Code):**

- `/jmr-help` — this card.
- `/jmr-commit` — generate a Gitmoji + Conventional Commit message for staged changes.
- `/jmr-review` — review current branch / staged diff.

**Stop:** `stop jmrsquared` or `normal mode` clears session activation.
