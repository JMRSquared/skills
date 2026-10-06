---
name: agents-execute
description: "Hand off a mission for fully autonomous, parallel, end-to-end execution. Runs /to-spec, /to-tickets and /implement-spec unattended. Agents own 100% and never ask; supersedes the deploy / merge confirm gates for the mission."
disable-model-invocation: true
---

# /agents-execute: Autonomous Mission Execution

`/agents-execute` is `/implement-spec` with nobody at the keyboard. It runs the [`mattpocock/skills`](https://github.com/mattpocock/skills) chain `/to-spec` → `/to-tickets` → `/implement-spec` end to end, sitting in the human's seat at every point where those skills stop to ask.

Vendor-neutral and model-agnostic. Where this says "spawn a subagent", use your harness's parallel-agent or task-delegation primitive; with none, run the same steps sequentially.

## Contract

The user's objective is your **mission**. You own it end to end: architect, tech lead, implementer, reviewer, QA and DevOps at once. Decision authority is already delegated.

**Decide alone.** The user is out of the loop for the whole mission. When several approaches are valid, weigh them and pick the strongest. Record the choice in `notes/decisions.md` and continue. Repo inspection, docs, tests, experiments, research and deduction answer every engineering, product and operational question. Uncertainty is an input to a decision, never a reason to stop.

**Irreversible actions are yours.** For the mission this skill supersedes the confirm-before-deploy and confirm-before-merge gates in `jmr-standing-rules`. Deploy, merge, open and land PRs when they serve the mission. Before each irreversible step, make it recoverable (branch, tag or backup; prefer the reversible path; verify preconditions), then validate after. Judgement replaces the confirmation prompt.

## Loading the chain skills

`to-spec`, `to-tickets`, `implement` and `implement-spec` are user-invoked (`disable-model-invocation: true`), so a Skill tool call cannot fire them. **Load** one by reading its `SKILL.md` from the skills directory (`~/.agents/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md` or your harness's equivalent) and running its steps as written, with the overrides each step below lists. The Contract wins every conflict.

When a chain skill is not installed, the step's own text below is the full procedure. Install the chain with:

```bash
npx skills@latest add mattpocock/skills --skill to-spec --skill to-tickets --skill implement --skill implement-spec --skill code-review --skill tdd -g
```

`tdd`, `code-review`, `research` and `diagnosing-bugs` are model-invoked: call them through the Skill tool when installed.

## The orchestrator

You are the **orchestrator**. Your context window holds the mission, the task graph and the decisions; subagents hold the code. Push implementation, exploration, debugging and review into subagents so your window stays clear for coordination.

Talk to subagents through **context pointers**: paths to the spec, the ticket, the mission notes, a commit SHA. A subagent prompt names its pointers and its completion criterion. It repeats nothing a pointer already holds. Subagents report back the same way: a short verdict plus pointers (branch, commit, notes file).

**Tracker.** If the repo has `docs/agents/issue-tracker.md` (written by `/setup-matt-pocock-skills`), the spec and tickets live there. Otherwise the **mission directory** is the tracker, run as local markdown: `${TMPDIR:-/tmp}/agents-execute/<mission-slug>/` holding `spec.md`, `issues/NN-<slug>.md` and `notes/`. Keep `notes/` in the mission directory either way so every worktree can reach it.

## Steps

1. **Understand.** Restate the mission and its Definition of Done in `notes/mission.md`. Read the repo's agent docs (`CLAUDE.md`/`AGENTS.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`) and use their vocabulary. When the user hands over an existing spec or ticket set (an issue number, a `.scratch/` path, `/to-spec` or `/to-tickets` output), adopt it: run step 2, then go to step 6. Done when every requested outcome is written as a checkable statement.

2. **Explore.** Spawn exploration subagents in parallel: relevant code, prior art for tests, external docs (`research`). Each saves markdown into `notes/`. This is `implement-spec` step 2. Done when every area the mission touches has a notes file an implementer could start from.

3. **Size the mission.** A mission with no real dependency graph (one coherent change, one session's work) goes **direct**: **load `implement`** and run it in one implementer subagent, then go to step 7. Everything else runs steps 4 to 6.

4. **Spec. Load `to-spec`.** Override: where it says to check the seams with the user, pick them yourself and record why in `notes/decisions.md`. Without the skill, write `spec.md` with problem, solution, numbered user stories, implementation decisions, testing decisions and out of scope. Name the **seams** where tests attach: existing seams over new ones, the highest seam possible, as few as possible. Leave file paths and code snippets out. Done when every requested outcome maps to at least one user story.

5. **Tickets. Load `to-tickets`.** Override: replace its "Quiz the user" step with your own review of the graph, then publish. Without the skill, split the spec into **tracer-bullet** tickets: each a thin vertical slice through every layer (schema, API, UI, tests), verifiable on its own and sized to one fresh context window. Prefactor tickets come first; a wide mechanical refactor goes expand, migrate in batches, contract. Give each ticket its **blocking edges**. Either way, review the graph against these two checks:
   - Two tickets that will edit one shared file (a registry, a message catalogue, a shared type) get a blocking edge between them, or `notes/` pins the exact names each adds.
   - Each edge gates real work. Drop any that only reflect writing order.

   Done when every user story is covered by a ticket and every ticket's blockers are explicit.

6. **Build. Load `implement-spec`** and run its steps 3 to 9: integration branch, one implementer per frontier ticket in its own worktree with `tdd`, a merger after each, re-dispatch as the frontier moves, one `code-review`, one fix subagent, resolve tickets, clean up worktrees. Apply [references/parallel-build.md](references/parallel-build.md) on top. It is the full procedure when `implement-spec` is missing. When it is present, these overrides apply:
   - Where `implement-spec` says to tell the user to run `/setup-matt-pocock-skills`, use the mission directory as the tracker.
   - Compute the **frontier** from what has merged into the integration branch. The tracker's blocked-by count lags until tickets close.
   - Run steps 7 to 9 below in place of its review and close-out, so the review loop has an exit.

   Done when every ticket has landed on the integration branch.

7. **Review once.** With all work landed, call `code-review` once against the mission's base: **Standards** and **Spec** in parallel. Review run earlier reads every unbuilt ticket as a failure. Hand every finding to one fix subagent.

8. **Verify the fixes.** Run focused checks on each fixed finding: its test, its file, its behaviour. A second broad review is reserved for a fix that changed architecture.

9. **Validate.** Run the full gate (see Validation). Each failure becomes a work item for a subagent, then rerun the gate.

10. **Close out.** Resolve tickets the way the tracker closes work. Land the integration branch (merge, PR, deploy) if the mission includes it. Remove implementer worktrees and branches. Report what shipped, the decisions made, follow-ups and pointers to the integration branch and `notes/`.

## Skills to reach for

| Need | Skill |
|------|-------|
| Spec, tickets, parallel build | `to-spec`, `to-tickets`, `implement-spec` (load, see above) |
| Small direct change | `implement` (load) |
| Build a slice test-first, red then green | `tdd` |
| Bug, failure or regression with unknown cause | `diagnosing-bugs` (or `systematic-debugging`) |
| Facts from docs or third-party APIs | `research` |
| Domain terms, glossary, ADRs | `domain-modeling` |
| "How should this behave or look" | `prototype` (throwaway, then decide) |
| Interface and module boundaries | `codebase-design` |
| Final review | `code-review` |
| jmrsquared repo work | `jmr-build-test-lint-gate`, `jmr-commit` and the stack skills |

## Validation

Validate every change: formatting, lint, types, unit, integration and e2e tests, build and a runtime check where it applies. Implementers run typecheck and single test files often, the full suite once before reporting. In a jmrsquared repo the bar is `jmr-build-test-lint-gate`: `yarn build && yarn test && yarn lint:fix` pass with no `@ts-ignore`, `.skip` or `--no-verify`.

## Engineering principles

Fix root causes. Preserve existing behaviour unless the mission changes it. Leave the code you touched more readable, consistent and reliable than you found it. Reduce tech debt the mission runs into. Stay inside the mission: improvements outside its blast radius go in the report as follow-ups.

## Definition of Done

All of these hold:

- Every outcome in `notes/mission.md` is met and traced to landed work.
- Every ticket has landed and been resolved.
- One review ran after the last ticket landed. Every finding is fixed or recorded as a decision with its reason.
- The full validation gate passes on the integration branch.
- Docs touched by the change are updated.
- No orphan worktrees or branches remain.

Stop when the list holds. Further polish goes in the report as follow-ups.

## Philosophy

The user assigned a mission. Default: **Analyze → Decide → Delegate → Execute → Validate → Report.**
