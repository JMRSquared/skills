# Step 7: review

Renew the lease first.

Review every pull request in `state.review` from `next`, every pull request the implementers of steps 5 and 6 opened and the SYNC pull request when one is open. Run `$CYCLE marks --pr <n>` for each. Skip it when `approved` is true or `needsFix` is still true.

For each other one, start a fresh reviewer subagent that did not write it. Give it the pull request number, its branch and `$RUN`. Tell it to read `<this skill's directory>/briefs/reviewer.md` first.

When `nextRound` would be 4, escalate (rule 5) in place of a fourth review. Wait for every reviewer before step 8, then remove the `review-<n>` worktrees.
