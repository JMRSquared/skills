# Step 6: build, review and merge as each one finishes

Steps 6, 7 and 8 are one pipeline. Nothing waits for the slowest builder: each pull request is reviewed the moment its implementer reports and merged the moment it is approved, and a freed slot takes the next ticket. Renew the lease each time a helper finishes.

1. **Start.** One implementer per claimed ticket, per pull request from step 5 and for the SYNC task from step 1, in the background, at most `--parallel` at a time. Give each only pointers, never pasted text:
   - the issue or pull request URL and `docs/milestones/<slug>/`;
   - its branch, plus `resumeBranch` when `claim` printed one that exists on `origin`;
   - `$RUN`;
   - the instruction to read `<this skill's directory>/briefs/implementer.md` before anything else.
   Every pull request already in `state.review` that is not waiting on a fix goes to step 7 now, without waiting for a builder.
2. **Wait for the next one.** Inside Herdr, `$JH wait --any` returns when the first helper ends; elsewhere, take the next subagent that reports. Keep only its verdict, pull request URL and `needs_*` items.
3. **Act on it at once.**
   - An implementer that opened or updated a pull request: start its reviewer (`steps/7-review.md`, for that pull request only).
   - A reviewer that approved: merge that pull request (`steps/8-merge.md`, for that pull request only).
   - A reviewer that asked for changes: start a fixer for it, as step 5 describes, unless `nextRound` would be 4 (step 7).
4. **Refill.** After every merge, and whenever a slot is free, run `$CYCLE next`. While `--max` allows, claim (`steps/4-claim.md`) and start the frontier tickets it lists, including the ones a merge just unblocked.
5. **Repeat** from 2 until no implementer or reviewer is running and nothing more can start. Then run the wave gate (step 8).
