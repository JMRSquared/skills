# Multi-agent installer surface — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `wonderhire-skills` installable via one command per agent (Claude Code, Gemini CLI, Codex, Cursor, Windsurf, Cline, Copilot, 40+ more), matching JuliusBrussee/caveman's install surface exactly — without building any custom CLI.

**Architecture:** Add four new manifest files (`.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json`, `gemini-extension.json`, `.codex/config.toml`, `.codex/hooks.json`) that let three pre-existing third-party tools (`claude plugin`, `gemini extensions`, `npx skills`) consume this repo. All manifests reference the existing hook runtime (`hooks/wh-session-start.js`, `hooks/wh-statusline.sh`) — no duplication. `npx skills` track already works via existing `skills/**/SKILL.md` + `AGENTS.md`.

**Tech Stack:** JSON, TOML, Node.js (existing hook runtime), Bash (existing statusline). Node.js 20+ required. Reference spec: `docs/superpowers/specs/2026-04-24-multi-agent-installer-design.md`.

---

## File Structure

### New files

- `.claude-plugin/marketplace.json` — Claude Code marketplace registration (one plugin: `wonderhire-standards`).
- `.claude-plugin/plugin.json` — Claude Code plugin manifest wiring SessionStart hook + statusline to existing `hooks/`.
- `gemini-extension.json` — Gemini CLI extension manifest. Points at existing `GEMINI.md` as context file.
- `.codex/config.toml` — Enables Codex hooks feature for repo-local auto-start.
- `.codex/hooks.json` — Codex SessionStart hook pointing at `hooks/wh-session-start.js`.

### Modified files

- `README.md` — Replace Install table with 9-row caveman-style table; add per-agent `<details>` sections.
- `CLAUDE.md` — Extend "Single source of truth" table with the 5 new canonical manifest files.

### Unchanged (verified, referenced by new manifests)

- `hooks/wh-session-start.js` — SessionStart hook entrypoint.
- `hooks/wh-statusline.sh` — Statusline renderer.
- `hooks/install.sh` — Standalone curl installer for users who want hooks without plugin system.
- `skills/<14-names>/SKILL.md` — Canonical skills consumed by `npx skills`.
- `AGENTS.md`, `GEMINI.md` — Already-synced rule surfaces.
- `plugins/wonderhire-standards/` — Codex plugin bundle (separate consumer from `.claude-plugin/`).
- `.github/workflows/sync-skill.yml` — Sync logic unchanged; new files sit outside the rsync set.

### Preconditions

- GitHub remote is `git@github.com:sortdinc/wonderhire-skills.git` (verified).
- Repo is currently **PRIVATE** — must be flipped to public before install commands work for external users. **Task 0** covers this; don't skip.

---

## Task 0: Flip repo to public

**Files:** None (GitHub config only).

- [ ] **Step 1: Confirm with the user before flipping visibility**

This is an irreversible scope change for who can see the repo. Ask the user:

> "Repo is PRIVATE. `claude plugin marketplace add`, `gemini extensions install`, and `npx skills add` all require public access. Flip `sortdinc/wonderhire-skills` to public? (yes/no)"

Wait for explicit "yes" before running any command. If the user declines, stop — the plan cannot proceed without a public repo.

- [ ] **Step 2: Flip visibility**

Run: `gh repo edit sortdinc/wonderhire-skills --visibility public --accept-visibility-change-consequences`
Expected: no output, exit 0.

- [ ] **Step 3: Verify**

Run: `gh repo view sortdinc/wonderhire-skills --json visibility`
Expected: `{"visibility":"PUBLIC"}`

No commit — GitHub-side change only.

---

## Task 1: Add Claude Code marketplace manifest

**Files:**
- Create: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Create the directory + file**

Write `.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "wonderhire-skills",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills for the Wonderhire monorepo stack.",
  "owner": {
    "name": "Sortd",
    "url": "https://github.com/sortdinc"
  },
  "plugins": [
    {
      "name": "wonderhire-standards",
      "description": "Wonderhire coding standards. Auto-injects standing rules and build/test/lint gate every session; ships 14 task-scoped skills.",
      "source": "./",
      "category": "coding-standards"
    }
  ]
}
```

- [ ] **Step 2: Verify JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))"`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat: add Claude Code marketplace manifest

Registers \`wonderhire-skills\` marketplace with one plugin
\`wonderhire-standards\`. Enables \`claude plugin marketplace
add sortdinc/wonderhire-skills\`.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Add Claude Code plugin manifest

**Files:**
- Create: `.claude-plugin/plugin.json`

- [ ] **Step 1: Create the file**

Write `.claude-plugin/plugin.json`:

```json
{
  "name": "wonderhire-standards",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills.",
  "author": {
    "name": "Sortd",
    "url": "https://github.com/sortdinc"
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/wh-session-start.js\"",
            "timeout": 5,
            "statusMessage": "Loading wonderhire-standards..."
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "${CLAUDE_PLUGIN_ROOT}/hooks/wh-statusline.sh"
  }
}
```

- [ ] **Step 2: Verify JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))"`
Expected: no output, exit 0.

- [ ] **Step 3: Verify referenced hook files exist**

Run: `test -f hooks/wh-session-start.js && test -x hooks/wh-statusline.sh && echo OK`
Expected: `OK`.

If `wh-statusline.sh` is not executable, run `chmod +x hooks/wh-statusline.sh` and stage it.

- [ ] **Step 4: Commit**

```bash
git add .claude-plugin/plugin.json
git commit -m "feat: add Claude Code plugin manifest

Wires SessionStart hook + statusline to existing hooks/
runtime. \${CLAUDE_PLUGIN_ROOT} resolves to the installed
plugin directory.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Add Gemini CLI extension manifest

**Files:**
- Create: `gemini-extension.json`

- [ ] **Step 1: Create the file**

Write `gemini-extension.json`:

```json
{
  "name": "wonderhire-standards",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills for the Wonderhire monorepo stack.",
  "version": "0.1.0",
  "contextFileName": "GEMINI.md"
}
```

- [ ] **Step 2: Verify JSON parses + GEMINI.md exists**

Run: `node -e "JSON.parse(require('fs').readFileSync('gemini-extension.json','utf8'))" && test -f GEMINI.md && echo OK`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add gemini-extension.json
git commit -m "feat: add Gemini CLI extension manifest

Enables \`gemini extensions install
https://github.com/sortdinc/wonderhire-skills\`. Gemini loads
existing GEMINI.md as context file every session.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Add Codex repo-local auto-start config

**Files:**
- Create: `.codex/config.toml`
- Create: `.codex/hooks.json`

- [ ] **Step 1: Create `.codex/config.toml`**

```toml
[features]
codex_hooks = true
```

- [ ] **Step 2: Create `.codex/hooks.json`**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "node hooks/wh-session-start.js",
            "timeout": 5,
            "statusMessage": "Loading wonderhire-standards"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('.codex/hooks.json','utf8'))"`
Expected: no output, exit 0.

- [ ] **Step 4: Verify hook path resolves from repo root**

Run: `cd /Users/lavhe/CODE/wonderhire-skills && test -f hooks/wh-session-start.js && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add .codex/config.toml .codex/hooks.json
git commit -m "feat: add Codex repo-local auto-start

Enables auto-start when Codex runs inside this repo clone.
Users installing the Codex plugin into their own repos get
\$wonderhire-standards manually; copy these files over for
always-on behavior there too.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Update README install table + per-agent details

**Files:**
- Modify: `README.md:60-74` (the current "## Install" section through the Uninstall line)

- [ ] **Step 1: Read current state**

Run: `sed -n '58,76p' README.md`
Expected: see current 9-line install table (Claude Code plugin, Claude Code manual, Codex, Cursor, Windsurf, Cline, Copilot, Gemini CLI, Other agents) plus Uninstall line.

- [ ] **Step 2: Replace the `## Install` section**

Replace the entire block from `## Install` through the `Uninstall:` line with the following (verbatim — do not re-word):

```markdown
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
```

- [ ] **Step 3: Verify tables render**

Run: `grep -c '^| \*\*' README.md`
Expected: ≥ 8 (one per agent in install table).

Run: `grep -c '<details>' README.md`
Expected: 5 (Claude Code, Codex, Gemini, rule-based agents, other agents).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: rewrite install section with one-command-per-agent table

Matches JuliusBrussee/caveman install surface. Nine install
tracks, per-agent <details> sections, 'What You Get' feature
matrix.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Update CLAUDE.md canonical-files table

**Files:**
- Modify: `CLAUDE.md` (the "Single source of truth — edit only these" table, around line 30)

- [ ] **Step 1: Read current state**

Run: `sed -n '28,40p' CLAUDE.md`
Expected: see current table with 5 rows (SKILL.md, rules/wonderhire-activate.md, hooks/wh-session-start.js, hooks/wh-statusline.sh/.ps1, hooks/wh-config.js).

- [ ] **Step 2: Extend the "Single source of truth" table**

Find the line `| `hooks/wh-config.js` | Shared helpers — `safeWriteFlag`, worktree resolver. |` and append these rows immediately below it:

```markdown
| `.claude-plugin/marketplace.json` | Claude Code marketplace manifest. |
| `.claude-plugin/plugin.json` | Claude Code plugin manifest (SessionStart + statusline). |
| `gemini-extension.json` | Gemini CLI extension manifest. |
| `.codex/config.toml` | Enables Codex hooks feature for repo-local auto-start. |
| `.codex/hooks.json` | Codex SessionStart hook. |
```

- [ ] **Step 3: Add a note below the table**

After the table, before the "### Auto-generated / auto-synced" heading, add:

```markdown
These five manifest files are canonical — NOT auto-generated from `rules/wonderhire-activate.md` — so they are NOT overwritten by `.github/workflows/sync-skill.yml`. If the hook runtime paths (`hooks/wh-session-start.js`, `hooks/wh-statusline.sh`) ever move, update these manifests by hand.
```

- [ ] **Step 4: Verify**

Run: `grep -c '\.claude-plugin' CLAUDE.md`
Expected: ≥ 2.

Run: `grep -c 'gemini-extension.json' CLAUDE.md`
Expected: ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: register new install manifests in canonical-files table

Claude Code marketplace + plugin, Gemini extension, and Codex
auto-start configs are canonical sources — they reference
hooks/ paths directly, so any hook reorg must update them.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Push and end-to-end verify each install track

**Files:** None (verification only).

- [ ] **Step 1: Push**

Run: `git push origin main`
Expected: push succeeds, no CI conflicts (CI sync workflow runs on `skills/` or `rules/` changes, not these files).

- [ ] **Step 2: Verify Claude Code marketplace resolves**

Run: `gh api repos/sortdinc/wonderhire-skills/contents/.claude-plugin/marketplace.json -H "Accept: application/vnd.github.raw" | head -5`
Expected: first 5 lines of marketplace.json, starting with `{`.

If that works, the marketplace is reachable by Claude Code.

- [ ] **Step 3: Verify Gemini extension manifest resolves**

Run: `gh api repos/sortdinc/wonderhire-skills/contents/gemini-extension.json -H "Accept: application/vnd.github.raw" | head -3`
Expected: first 3 lines including `"name": "wonderhire-standards"`.

- [ ] **Step 4: Verify `npx skills` sees all 14 skills**

Run: `npx --yes skills add sortdinc/wonderhire-skills --list 2>&1 | tee /tmp/wh-skills-list.txt`
Expected: output lists all 14 skill names (`bdd-router-tests`, `code-quality`, `knex-migration`, `naming-imports-exports`, `react-tsx-component`, `sst-infra`, `supabase-auth`, `tanstack-trpc-query`, `trpc-procedure`, `wonderhire-build-test-lint-gate`, `wonderhire-commit`, `wonderhire-help`, `wonderhire-review`, `wonderhire-standing-rules`).

Count check: `grep -cE '^\s*[a-z-]+\s*$' /tmp/wh-skills-list.txt`
Expected: 14.

- [ ] **Step 5: Report results back to the user**

If all four verification steps pass, report:

> Installer surface live. All four tracks verified:
> - Claude Code marketplace manifest reachable
> - Gemini extension manifest reachable
> - `npx skills --list` returns 14 skills
> - Standalone `hooks/install.sh` unchanged
>
> Users can now run the commands in the README Install section.

If any step fails, do NOT mark the task complete. Report the exact failure and stop for user input — verification-before-completion gate applies.

---

## Self-Review

Spec coverage check:

- Install surface (9 tracks): Tasks 1-5 (manifests) + Task 5 (README). ✓
- `.claude-plugin/marketplace.json` content: Task 1. ✓
- `.claude-plugin/plugin.json` content: Task 2. ✓
- `gemini-extension.json` content: Task 3. ✓
- `.codex/config.toml` + `.codex/hooks.json` content: Task 4. ✓
- README rewrite: Task 5. ✓
- CLAUDE.md canonical-files update: Task 6. ✓
- `npx skills` compat verification: Task 7. ✓
- Public repo precondition: Task 0. ✓
- End-to-end verification: Task 7. ✓

Placeholder scan: no "TBD", "TODO later", "implement X", "similar to Task N" without content. All code blocks show exact content. All commands show expected output.

Type/path consistency check:
- `wonderhire-skills` = marketplace name, matches repo name. ✓
- `wonderhire-standards` = plugin name, matches `plugins/wonderhire-standards/` existing directory + `.claude-plugin/plugin.json` + `gemini-extension.json`. ✓
- `${CLAUDE_PLUGIN_ROOT}/hooks/wh-session-start.js` in Task 2 matches `hooks/wh-session-start.js` referenced in Task 4 (Codex) — both point at the same file, different resolution context (Claude plugin install dir vs Codex working dir). ✓
- `sortdinc` (not `sortd`) used consistently across all tasks. ✓

No gaps, no placeholders, no inconsistencies.
