# Step 5: fix requested changes

For each pull request in `state.review` from `next`, run `$CYCLE marks --pr <n>`. When `needsFix` is true, it gets an implementer in the step 6 pipeline. Give it the pull request URL, its branch, `$RUN` and the newest review comment as its task. Tell it to read `<this skill's directory>/briefs/implementer.md` first.

A pull request with `needsFix` true is never reviewed again until its implementer has pushed: step 7 skips it.
