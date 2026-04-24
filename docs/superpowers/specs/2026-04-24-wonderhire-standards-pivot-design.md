# Wonderhire Standards — Pivot Design

**Status:** approved 2026-04-24
**Author:** Claude (Opus 4.7) + Joe Sirwali
**Supersedes:** caveman plugin

---

## 1. Goal

Convert this repo from the caveman prose-compression plugin into a **multi-agent coding-standards distribution for the Wonderhire monorepo stack**. AI coding agents working in any repo that shares the Wonderhire stack get stack-specific guardrails applied automatically — standing safety rules on every session, narrow stack skills triggered by task context.

Non-goals: reusable across arbitrary stacks (see Q3 answer A — wonderhire-stack-specific on purpose), prose style enforcement, token-efficiency benchmarks.

---

## 2. Source material

1. `/Users/lavhe/CODE/wonderhire/CLAUDE.md` — "Standing Rules for AI Assistants" (§1–3), repo structure, key apps/api + apps/web directories.
2. `/Users/lavhe/CODE/wonderhire/.cursor/rules/build-test-lint.mdc` — yarn build/test/lint:fix gate.
3. `/Users/lavhe/CODE/wonderhire/.cursor/rules/coding-spec.mdc` — architecture + naming + imports + styling + DB + API + quality + deployment + auth + packages.
4. `/Users/lavhe/CODE/wonderhire/.cursor/rules/testing.mdc` — BDD tests for new/updated router procedures.
5. Senior-engineer knowledge of the stack: React 19 + Vite, TanStack Query + tRPC, Supabase Auth, Tailwind, Knex/Kysely/Objection, ULID PKs, Zod, Biome, Yarn 4 + Corepack, Turborepo, SST v3 (af-south-1).

---

## 3. Activation model (Q4 answer A)

Two tiers:

**Tier 1 — always-on (SessionStart hook injects as system context):**
- `wonderhire-standing-rules` — never deploy without explicit user confirm; maintain worktree context; confirm before merging branches.
- `wonderhire-build-test-lint-gate` — work is not done until `yarn build`, `yarn test`, `yarn lint:fix` pass (or the relevant subset).

**Tier 2 — description-activated (native skill discovery):**
Narrow skills each with a precise `description` front-matter field so agents invoke them only when their task matches. Activates on edit to specific directories or on specific keywords.

---

## 4. Skill catalogue

| # | Skill | Activation trigger (description keywords + paths) | What it enforces |
|---|-------|---------------------------------------------------|-------------------|
| 1 | `wonderhire-standing-rules` | always-on | §1 Standing Rules (no silent deploy, worktree context, confirm merge) |
| 2 | `wonderhire-build-test-lint-gate` | always-on | Run/recommend `yarn build && yarn test && yarn lint:fix` before marking work complete; fix root cause on failure, never disable checks |
| 3 | `trpc-procedure` | editing `apps/api/src/router/**`, keywords "router", "procedure", "tRPC" | Modular router per feature, Zod input validation, consistent error handling, named exports, no `any` |
| 4 | `bdd-router-tests` | new/changed procedure in `apps/api/src/router/**`; pairs with #3 | `__tests__/<name>.feature` + `.steps.ts` colocated with the router file; `yarn test` must pass; not done without these |
| 5 | `knex-migration` | editing `packages/db/migrations/**`, keywords "migration", "knex" | ULID primary keys, `snake_case` columns, `created_at`/`updated_at` on every table, explicit FK constraints |
| 6 | `react-tsx-component` | editing `apps/web/src/**/*.tsx`, `apps/video-call/src/**/*.tsx`, `packages/web-ui/**/*.tsx` | `export function Component()`; `interface Props` defined at bottom; early returns for loading/error; `handle*` prefix for event handlers; React 19 idioms; no `any`; Tailwind utility-first, no custom CSS, mobile-first responsive |
| 7 | `supabase-auth` | editing auth flows, route guards, session context; paths under `apps/web/src/domain/auth/**` or files using `ProtectedRoute`, `CandidateProtectedRoute`, `RecruiterProtectedRoute` | Supabase session in React Context, route-level guards, tRPC profile fetch, auth-state + profile-completion routing |
| 8 | `tanstack-trpc-query` | editing frontend queries/mutations that use tRPC + TanStack Query | Proper `useQuery`/`useMutation` patterns, loading/error state handling, cache invalidation, no ad-hoc fetch |
| 9 | `sst-infra` | editing `infra/**`, `sst.config.ts`, or adding SST resources | Stage-based (dev/prod), SST secret management, region `af-south-1`, Lambda + API Gateway v2 patterns; block accidental deploys (defers to standing-rule #1) |
| 10 | `naming-imports-exports` | any code edit | `camelCase` variables, `PascalCase` components, `kebab-case` directories, boolean prefix `is/has/should`, named exports over default, `~` absolute-import alias, barrel `index.ts` re-exports, external-deps-first import order |
| 11 | `code-quality` | any code edit | DRY, single responsibility, early returns over nested if-else, lookup objects over if-chains, no comments for self-evident code, strict TypeScript (no `any`), Zod at every runtime boundary |
| 12 | `wonderhire-commit` | user asks for commit / `/wh-commit` | Conventional Commits format, ≤72-char subject, body explains "why". Before committing, echo: "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?" (standing rule §2). |
| 13 | `wonderhire-review` | user asks for PR/diff review / `/wh-review` | Audits diff against skills 3–11; flags: missing Zod, `any`, missing BDD test for new procedure, custom CSS, untyped DB field, default export of component, direct Lambda deploy without standing-rule acknowledgement |
| 14 | `wonderhire-help` | `/wh-help` | Prints index of skills 1–13 with one-line hook each |

---

## 5. Hook system (Claude Code)

Keep the caveman hook shape but slim it — no modes, no UserPromptSubmit mode-tracker.

```
hooks/
├── wh-config.js          # safeWriteFlag, worktree/branch/stage resolver
├── wh-session-start.js   # SessionStart: inject tier-1 skills + statusline nudge
├── wh-statusline.sh      # reads flag file → [WH: <branch>@<stage>]
├── wh-statusline.ps1     # Windows counterpart
├── install.sh            # standalone installer
├── install.ps1
├── uninstall.sh
├── uninstall.ps1
└── package.json          # {"type": "commonjs"}
```

### `wh-config.js`
- Port `safeWriteFlag` unchanged (symlink-safe, `O_NOFOLLOW`, atomic rename, 0600, silent-fail).
- Add `resolveWorktreeContext()` — reads `git branch --show-current` and scans `.claude/worktrees/<name>/CLAUDE.md` for the active SST stage. Returns `{ branch, stage }` or `null` on any error.
- Flag file path: `$CLAUDE_CONFIG_DIR/.wh-active` → plain text line `<branch>@<stage>` (empty string for either field if unresolved). Used only by statusline — kept text-shaped so shell/PS1 read it without a JSON parser.

### `wh-session-start.js`
On every Claude Code SessionStart:
1. Resolve worktree context via `wh-config.js`. Write to flag file via `safeWriteFlag`.
2. Emit tier-1 system context to stdout (hidden-to-user; Claude Code injects as system prompt):
   - `wonderhire-standing-rules` body
   - `wonderhire-build-test-lint-gate` body
   - A one-line mention of tier-2 skills available (so the agent knows to reach for them)
3. Statusline nudge if `settings.json` missing the statusline command.

Silent-fail on every filesystem error. Never block session start.

### `wh-statusline.sh`
Reads `$CLAUDE_CONFIG_DIR/.wh-active`. Outputs:
- Flag missing → `[WH]`
- Flag present → `[WH: <branch>@<stage>]` (orange)

### No UserPromptSubmit hook
There are no runtime "modes" to track. Tier-1 skills are injected once per session by SessionStart; tier-2 skills are loaded on demand by Claude Code's skill system. Agents that support neither (Cursor, Windsurf, etc.) get the rules via their native always-on rule files.

### No `.wh-active` write from user prompts
The flag file is purely a cache for the statusline. Nothing parses user prompts for mode changes.

---

## 6. Multi-agent distribution

| Agent | Mechanism | Auto-activates? | Source of truth |
|-------|-----------|-----------------|------------------|
| Claude Code | Plugin (hooks + skills) or standalone hooks | Yes — SessionStart hook | `skills/*/SKILL.md` |
| Codex | Plugin in `plugins/wonderhire-standards/` + repo `.codex/hooks.json`, `.codex/config.toml` | Yes on macOS/Linux — SessionStart | same |
| Gemini CLI | Extension with `GEMINI.md` context | Yes — loads every session | same (tier-1 concatenated) |
| Cursor | `.cursor/rules/wonderhire.mdc` with `alwaysApply: true` | Yes — always-on rule | `rules/wonderhire-activate.md` (tier-1) |
| Windsurf | `.windsurf/rules/wonderhire.md` with `trigger: always_on` | Yes | same |
| Cline | `.clinerules/wonderhire.md` | Yes — Cline auto-discovers | same |
| Copilot | `.github/copilot-instructions.md` + `AGENTS.md` | Yes | same |
| Others | `npx skills add <repo>` | No — user invokes `/wh-help` | same |

### CI sync (`.github/workflows/sync-skill.yml`)
Triggers on main push when `skills/**/SKILL.md` or `rules/wonderhire-activate.md` change.

1. Concatenate `skills/wonderhire-standing-rules/SKILL.md` + `skills/wonderhire-build-test-lint-gate/SKILL.md` → the content that agents without description-activated skills (Cursor, Windsurf, Cline, Copilot, Gemini) get as always-on. Write to `rules/wonderhire-activate.md`.
2. Rebuild agent-specific rule files with correct frontmatter (Cursor `alwaysApply: true`; Windsurf `trigger: always_on`; Cline/Copilot plain).
3. Copy every `skills/<name>/SKILL.md` into `.cursor/skills/<name>/SKILL.md`, `.windsurf/skills/<name>/SKILL.md`, `plugins/wonderhire-standards/skills/<name>/SKILL.md`.
4. Commit with `[skip ci]`.

Tier-2 skills reach Cursor/Windsurf by being copied into their skills directory even if those agents don't currently auto-discover — they become available when referenced.

---

## 7. Files removed

- `evals/` — token-count harness. Not relevant.
- `benchmarks/` — token-count benchmarks. Not relevant.
- `caveman-compress/` — prose compression sub-skill. Not relevant.
- `skills/caveman/`, `skills/caveman-commit/`, `skills/caveman-review/`, `skills/caveman-help/` — replaced by skills/wonderhire-*.
- `caveman.skill` ZIP artifact — no single-skill ZIP; each new skill small.
- Intensity/wenyan machinery inside old SKILL.md.
- `hooks/caveman-mode-tracker.js` — UserPromptSubmit hook. No modes to track.
- `.caveman-active` flag writes from mode-tracker (flag itself repurposed for statusline cache).
- Legacy READMEs/docs that reference caveman.

---

## 8. CLAUDE.md (project-level)

Rewrite from scratch. Keep the structure of the existing caveman CLAUDE.md (already mass-renamed by user) but with accurate content:
- Project overview: coding-standards distribution, not prose compressor.
- File structure table updated to the 14-skill catalogue.
- Hook system reduced to SessionStart + statusline (drop mode-tracker + UserPromptSubmit + intensity modes).
- Remove README-as-product-artifact Voice preservation clauses about caveman speak — that's no longer the brand. New voice: "professional, direct, senior-engineer tone" in README.
- Standing Rules bubble up to be mentioned at the top.

---

## 9. README.md

Full rewrite. Target audience: a Wonderhire engineer installing this into their setup, or a dev in a repo sharing the stack.

Must contain:
- One-paragraph pitch: "Wonderhire coding standards as plug-in skills for any AI coding agent. Safety rules on every session; stack-specific skills triggered by task context."
- Before/After examples: agent cold vs. agent with this plugin.
- "What You Get" table = the 14 skills.
- Install table for each agent (keep Claude Code / Codex / Gemini / Cursor / Windsurf / Cline / Copilot / `npx skills` rows, swap every "caveman" → "wonderhire-standards").
- Quick-start: `/wh-help` shows index; `/wh-review` reviews current diff; `/wh-commit` generates a Conventional Commit.
- 60-second-read check (rule from CLAUDE.md README section).

---

## 10. Execution order (high-level — writing-plans skill expands)

1. Scaffold new skills directory + write all 14 SKILL.md files.
2. Write `rules/wonderhire-activate.md` (tier-1 concat).
3. Rewrite hooks (`wh-config.js`, `wh-session-start.js`, `wh-statusline.sh`, `wh-statusline.ps1`, `install.sh`, `install.ps1`, `uninstall.sh`, `uninstall.ps1`, `hooks/package.json`).
4. Rewrite CI workflow (`sync-skill.yml`) for the new layout.
5. Rewrite `CLAUDE.md`, `README.md`, `.cursor/rules/wonderhire.mdc` seed.
6. Delete: `evals/`, `benchmarks/`, `caveman-compress/`, old `skills/caveman*/`, `caveman.skill`, `hooks/caveman-*.js`/`.sh`/`.ps1`, stale `.caveman-active` paths, stale docs.
7. Commit on a new branch `pivot-to-wonderhire-standards`. Do not push or merge (standing rule: confirm merge before merging).

---

## 11. Acceptance criteria

- Repo contains 14 skills with valid frontmatter (`name`, `description`).
- Tier-1 skills appear in `rules/wonderhire-activate.md` and all agent-specific rule files with correct frontmatter.
- `hooks/wh-session-start.js` emits the tier-1 body to stdout when piped a SessionStart JSON payload; silent-fails on bogus input.
- `hooks/wh-statusline.sh` outputs `[WH]` when flag missing and `[WH: <branch>@<stage>]` when flag present.
- No files in the tree reference "caveman", "wenyan", "compress", "intensity" except in git history / this spec.
- `yarn` / `npm` scripts (if any kept) still run without error. Hook JS still resolves CJS via `hooks/package.json`.
- CLAUDE.md + README.md contain no stale caveman references; CLAUDE.md standing-rules section matches `skills/wonderhire-standing-rules/SKILL.md`.

---

## 12. Open items deferred

- Migrating the `.cursor/rules/wonderhire.mdc` seed in this repo (not in wonderhire repo) — kept in sync by CI.
- Whether to publish as an `npm` package for `npx skills` distribution — assume yes, keep manifest shape.
- Long-term: add `supabase-rls` skill once wonderhire adopts RLS broadly (not in this pass).
