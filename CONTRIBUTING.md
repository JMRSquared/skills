# Contributing

Improvements to any SKILL.md prompt are welcome — open a PR with before/after examples showing the change.

## How

1. Fork the repo.
2. Edit the canonical source:
   - `skills/<name>/SKILL.md` for a skill's behaviour and frontmatter.
   - `rules/jmrsquared-activate.md` for the always-on rule body.
   - `hooks/jmr-*.{js,sh,ps1}` for the Claude Code SessionStart and statusline scripts.
3. Open a PR with:
   - **Before:** what it says now.
   - **After:** what it says with your change.
   - One sentence on why the change is better.

> **Note:** The mirrored copies under `plugins/jmrsquared-standards/`, `.cursor/`, `.windsurf/`, `.clinerules/`, `.github/copilot-instructions.md`, `AGENTS.md`, and `GEMINI.md` are auto-synced by CI after merge. Do not edit them directly.

Small focused change > big rewrite. Keep it simple.

## Ideas

See [issues labeled `good first issue`](../../issues?q=label%3A%22good+first+issue%22) for starter tasks.
