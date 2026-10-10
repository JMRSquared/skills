---
name: agents-execute
description: "Use when the owner runs /agents-execute to hand off a mission, or the repo's own spec (\"/agents-execute lets build\"), for unattended parallel building on a GitHub repository until a milestone branch is merged into main."
disable-model-invocation: true
---

# /agents-execute: Autonomous Mission Execution

`/agents-execute` turns a mission into a milestone and starts agents building it. It writes the spec, splits it into tickets, publishes them as GitHub issues on a new `milestone/<slug>` branch, then runs `/jmr-cycle` under `/loop` until that branch is merged into the base branch. It follows the [`mattpocock/skills`](https://github.com/mattpocock/skills) chain `/to-spec` → `/to-tickets` for planning and sits in the human's seat wherever those skills stop to ask.

| Part | Owns |
|---|---|
| `/agents-execute` (this skill) | Mission, spec, tickets, the milestone branch, starting the loop |
| `/jmr-cycle` | Claims, parallel builders, a reviewer for every pull request, merges into the milestone branch, close-out, landing |
| `/loop` | Repeating `/jmr-cycle` until it reports `complete` |

## Contract

The user's objective is your **mission**. Decision authority is delegated: the user is out of the loop for the whole mission. When several approaches are valid, weigh them and pick the strongest. Record the choice in `notes/decisions.md` and continue. Repo inspection, docs, tests, experiments, research and deduction answer every engineering, product and operational question. Uncertainty is an input to a decision, never a reason to stop.

The run's authority is the `/jmr-cycle` Authority section: it replaces the confirm-before-commit, merge and deploy prompts in `jmr-standing-rules` and `jmr-commit` for this mission, inside that section's limits.

**Definition of done:** `milestone/<slug>` is merged into the base branch, with every ticket merged, one final review run and the full gate passing. `/jmr-cycle` reaches it; this skill starts it.

## Requirements

- **A GitHub repository you can push to.** Tickets, claims, reviews and status live in GitHub issues and pull requests. Without one, `/agents-execute` stops; there is no local fallback.
- **`gh`**, signed in.
- **`jmr-cycle`**, which ships with jmrsquared-standards. Set `CYCLE="node <jmr-cycle skill directory>/scripts/cycle.mjs"`. The directory is `~/.agents/skills/jmr-cycle`, `~/.claude/skills/jmr-cycle` or the plugin's `skills/jmr-cycle`.

## Loading the chain skills

`to-spec`, `to-tickets` and `jmr-cycle` are user-invoked (`disable-model-invocation: true`), so a Skill tool call cannot fire them. Load one by reading its `SKILL.md` from `~/.agents/skills/<name>/`, `~/.claude/skills/<name>/` or your harness's equivalent. Run its steps with the overrides below. The Contract wins every conflict. When `to-spec` or `to-tickets` is missing, the step's own text is the full procedure. Install them with:

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

3. **Explore.** Spawn exploration subagents in parallel: the code the mission touches, prior art for tests, external docs (`research`). Each writes markdown into the `notes/` folder. Read the repo's `CLAUDE.md` or `AGENTS.md`, glossary and `docs/adr/` and use their vocabulary (`domain-modeling`). Done when every area the mission touches has a notes file an implementer could start from.

4. **Spec. Load `to-spec`.** Override: where it checks seams with the user, pick them yourself and record why in `notes/decisions.md`; write the result to `spec.md` instead of publishing it elsewhere. The spec holds the problem, the solution, numbered user stories, implementation decisions, testing decisions and out of scope. Name the seams where tests attach: existing seams over new ones, the highest seam possible, as few as possible. Add **acceptance scenarios**, each a checkable behaviour with an id `<PREFIX>-001`, `<PREFIX>-002` and so on; status counts these ids in test titles. Leave file paths and code out. Done when every outcome maps to a user story and every user story to at least one scenario.

5. **Tickets. Load `to-tickets`.** Override: replace its "Quiz the user" step with your own review of the graph and write `tickets.json` instead of publishing. Split the spec into **tracer-bullet** tickets: each a thin vertical slice through every layer, verifiable on its own and sized to one fresh context window. Prefactor tickets come first. A wide mechanical refactor goes expand, migrate in batches, contract. Each ticket:

   ```json
   { "id": "T03", "type": "feature", "title": "Refund a captured charge",
     "body": "What to build, the spec sections and user stories it covers, how to verify it.",
     "blockedBy": ["T01"], "scenarios": ["PAY-004", "PAY-005"], "serial": "db" }
   ```

   `type` is one of `feature`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`. `serial` is optional: tickets that share one (a database schema, a shared registry) never build at once. Review the graph:
   - Every scenario sits on exactly one ticket. Every user story is covered.
   - Two tickets that edit one shared file get a blocking edge, a shared `serial` or exact names pinned in the ticket bodies.
   - Each edge gates real work. Drop any that only reflect writing order.

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
   - `deploy` lists only deploy commands the prompt asked for, run after landing.

7. **Publish.** Run `git fetch origin <base>`, then `git worktree add -b milestone/<slug> "${TMPDIR:-/tmp}/agents-execute/<slug>/wt" origin/<base>` and work inside that worktree. Write `docs/milestones/<slug>/` with `milestone.json`, `spec.md`, `tickets.json` and `decisions.md` (from `notes/decisions.md`, plus the mission's outcomes). From the worktree root:
   1. `$CYCLE validate --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`. Fix every error.
   2. Commit with `jmr-commit`, then `git push -u origin milestone/<slug>`.
   3. `$CYCLE publish --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`. It is safe to rerun; on failure, fix the cause and run it again before going on.
   4. `git worktree remove` the worktree.

8. **Run.** Load `jmr-cycle` and run one full cycle for `<slug>` in this session. Then keep it going until done:
   - Claude Code: invoke the `loop` skill with `/jmr-cycle <slug>` and no interval, so it paces itself by each cycle's `CYCLE_RESULT` line and ends on `complete`.
   - A harness with no loop: tell the user to repeat `/jmr-cycle <slug>` or schedule it (the `jmr-cycle` "Running unattended" section).

9. **Report.** In at most six lines: the milestone branch, the status issue link, ticket and scenario counts, what the first cycle merged or started, the decisions that shape the build. Say that the loop runs until `milestone/<slug>` is merged into `<base>`.

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

The user assigned a mission. Default: **Analyze → Decide → Plan → Publish → Loop → Land.**
