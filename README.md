# wonderhire-standards

Wonderhire coding standards as plug-in skills for any AI coding agent. Safety rules on every session; stack-specific skills triggered by task context.

Works across Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Codex, Gemini CLI, and 40+ other agents.

---

## Before / After

**Before (cold agent in a Wonderhire worktree):**

> User: "Add a `getCandidatesByJobId` procedure to the candidates router."
>
> Agent: *writes handler with untyped input, no Zod, forgets the `__tests__/` BDD pair, default-exports a new React component that consumes the result, and finishes with "the change is complete" without running `yarn build`.*

**After (wonderhire-standards installed):**

> User: same request.
>
> Agent: writes the handler with a Zod input schema, colocated `.feature` + `.steps.ts`, named-exports the React component, runs `yarn build && yarn test && yarn lint:fix`, then: "About to commit to branch `candidate-search` targeting stage `dev` — confirm?"

---

## What You Get

Two tiers.

**Tier 1 — always-on (injected every session):**

| Skill | Enforces |
|-------|----------|
| `wonderhire-standing-rules` | No silent deploy. Worktree context (branch + stage). Confirm before merge. |
| `wonderhire-build-test-lint-gate` | `yarn build && yarn test && yarn lint:fix` before "done". No `@ts-ignore`, no `.skip`, no `--no-verify`. |

**Tier 2 — task-scoped (activated by context):**

| Skill | Fires on |
|-------|----------|
| `trpc-procedure` | `apps/api/src/router/**` edits |
| `bdd-router-tests` | New/changed tRPC procedure |
| `knex-migration` | `packages/db/migrations/**` edits |
| `react-tsx-component` | `.tsx` edits in web apps and `packages/web-ui` |
| `supabase-auth` | Auth flow / `*ProtectedRoute` edits |
| `tanstack-trpc-query` | Frontend `useQuery` / `useMutation` edits |
| `sst-infra` | `infra/**`, `sst.config.ts` edits |
| `naming-imports-exports` | Any TS/TSX edit |
| `code-quality` | Any TS/TSX edit |

**Companion:**

| Skill | Use |
|-------|-----|
| `wonderhire-commit` | `/wh-commit` — Conventional Commits + branch/stage confirm |
| `wonderhire-review` | `/wh-review` — audit current diff against every skill |
| `wonderhire-help` | `/wh-help` — quick-reference card |

---

## Install

| Agent | Command |
|-------|---------|
| **Claude Code** (plugin) | Clone this repo, then `./hooks/install.sh` — follow the printed `settings.json` additions. |
| **Claude Code** (manual) | Copy `skills/` into your project's `.claude/skills/`, add the `SessionStart` hook and statusline entries to `settings.json`. |
| **Codex** | Point your Codex config at `plugins/wonderhire-standards/`. |
| **Cursor** | Copy `.cursor/rules/wonderhire.mdc` into your project's `.cursor/rules/`. Always-on — no command needed. |
| **Windsurf** | Copy `.windsurf/rules/wonderhire.md` into your project's `.windsurf/rules/`. Always-on. |
| **Cline** | Copy `.clinerules/wonderhire.md` into your project's `.clinerules/`. Always-on. |
| **GitHub Copilot** | Copy `.github/copilot-instructions.md` into your project's `.github/`. Always-on. |
| **Gemini CLI** | Copy `GEMINI.md` into your project root. Loaded every session. |
| **Other agents** | `npx skills add <this-repo-url>` — reads `AGENTS.md` + `skills/`. |

Uninstall: `./hooks/uninstall.sh` removes the hook files and prints the `settings.json` entries to remove manually.

---

## Quick start

In any Claude Code session once installed:

- `/wh-help` — see the full skill catalogue.
- `/wh-review` — review your current branch's diff against every skill.
- `/wh-commit` — generate a Conventional Commits message and echo the branch/stage confirmation.

The standing rules and the build/test/lint gate are always on — you don't need to invoke them.

---

## Why two tiers?

**Always-on** rules are session-scoped: they need to be present every turn because they're about safety and "done-ness" (don't deploy, run the tests). Burning the tokens each session is worth it.

**Task-scoped** skills are about precision. There's no point loading the `knex-migration` rule when you're editing a React component — and vice versa. Agents with native skill discovery (Claude Code) load these on demand by matching the task to the skill `description`. Agents without (Cursor, Windsurf, Cline) get the tier-1 body via always-on rule files and can reach for tier-2 skills in the `skills/` directory when relevant.

---

## Repo map

```
skills/                       # canonical SKILL.md files — edit here
rules/wonderhire-activate.md  # tier-1 concat for non-skill-native agents
hooks/                        # Claude Code SessionStart + statusline
plugins/wonderhire-standards/ # Codex plugin bundle (auto-synced)
.cursor/ .windsurf/ .clinerules/ .github/ AGENTS.md GEMINI.md  # agent rule surfaces (auto-synced)
.github/workflows/sync-skill.yml  # CI sync
CLAUDE.md                     # project-level guide for AI agents
```

---

## Contributing

See `CLAUDE.md` for the editing rules. Short version:

1. Edit `skills/<name>/SKILL.md` — never the synced copies.
2. Edit `rules/wonderhire-activate.md` — never the agent-specific rule files.
3. Update the "What You Get" table when adding or removing a skill.
4. Open a PR. CI rebuilds everything on merge.
