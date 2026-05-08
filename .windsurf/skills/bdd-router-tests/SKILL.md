---
name: bdd-router-tests
description: Use whenever you add or change a tRPC procedure. Enforces a colocated BDD test pair — .feature file plus .steps.ts — in __tests__/ next to the procedure. Blocks "done" until yarn test passes.
---

# BDD Router Tests

Every new or changed tRPC procedure must have BDD coverage in a `__tests__/` folder colocated with the router.

## File layout

```
<router-root>/<feature>/
├── index.ts
├── <procedureName>.ts
└── __tests__/
    ├── <procedureName>.feature
    └── <procedureName>.steps.ts
```

Feature file + steps file must be present. If only one exists, the test is not complete.

## Feature file

Gherkin syntax. One `Feature:` at the top. One or more `Scenario:` blocks that cover:
- The happy path.
- At least one failure mode (invalid input, missing auth, not-found, forbidden).
- Side-effect checks when the procedure writes (row inserted, event emitted, etc.).

## Steps file

Implements each `Given` / `When` / `Then` step in TypeScript, using the project's BDD runner (check neighbouring `.steps.ts` files to follow the exact pattern — do not invent a new runner).

## When you change a procedure

- Update the `.feature` to describe the new/changed behaviour.
- Update the `.steps.ts` so existing scenarios still pass and new scenarios are covered.
- Run `yarn test` (or the narrower workspace-scoped test command) and confirm all scenarios pass.

## What "done" looks like

- Feature + steps files both exist for the procedure.
- `yarn test` passes.
- No scenario is `@skip`-ed or otherwise silenced to "make CI pass".
