# Multi-agent installer surface — design

**Date:** 2026-04-24
**Author:** Joe Sirwali (tech@jmrsquared.com)
**Status:** Approved design, pending implementation plan

## Summary

Wonderhire-standards currently installs via `./hooks/install.sh` clone + manual `settings.json` edit, plus rule files that users copy by hand into `.cursor/`, `.windsurf/`, etc. The ask: one simple command per agent, matching the install surface shipped by [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman).

We adopt caveman's model verbatim. No new CLI is built. We consume three pre-existing third-party tools — `claude plugin` (Claude Code marketplace), `gemini extensions` (Gemini CLI extensions), and `npx skills` ([vercel-labs/skills](https://github.com/vercel-labs/skills)) — by adding the manifest files each tool expects. The repo becomes simultaneously a Claude Code marketplace, a Gemini extension, a Codex plugin, and an `npx skills` source.

## Goals

- One-line install per agent (Claude Code, Gemini CLI, Codex, Cursor, Windsurf, Cline, Copilot, and 40+ more via `npx skills`).
- No custom CLI code or npm package to maintain.
- Preserve existing standalone curl installer (`hooks/install.sh`) for users who want hooks without plugin system.
- Preserve existing canonical sources (`skills/<name>/SKILL.md`, `rules/wonderhire-activate.md`, `hooks/`) — new manifests reuse existing hook code rather than duplicating it.

## Non-goals

- Building a `@sortd/skills` npm package (considered, rejected — caveman shows the ecosystem tooling already exists).
- Hosting a skills registry.
- Claiming generic `skills` npm name.
- Writing the installer CLI ourselves.

## Install surface (target)

Nine tracks. Exact commands — what users run post-merge:

| Agent | Command |
|-------|---------|
| Claude Code | `claude plugin marketplace add sortd/wonderhire-skills && claude plugin install wonderhire-standards@wonderhire-skills` |
| Gemini CLI | `gemini extensions install https://github.com/sortd/wonderhire-skills` |
| Codex | Clone repo → `/plugins` → search "wonderhire" → install |
| Cursor | `npx skills add sortd/wonderhire-skills -a cursor` |
| Windsurf | `npx skills add sortd/wonderhire-skills -a windsurf` |
| Copilot | `npx skills add sortd/wonderhire-skills -a github-copilot` |
| Cline | `npx skills add sortd/wonderhire-skills -a cline` |
| Any other agent | `npx skills add sortd/wonderhire-skills` |
| Standalone Claude Code hooks | `bash <(curl -s https://raw.githubusercontent.com/sortd/wonderhire-skills/main/hooks/install.sh)` |

Uninstall parity: `npx skills remove wonderhire-standards`, `claude plugin uninstall`, `gemini extensions uninstall wonderhire-standards`, `bash hooks/uninstall.sh`.

## Architecture

Each install channel reads a different manifest from the same repo. The hook runtime (`hooks/wh-session-start.js`, `hooks/wh-statusline.sh`) is shared across channels — all manifests reference these existing files rather than duplicating logic.

```
sortd/wonderhire-skills (public GitHub repo)
│
├── .claude-plugin/          ← Claude Code marketplace + plugin manifest
│   ├── marketplace.json     (new) — registers marketplace `wonderhire-skills`
│   └── plugin.json          (new) — wires SessionStart + statusline to hooks/
│
├── gemini-extension.json    (new) — Gemini CLI extension manifest
│
├── .codex/                  ← Codex repo-local auto-start
│   ├── config.toml          (new) — enables codex_hooks
│   └── hooks.json           (new) — SessionStart hook injecting tier-1 body
│
├── plugins/wonderhire-standards/   ← existing Codex plugin bundle (unchanged)
│
├── skills/**/SKILL.md       ← canonical skills (consumed by npx skills)
├── AGENTS.md                ← always-on rule body (consumed by npx skills)
├── GEMINI.md                ← context file (consumed by Gemini extension)
├── .cursor/ .windsurf/ .clinerules/ .github/  ← agent rule surfaces (unchanged)
│
└── hooks/                   ← shared hook runtime (unchanged)
    ├── wh-session-start.js  ← referenced by .claude-plugin/plugin.json
    ├── wh-statusline.sh     ← referenced by .claude-plugin/plugin.json
    └── install.sh           ← standalone curl installer (unchanged)
```

## New files — full content

### `.claude-plugin/marketplace.json`

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "wonderhire-skills",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills for the Wonderhire monorepo stack.",
  "owner": {
    "name": "Sortd",
    "url": "https://github.com/sortd"
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

### `.claude-plugin/plugin.json`

```json
{
  "name": "wonderhire-standards",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills.",
  "author": {
    "name": "Sortd",
    "url": "https://github.com/sortd"
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

Hook paths reference existing files — no duplication.

### `gemini-extension.json`

```json
{
  "name": "wonderhire-standards",
  "description": "Wonderhire coding standards — tier-1 always-on rules + tier-2 task-scoped skills for the Wonderhire monorepo stack.",
  "version": "0.1.0",
  "contextFileName": "GEMINI.md"
}
```

Gemini loads the existing `GEMINI.md` (already synced from `rules/wonderhire-activate.md`) on every session.

### `.codex/config.toml`

```toml
[features]
codex_hooks = true
```

### `.codex/hooks.json`

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

Repo-local auto-start for Codex users running inside this repo's checkout. The `plugins/wonderhire-standards/` bundle remains the install path for users consuming the plugin in their own repos.

## Modified files

### `README.md`

Replace current Install table with the nine-row table from the "Install surface" section above. Add per-agent `<details>` sections matching caveman's README layout, covering uninstall commands, always-on caveats for agents without hook systems, and the standalone hooks fallback for Claude Code.

### `CLAUDE.md`

Extend "Single source of truth — edit only these" table with the five new manifest files. Add a note: these are canonical manifests, NOT auto-generated from `rules/wonderhire-activate.md`, so they do not appear in `.github/workflows/sync-skill.yml`'s sync set.

### `.github/workflows/sync-skill.yml`

No change to sync logic. The new manifest files are root-level canonical files that sit outside the `skills/` → agent-surfaces rsync. Confirm the workflow does not accidentally delete them (current `rsync -a --delete` targets are scoped to subdirs, so they are safe).

## Compatibility check — `npx skills add`

`vercel-labs/skills` auto-discovers:
- `skills/<name>/SKILL.md` — already 14 present.
- `AGENTS.md` — already present at repo root.

Expected `npx skills add sortd/wonderhire-skills --list` output: 14 skills.
Expected `npx skills add sortd/wonderhire-skills -a cursor`: installs symlinks under `.cursor/skills/` pointing at each `skills/<name>/SKILL.md`; does NOT install `.cursor/rules/wonderhire.mdc` (the rule file is repo-specific, not a skill — users get tier-2 only unless they copy the rule file manually, matching caveman's documented behavior).

No repo changes needed for this track. Document the limitation in README per-agent details (mirroring caveman's footnote 2: "Add the always-on snippet below to those agents' system prompt or rule file if you want session-start activation.").

## Preconditions for install commands to work

- Repo must be public at `github.com/sortd/wonderhire-skills`.
- Current git remote: confirm during implementation. Repo may need to be created / renamed / made public.
- `hooks/wh-session-start.js` must remain at the exact path referenced by all three new manifests. Any future reorg must update all manifests.

## Risk register

| Risk | Mitigation |
|------|-----------|
| Repo not yet public at `sortd/wonderhire-skills` | Confirm before merging README. Gate marketplace/extension commands on public availability. |
| Claude Code marketplace schema URL (`anthropic.com/claude-code/marketplace.schema.json`) is unstable | Copied verbatim from caveman's working manifest; treat as known-good. |
| `npx skills` symlink model fails on Windows | Document `--copy` flag in README (caveman parity). |
| Gemini extensions only load `contextFileName`, not skills directory | Expected — Gemini gets tier-1 rule body only, same as caveman's Gemini install. Tier-2 skills accessed via `/caveman`-style slash commands (future; out of scope here). |
| Existing `plugins/wonderhire-standards/plugin.json` conflicts with new `.claude-plugin/plugin.json` | No conflict — different paths, different consumers. Codex reads `plugins/`, Claude Code marketplace reads `.claude-plugin/`. |

## Acceptance criteria

1. `claude plugin marketplace add sortd/wonderhire-skills` succeeds on a fresh Claude Code install.
2. `claude plugin install wonderhire-standards@wonderhire-skills` registers SessionStart hook + statusline without editing `settings.json` by hand.
3. `gemini extensions install https://github.com/sortd/wonderhire-skills` succeeds; `GEMINI.md` loads on next Gemini session.
4. `npx skills add sortd/wonderhire-skills --list` prints all 14 skills.
5. `npx skills add sortd/wonderhire-skills -a cursor` installs skills under `.cursor/skills/` in the target project.
6. `bash <(curl -s https://raw.githubusercontent.com/sortd/wonderhire-skills/main/hooks/install.sh)` still works (unchanged).
7. Codex users cloning the repo see auto-start via `.codex/hooks.json`.
8. README's install table renders the nine-row layout; per-agent `<details>` sections match caveman's structure.

## Out of scope (deferred)

- Slash commands for Gemini / Cursor / Windsurf (caveman ships `/caveman` for these; we defer until tier-2 skills prove they need manual triggering).
- `npx skills` registry submission so `npx skills find wonderhire` surfaces the repo — nice-to-have once repo is public.
- Windows PowerShell variant of `hooks/install.sh` already exists (`install.ps1`) — keep as-is.

## Implementation sequence (for planning skill)

1. Verify repo is public at `github.com/sortd/wonderhire-skills` (or coordinate the rename/transfer).
2. Create `.claude-plugin/marketplace.json` + `.claude-plugin/plugin.json`.
3. Create `gemini-extension.json`.
4. Create `.codex/config.toml` + `.codex/hooks.json`.
5. Update `README.md` install table + per-agent details.
6. Update `CLAUDE.md` canonical-files table.
7. End-to-end test each command against a scratch Claude Code / Gemini / Codex session.
8. Commit + push. CI sync (`.github/workflows/sync-skill.yml`) runs unchanged.
