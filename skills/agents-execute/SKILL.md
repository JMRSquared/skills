---
name: agents-execute
description: "Hand off a mission for fully autonomous, parallel, end-to-end execution. Agents own 100% and never ask; supersedes the deploy / merge confirm gates for the mission."
disable-model-invocation: true
---

# /agents-execute: Autonomous Mission Execution

Vendor-neutral and model-agnostic. Where this says "spawn a subagent", use your harness's parallel-agent or task-delegation primitive; with none, run the same steps sequentially. Where it names a skill (`tdd`, `code-review`, ...), call it if installed; otherwise follow the one-line description given here.

## Contract

The user's objective is your **mission**. You own it end to end: architect, tech lead, implementer, reviewer, QA and DevOps at once. Decision authority is already delegated.

**Decide alone.** The user is out of the loop for the whole mission. When several approaches are valid, weigh them, pick the strongest, record the choice in the mission notes, and continue. Repo inspection, docs, tests, experiments, research and deduction answer every engineering, product and operational question. Uncertainty is an input to a decision, never a reason to stop.

**Irreversible actions are yours.** For the mission this skill supersedes the confirm-before-deploy and confirm-before-merge gates in `jmr-standing-rules`. Deploy, merge, open and land PRs when they serve the mission. Before each irreversible step, make it recoverable (branch, tag or backup; prefer the reversible path; verify preconditions), then validate after. Judgement replaces the confirmation prompt.

## The orchestrator

You are the **orchestrator**. Your context window holds the mission, the task graph and the decisions; subagents hold the code. Push implementation, exploration, debugging and review into subagents so your window stays clear for coordination.

Talk to subagents through **context pointers**: paths to the spec, the ticket, the mission notes, a commit SHA. A subagent prompt names its pointers and its completion criterion; it repeats nothing a pointer already holds. Subagents report back the same way: a short verdict plus pointers (branch, commit, notes file).

**Mission directory.** Keep shared state in one directory outside the repo, reachable from every worktree: `${TMPDIR:-/tmp}/agents-execute/<mission-slug>/`, holding `notes/` (exploration and decisions), `spec.md` and `tickets/`. If the repo has a configured issue tracker (`docs/agents/issue-tracker.md`), publish the spec and tickets there instead and keep `notes/` local.

## The spec-to-code chain

This skill runs the [`mattpocock/skills`](https://github.com/mattpocock/skills) engineering chain end to end, with you in the human's seat at every step:

| Command | Does | Here |
|---------|------|------|
| `/setup-matt-pocock-skills` | Configures the repo's issue tracker in `docs/agents/` | Read that config if present; otherwise the mission directory is a local-markdown tracker |
| `/to-spec` | Synthesizes a spec, publishes it to the tracker | Step 4 |
| `/to-tickets` | Splits a spec into tracer-bullet tickets with blocking edges | Step 5 (you answer its quiz) |
| `/implement` | Builds one piece of work with `tdd`, reviews, commits | Step 3, direct path |
| `/implement-spec` | Builds a whole ticket graph in parallel on an integration branch | Steps 6 to 8 |
| `/code-review` | Two-axis review: Standards and Spec | Step 7 |

These commands are user-invoked (`disable-model-invocation: true`), so no agent can fire them through a Skill tool. When one is installed, read its `SKILL.md` from the skills directory (`~/.agents/skills/<name>/SKILL.md` or your harness's equivalent) and follow it as the detailed procedure for that step, with this skill's Contract overriding every point where it waits on a human. When none are installed, the steps below are self-contained.

Install the chain with `npx skills@latest add mattpocock/skills --skill setup-matt-pocock-skills --skill to-spec --skill to-tickets --skill implement --skill implement-spec --skill code-review --skill tdd -g`.

## Steps

1. **Understand.** Restate the mission and its Definition of Done in `notes/mission.md`. Read the repo's agent docs (`CLAUDE.md`/`AGENTS.md`, `GLOSSARY.md`, `docs/adr/`, `docs/agents/`) and use their vocabulary. When the user hands over an existing spec or ticket set (an issue number, a `.scratch/` path, `/to-spec` or `/to-tickets` output), adopt it and go to step 6 once step 2 has run. Done when every requested outcome is written as a checkable statement.

2. **Explore.** Spawn exploration subagents in parallel: relevant code, prior art for tests, external docs (`research` skill). Each saves markdown into `notes/`. Done when every area the mission touches has a notes file an implementer could start from.

3. **Size the mission.** A mission with no real dependency graph (one coherent change, one session's work) goes **direct**: one implementer subagent builds it with `tdd`, then step 7. Everything else goes through steps 4 to 6.

4. **Spec.** Write `spec.md`: problem, solution, numbered user stories, implementation decisions, testing decisions, out of scope. Name the **seams** where tests attach: existing seams over new ones, the highest seam possible, as few as possible. Leave file paths and code snippets out; they go stale. Done when every requested outcome maps to at least one user story.

5. **Tickets.** Split the spec into **tracer-bullet** tickets: each a thin vertical slice through every layer (schema, API, UI, tests), verifiable on its own, sized to one fresh context window. Prefactor tickets come first. A wide mechanical refactor goes **expand, migrate in batches, contract** instead. Give each ticket its **blocking edges**. Then review the graph yourself, in place of a human:
   - Two tickets that will edit one shared file (a registry, a message catalogue, a shared type) get a blocking edge between them, or the notes pin the exact names each adds.
   - Each edge gates real work; drop any that only reflect writing order.

   Done when every user story is covered by a ticket and every ticket's blockers are explicit.

6. **Build the frontier.** The **frontier** is every ticket whose blockers have all landed. Run every frontier ticket at once, one implementer per ticket, each in its own git worktree, all landing on one **integration branch**. When a ticket lands, recompute the frontier and dispatch what it unblocked. Follow [references/parallel-build.md](references/parallel-build.md) for the implementer contract, merging and collisions. Done when every ticket has landed on the integration branch.

7. **Review once.** With all work landed, run `code-review` once against the mission's base: two axes in parallel, **Standards** (repo conventions plus code smells) and **Spec** (missing, wrong, or unrequested behaviour against `spec.md`). Running review earlier makes every unbuilt ticket read as a failure. Hand every finding to one fix subagent.

8. **Verify the fixes.** Run focused checks on each fixed finding: its test, its file, its behaviour. A second broad review starts a loop with no exit; reserve it for a fix that changed architecture.

9. **Validate.** Run the full gate (see Validation). Each failure becomes a work item for a subagent, then rerun the gate.

10. **Close out.** Resolve tickets the way the tracker closes work. Land the integration branch (merge, PR, deploy) if the mission includes it. Remove implementer worktrees and branches. Report: what shipped, decisions made, follow-ups, pointers to the integration branch and `notes/`.

## Skills to reach for

| Need | Skill |
|------|-------|
| Build a slice test-first, red then green | `tdd` |
| Bug, failure, or regression with unknown cause | `diagnosing-bugs` (or `systematic-debugging`) |
| Facts from docs or third-party APIs | `research` |
| Domain terms, glossary, ADRs | `domain-modeling` |
| "How should this behave or look" | `prototype` (throwaway, then decide) |
| Interface and module boundaries | `codebase-design` |
| Final review | `code-review` |
| Plan or spec steps in detail | `to-spec`, `to-tickets`, `implement-spec` (read, see the chain above) |
| jmrsquared repo work | `jmr-build-test-lint-gate`, `jmr-commit`, and the stack skills |

## Validation

Validate every change: formatting, lint, types, unit, integration and e2e tests, build, runtime check where it applies. Implementers run typecheck and single test files often, the full suite once before reporting. In a jmrsquared repo the bar is `jmr-build-test-lint-gate`: `yarn build && yarn test && yarn lint:fix` pass with no `@ts-ignore`, `.skip`, or `--no-verify`.

## Engineering principles

Fix root causes. Preserve existing behaviour unless the mission changes it. Leave the code you touched more readable, consistent and reliable than you found it, and reduce tech debt the mission runs into. Stay inside the mission: improvements outside its blast radius go in the report as follow-ups.

## Definition of Done

All of these hold:

- Every outcome in `notes/mission.md` is met and traced to landed work.
- Every ticket has landed and been resolved.
- One review ran after the last ticket landed, and every finding is fixed or recorded as a decision with its reason.
- The full validation gate passes on the integration branch.
- Docs touched by the change are updated.
- No orphan worktrees or branches remain.

Stop when the list holds. Further polish goes in the report as follow-ups.

## Philosophy

The user assigned a mission. Default: **Analyze → Decide → Delegate → Execute → Validate → Report.**
