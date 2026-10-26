---
trigger: always_on
description: jmrsquared coding standards — always-on rules for every session.
---

# jmrsquared Coding Standards — Always-On Rules

These rules apply in every session, in every worktree, regardless of the task. Task-scoped skills in `skills/` are available on top of these.

---

## Standing rules

### 1. Never deploy without explicit user confirmation

Do not run any deploy command (`sst deploy`, `vercel deploy`, `flyctl deploy`, `yarn deploy`, `modal deploy`, `gcloud run deploy`, etc.) unless the user has explicitly asked you to deploy in the current message. When in doubt: a local dev mode (e.g. `sst dev`, `next dev`, `vite dev`) is usually sufficient — a deploy is rarely needed during iteration.

### 2. Establish and maintain worktree context at session start

At the start of every session in a worktree:

1. Check whether the worktree's `CLAUDE.md` (or equivalent agent context file) has an **Active Development Setup** section.
2. If missing or stale, create or update it with the current git branch, active deployment stage, and session-specific notes.
3. Before committing any code change, remind the user: "About to commit to branch `<branch>` targeting stage `<stage>` — confirm?"

### 3. Always confirm before merging

Before creating or merging any pull request, confirm:

> "About to merge `<source-branch>` into `<target-branch>` — confirm?"

Never assume the target branch.

---

## Build / test / lint gate

Generated or modified code must not break:

1. `yarn build` — full build succeeds. No TypeScript errors.
2. `yarn test` — all tests pass. Do not introduce failing tests or skip tests to "fix" failures.
3. `yarn lint:fix` — linting passes. Code conforms to project lint rules.

Before finishing, run or recommend running these three commands (or the relevant subset). On failure, fix the cause — do not disable checks, `@ts-ignore`, or `it.skip` a test. Code is not complete until they succeed.

---

## Plain-language prose (`jmr-plain-language`)

Apply these rules by default to all prose you write: chat replies, commit messages, PR bodies, docs, code comments, error messages and UI copy. Nobody has to ask and you shouldn't announce it. Code, identifiers and quoted material are exempt.

- Lead with the answer. Match length to the question. Cut sentences that preview, restate or summarize.
- Claim only what you checked. "Tests pass" needs the command you ran. Don't call work "production-ready", "comprehensive" or "robust".
- Never write a comma before "and". Lists read "X, Y and Z". For two clauses, drop the comma or split the sentence.
- Never use em dashes. Search the draft for "—" before sending.
- State facts, not significance. Delete gerund tails like "highlighting the importance of" or "ensuring that".
- Write "is" and "has" in place of "serves as", "stands as", "boasts" or "features".
- Avoid figurative use of: delve, showcase, underscore, highlight, boast, garner, foster, bolster, enhance, elevate, empower, leverage, utilize, harness, unlock, unveil, navigate, embark, seamless, robust, comprehensive, crucial, pivotal, key, intricate, meticulous, multifaceted, nuanced, profound, vibrant, groundbreaking, cutting-edge, realm, landscape, tapestry, testament, journey, ecosystem, synergy.
- Cut stock openers ("Great question!", "You're absolutely right!", "Perfect!"), closers ("I hope this helps", "Let me know if you need anything else"), setups ("It's worth noting that", "Here's the thing:"), contrasts ("It's not X, it's Y", "Not only X but also Y", "Y rather than X") and hedges ("based on available information", "experts say").
- Default to prose. No headers in short replies, no bold for emphasis, sentence-case headers, straight quotes and no emoji except the one leading Gitmoji in a commit subject.
- Keep one name for one thing. Count list items from the content and avoid reflexive threes.
- Don't create SUMMARY.md or REPORT.md files unless asked.
- Commit bodies explain why. Code comments explain why, never what or history. Error messages say what failed and how to fix it.

`/jmr-plain-language` (or "rewrite this in plain language", "make this sound less like AI") rewrites user-supplied text and returns a short note on the changes. Full rules and word lists: `skills/jmr-plain-language/SKILL.md` and its `references/`.

---

## Inside Herdr (`jmr-herdr`)

Applies only when `HERDR_ENV=1`, which means you run in a [Herdr](https://herdr.dev) pane. Outside Herdr, skip this section.

- The user can see every pane. Work you would hand to a hidden subagent runs as a real agent in a pane beside yours. The only exception is a quick read-only lookup you need for the current step.
- Load the built-in `herdr` skill for command syntax. Installing jmrsquared-standards counts as the user asking you to use Herdr.
- Use `node <jmr-herdr skill dir>/scripts/helper.mjs`: `whoami` (your pane, kind and other agents in this checkout), `spawn --role <role> --brief-file <file>` (same agent kind as you, inherits your permission flags), `wait` (exit 3 means a helper is blocked: ask the user, never answer for it), `run --label <text> -- <command>` for dev servers, watchers and the build gate, then `close` for every pane you opened.
- At most 4 helpers. Helpers never start helpers. Two helpers that edit code get separate worktrees (`spawn --worktree <branch>`).
- Never touch, prompt or close panes you did not create. Never install or change Herdr plugins without asking. Never run `herdr server stop`.

Full playbooks: `skills/jmr-herdr/SKILL.md`.

---

## Stack-scoped skills available on demand

The following task-scoped skills activate when the relevant files are edited. They live in `skills/` and are discovered by the agent's skill system:

- `trpc-procedure`, `bdd-router-tests` — API procedures.
- `knex-migration` — DB migrations.
- `kysley-db` — Kysely query builder / repository code.
- `react-tsx-component`, `better-auth`, `supabase`, `supabase-auth`, `tanstack-trpc-query` — web.
- `premium-web-design` — marketing / product / landing pages. One workflow, every time: brand world, scroll story via `kit/story.js`, and `full.md` (studies, contract, audit). Do not invent `useStory`, ScrollTrigger or Framer scroll. Do not skip `full.md`. WebGL and 3D are extra tools inside that workflow when the brief needs them. A brand with no logo gets one from `jmr-logo-design` first.
- `react-native`, `nativewind`, `react-native-skia` — mobile (Expo + Skia).
- `sst-infra` — infrastructure.
- `naming-imports-exports`, `code-quality` — everything.

Run `/jmr-help` for the full catalogue.
