---
name: agents-execute
description: "Use when the owner runs /agents-execute to hand off a mission, or the repo's own spec (\"/agents-execute lets build\"), for unattended parallel building on a GitHub repository until a milestone branch is merged into main. Slash-command only; agents without slash support should load this file directly and follow the same steps."
version: 1.0.0
---

# /agents-execute: Autonomous Mission Execution

`/agents-execute` turns a mission into a milestone and starts agents building it. It writes the spec, splits it into tickets, publishes them as GitHub issues on a new `milestone/<slug>` branch, then runs `/jmr-cycle` under `/loop` until that branch is merged into the base branch. It follows the [`mattpocock/skills`](https://github.com/mattpocock/skills) chain `/to-spec` → `/to-tickets` for planning and sits in the human's seat wherever those skills stop to ask.

| Part | Owns |
|---|---|
| `/agents-execute` (this skill) | Mission, spec, tickets, the milestone branch, starting the loop |
| `/jmr-cycle` | Claims, parallel builders, a reviewer for every pull request, merges into the milestone branch, close-out, landing |
| `$CYCLE loop` or `/loop` | Repeating `/jmr-cycle` in a fresh context each time until it reports `complete` |

## Contract

The user's objective is your **mission**. Decision authority is delegated: the user is out of the loop for the whole mission. When several approaches are valid, weigh them and pick the strongest. Record the choice in `notes/decisions.md` and continue. Repo inspection, docs, tests, experiments, research and deduction answer every engineering, product and operational question. Uncertainty is an input to a decision, never a reason to stop.

The run's authority is the `/jmr-cycle` Authority section: it replaces the confirm-before-commit, merge and deploy prompts in `jmr-standing-rules` and `jmr-commit` for this mission, inside that section's limits.

**Definition of done:** `milestone/<slug>` is merged into the base branch, with every ticket merged, one final review run and the full gate passing. `/jmr-cycle` reaches it; this skill starts it.

**Speed is the goal.** Land working features in as few cycles as possible. A feature that works is done, even when the code could be nicer. Plan the smallest set of tickets that delivers the mission and leave everything else out of scope.

## Requirements

- **A GitHub repository you can push to.** Tickets, claims, reviews and status live in GitHub issues and pull requests. Without one, `/agents-execute` stops; there is no local fallback.
- **`gh`**, signed in.
- **`jmr-cycle`**, which ships with jmrsquared-standards. Set `CYCLE="node <jmr-cycle skill directory>/scripts/cycle.mjs"`. The directory is `~/.agents/skills/jmr-cycle`, `~/.claude/skills/jmr-cycle`, `~/.config/opencode/skills/jmr-cycle` or the plugin's `skills/jmr-cycle`.
- **Optional: Herdr.** Inside a Herdr pane (`HERDR_ENV=1`), set `JH="node <jmr-herdr skill directory>/scripts/helper.mjs"` from the same skills directory. Exploration helpers, the loop and every cycle then run in panes the owner can watch.
- **Optional: the savvy-progress mod** for Claude Code. When `mcp__savvy-progress__progress` is among your tools (load it with ToolSearch when it is deferred), report the mission to the bar above the prompt as the steps below say. Skip every progress call silently when the tool is absent.

## Loading the chain skills

`to-spec`, `to-tickets` and `jmr-cycle` are slash-command-only skills, so an auto-loader cannot fire them. Load one by reading its `SKILL.md` from the agent's installed skills directory (`~/.agents/skills/<name>/`, `~/.claude/skills/<name>/`, `~/.config/opencode/skills/<name>/`, or your harness's equivalent). Run its steps with the overrides below. The Contract wins every conflict. When `to-spec` or `to-tickets` is missing, the step's own text is the full procedure. Install them with:

```bash
npx skills@latest add mattpocock/skills --skill to-spec --skill to-tickets --skill code-review --skill tdd -g
```

## Steps

1. **Preflight.** Run `$CYCLE preflight`. On exit 5, print its message and stop: `/agents-execute` needs a GitHub repository. Never create, publish or reconfigure a repository yourself; that is the owner's call. Note `defaultBranch` from its output.

2. **Find the mission.**
   - An objective in the prompt is the mission.
   - A prompt with no objective ("lets build", "build it", "go") means: build what the repo already specifies. First run `$CYCLE milestones`. Resume every open milestone it lists: go to step 8 for each slug. Then check `git ls-remote --heads origin 'milestone/*'` for a branch with no status issue, open or closed (`gh issue list --label jmr:status --label milestone:<slug> --state all`): its publish failed, so rerun step 7's `publish` from a worktree of it and resume it too. When anything was resumed, stop there. Otherwise find the spec: a PRD, spec, roadmap or design doc under `docs/`, the README's roadmap, or GitHub issues that describe planned work. Pick the most complete unbuilt one and record why in `notes/decisions.md`. When no spec or objective exists, stop and say so: nothing can be built from nothing.
   - Choose a short kebab-case `<slug>` with no `milestone/<slug>` branch on `origin`. Pick a 2 to 6 letter uppercase scenario prefix (`PAY`).
   - The mission folder is `${TMPDIR:-/tmp}/agents-execute/<slug>/`. Write the mission and its outcomes as checkable statements in its `notes/mission.md`. `notes/decisions.md` collects dated decisions until step 7 commits it.
   - Progress: call the progress tool with `title` (the milestone title, a few words) and `phase: "plan"`.

3. **Explore.** Start exploration helpers in parallel, as `$JH spawn --role explore-<area>` panes inside Herdr (the `jmr-herdr` research fan-out) and as subagents elsewhere: the code the mission touches, prior art for tests, external docs (`research`). Each writes markdown into the `notes/` folder. Read the repo's `CLAUDE.md` or `AGENTS.md`, glossary and `docs/adr/` and use their vocabulary (`domain-modeling`). Done when every area the mission touches has a notes file an implementer could start from.

4. **Spec. Load `to-spec`.** Override: where it checks seams with the user, pick them yourself and record why in `notes/decisions.md`; write the result to `spec.md` instead of publishing it elsewhere. The spec holds the problem, the solution, numbered user stories, implementation decisions, testing decisions and out of scope. Name the seams where tests attach: existing seams over new ones, the highest seam possible, as few as possible. Add **acceptance scenarios**, each a checkable behaviour with an id `<PREFIX>-001`, `<PREFIX>-002` and so on; status counts these ids in test titles. A scenario is something a user or caller sees ("a captured charge can be refunded in full"), never an internal detail ("`refund()` returns a `Refund`"). Aim for one to three scenarios per user story. Leave file paths and code out. Put polish, nice-to-haves and cleanup under out of scope. Done when every outcome maps to a user story and every user story to at least one scenario.

5. **Tickets. Load `to-tickets`.** Override: replace its "Quiz the user" step with your own review of the graph and write `tickets.json` instead of publishing. Split the spec into **feature tickets**. Each ticket is a whole feature or bug fix a user could try once it merges, built through every layer it needs. One implementer must be able to finish it in one session. The helpers, types, refactors, tests and docs a feature needs go inside that feature's ticket, never in a ticket of their own. No prefactor tickets. When the mission is itself a refactor or migration, name each ticket by what works afterwards ("Checkout runs on the new payments client"). Aim for two to six tickets; more than eight means they are too small, so merge them. Each ticket:

   ```json
   { "id": "T03", "type": "feature", "title": "Refund a captured charge",
     "body": "What the user can do when this merges, the spec sections and user stories it covers, how to check it works.",
     "blockedBy": ["T01"], "scenarios": ["PAY-004", "PAY-005"], "serial": "db" }
   ```

   `type` is `feature` or `fix`; `$CYCLE validate` rejects anything else. Titles name the outcome ("Refund a captured charge"), not the code ("Add `refund()` helper"). `serial` is optional: tickets that share one (a database schema, a shared registry) never build at once. Review the graph:
   - Merge any ticket a user could not try on its own into the ticket it serves.
   - Every scenario sits on exactly one ticket. Every user story is covered.
   - Two tickets that edit one shared file get a blocking edge, a shared `serial` or exact names pinned in the ticket bodies.
   - Each edge gates real work. Drop any that only reflect writing order.

   Progress, once the graph is final: `total` (ticket count), `done: 0`, `phase: "delegate"`.

6. **Milestone file.** Write `milestone.json`:

   ```json
   { "version": 1, "slug": "payments", "title": "Card payments",
     "base": "main", "branch": "milestone/payments", "scenarioPrefix": "PAY",
     "install": "yarn install",
     "gate": ["yarn build", "yarn test", "yarn lint"],
     "fix": ["yarn lint:fix"],
     "testReports": ["yarn vitest run --reporter=json --outputFile=$JMR_RESULTS/vitest.json"],
     "land": "merge", "deploy": [] }
   ```

   - `base` is `defaultBranch` unless the prompt names another.
   - `gate` is the repo's own build, test and lint commands, in forms that check without rewriting files. `fix` holds the rewriting forms (formatters, `lint:fix`) that implementers run before committing. In a jmrsquared repo the two together are `jmr-build-test-lint-gate`.
   - `testReports` writes JSON (Jest, Vitest) or JUnit XML (pytest `--junitxml`, gotestsum and most other runners) into `$JMR_RESULTS`, so status can show pass and fail per scenario.
   - `land` is `merge` unless the prompt says the owner merges it, which makes it `pr`.
   - `deploy` lists only deploy commands the prompt asked for, run after landing. Write a step that must never run twice (a seed, a one-off data fix, a release notification) as `{ "run": "<command>", "once": true }`: if a crash cuts it off, the owner decides whether it ran.

7. **Publish.** Run `git fetch origin <base>`, then `git worktree add -b milestone/<slug> "${TMPDIR:-/tmp}/agents-execute/<slug>/wt" origin/<base>` and work inside that worktree. Write `docs/milestones/<slug>/` with `milestone.json`, `spec.md`, `tickets.json` and `decisions.md` (from `notes/decisions.md`, plus the mission's outcomes). From the worktree root:
   1. `$CYCLE validate --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`. Fix every error.
   2. Commit with `jmr-commit`, then `git push -u origin milestone/<slug>`.
   3. `$CYCLE publish --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`. It is safe to rerun; on failure, fix the cause and run it again before going on.
   4. `git worktree remove` the worktree.

8. **Run.** Keep every cycle out of this session's context: each one starts empty and reads its state from GitHub.
   - Inside Herdr: start the loop in its own pane, with each cycle as an agent pane beside it, as the `jmr-cycle` "Running unattended" section shows. Write its log to `${TMPDIR:-/tmp}/agents-execute/<slug>/loop.log`. Give the cycle `--kind` set to your own agent kind and the permission flags this session runs with.
   - Claude Code with a shell: start `$CYCLE loop --milestone <slug>` in the background (Bash `run_in_background`). It runs each cycle as a fresh `claude -p "/jmr-cycle <slug>"` process and stops on `complete`. When headless permissions would block the cycle's `git`, `gh` or `node` calls, put the agent command after `--` (see the `jmr-cycle` "Running unattended" section).
   - Claude Code without a background shell, or any other agent: invoke your agent's loop mechanism with no interval and the subagent prompt from that section, so each cycle runs in its own subagent and this session keeps only the reports. The `loop` skill in Claude Code, `/loop` in OpenCode, and equivalent subagent schedulers in Cursor / Windsurf / Codex / Gemini CLI all fit.
   - A harness with no loop: tell the user to run `$CYCLE loop --milestone <slug>` in a terminal, repeat `/jmr-cycle <slug>` or schedule it.
   - **Keep the bar moving** (only with the progress tool). The loop prints one JSON line per cycle. Follow that output (the Herdr log, or the background command's output) with a watcher that wakes you once per line, such as Claude Code's Monitor on `tail -f`. For each line with `progress`, call the progress tool with its `done` and `total` and `phase` `"delegate"` for `build` or `"review"` for `closeout`. On `"result": "complete"`, call it with `finished: true` and stop watching. A wake-up does nothing else: the cycles own the work.

9. **Report.** In at most six lines: the milestone branch, the status issue link, ticket and scenario counts, how the loop runs (name the pane inside Herdr), the decisions that shape the build. Say that the loop runs until `milestone/<slug>` is merged into `<base>`.

## Skills to reach for

| Need | Skill |
|------|-------|
| Spec and tickets | `to-spec`, `to-tickets` (load, see above) |
| Building, reviewing, merging, landing | `jmr-cycle` (load) |
| Domain terms, glossary, ADRs | `domain-modeling` |
| Interface and module boundaries | `codebase-design` |
| Facts from docs or third-party APIs | `research` |
| "How should this behave or look" | `prototype` (throwaway, then decide) |
| Standards every builder and reviewer applies | the Standards table in `jmr-cycle` |

## Philosophy

The user assigned a mission. Default: **Analyze → Decide → Plan → Publish → Loop → Land.** Few tickets, each a working feature, landed fast. Hours of cycles with nothing a user can try is a failed plan.
