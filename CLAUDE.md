# CLAUDE.md — wonderhire-standards

## Purpose

This repo ships **wonderhire-standards**: a multi-agent coding-standards distribution for the Wonderhire monorepo stack. It applies the Wonderhire standing rules and stack-specific skills automatically across Claude Code, Cursor, Windsurf, Cline, Copilot, Codex, and Gemini CLI.

## Standing rules (applied automatically to every session)

1. Never deploy without explicit user confirmation.
2. Establish and maintain worktree context at session start (branch + stage).
3. Always confirm before merging.

Plus the build/test/lint gate: work is not done until `yarn build`, `yarn test`, `yarn lint:fix` pass.

Source: `skills/wonderhire-standing-rules/SKILL.md`, `skills/wonderhire-build-test-lint-gate/SKILL.md`.

## README is a product artifact

README = product front door. Non-technical engineers read it to decide if wonderhire-standards is worth installing. Treat it like UI copy.

- Readable by non-AI-agent users. If you write "SessionStart hook injects system context," translate it for a human reader.
- Install table always complete + accurate. One broken install command costs a real user.
- "What You Get" table must sync with the actual `skills/` directory. Ship a new skill → add a row. Remove a skill → remove a row.
- Voice: professional, direct, senior-engineer tone. No jokey fillers.

## File structure and what owns what

### Single source of truth — edit only these

| File | What it controls |
|------|-----------------|
| `skills/<name>/SKILL.md` | Skill behaviour + frontmatter. Edit here. |
| `rules/wonderhire-activate.md` | Always-on body for Cursor, Windsurf, Cline, Copilot, Codex, Gemini. |
| `hooks/wh-session-start.js` | Claude Code SessionStart hook — injects tier-1 skills as system context. |
| `hooks/wh-statusline.sh` / `.ps1` | `[WH: <branch>@<stage>]` badge. |
| `hooks/wh-config.js` | Shared helpers — `safeWriteFlag`, worktree resolver. |

### Auto-generated / auto-synced — do not edit directly

Overwritten by CI on push to `main` when sources change. Edits here will be lost.

| File | Synced from |
|------|-------------|
| `.cursor/rules/wonderhire.mdc` | `rules/wonderhire-activate.md` + Cursor frontmatter |
| `.windsurf/rules/wonderhire.md` | `rules/wonderhire-activate.md` + Windsurf frontmatter |
| `.clinerules/wonderhire.md` | `rules/wonderhire-activate.md` |
| `.github/copilot-instructions.md` | `rules/wonderhire-activate.md` |
| `AGENTS.md` | `rules/wonderhire-activate.md` |
| `GEMINI.md` | `rules/wonderhire-activate.md` |
| `.cursor/skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` |
| `.windsurf/skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` |
| `plugins/wonderhire-standards/**` | `skills/`, `hooks/` |

## CI sync workflow

`.github/workflows/sync-skill.yml` fires on main push when `skills/**`, `rules/wonderhire-activate.md`, or `hooks/**` change. It rebuilds every agent-surface file from the canonical sources and commits with `[skip ci]`.

## Hook system (Claude Code)

Two hooks, not three (there are no modes to track):

- `hooks/wh-session-start.js` — SessionStart hook. Resolves `(branch, stage)` and writes `$CLAUDE_CONFIG_DIR/.wh-active`, then emits the concatenated tier-1 skill bodies to stdout for Claude Code to inject as system context. Silent-fails on any filesystem error.
- `hooks/wh-statusline.sh` / `.ps1` — reads the flag file and renders `[WH: <branch>@<stage>]`, falling back to `[WH]` when the flag is missing.

Flag file: `$CLAUDE_CONFIG_DIR/.wh-active` (falls back to `~/.claude/.wh-active`). Plain-text format `branch@stage`. Written via `safeWriteFlag` (symlink-safe, atomic rename, 0600).

`hooks/package.json` pins the directory to `{"type": "commonjs"}` so `require()` resolves even when an ancestor `package.json` declares `"type": "module"`.

## Adding a new skill

1. `mkdir skills/<name> && $EDITOR skills/<name>/SKILL.md`.
2. Frontmatter: `name`, `description`. Description must be specific enough that the agent's skill system picks it up on the right tasks and not others.
3. Add a row to the "What You Get" table in `README.md`.
4. If it's a new tier-1 rule, also append to `rules/wonderhire-activate.md` and `hooks/wh-session-start.js`'s reader.
5. Open a PR. CI syncs on merge.

## Key rules for agents working in this repo

- Edit `skills/<name>/SKILL.md` for skill behaviour. Never edit synced copies.
- Edit `rules/wonderhire-activate.md` for the always-on rule body. Never edit agent-specific rule copies.
- Hooks must silent-fail on filesystem errors. Never let a hook crash block session start.
- Any new flag-file write goes through `safeWriteFlag()` in `wh-config.js`. Direct `fs.writeFileSync` on predictable user-owned paths reopens the symlink-clobber attack surface.
- Hooks must respect `CLAUDE_CONFIG_DIR`, not hardcode `~/.claude`.
