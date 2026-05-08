---
name: jmr-commit
description: Use when the user asks to generate a commit message, runs /jmr-commit, or after staging changes. Produces Gitmoji + Conventional Commit messages (see https://gitmoji.dev/), plain-language clarity, and echoes the branch/stage confirmation from jmr-standing-rules before committing.
---

# Commit Workflow

Follow [gitmoji](https://gitmoji.dev/) for emoji meaning and [Conventional Commits](https://www.conventionalcommits.org/) for structure. Prefer **clear, specific** subjects: name the behavior or area changed, not vague words like “stuff”, “misc”, or “updates”.

## Before committing

Echo to the user:

> "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

`<branch>` = `git branch --show-current`. `<stage>` comes from the worktree's Active Development Setup section. Wait for `yes` (or explicit alternative) before running `git commit`.

## Message format

```
<emoji> <type>(<scope>): <subject>

<body>
```

- **Emoji:** one Unicode emoji at the start of the subject line, chosen from [gitmoji.dev](https://gitmoji.dev/) to match the **primary** intent of the change (not `:shortcode:` in the final message — use the real character).
- **Type:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `style`, or another conventional type that fits the emoji (keep types consistent with team tooling).
- **Scope:** optional — package or area (`api`, `web`, `db`, `infra`, `auth`).
- **Subject:** imperative mood, lowercase, ≤72 characters, no trailing period, **specific** (what changed and where, in plain language).
- **Body:** wrap ~72 chars. Explain *why* when it is not obvious; omit for trivial changes. Use `BREAKING CHANGE:` in the body when applicable.

## Emoji quick map

Use [gitmoji.dev](https://gitmoji.dev/) as the full catalogue. Common picks:

| Emoji | Typical type | Use |
|-------|----------------|-----|
| ✨ | feat | New user-visible capability |
| 🐛 | fix | Bug fix |
| ♻️ | refactor | Refactor without behavior change |
| 🎨 | style | Structure/format (non-functional layout of code) |
| ⚡️ | perf | Performance |
| 🔥 | chore | Remove code or files |
| ✅ | test | Add, update, or fix tests |
| 📝 | docs | Documentation |
| 🔧 | chore | Configuration |
| 👷 | ci | CI |
| 💚 | ci | Fix CI |
| ⬆️ / ➕ / ➖ | build | Dep upgrades / add / remove |
| 🗃️ | chore | Database migrations/schema |
| 💄 | style | UI and styling |
| 🔒️ | fix | Security / privacy |
| 🚨 | fix | Fix compiler or linter issues |
| 💥 | feat | Breaking change |

## Good examples

```
✨ feat(api): add batch import endpoint

Imports run in chunks of 100 to stay under the Lambda payload limit.
```

```
🐛 fix(auth): redirect only after session is loaded

Cold starts raced the profile query against refresh and sent authenticated
users to /login. Gate redirect on sessionLoaded.
```

## What to avoid

- Vague subjects: `chore: stuff`, `fix: bug`, `update: misc`.
- Trailing periods on the subject.
- Title case or sentence case in the subject (`feat: Add endpoint` — wrong).
- Stacking unrelated changes into one message; split commits when intents differ.
- `--no-verify` or amending to bypass hooks — fix the failure and commit cleanly.

## Optional local CLI

If [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) is installed (`yarn global add gitmoji-cli`), interactive commits can use `gitmoji -c`. Ensure `$(yarn global bin)` is on your `PATH` (often `~/.yarn/bin`).

## What "done" looks like

- Branch/stage confirmation sent and acknowledged.
- Commit runs cleanly (no hook failure).
- One leading gitmoji from [gitmoji.dev](https://gitmoji.dev/), plus Conventional Commits shape and a **clear** subject.
