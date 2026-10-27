# Step 4: choose and claim

Every claim runs `$CYCLE claim --milestone <slug> --ticket <id> --run $RUN_ID --holder "$HOLDER"`. Exit 0 means it is yours: note the `branch` it prints and `resumeBranch` when that exists on `origin`. Exit 3 or 4 means skip it and keep going.

1. Adopt first. Run `claim` for each ticket in `state.building` from `next`. `result` `adopted` means a crashed run from this checkout held it (`previousRun`): it is yours now and counts toward `--max`. Claims from other holders exit 3.
2. Then walk `state.frontier` in order until `--max` tickets are claimed this cycle. Skip a ticket whose `serial` is in `state.busySerials` or matches a ticket already claimed this cycle.

Watch for:

- Claiming without `--holder`: the next run cannot adopt the claim after a crash, so the ticket waits 30 minutes for `release-stale`.
- Naming a ticket branch `milestone/<slug>/...`: git cannot hold both refs. Use the branch `claim` prints.
