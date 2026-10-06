# Parallel build protocol

Reference for step 6 of `/agents-execute`: landing a task graph of tickets on one **integration branch** with parallel implementers. Adapted from `/implement-spec` in `mattpocock/skills`; when that skill is installed, its steps apply too. This file covers the gaps its users hit.

## Integration branch

Create it once from the mission's base: `agents-execute/<mission-slug>`. Every ticket lands here; nothing lands on the base branch until close-out.

Open a draft PR only when the tracker closes work through PRs or the mission includes landing a PR. Open it only after the first merge (a branch with no commits ahead of base can't open one). Otherwise the run ends on the integration branch, which works fully offline.

## Frontier

Compute the frontier from what has merged into the integration branch, tracked by the orchestrator. A tracker's blocked-by count drops only when a blocker *closes*, which usually happens at the end of the run, so mid-run it reads stale. The tracker supplies the starting graph; the integration branch supplies progress.

## Implementer contract

Each implementer subagent gets one ticket and these pointers: the spec, its ticket, `notes/`, the integration branch name. It:

1. Works in its own git worktree on branch `agents-execute/<mission-slug>/<ticket-slug>`. It confirms that branch is based on the integration branch tip before starting (reset onto it if not).
2. Builds the ticket with `tdd`: a failing test at the named seam first, then the code that turns it green, one slice at a time.
3. Runs typecheck and the ticket's test files as it goes, then the full suite once.
4. Merges the integration branch tip into its own branch and reruns the suite, so landing is a fast-forward.
5. Commits with the repo's commit convention and reports: verdict, branch, head SHA, any decision it made (appended to `notes/decisions.md`).

## Merging

A **merger** subagent (or the orchestrator, for small runs) fast-forwards the integration branch to each finished implementer branch. A merge that is not a fast-forward means the implementer skipped step 4 or another ticket landed in between: send it back to the implementer to re-merge and re-test. Never resolve conflicts on the integration branch itself.

## Collisions

Worktrees postpone collisions to merge time; they don't remove them. Two implementers see only their own ticket and the shared notes, never each other's work in progress, so they can pick different names for the same thing or edit one shared file. Prevent it in step 5: put a blocking edge between tickets that touch one shared file, or pin the exact names each adds in `notes/`. When a collision still lands, the later ticket rebases onto the earlier one's names.

## Untracked material

A worktree holds only what git tracks. Tests that read gitignored fixtures, local databases, `.env` files or credentials can skip silently there and report green. For a ticket whose verification depends on untracked material, run that ticket's verification in the main checkout. Treat any skipped test as a failure.

## Cleanup

At close-out remove every implementer worktree (`git worktree remove`) and delete merged ticket branches. Keep the integration branch until it has landed.
