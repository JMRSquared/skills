---
name: jmr-build-test-lint-gate
description: Enforces the jmrsquared "done" bar. Always-on rule requiring yarn build, yarn test, and yarn lint:fix (or the relevant subset) to pass before any change can be considered complete. Blocks lazy "disable the check" fixes.
---

# Build / Test / Lint Gate

Generated or modified code must not break the following commands. Treat them as mandatory checks before considering any change complete.

## Required commands

1. `yarn build` — full build succeeds. No TypeScript errors. No failed workspace builds.
2. `yarn test` — all tests pass. Do not introduce failing tests or skip tests to "fix" failures.
3. `yarn lint:fix` — linting passes. Generated code conforms to project lint rules.

## Expectations

- **Before finishing:** Run or recommend running `yarn build`, `yarn test`, and `yarn lint:fix` (or the relevant subset) after changes.
- **On failure:** Fix the cause (types, imports, lint violations, test assertions) rather than disabling checks or leaving broken state.
- **New code:** Follow existing patterns and types so that build and lint pass without modification.
- **Tests:** When adding or changing logic, add or update tests so `yarn test` stays green. If the change touches a tRPC procedure, the `bdd-router-tests` skill applies in addition to this one.

Code is not complete until these three commands succeed.

## Anti-patterns

- Don't `// @ts-ignore` or `// biome-ignore` a failure. Fix the root cause.
- Don't skip (`it.skip`, `describe.skip`) a test to get CI green.
- Don't remove a test because it started failing after your change. That's the test doing its job.
- Don't claim "done" before running the checks.
