# Step 8: merge, then the wave gate

## Merge one approved pull request

Run this the moment a review approves, while other helpers keep working. Merges run one at a time.

1. `$CYCLE marks --pr <n>` must say `approved`. Otherwise leave it for the next review.
2. When the branch is behind `origin/milestone/<slug>`, merge that in, in a worktree of the branch (add one when this run has none, then `$CYCLE install --milestone <slug> --to <worktree> --from "$RUN/orchestrator"`).
   - A clean merge keeps the approval.
   - Conflicts in generated files (lockfiles, generated types, codemaps): take the milestone's copy and regenerate.
   - Conflicts in append-only lists, where both sides added an entry (a decision log, a changelog, numbered ids such as `D-171`, a prompt or schema version): keep both entries and give this pull request's entry the next free number, updating every reference to it in this pull request's own diff. The approval stands. Parallel tickets clash here all the time, so this is never sent back to an implementer or counted as a review round.
   - Any other conflict goes back to an implementer in the pipeline.
   Run `check` (or `gate` when there is no `check`), push, and re-post the reviewer's approve comment with the new head sha, quoting the original.
3. `$CYCLE checks --pr <n> --wait` must say `pass` or `none`.
4. Remove every worktree of this run that has the branch checked out (`git worktree list` shows them) with `git worktree remove --force`. Merge: `gh pr merge <n> --squash --delete-branch`, or `gh pr merge <n> --merge --delete-branch` for SYNC so the base's history stays in the milestone. Then `$CYCLE close --milestone <slug> --ticket <id> --pr <n>` (not for SYNC). A crash between the merge and `close` is safe: the next run's `repair` closes the ticket.
5. Refresh the orchestrator: `git fetch origin milestone/<slug>`, `git checkout --detach origin/milestone/<slug>`, then `$CYCLE install --milestone <slug> --to "$RUN/orchestrator"` (it skips when the lockfiles did not change).
6. For `needs_ticket`, add the ticket (`steps/adding-tickets.md`) only when the milestone cannot ship without it. Otherwise leave it as a follow-up in the pull request body. For `needs_migration`, escalate (rule 2) before anything depending on it runs against a shared database. For `needs_owner`, escalate (rule 8).

Then go back to the step 6 pipeline: a merge often unblocks frontier tickets.

## Wave gate

When the pipeline has drained and at least one pull request merged this cycle, run the full `gate` once on the milestone tip in the orchestrator, with every `testReports` command (`JMR_RESULTS=$RUN/results`). Implementers and reviewers run only `check`, so this is where the whole milestone is built and tested together.

- Pass: comment `jmr-cycle gate pass <sha>` on the status issue. Close-out skips its gate when the tip has not moved since.
- Fail: add one `fix` ticket (`steps/adding-tickets.md`) that names the failing command, the failing tests and the pull requests merged this wave. The next cycle builds it first.

Watch for:

- Squash-merging the SYNC pull request: it drops the base's history and the conflict returns next cycle. Use `--merge`.
- Treating `none` from `checks` as a failure: it means no checks are configured, which passes.
- Sending a pull request back because a parallel one took its decision number: renumber it here.
