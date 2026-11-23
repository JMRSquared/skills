# Planning skills live in this repo

Date: 2026-11-24
Status: approved in chat; awaiting implementation plan

## Problem

`/agents-execute` and `/jmr-cycle` tell an agent to load `to-spec`, `to-tickets`, `tdd`, `code-review`, `domain-modeling`, `codebase-design`, `research` and `prototype` from [mattpocock/skills](https://github.com/mattpocock/skills). Those files are not in this repo. `/agents-execute` even prints an install command for that repo. A mission should plan, ticket and review from skills that ship with jmrsquared-standards.

The same planning step also has no place to say what kind of work a ticket is, no scaffolding tickets for a new project and no way to close a finished group of tickets on its own.

## Decision

Rewrite those eight skills in this repo's voice. Name them with a `jmr-` prefix. Drop the steps that quiz the user, publish to an outside tracker, or tell the agent to run a skill this repo does not ship.

Do not copy the rest of that upstream repo. `implement`, `implement-spec`, `wayfinder`, `triage`, `setup-matt-pocock-skills` and the productivity skills stay out. `jmr-grill-me` stays as it is.

`/agents-execute` never names that repo and never tells anyone to install from it.

Each new skill folder carries a `LICENSE` file with the upstream MIT notice (Copyright (c) 2026 Matt Pocock) and a one-line note at the top of `SKILL.md`: `Adapted from Matt Pocock's <original-name> skill (MIT).` The note names the skill. It does not link the repo and it does not include an install command.

## The eight skills

They live as flat directories under `skills/`, the same layout as every other skill. Synced copies under `.cursor/`, `.windsurf/` and `plugins/` are not edited by hand.

| Skill | Replaces | Who loads it |
|---|---|---|
| `jmr-to-spec` | `to-spec` | `/agents-execute`, by reading `SKILL.md` |
| `jmr-to-tickets` | `to-tickets` | `/agents-execute`, by reading `SKILL.md` |
| `jmr-tdd` | `tdd` | Implementers, from the standards table |
| `jmr-code-review` | `code-review` | Reviewers and close-out, beside `jmr-review` |
| `jmr-domain-modeling` | `domain-modeling` | When a term or an ADR is being written |
| `jmr-codebase-design` | `codebase-design` | When a module interface is being designed |
| `jmr-research` | `research` | When a question needs primary sources |
| `jmr-prototype` | `prototype` | When a design question needs a throwaway |

`jmr-to-spec` and `jmr-to-tickets` are user-invoked. Their descriptions say to load them when `/agents-execute` says to, not on ordinary coding. The other six are model-invoked. Their descriptions name the task that should reach them.

### jmr-to-spec

Writes the spec from the mission and the repo. Does not interview. Does not open an issue.

The spec has these sections, in this order: Problem, Solution, User stories, Areas, Foundation, Implementation decisions, Testing decisions, Out of scope.

- User stories are numbered and use "As a …, I want …, so that …".
- Areas names which of the closed area list this mission touches.
- Foundation says whether the repo needs a scaffolding group and what "done" looks like for that group. A repo that already builds, tests and boots does not get one.
- Implementation decisions name modules and interfaces. They leave out file paths and code, except a short snippet that came from a prototype and records a decision.
- Testing decisions name the seams. Existing seams win. Prefer the highest seam and as few as possible. The skill picks the seams and records why. It does not ask.
- Out of scope holds polish, nice-to-haves and cleanup.

`/agents-execute` still adds what this skill does not own: acceptance scenarios with ids `<PREFIX>-001`, a `## UI direction` section when the mission ships a screen and the `PRODUCT.md` brief when the page is customer-facing. The skill's output is the spec body. The caller writes it to `spec.md`.

### jmr-to-tickets

Splits that spec into tickets and writes `tickets.json`. Does not quiz. Does not publish.

Rules:

- A ticket is one session of work and has a checkable outcome.
- `type` is `feature` or `fix`.
- Helpers, refactors, tests and docs that exist only to serve one feature stay inside that feature's ticket.
- A new or thin repo gets a foundation group of scaffold tickets first, when the spec's Foundation section says so. Each scaffold ticket is a feature with `scaffold` in `areas` and an outcome someone can check ("the test runner passes", "the app boots").
- Later tickets name `blockedBy` only where they need that scaffold. Group order is not itself a dependency.
- Titles name the outcome.
- Every scenario sits on exactly one ticket. Every user story is covered. A scaffold ticket has at least one scenario.
- Two tickets that edit one shared file get a blocking edge, a shared `serial`, or exact names pinned in both bodies.
- A group holds at most eight tickets. More than that means split the group. There is no cap on the number of tickets in the milestone.
- The caller still adds visuals and the prose context `/agents-execute` already requires. This skill owns the graph, the groups and the areas.

### jmr-tdd

Red, then green, one slice at a time. Tests hit the seams named in the spec or the ticket. The skill does not ask the user to confirm seams. A good test checks behaviour through the public interface. The skill names the anti-patterns it already relies on: tests coupled to internals, tautological assertions and writing every test before any implementation. Refactoring belongs to review, not to the red-green loop. When the shape of the interface is the question, read `jmr-codebase-design`.

Worked examples of a good test and of mocking live in `references/` under the skill. The procedure stays in `SKILL.md`.

### jmr-code-review

Reviews the diff since a fixed point the caller supplies, on two axes, in parallel, each in a fresh context.

- Standards: the repo's `CLAUDE.md` or `AGENTS.md`, the jmrsquared skills that match the files and a fixed smell baseline (mysterious name, duplicated code, feature envy, data clumps, primitive obsession, repeated switches, shotgun surgery, divergent change, speculative generality, message chains, middle man, refused bequest). A documented repo rule wins over a smell. A smell is a judgement call. Skip anything the tooling already enforces.
- Spec: the milestone spec or the ticket. Missing behaviour, extra behaviour and behaviour that looks wrong.

The report keeps the two axes separate. `jmr-review` stays the audit against jmrsquared skills. Close-out runs both.

The caller passes the fixed point. Inside `/jmr-cycle` that is `git diff origin/<base>...HEAD` for a ticket and `git diff origin/<base>...origin/milestone/<slug>` for the final review. The skill does not ask for it.

### jmr-domain-modeling

Use it when a term or a decision is being settled, not when a glossary is only being read.

- One context: `GLOSSARY.md` and `docs/adr/` at the repo root. A `GLOSSARY-MAP.md` at the root points at extra contexts.
- Create a file when there is something to write.
- The glossary has terms only. No implementation detail.
- Offer an ADR only when all three are true. The decision is hard to reverse. A later reader will wonder why it was made this way. There were real alternatives and one was picked for a stated reason.
- Glossary and ADR shapes are inline in the skill, short enough to copy.

### jmr-codebase-design

The shared vocabulary: module, interface, implementation, depth, seam, adapter, leverage, locality. Deep means a lot of behaviour behind a small interface. The skill is a reference. It does not start a design session of its own.

### jmr-research

One question, primary sources, one markdown file, each claim cited. Inside Herdr (`HERDR_ENV=1`) the research runs in a pane spawned with `jmr-herdr`. Otherwise it runs as a subagent with a fresh context. Save the note where the repo already keeps notes. A mission in progress uses the mission `notes/` folder.

### jmr-prototype

A throwaway that answers one question.

- Logic or state: one HTML file a person can open.
- Look: a few variants on one route, switched by a query param.

Pick the branch from the question. When the question is ambiguous, match the surrounding code and write the assumption at the top of the prototype. Do not ask. No tests and no persistence unless the question is about persistence. The main branch keeps the decision the prototype settled. The prototype itself stays on a throwaway branch.

## Areas, groups and scaffolding

`type` stays `feature` or `fix`. It means what the user can try. Kind of work is a separate field.

### Areas

`areas` is a non-empty list. Each entry is one of:

`backend`, `frontend`, `database`, `infra`, `design`, `scaffold`

`validate` rejects any other name. Publish creates a GitHub label `area:<name>` and puts it on the issue. The same list is stored in the ticket marker.

The list is closed. A new area means a change to this spec, to `validate` and to `jmr-to-tickets`.

### Groups

Every new ticket has one `group`. `tickets.json` lists the groups in reading order:

```json
{
  "groups": [
    { "id": "foundation", "title": "App shell" },
    { "id": "payments", "title": "Card payments" }
  ],
  "tickets": [
    {
      "id": "T01",
      "type": "feature",
      "group": "foundation",
      "areas": ["scaffold", "infra"],
      "title": "The app boots and the test runner passes",
      "body": "What a person can check when this merges.",
      "blockedBy": [],
      "scenarios": ["PAY-001"]
    }
  ]
}
```

- `groups[].id` matches the same pattern as `serial`: lowercase letters, digits and dashes.
- `groups[].title` is required.
- Every ticket's `group` matches a listed id.
- Every listed group has at least one ticket.
- Array order is the reading order. It does not block later tickets.
- `serial` stays what it is: tickets that share one never build at once. A group does not do that job.

Publish opens one GitHub milestone per group, titled `[<slug>] <group title>`. It files the issue into that milestone. An issue is in one GitHub milestone.

A group is archivable. When every ticket in the group is done (merged or closed, the same notion `/jmr-cycle` already uses), the cycle closes that GitHub milestone. The code stays on `milestone/<slug>`. Closing the group only takes it off the open list. If a later publish adds an open ticket to a closed group, the cycle reopens that GitHub milestone.

Tickets already committed without `areas` or `group` stay valid. New tickets must have both. A file with no `groups` key is valid only when every ticket is an already-committed ticket that omits `group`.

### Scaffolding

A scaffold ticket is how a new project gets a floor: the shell, the test runner, the home for the schema, the deploy stub the mission actually needs. It is a normal feature ticket tagged `scaffold`, usually in the first group. It is not a prefactor of a later feature. Refactors that only serve one feature still ride inside that feature.

## Wiring

- `skills/agents-execute/SKILL.md` loads `jmr-to-spec` and `jmr-to-tickets` from the installed skills directory, the same way it loads `jmr-cycle`. Remove the install command and every mention of the upstream repo. Point the skills table at the `jmr-` names. Drop the global "two to six tickets, more than eight is too small" cap. Point at the per-group cap in `jmr-to-tickets`. Keep the contract, the scenario ids, the visuals and the publish steps.
- `skills/jmr-cycle/briefs/standards.md`, `briefs/reviewer.md` and `steps/9-closeout.md` use the `jmr-` names.
- `skills/jmr-cycle/steps/adding-tickets.md` tells the caller to set `group` and `areas` on a ticket added mid-flight.
- `skills/jmr-cycle/scripts/lib.mjs` validates `areas` and `groups`. The marker includes both.
- `skills/jmr-cycle/scripts/cycle.mjs` creates the area labels and the GitHub milestones on publish. It closes or reopens a group milestone when the group's tickets change.
- `README.md` and `skills/jmr-help/SKILL.md` gain a row for each new skill. The `/agents-execute` blurb no longer mentions an install from outside this repo.
- Tests in `lib.test.mjs` and `cycle.test.mjs` cover a valid grouped file, a bad area, a ticket whose group is missing from `groups`, an old ticket with no group, label creation, milestone create, milestone close when the group is done and milestone reopen when a ticket is added.

## Out of scope

- Copying any upstream skill not in the table above.
- Rewriting `jmr-grill-me`.
- Editing the synced skill copies by hand.
- A new ticket `type` for scaffold. Scaffold is an area.
- Automatic blocking from one group to the next.
- Changing claim order, `serial`, or the git branch name `milestone/<slug>`.
