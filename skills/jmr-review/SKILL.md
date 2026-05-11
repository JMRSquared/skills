---
name: jmr-review
description: Use when the user asks to review a diff, PR, or branch, or runs /jmr-review. Audits the diff against every jmrsquared standards skill and returns a punch list of blockers and suggestions.
---

# PR Review

Audit a diff against the jmrsquared standards skills. Produce a punch list.

## Review inputs

- Current branch diff (`git diff main...HEAD`) — default.
- A specific PR via `gh pr diff <n>` when the user names one.
- A staged diff (`git diff --staged`) when asked to review before commit.

## What to check

For every file in the diff, apply the matching tier-2 skill:

| If the file is… | Apply… |
|-----------------|--------|
| A tRPC procedure file | `trpc-procedure`, `bdd-router-tests`, `code-quality`, `naming-imports-exports` |
| A tRPC procedure test file | `bdd-router-tests` |
| A Knex migration file | `knex-migration` |
| A Kysely DB/repository/query file | `kysley-db`, `code-quality`, `naming-imports-exports` |
| A React `.tsx` component | `react-tsx-component`, `code-quality`, `naming-imports-exports` |
| A React Native screen / component (`.tsx` importing from `react-native` or `expo-*`) | `react-native`, `nativewind` (if `className` present), `code-quality`, `naming-imports-exports` |
| Any file importing `@shopify/react-native-skia` | `react-native-skia`, `code-quality` |
| Supabase client, RLS/SQL, Storage, Realtime, Edge (not app auth flow only) | `supabase`, `code-quality` |
| Supabase Auth routes, guards, session context (`ProtectedRoute`, `AuthProvider`) | `supabase-auth` |
| Better Auth (`better-auth`, `authClient`, auth API routes) | `better-auth`, `code-quality` |
| A file using `useQuery` / `useMutation` via tRPC | `tanstack-trpc-query` |
| An SST infra file (`infra/**`, `sst.config.ts`) | `sst-infra` |
| Any other `.ts`/`.tsx` | `code-quality`, `naming-imports-exports` |

Always apply: `jmr-standing-rules`, `jmr-build-test-lint-gate`.

## Output format

One line per finding:

```
<path>:<line>  [blocker|suggestion]  <skill>  <problem>. <fix>.
```

Example:

```
src/api/router/users/score.ts:42  blocker  trpc-procedure  No Zod input schema. Wrap the handler's input in z.object({ userId: z.string() }).
src/web/components/UserList.tsx:17  blocker  react-tsx-component  export default used. Switch to a named export.
src/web/components/UserList.tsx:88  suggestion  code-quality  Six-case if-chain. Replace with a Record<Status, string> lookup.
```

## Signal bar

Block the merge when any of these appear:
- `: any` in new code.
- Missing Zod input on a new tRPC procedure.
- New/changed tRPC procedure without a `.feature` + `.steps.ts` in the same commit.
- A deploy command in a script without a guard.
- Default export of a React component.
- Custom CSS file or `<style>` block.
- Anonymous `renderItem` in a `FlatList` of non-trivial size.
- Per-frame allocation inside a Skia frame callback (`useDerivedValue`, `useFrameCallback`).
- Untyped DB column in a new migration.
- Missing FK constraint on a new relation.

Suggestions are not blockers — the user decides whether to fix or defer.

## What "done" looks like

- Every file in the diff has been mapped to its skills and checked.
- Blockers and suggestions are listed separately.
- No false positives from skills that don't apply to the file (e.g., don't flag a migration for "no Zod input").
