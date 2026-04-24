---
name: trpc-procedure
description: Use when editing or adding tRPC procedures under apps/api/src/router/**. Enforces modular router-per-feature layout, Zod input validation, consistent error patterns, named exports, and strict types. Pairs with bdd-router-tests.
---

# tRPC Procedure Standards (Wonderhire API)

Apply when editing any file under `apps/api/src/router/**` or adding a new router module. Pairs with `bdd-router-tests` — every new or changed procedure needs a BDD test updated in the same commit.

## Structure

- One directory per feature: `apps/api/src/router/<feature>/` with `index.ts` exporting the router and individual procedure files.
- Routers compose via `router({ ... })`; do not flatten unrelated procedures into a single router.
- Merge feature routers into the app router exactly once, in `apps/api/src/trpc/` (or wherever the existing root router lives — follow the pattern already used by neighbouring features).

## Input validation

- Every procedure with input must declare a Zod schema via `.input(z.object({ ... }))`. No untyped input.
- Reuse Zod schemas from `packages/` when a shape already exists. Do not duplicate.
- Output types flow from the implementation; only add `.output()` when the runtime shape must be narrower than the TS return type.

## Error handling

- Throw `TRPCError` with a specific `code` (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`, etc.). Never return `{ error: ... }` ad hoc.
- Map known service errors to tRPC codes at the boundary. Let unknown errors bubble — the global handler maps them to `INTERNAL_SERVER_ERROR`.
- Include a human-readable `message` and, when useful, a structured `cause` for the client.

## Authorization

- Auth is enforced via tRPC middleware (`protectedProcedure`, `recruiterProcedure`, etc.). Do not re-check auth inside the procedure body unless you're narrowing to a stricter rule.
- For candidate- vs recruiter-scoped procedures, choose the correct base procedure. If none exists and the task needs a new scope, create the middleware first.

## Imports & exports

- Named exports only.
- Absolute imports via `~` alias.
- External deps first, then internal, then relative — Biome import-sort handles ordering; do not fight it.

## What "done" looks like

- New/changed procedure has a BDD test (`.feature` + `.steps.ts`) in `__tests__/` in the same directory.
- `yarn build`, `yarn test`, `yarn lint:fix` all pass.
- No `any`. No untyped Zod. No ad-hoc error shapes.
