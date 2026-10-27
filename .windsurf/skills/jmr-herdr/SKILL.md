---
name: jmr-herdr
description: Use whenever HERDR_ENV=1 (the agent runs inside a Herdr pane) and it is about to delegate work to a subagent, run parallel work, start a dev server, watcher or long test run, run the build/test/lint gate, get a second opinion on a diff or wait on something slow. Inside Herdr, helpers run as real agents in visible panes beside the parent, not as hidden in-process subagents. Applies to every agent kind Herdr can host (Claude Code, pi, Cursor, Codex, OpenCode, Gemini and the rest). Does nothing outside Herdr.
version: 1.0.0
---

# jmr-herdr

When you run inside Herdr, the user can see every pane. Use that. Work you would hand to a hidden subagent runs as a real agent in a pane next to yours, where the user can watch it, talk to it or stop it. Servers, watchers and slow commands get their own panes too, so your shell stays free.

Installing jmrsquared-standards is the user's standing request to use Herdr this way. That lifts the built-in `herdr` skill's "only when the user mentions Herdr" gate. Every other rule in that skill still holds.

## Before anything

1. Check `test "${HERDR_ENV:-}" = 1`. If it fails, ignore this skill and delegate the usual way.
2. Load the built-in `herdr` skill. It owns command syntax and safety. It is installed per agent: `~/.claude/skills/herdr`, `~/.pi/agent/skills/herdr`, `~/.cursor/skills/herdr`, `~/.codex/skills/herdr` or `~/.agents/skills/herdr`. If a command here disagrees with `herdr --help`, the installed binary wins.
3. Run `node <this skill's directory>/scripts/helper.mjs whoami` once, the first time you need it. It reports your pane, your agent kind, your helper depth and `peersInCheckout`: other live agents working in the same git checkout. If that list is not empty and you are about to edit files, tell the user which agents share the checkout before you write.

`helper.mjs` needs only `node` and `herdr`. It prints JSON. It keeps its state in `$TMPDIR/jmr-herdr/<your pane>/` and only ever touches panes it created.

## Delegate to panes, not hidden subagents

Inside Herdr, any delegated task runs as a helper agent in a pane. The one exception: a quick read-only lookup you need inside the current step ("where is X defined?") can still use your built-in subagent, because a pane agent takes up to a minute to start.

The loop:

1. Write a brief to a file. A helper knows nothing you do not tell it. State the goal, what you already ruled out, the files to read, what done looks like and what it must not touch.
2. Spawn it:
   ```bash
   node <dir>/scripts/helper.mjs spawn --role review --brief-file /path/brief.md
   ```
   It splits a pane beside yours without taking focus, starts the same agent kind as you, names it `<kind letter>-<repo>-<role>` (for example `c-skills-review`), labels the pane and sends the brief. It appends the reporting protocol for you: the helper writes a Markdown report, then a `.done` marker file.
3. Keep working on your own part. Do not sit idle while helpers run.
4. Collect:
   ```bash
   node <dir>/scripts/helper.mjs wait [name...] --timeout 1200000
   ```
   Run it as a background command if your harness has one. Exit 0 means every helper is done and the JSON lists each report path. Exit 3 means a helper is blocked on a question or approval: read it with `helper.mjs read <name>`, then ask the user. Never answer a helper's approval dialog yourself. Exit 4 is a timeout and exit 5 means the pane vanished. On either, read the pane before deciding anything. Do not resend the brief blindly. Add `--any` to return as soon as the first helper ends: the JSON marks the others `working`, so you can act on that one and call `wait --any` again for the rest.
5. Read the report and check its claims before you build on them. A helper's "tests pass" is a claim until you see the command output.
6. Close what you started: `helper.mjs close <name>` or `close --all`. Leave a helper open only when the user wants to keep talking to it. Say so when you do.

**One task, start to finish.** `helper.mjs once --role <role> [--kind k] [-- <agent flags>] <task>` starts an agent in a pane, waits for its report, prints the report on stdout and closes the pane. The task is the last argument, and a slash command such as `/jmr-cycle payments` runs as that skill. It is built to be the agent command for a loop runner, so each run of the loop is an agent the user can watch. `--orchestrator` lets that agent start helpers of its own. When nobody answers a dialog in its pane, it sends one notification and waits, up to `--timeout` (12 hours by default).

Limits: at most 4 helper agents at once. The first three stack in a column beside you; more go to a `jmr helpers` tab. A helper never starts helpers of its own (the script refuses at depth 1). It uses its built-in subagents instead.

## Pick the right helper

- **Same kind as you** by default. Claude starts Claude, pi starts pi. The helper inherits your permission flags (for example `--dangerously-skip-permissions`) and never gets more than you have.
- **A different kind when the user names one** ("get codex to check this"): `--kind codex`. Cross-kind helpers start with their own default permissions.
- **A second opinion before a risky commit.** When a diff touches auth, payments, migrations, infrastructure or more than about 300 lines, start a reviewer of a different kind if one is installed (`command -v codex`, `command -v pi` and so on). A model from another family catches different mistakes. Ask it to report only problems that break behaviour.
- **One writer per file.** Read-only helpers share your checkout. Two helpers that both edit code get separate worktrees: `spawn --worktree feat/<slug>-<part>`. That opens a Herdr worktree workspace on a new branch. Merging those branches back still follows the standing rules: confirm with the user first.

## Playbooks

- **Research fan-out.** Split a broad question into 2 to 4 independent parts with one helper each. Merge the reports and resolve conflicts yourself.
- **Parallel build.** A plan with independent parts gets one worktree helper per part. You stay the integrator: review each branch, run the gate, then propose the merge.
- **Reviewer before commit.** Spawn a reviewer on the current diff while you write the commit message. Fold in its findings, then commit.
- **Test fixer.** When the suite has several unrelated failures, give each cluster to a helper. Each one fixes its cluster and reports the root cause.
- **Long-running processes.** Dev servers, watchers and log tails each get a labelled pane:
  ```bash
  node <dir>/scripts/helper.mjs run --label "dev :3000" -- yarn dev
  ```
  Check them with `helper.mjs read <name>` or `herdr pane wait-output <pane> --match "ready"`. Never block your own shell on a server.
- **The build gate in view.** Run `yarn lint:fix` first because it rewrites files. Then run `yarn build` and `yarn test` in two `run` panes at once and wait on both. The user watches the gate pass instead of reading your summary of it.

## Plugins

List what is installed with `herdr plugin list` and `herdr plugin action list`, then call actions with `herdr plugin action invoke <action_id> --plugin <id>`. Use them where they fit:

- A file viewer plugin (such as `herdr-file-viewer`): open it beside you when you ask the user to review changes.
- A notification plugin: use it for messages that must reach the user away from the terminal.

Never install, update, enable, disable or configure a plugin without the user asking.

## Tell the user what matters

- `herdr notification show "<title>" --body "<one line>" --sound request` when you are blocked on the user.
- `--sound done` when a task that ran longer than about 10 minutes finishes.
- Keep it rare. One notification per event that needs the user, not per step.

## Other jmr skills inside Herdr

Any jmr skill that delegates uses these panes when it runs inside Herdr. `/agents-execute` runs its exploration helpers here, and starts the `/jmr-cycle` loop in a pane with each cycle as an agent pane (`once --orchestrator`). Each cycle starts its implementers and reviewers as helpers beside it, with a reviewer of a different kind where one is installed. The `jmr-cycle` SKILL.md has the commands.

## Never

- Close, prompt, type into or resize panes and agents you did not create. Other agents in the session belong to the user. You may read them only when the user asks.
- Answer an approval or question dialog in a helper's pane.
- Run `herdr server stop`, kill the Herdr process or change sessions, machines or integrations.
- Deploy from a helper pane or let a helper commit, push or merge unless the user asked for that.
- Pass `--trust-repository` unless the user has verified the repository.

## When something goes wrong

- `detected: false` from `spawn`: Herdr did not recognise the agent build in time, usually after an agent update. The script falls back to typing into the pane. The `.done` marker still works, so carry on. Blocked dialogs are not detected in this mode, so check `helper.mjs read <name>` if a helper runs long.
- `spawn` exits 3 at startup: the new agent hit a first-run dialog (folder trust, login). Show the user the pane and let them answer it.
- A helper finished without writing its report: read the pane, then ask it once in its own pane to write the report.
