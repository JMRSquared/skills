# Step 2: repair and release

1. `$CYCLE repair --milestone <slug>` closes every ticket whose pull request merged before a crashed run could close it.
2. `$CYCLE release-stale --milestone <slug> --run $RUN_ID` releases claims with no progress in 24 hours.

A ticket whose pull request merged stays done even if someone reopens its issue: `repair` closes it again. Rework goes in a new `fix` ticket (`steps/adding-tickets.md`).
