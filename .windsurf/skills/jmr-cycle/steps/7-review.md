# Step 7: review

Review one pull request as soon as it is ready: when its implementer reports in the step 6 pipeline, or at the start of the pipeline for pull requests already in `state.review` and the SYNC pull request. Run `$CYCLE marks --pr <n>` first. Skip it when `approved` is true (go to step 8) or `needsFix` is still true.

Start a fresh reviewer that did not write it. Give it the pull request number, its branch and `$RUN`. Tell it to read `<this skill's directory>/briefs/reviewer.md` first. It takes one `--parallel` slot.

When `nextRound` would be 4, escalate (rule 5) in place of a fourth review. When the reviewer reports, remove its `review-<n>` worktree.
