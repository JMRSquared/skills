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

Pick your agent. One command. Done.

| Agent | Install |
|-------|---------|
| **Claude Code** | `claude plugin marketplace add sortdinc/wonderhire-skills && claude plugin install wonderhire-standards@wonderhire-skills` |
| **Codex** | Clone repo → `/plugins` → Search "wonderhire" → Install |
| **Gemini CLI** | `gemini extensions install https://github.com/sortdinc/wonderhire-skills` |
| **Cursor** | `npx skills add sortdinc/wonderhire-skills -a cursor` |
| **Windsurf** | `npx skills add sortdinc/wonderhire-skills -a windsurf` |
| **Copilot** | `npx skills add sortdinc/wonderhire-skills -a github-copilot` |
| **Cline** | `npx skills add sortdinc/wonderhire-skills -a cline` |
| **Any other** | `npx skills add sortdinc/wonderhire-skills` |

Install once. Use in every session after that.

### What You Get

Auto-activation is built in for Claude Code, Gemini CLI, and the repo-local Codex setup below. `npx skills add` installs the 14 task-scoped skills for other agents, but does **not** install the always-on rule file — tier-1 standing rules + build/test/lint gate will not auto-fire there unless you add the snippet from the always-on section below.

| Feature | Claude Code | Codex | Gemini CLI | Cursor | Windsurf | Cline | Copilot |
|---------|:-----------:|:-----:|:----------:|:------:|:--------:|:-----:|:-------:|
| 14 task-scoped skills | Y | Y | Y | Y | Y | Y | Y |
| Tier-1 rules auto-loaded every session | Y | Y¹ | Y | Y² | Y² | Y² | Y² |
| `/wh-help`, `/wh-review`, `/wh-commit` slash commands | Y | — | Y | — | — | — | — |
| Statusline badge `[WH: branch@stage]` | Y | — | — | — | — | — | — |

¹ Codex auto-starts via `.codex/hooks.json` only when run inside this repo's clone. Copy `.codex/hooks.json` + `.codex/config.toml` into your target repo for always-on there too.
² Cursor/Windsurf/Cline/Copilot: rule files (`.cursor/rules/wonderhire.mdc`, etc.) ship in this repo and ARE copied into the target project when `npx skills add` runs — but verify after install that your agent picks them up. See per-agent detail section below.

<details>
<summary><strong>Claude Code — full details</strong></summary>

The plugin install gives you all 14 skills + SessionStart hook + statusline.

```bash
claude plugin marketplace add sortdinc/wonderhire-skills
claude plugin install wonderhire-standards@wonderhire-skills
```

**Standalone hooks (without plugin system):**
```bash
# macOS / Linux / WSL
bash <(curl -s https://raw.githubusercontent.com/sortdinc/wonderhire-skills/main/hooks/install.sh)

# Windows (PowerShell)
irm https://raw.githubusercontent.com/sortdinc/wonderhire-skills/main/hooks/install.ps1 | iex
```

Uninstall: `claude plugin uninstall wonderhire-standards` or `bash hooks/uninstall.sh`

</details>

<details>
<summary><strong>Codex — full details</strong></summary>

1. Clone repo → Open Codex in the repo directory → `/plugins` → Search "wonderhire" → Install
2. Repo-local auto-start is already wired by `.codex/hooks.json` + `.codex/config.toml`

For always-on behavior in OTHER repos too, copy this repo's `.codex/` directory there and enable:

```toml
[features]
codex_hooks = true
```

</details>

<details>
<summary><strong>Gemini CLI — full details</strong></summary>

```bash
gemini extensions install https://github.com/sortdinc/wonderhire-skills
```

Update: `gemini extensions update wonderhire-standards` · Uninstall: `gemini extensions uninstall wonderhire-standards`

Auto-activates via `GEMINI.md` context file every session.

</details>

<details>
<summary><strong>Cursor / Windsurf / Cline / Copilot — full details</strong></summary>

`npx skills add` installs the 14 task-scoped skills. Rule files (always-on tier-1 body) also ship in this repo — verify your agent picks them up after install, or copy manually.

| Agent | Command | Rule file location |
|-------|---------|--------------------|
| Cursor | `npx skills add sortdinc/wonderhire-skills -a cursor` | `.cursor/rules/wonderhire.mdc` |
| Windsurf | `npx skills add sortdinc/wonderhire-skills -a windsurf` | `.windsurf/rules/wonderhire.md` |
| Cline | `npx skills add sortdinc/wonderhire-skills -a cline` | `.clinerules/wonderhire.md` |
| Copilot | `npx skills add sortdinc/wonderhire-skills -a github-copilot` | `.github/copilot-instructions.md` + `AGENTS.md` |

Uninstall: `npx skills remove wonderhire-standards`

> **Windows note:** `npx skills` uses symlinks by default. If symlinks fail, add `--copy`.

</details>

<details>
<summary><strong>Any other agent (opencode, Roo, Amp, Goose, Kiro, 40+ more)</strong></summary>

[npx skills](https://github.com/vercel-labs/skills) supports 40+ agents:

```bash
npx skills add sortdinc/wonderhire-skills           # auto-detect agent
npx skills add sortdinc/wonderhire-skills -a amp
npx skills add sortdinc/wonderhire-skills -a goose
npx skills add sortdinc/wonderhire-skills -a kiro-cli
npx skills add sortdinc/wonderhire-skills -a roo
```

Uninstall: `npx skills remove wonderhire-standards`

**Always-on snippet** — paste into your agent's system prompt or rules file so the tier-1 rules fire every session:

```
Wonderhire monorepo. Standing rules, always on:
1. Never deploy without explicit user confirmation.
2. Establish worktree context (branch + stage) at session start.
3. Always confirm before merging.
Build/test/lint gate: work is not done until `yarn build && yarn test && yarn lint:fix` pass.
No `@ts-ignore`, no `.skip`, no `--no-verify`.
```

</details>

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
