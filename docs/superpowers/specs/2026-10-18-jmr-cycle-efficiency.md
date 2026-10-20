# jmr-cycle efficiency: strong implementers, small contexts

## Problem

A `/agents-execute` milestone burns through usage limits and takes hours. Every cycle runs an orchestrator session on the default (strong) model to relay deterministic `$CYCLE` calls. Every implementer and reviewer loads many full skills, re-explores the repo, runs cold installs and reads raw gate output. Phase barriers leave finished tickets idle, and a review round restarts a fixer from nothing in the next cycle.

## Goal

Keep strong models for implementers. Spend their tokens on code only. Move everything deterministic into `cycle.mjs`, give reviewers and explorers cheaper models, shrink what each agent reads and back off cleanly when a usage limit hits.

## Rules for every item

- Edit only the files the item owns. Other items run at the same time in the same checkout.
- Canonical sources only: `skills/` and `hooks/`. Never edit `.cursor/`, `.windsurf/`, `plugins/` or other synced copies.
- Node 24, ES modules, no new npm dependencies. `node:sqlite`, `node:test` and `node:child_process` are fine.
- Match the style of `skills/jmr-cycle/scripts/lib.mjs`: small exported arrow functions, early returns, lookup objects over `if` chains, no comments unless a constraint needs one.
- Every new script module gets a sibling `*.test.mjs`. Gate: `node --test skills/jmr-cycle/scripts/*.test.mjs` passes, plus any test file the item adds elsewhere.
- Prose follows `jmr-plain-language`. No em dashes.
- Do not commit. The parent session commits after both waves.

## Shared interfaces

Wave 1 modules are written in parallel against these signatures. Wave 2 depends on them exactly.

```js
// agent.mjs
runAgent({ role, model, prompt, cwd, maxTurns, timeoutMs, resume, appendSystemPrompt, env, command })
  -> Promise<{ ok, result, sessionId, costUsd, usage: { input, output, cacheRead, cacheWrite }, turns, durationMs, exitCode, timedOut, stdout, stderr }>

// ledger.mjs
openLedger(dbPath?) -> { record(row), totals({ milestone, ticket?, role? }), recent({ milestone, limit }), close() }
// row: { milestone, cycle, role, ticket, model, sessionId, costUsd, input, output, cacheRead, cacheWrite, turns, durationMs, result }

// limits.mjs
detectLimit(text, now = new Date()) -> { limited, resetAt: Date | null, waitMs }

// budget.mjs
checkBudget({ budgets, role, totals }) -> { ok, reason }

// gate.mjs
compactOutput(text, { maxLines = 150 }) -> string
treeKey(cwd, commands) -> string
runGate({ commands, cwd, logDir, cachePath, env }) -> { pass, key, cached, failures: [{ command, excerpt, logFile }] }

// digest.mjs
digestReports(resultsDir, scenarioPrefix) -> { scenarios: { [id]: 'pass' | 'fail' | 'skip' }, failures: [{ title, message }] }
formatDigest(digest, { maxFailures = 10 }) -> string

// snapshot.mjs
loadSnapshot({ slug, ttlMs, cachePath, gh }) -> { issues, prs, fetchedAt }

// context-pack.mjs
buildContextPack({ milestoneDir, ticketId, maxBytes = 24000 }) -> string
writeContextPacks({ milestoneDir }) -> string[]

// codemap.mjs
buildCodemap({ root, maxBytes = 40000 }) -> string

// supervisor.mjs
runCycle({ slug, flags, deps }) -> Promise<{ result: 'continue' | 'waiting' | 'complete', report: string[] }>
```

## Wave 1: sixteen items in parallel

### 1. Usage ledger

Owns `skills/jmr-cycle/scripts/ledger.mjs` and `ledger.test.mjs`.

SQLite file at `$JMR_HOME/cycles.db`, default `~/.jmr/cycles.db`, through `node:sqlite`. One `runs` table with the row fields above plus `at`. `totals` sums cost, tokens and turns for the filter. `recent` returns the latest rows. Create the folder and table on open.

Done when tests cover record, totals by milestone, ticket and role, and a fresh temp database.

### 2. Async agent runner

Owns `scripts/agent.mjs` and `agent.test.mjs`.

Starts one headless agent with `spawn` (never `spawnSync`), default command `claude -p --output-format json`. Adds `--model`, `--max-turns`, `--resume` and `--append-system-prompt` when given. Sets `JMR_CYCLE=1` in the child env. Parses the JSON result (`result`, `session_id`, `total_cost_usd`, `usage`, `num_turns`, `duration_ms`, `is_error`). Kills the process group on `timeoutMs` and returns `timedOut: true`. A custom `command` array replaces the default so Codex or Gemini CLI can run reviews; non-JSON output then returns `result` as raw text.

Done when tests run a fake agent script (a small node file written to a temp dir) for success, error JSON, non-JSON output and timeout.

### 3. Usage-limit detection

Owns `scripts/limits.mjs` and `limits.test.mjs`.

Recognises usage and rate limit messages in agent output: Claude Code's "usage limit reached" with its reset time, API `rate_limit_error`, `overloaded_error`, HTTP 429 and 529. Parses the reset time when present (Unix seconds or a clock time with zone) and returns `waitMs` until then plus 60 seconds. With no reset time, returns 15 minutes. Keep patterns in one exported lookup so they are easy to extend.

Done when fixture strings for each case pass.

### 4. Compact gate runner with a tree cache

Owns `scripts/gate.mjs` and `gate.test.mjs`.

Runs each gate command in order and stops at the first failure. Writes full output to `logDir/<n>-<command-slug>.log`. Returns only an excerpt per failure from `compactOutput`: lines matching error patterns (`error`, `Error:`, `FAIL`, `✗`, `TS\d{4}`, `AssertionError`, `expected`), a few lines of context around each and the last 20 lines, capped at `maxLines`. `treeKey` hashes `git rev-parse HEAD^{tree}` with the command list. A pass is stored in `cachePath` (JSON map, default `$JMR_HOME/gate-cache.json`) and a later call with the same key returns `cached: true` without running anything. Uncommitted changes make the key uncacheable; check `git status --porcelain`.

Done when tests cover pass, failure excerpt size, cache hit and dirty tree bypass, using a temp git repo.

### 5. Test report digest

Owns `scripts/digest.mjs` and `digest.test.mjs`.

Wraps `parseResults` and `mergeResults` from `lib.mjs` (import, do not edit). Maps results to scenario ids by prefix and keeps the first five lines of each failure message. `formatDigest` prints one line per scenario and the capped failure list, so an agent reads a few hundred bytes in place of a full report.

Done when tests cover Vitest JSON, Jest JSON and JUnit XML fixtures.

### 6. GitHub snapshot

Owns `scripts/snapshot.mjs`, `snapshot.test.mjs` and `scripts/fake-gh-graphql.mjs`.

One `gh api graphql` call (paginated) fetches every issue and pull request labelled `milestone:<slug>` with labels, state, body, head ref, merge state and comments with `author.login` and `authorAssociation`. Read how `cycle.mjs` builds issue and comment objects today and return the same shapes so wave 2 can swap it in. Cache to `cachePath` for `ttlMs` (default 30 seconds). `gh` is injectable for tests.

Done when tests with the fake cover pagination, cache hit and expiry.

### 7. Ticket context pack

Owns `scripts/context-pack.mjs` and `context-pack.test.mjs`.

For one ticket in `tickets.json`, writes a single markdown file an implementer reads first: the ticket body, its scenarios with their text from `spec.md`, the spec sections and user stories the ticket names (match headings and numbered stories), testing decisions, `decisions.md` rows, matching files from `notes/` and the relevant part of `notes/codemap.md`. Truncate per section to stay under `maxBytes`. `writeContextPacks` writes `context/<id>.md` for every ticket.

Done when tests on a fixture milestone show the right sections included, unrelated stories left out and the size cap held.

### 8. Standards digest

Owns `skills/jmr-cycle/briefs/standards-digest.md`.

At most 80 lines that replace loading full skills for normal work. Distil the rules an implementer needs from `tdd`, `code-quality`, `naming-imports-exports`, `jmr-commit`, `jmr-plain-language` and `jmr-build-test-lint-gate`. End with a table of stack skills (`trpc-procedure`, `kysley-db`, `react-tsx-component` and the rest of `briefs/standards.md`) with one line each and a rule: read the full skill only when the ticket creates a new file of that kind.

Done when the file is under 80 lines and every rule traces to a source skill.

### 9. Lean implementer brief

Owns `skills/jmr-cycle/briefs/implementer.md`.

Rewrite for minimum reading. Order: read `docs/milestones/<slug>/context/<id>.md`, then `briefs/standards-digest.md`, then only the files the work touches. Read files by line range and search with `rg` or Serena's symbol tools before opening whole files. Never open lockfiles, `dist`, `build`, `.next`, coverage or generated files. Run checks through `$CYCLE gate` and read test results through `$CYCLE digest`, never raw logs unless the excerpt is not enough. Keep the commit-on-each-scenario cadence, the contract and the pull request marker. The report is one JSON line: `{"verdict","pr","sha","scenarios","decisions","needs":[]}`. When resumed with review feedback, fix only the listed blockers.

Done when every rule of the current brief is kept or deliberately replaced and the file is shorter.

### 10. Lean reviewer brief

Owns `skills/jmr-cycle/briefs/reviewer.md`.

The reviewer runs on a cheaper model. It trusts a `gate pass` mark whose tree key matches the head and the CI verdict from `$CYCLE checks`; it runs the gate only when no matching mark exists. It reads `git diff --stat`, then the diff per file, never the whole repo. It inlines the blocker list from `jmr-review`'s signal bar (at most 20 lines) instead of loading `jmr-review` and `code-review`. It runs the feature only when a scenario test cannot show the behaviour. Keep the review bar, the comment format and the round rules.

Done when the brief needs no other skill file to do a normal review.

### 11. Lean session hook

Owns `hooks/jmr-session-start.js` and a new `hooks/jmr-session-start.test.js`.

When `JMR_CYCLE=1` or `JMR_LEAN=1` is set, still write the flag file but print only a five-line stub: no deploys, no force-push, follow `briefs/standards-digest.md`, plain language, no em dashes. Otherwise behave as now. Keep the silent-fail behaviour. The test runs the hook with `node:test` and `spawnSync`, with and without the variable.

Done when `node --test hooks/*.test.js` passes.

### 12. Headless settings template

Owns `skills/jmr-cycle/templates/claude-settings.json`.

A `.claude/settings.json` fragment for cycle sessions. `permissions.allow`: `git`, `gh`, `node`, `yarn`, `pnpm`, `npm run`, `npx vitest`, `npx tsc`. `permissions.deny`: `Read` of `node_modules/**`, `dist/**`, `build/**`, `.next/**`, `coverage/**`, `*.lock`, `yarn.lock`, `pnpm-lock.yaml`, `package-lock.json`, `**/*.min.js`, `.env*`, plus `git push --force*`. Use Claude Code's documented permission rule syntax.

Done when the JSON parses and every rule uses valid syntax.

### 13. Code map

Owns `scripts/codemap.mjs` and `codemap.test.mjs`.

Walks the repo with `shouldSkipDir` from `lib.mjs` plus git-ignored paths (`git ls-files`). Prints a tree of source files with their exported names (regex for `export function|const|class|type|interface|default` in ts, tsx, js, mjs; `def` and `class` at top level in py). Uses `ast-grep` when it is on `PATH`, otherwise the regex. Trims the largest folders first to stay under `maxBytes`.

Done when tests on a fixture tree pass, with and without the size cap.

### 14. Budgets

Owns `scripts/budget.mjs` and `budget.test.mjs`.

Pure functions. `budgets` from `milestone.json` looks like `{ "implementer": { "maxTurns": 120, "maxCostUsd": 15 }, "reviewer": { "maxTurns": 40, "maxCostUsd": 2 }, "ticketMaxCostUsd": 40 }`. `checkBudget` compares ledger totals and returns the first limit crossed as a plain reason the supervisor can put in an escalation. Missing budgets mean no limit.

Done when tests cover each limit and missing config.

### 15. Milestone schema for models, budgets and concurrency

Owns `validateMilestone` in `scripts/lib.mjs` and its cases in `lib.test.mjs`. Touch nothing else in those files.

Accept optional fields: `models` (`implementer`, `fixer`, `reviewer`, `explorer`, `finalReview`, each a string), `budgets` (shape in item 14), `parallel` (integer 1 to 8), `agent` (`{ "implementer": [...], "reviewer": [...] }` command arrays) and `gateCache` (boolean, default true). Reject wrong types with clear messages. Defaults when absent: `implementer` and `fixer` `opus`, `reviewer` and `finalReview` `sonnet`, `explorer` `haiku`. Export them as `MODEL_DEFAULTS`.

Done when new validation tests pass and old ones still pass.

### 16. Tool reference

Owns `skills/jmr-cycle/references/tools.md` and `skills/jmr-cycle/templates/mcp.json`.

When and how cycle agents use Serena (symbol search and edits over reading files), Context7 (current library docs), claude-mem (memory across sessions) and ast-grep (structural search). Install commands, the one situation each one saves tokens in and a warning that each MCP server adds its tool list to every session's context, so enable only Serena and Context7 for implementers by default. `mcp.json` holds those two servers.

Done when every install command is checked against the tool's current README.

## Wave 2: four items in parallel, after wave 1

### 17. Supervisor

Owns `scripts/supervisor.mjs` and `supervisor.test.mjs`.

`runCycle` runs a whole cycle in Node with no orchestrator model. Every dependency (gh, git, agent, ledger, gate, clock) comes in through `deps` so tests run with fakes. Flow: preflight, lease, workspace, landing check, `next`. Then one lane per frontier ticket, up to `parallel`, each lane running on its own:

1. claim, then `runAgent` with the `implementer` model, a short prompt that points to the context pack and the brief and `maxTurns` from budgets;
2. `runGate` on the pushed head and post `jmr-cycle gate pass <key>` on a pass;
3. a reviewer agent on the `reviewer` model;
4. on changes, resume the implementer's `sessionId` with the blocker list (`fixer` model), up to three rounds, then escalate;
5. merge in Node, one lane at a time behind a mutex, with the existing sync, checks and close rules.

Record every agent run in the ledger and check budgets before each agent start. On `detectLimit`, stop starting agents, let running ones finish and return `waiting` with the reset time. Spawn an agent only for merge conflicts outside generated files. Close-out runs the final review on the `finalReview` model over only files more than one ticket touched, and skips it when every pull request was approved and the gate passes on the merged tree.

Done when tests cover a two-ticket happy path, a review round with resume, a usage limit mid-cycle, a budget escalation and a crash restart that adopts claims.

### 18. Wire the commands into `cycle.mjs`

Owns `scripts/cycle.mjs` and `cycle.test.mjs`.

Add commands: `run` (calls `runCycle`), `gate`, `digest`, `context-pack`, `codemap`, `usage` (ledger totals per ticket and role for a milestone) and `init-settings` (merges the item 12 template into `.claude/settings.json` without dropping existing rules). Upgrade `loop`: default to `run` in place of a `claude -p` orchestrator, keep `-- <agent command>` as the fallback, back off with `detectLimit` until the reset time, log to the ledger. Make `next` and `marks` read through `loadSnapshot`. Update `help` and exit codes.

Done when existing tests still pass and each new command has a test.

### 19. jmr-cycle docs

Owns `skills/jmr-cycle/SKILL.md`, `skills/jmr-cycle/steps/*.md` and `skills/jmr-cycle/briefs/standards.md`.

Make `$CYCLE run` and `$CYCLE loop` the default way to run, and the subagent path the fallback for harnesses without a shell. Document the model per role, budgets, gate cache, usage-limit backoff, `usage` and `init-settings`. Step 6 points implementers at context packs. Step 7 uses the lean reviewer. Step 9 scopes the final review to files more than one ticket touched. `standards.md` points to the digest first. Keep the crash, authority, trust and escalation rules unchanged.

Done when every command named in the docs exists in item 18's `help`.

### 20. agents-execute and README

Owns `skills/agents-execute/SKILL.md`, `README.md` and `CLAUDE.md`.

Step 3 explorers run on the `explorer` model and write to `docs/milestones/<slug>/notes/`, which step 7 commits. Step 7 also runs `$CYCLE codemap` and `$CYCLE context-pack` before publishing. Step 6 documents `models`, `budgets` and `parallel` in `milestone.json`. Step 8 runs `$CYCLE run` through `loop`. Add `$CYCLE usage` to the report step. Update the README rows for `agents-execute` and `jmr-cycle` and the `CLAUDE.md` Active Development Setup notes.

Done when the README table matches `skills/` and no step names a command that does not exist.
