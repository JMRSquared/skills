# jmrsquared-standards

Coding standards as plug-in skills for any AI coding agent. Safety rules on every session; stack-specific skills triggered by task context.

Works across Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Codex, Gemini CLI, and 40+ other agents.

---

## Before / After

**Before (cold agent in a fresh worktree):**

> User: "Add a `getOrdersByUserId` procedure to the orders router."
>
> Agent: *writes handler with untyped input, no Zod, forgets the `__tests__/` BDD pair, default-exports a new React component that consumes the result, and finishes with "the change is complete" without running `yarn build`.*

**After (jmrsquared-standards installed):**

> User: same request.
>
> Agent: writes the handler with a Zod input schema, colocated `.feature` + `.steps.ts`, named-exports the React component, runs `yarn build && yarn test && yarn lint:fix`, then: "About to commit to branch `order-search` targeting stage `dev` — confirm?"

---

## What You Get

Two tiers.

**Tier 1 — always-on (injected every session):**

| Skill | Enforces |
|-------|----------|
| `jmr-standing-rules` | No silent deploy. Worktree context (branch + stage). Confirm before merge. |
| `jmr-build-test-lint-gate` | `yarn build && yarn test && yarn lint:fix` before "done". No `@ts-ignore`, no `.skip`, no `--no-verify`. |

**Tier 2 — task-scoped (activated by context):**

| Skill | Fires on |
|-------|----------|
| `trpc-procedure` | tRPC procedure edits |
| `bdd-router-tests` | New/changed tRPC procedure |
| `knex-migration` | Knex migration edits |
| `kysley-db` | Kysely DB/repository/query code |
| `react-tsx-component` | `.tsx` component edits |
| `better-auth` | Better Auth config, routes, adapters, client |
| `supabase` | Supabase client, RLS, SQL policies, Storage, Realtime |
| `supabase-auth` | Supabase Auth flows, guards, session + profile loading |
| `tanstack-trpc-query` | Frontend `useQuery` / `useMutation` edits |
| `react-native` | React Native screens / components, Expo Router, FlatList edits |
| `nativewind` | RN `className` styling, `tailwind.config.js`, NativeWind setup |
| `react-native-skia` | `@shopify/react-native-skia` imports — Canvas, paths, shaders, animations |
| `sst-infra` | `infra/**`, `sst.config.ts` edits |
| `naming-imports-exports` | Any TS/TSX edit |
| `code-quality` | Any TS/TSX edit |

**Companion:**

| Skill | Use |
|-------|-----|
| `agents-execute` | `/agents-execute` — hand off a mission for fully autonomous, parallel, end-to-end execution |
| `jmr-commit` | `/jmr-commit` — [Gitmoji](https://gitmoji.dev/) + Conventional Commits + branch/stage confirm |
| `jmr-review` | `/jmr-review` — audit current diff against every skill |
| `jmr-help` | `/jmr-help` — quick-reference card |

---

## Install

Pick your agent. One command. Done.

| Agent | Install |
|-------|---------|
| **Claude Code** | `claude plugin marketplace add jmrsquared/skills && claude plugin install jmrsquared-standards@skills` |
| **Codex** | Clone repo → `/plugins` → Search "jmrsquared" → Install |
| **Gemini CLI** | `gemini extensions install https://github.com/jmrsquared/skills` |
| **Cursor** | `npx skills add jmrsquared/skills -a cursor` |
| **Windsurf** | `npx skills add jmrsquared/skills -a windsurf` |
| **Copilot** | `npx skills add jmrsquared/skills -a github-copilot` |
| **Cline** | `npx skills add jmrsquared/skills -a cline` |
| **Any other** | `npx skills add jmrsquared/skills` |

Install once. Use in every session after that.

These commands pull from GitHub (`jmrsquared/skills`). The repository must be **public** so `claude plugin`, `npx skills`, `gemini extensions`, and raw `curl` installers can fetch it without extra credentials.

### What You Get

Auto-activation is built in for Claude Code, Gemini CLI, and the repo-local Codex setup below. `npx skills add` installs the full **`skills/`** bundle (**21** skill packages) for other agents, but does **not** install the always-on rule file — tier-1 standing rules + build/test/lint gate will not auto-fire there unless you add the snippet from the always-on section below.

| Feature | Claude Code | Codex | Gemini CLI | Cursor | Windsurf | Cline | Copilot |
|---------|:-----------:|:-----:|:----------:|:------:|:--------:|:-----:|:-------:|
| **21** skills (`skills/**`) | Y | Y | Y | Y | Y | Y | Y |
| Tier-1 rules auto-loaded every session | Y | Y¹ | Y | Y² | Y² | Y² | Y² |
| `/agents-execute`, `/jmr-help`, `/jmr-review`, `/jmr-commit` slash commands | Y | — | Y | — | — | — | — |
| Statusline badge `[JMR: branch@stage]` | Y | — | — | — | — | — | — |

¹ Codex auto-starts via `.codex/hooks.json` only when run inside this repo's clone. Copy `.codex/hooks.json` + `.codex/config.toml` into your target repo for always-on there too.
² Cursor/Windsurf/Cline/Copilot: rule files (`.cursor/rules/jmrsquared.mdc`, etc.) ship in this repo and ARE copied into the target project when `npx skills add` runs — but verify after install that your agent picks them up. See per-agent detail section below.

<details>
<summary><strong>Claude Code — full details</strong></summary>

The plugin install gives you all **21** skills + SessionStart hook + statusline.

```bash
claude plugin marketplace add jmrsquared/skills
claude plugin install jmrsquared-standards@skills
```

**Standalone hooks (without plugin system):**
```bash
# macOS / Linux / WSL
bash <(curl -s https://raw.githubusercontent.com/jmrsquared/skills/main/hooks/install.sh)

# Windows (PowerShell)
irm https://raw.githubusercontent.com/jmrsquared/skills/main/hooks/install.ps1 | iex
```

Uninstall: `claude plugin uninstall jmrsquared-standards` or `bash hooks/uninstall.sh`

</details>

<details>
<summary><strong>Codex — full details</strong></summary>

1. Clone repo → Open Codex in the repo directory → `/plugins` → Search "jmrsquared" → Install
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
gemini extensions install https://github.com/jmrsquared/skills
```

Update: `gemini extensions update jmrsquared-standards` · Uninstall: `gemini extensions uninstall jmrsquared-standards`

Auto-activates via `GEMINI.md` context file every session.

</details>

<details>
<summary><strong>Cursor / Windsurf / Cline / Copilot — full details</strong></summary>

`npx skills add` installs all **21** skill packages. Rule files (always-on tier-1 body) also ship in this repo — verify your agent picks them up after install, or copy manually.

| Agent | Command | Rule file location |
|-------|---------|--------------------|
| Cursor | `npx skills add jmrsquared/skills -a cursor` | `.cursor/rules/jmrsquared.mdc` |
| Windsurf | `npx skills add jmrsquared/skills -a windsurf` | `.windsurf/rules/jmrsquared.md` |
| Cline | `npx skills add jmrsquared/skills -a cline` | `.clinerules/jmrsquared.md` |
| Copilot | `npx skills add jmrsquared/skills -a github-copilot` | `.github/copilot-instructions.md` + `AGENTS.md` |

Uninstall: `npx skills remove jmrsquared-standards`

> **Windows note:** `npx skills` uses symlinks by default. If symlinks fail, add `--copy`.

</details>

<details>
<summary><strong>Any other agent (opencode, Roo, Amp, Goose, Kiro, 40+ more)</strong></summary>

[npx skills](https://github.com/vercel-labs/skills) supports 40+ agents:

```bash
npx skills add jmrsquared/skills           # auto-detect agent
npx skills add jmrsquared/skills -a amp
npx skills add jmrsquared/skills -a goose
npx skills add jmrsquared/skills -a kiro-cli
npx skills add jmrsquared/skills -a roo
```

Uninstall: `npx skills remove jmrsquared-standards`

**Always-on snippet** — paste into your agent's system prompt or rules file so the tier-1 rules fire every session:

```
jmrsquared coding standards. Standing rules, always on:
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

- `/jmr-help` — see the full skill catalogue.
- `/jmr-review` — review your current branch's diff against every skill.
- `/jmr-commit` — generate a Gitmoji + Conventional Commits message and echo the branch/stage confirmation.
- `/agents-execute` — hand off a mission for fully autonomous, parallel, end-to-end execution. Agents own 100% and never ask; supersedes the deploy / merge confirm gates for the mission.

The standing rules and the build/test/lint gate are always on — you don't need to invoke them.

---

## Why two tiers?

**Always-on** rules are session-scoped: they need to be present every turn because they're about safety and "done-ness" (don't deploy, run the tests). Burning the tokens each session is worth it.

**Task-scoped** skills are about precision. There's no point loading the `knex-migration` rule when you're editing a React component — and vice versa. Agents with native skill discovery (Claude Code) load these on demand by matching the task to the skill `description`. Agents without (Cursor, Windsurf, Cline) get the tier-1 body via always-on rule files and can reach for tier-2 skills in the `skills/` directory when relevant.

---

## Repo map

```
skills/                          # canonical SKILL.md files — edit here
rules/jmrsquared-activate.md     # tier-1 concat for non-skill-native agents
hooks/                           # Claude Code SessionStart + statusline
plugins/jmrsquared-standards/    # Codex plugin bundle (auto-synced)
.cursor/ .windsurf/ .clinerules/ .github/ AGENTS.md GEMINI.md  # agent rule surfaces (auto-synced)
.github/workflows/sync-skill.yml # CI sync
CLAUDE.md                        # project-level guide for AI agents
```

---

## Contributing

See `CLAUDE.md` for the editing rules. Short version:

1. Edit `skills/<name>/SKILL.md` — never the synced copies.
2. Edit `rules/jmrsquared-activate.md` — never the agent-specific rule files.
3. Update the "What You Get" table when adding or removing a skill.
4. Open a PR. CI rebuilds everything on merge.
