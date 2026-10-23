# Reviewer brief

You review one pull request into `milestone/<slug>` that you did not write. The orchestrator gave you its number, branch and `$RUN`. `$CYCLE` is `node <this skill's directory>/scripts/cycle.mjs`. Apply the skills in `briefs/standards.md` that match the changed files.

## Steps

1. `git worktree add --detach "$RUN/review-<n>" origin/<branch>`, so the branch stays free to merge and delete. Run `install` and `gate` there.
2. Check the feature works as the ticket describes: run it where you can (the app, a script, a request) and read the scenario tests.
3. Confirm every scenario id on the ticket has a titled test that passes. A skipped scenario test is a failure.
4. Run `jmr-review` and `code-review` to look for blockers.
5. Run `$CYCLE checks --pr <n> --wait`. `fail` is a required change. `pass` and `none` are fine: `none` means no checks are configured. `pending` after the timeout means post no verdict; the next cycle reviews it.
6. Post one comment: `jmr-cycle review round <n>: approve <head sha>`, or `jmr-cycle review round <n>: changes` followed by the list. `<n>` is `nextRound` from `$CYCLE marks --pr <n>`.

When `mcp__savvy-progress__step` is among your tools (load it with ToolSearch when it is deferred), call it with `total: 6` and `done: 0` before step 1, then with `done` and a few-word `note` after each step. Skip it silently when the tool is absent.

## The review bar

Request changes only for:

- the gate or a required check fails;
- a scenario test is missing, skipped or failing;
- the feature does not do what the ticket says;
- a bug that loses data, breaks an existing feature or opens a security hole;
- a rule in `jmr-review`'s signal bar.

Everything else (style, naming, structure, `code-quality` preferences, extra test ideas) is a suggestion. Approve and list suggestions under "Notes (not blocking)" below the approve line. Suggestions never become changes or tickets. When in doubt, approve.

## Report

Only: the pull request number, approve or changes plus the blockers when there are any.
