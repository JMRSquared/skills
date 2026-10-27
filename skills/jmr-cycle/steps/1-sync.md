# Step 1: sync the base branch

Run `git merge --no-edit origin/<base>` in the orchestrator. Syncing never stops the build: steps 2 to 8 run this cycle whatever happens here.

- Already up to date: go on.
- Clean merge: run `check` (or `gate` when `milestone.json` has no `check`). If it passes, `git push origin HEAD:milestone/<slug>`. A rejected push means the branch moved: `git fetch origin milestone/<slug>`, `git checkout --detach origin/milestone/<slug>` and redo this step once.
- Conflict, or a check failure the merge caused: `git merge --abort`. Start one implementer in the background with `briefs/implementer.md`. Its task: create `chore/<slug>-sync-base` from `origin/milestone/<slug>`, merge the base in, resolve it and open a pull request into `milestone/<slug>` whose body starts with `<!-- jmr-pr {"milestone":"<slug>","id":"SYNC"} -->`. It takes one `--parallel` slot. Its pull request goes through review and merge in the step 6 pipeline like any other, merged with `--merge` (step 8).
