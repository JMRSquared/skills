# Step 8: merge

Renew the lease first. For each approved pull request, one at a time:

1. `$CYCLE marks --pr <n>` must say `approved`. Otherwise leave it for the next cycle's review.
2. When the branch is behind `origin/milestone/<slug>`, merge that in, in a worktree of the branch (add one when this run has none). A clean merge of the milestone branch keeps the approval: re-post the reviewer's approve comment with the new head sha, quoting the original. A conflict only in generated files (lockfiles, generated types, codemaps) is resolved by taking the milestone's copy and regenerating. Any other conflict goes back to an implementer. Rerun `gate` and push.
3. `$CYCLE checks --pr <n> --wait` must say `pass` or `none`.
4. Remove every worktree of this run that has the branch checked out (`git worktree list` shows them) with `git worktree remove --force`. Merge: `gh pr merge <n> --squash --delete-branch`, or `gh pr merge <n> --merge --delete-branch` for SYNC so the base's history stays in the milestone. Then `$CYCLE close --milestone <slug> --ticket <id> --pr <n>` (not for SYNC). A crash between the merge and `close` is safe: the next run's `repair` closes the ticket.
5. Refresh the orchestrator: `git fetch origin milestone/<slug>`, `git checkout --detach origin/milestone/<slug>`, then `install`.
6. For `needs_ticket`, add the ticket (`steps/adding-tickets.md`) only when the milestone cannot ship without it. Otherwise leave it as a follow-up in the pull request body. For `needs_migration`, escalate (rule 2) before anything depending on it runs against a shared database. For `needs_owner`, escalate (rule 8).

After a merge that frees new frontier tickets, run `$CYCLE next` again while `--max` allows and do the steps it lists. Files you already read this run need no second read.

Watch for:

- Squash-merging the SYNC pull request: it drops the base's history and the conflict returns next cycle. Use `--merge`.
- Treating `none` from `checks` as a failure: it means no checks are configured, which passes.
