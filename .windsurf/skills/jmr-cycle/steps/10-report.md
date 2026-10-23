# Steps 10 to 12: publish, escalate and report

**10. Publish status.** Run each `testReports` command with `JMR_RESULTS=$RUN/results` unless step 9 already did, then `$CYCLE status --milestone <slug> --write --brief --run $RUN_ID --results-dir "$RUN/results"`. Keep its `counts.done`, `total` and `phase` for the report. Progress comes from this command, which counts scenario ids in test titles and results in test reports, never from an agent's report.

**11. Escalate** everything the earlier steps surfaced, as "Escalate" in `SKILL.md` describes.

**12. Clean up and report.** Wait for any subagent still running. Remove every worktree this run created with `git worktree remove --force`, then `git worktree prune`. A run that dies before this step leaves them behind; the next run's step 0.4 removes them. Unless this was `status` mode, run `$CYCLE unlease --milestone <slug> --run $RUN_ID`. Delete `$RUN`.

Reply in at most five lines: pull requests merged (numbers and titles), pull requests in review, owner items with links and the status issue link. Then one line `CYCLE_PROGRESS: <counts.done>/<total> <phase>` from step 10 (in status mode, from `next --status`). The last line is exactly one of:

- `CYCLE_RESULT: continue`: the frontier or the review queue has work an agent can do now.
- `CYCLE_RESULT: waiting`: everything left waits on the owner, on CI or on another run's lease or claim.
- `CYCLE_RESULT: complete`: the landing pull request is merged.

The loop runner and `/loop` pace themselves by that line, so never leave it out.
