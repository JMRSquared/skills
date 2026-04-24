---
name: wonderhire-review
description: Use when the user asks to review a diff, PR, or branch, or runs /wh-review. Audits the diff against every Wonderhire standards skill and returns a punch list of blockers and suggestions.
---

# Wonderhire PR Review

Audit a diff against the Wonderhire standards skills. Produce a punch list.

## Review inputs

- Current branch diff (`git diff main...HEAD`) — default.
- A specific PR via `gh pr diff <n>` when the user names one.
- A staged diff (`git diff --staged`) when asked to review before commit.

## What to check

For every file in the diff, apply the matching tier-2 skill:

| If the file is… | Apply… |
|-----------------|--------|
| `apps/api/src/router/**/*.ts` | `trpc-procedure`, `bdd-router-tests`, `code-quality`, `naming-imports-exports` |
| `apps/api/src/router/**/__tests__/*` | `bdd-router-tests` |
| `packages/db/migrations/**` | `knex-migration` |
| `apps/web/src/**/*.tsx`, `apps/video-call/src/**/*.tsx`, `packages/web-ui/**/*.tsx` | `react-tsx-component`, `code-quality`, `naming-imports-exports` |
| `apps/web/src/domain/auth/**`, files using `*ProtectedRoute` | `supabase-auth` |
| Files using `useQuery` / `useMutation` via tRPC | `tanstack-trpc-query` |
| `infra/**`, `sst.config.ts` | `sst-infra` |
| Any other `.ts`/`.tsx` | `code-quality`, `naming-imports-exports` |

Always apply: `wonderhire-standing-rules`, `wonderhire-build-test-lint-gate`.

## Output format

One line per finding:

```
<path>:<line>  [blocker|suggestion]  <skill>  <problem>. <fix>.
```

Example:

```
apps/api/src/router/candidates/score.ts:42  blocker  trpc-procedure  No Zod input schema. Wrap the handler's input in z.object({ candidateId: z.string() }).
apps/web/src/domain/candidates/CandidateList.tsx:17  blocker  react-tsx-component  export default used. Switch to a named export.
apps/web/src/domain/candidates/CandidateList.tsx:88  suggestion  code-quality  Six-case if-chain. Replace with a Record<Status, string> lookup.
```

## Signal bar

Block the merge when any of these appear:
- `: any` in new code.
- Missing Zod input on a new tRPC procedure.
- New/changed tRPC procedure without a `.feature` + `.steps.ts` in the same commit.
- `sst deploy` in a script without a guard.
- Default export of a React component.
- Custom CSS file or `<style>` block.
- Untyped DB column in a new migration.
- Missing FK constraint on a new relation.

Suggestions are not blockers — the user decides whether to fix or defer.

## What "done" looks like

- Every file in the diff has been mapped to its skills and checked.
- Blockers and suggestions are listed separately.
- No false positives from skills that don't apply to the file (e.g., don't flag a migration for "no Zod input").
