# Step 1: sync the base branch

While an open pull request into `milestone/<slug>` comes from `chore/<slug>-sync-base`, merge nothing else this cycle: `next` then lists only this step, review and merge. Review and merge that pull request first. Otherwise run `git merge --no-edit origin/<base>` in the orchestrator.

- Already up to date: go on.
- Clean merge: run `gate`. If it passes, `git push origin HEAD:milestone/<slug>`. A rejected push means the branch moved: `git fetch origin milestone/<slug>`, `git checkout --detach origin/milestone/<slug>` and redo this step once.
- Conflict, or a gate failure the merge caused: `git merge --abort`. Start one implementer subagent with `briefs/implementer.md`. Its task: create `chore/<slug>-sync-base` from `origin/milestone/<slug>`, merge the base in, resolve it and open a pull request into `milestone/<slug>` whose body starts with `<!-- jmr-pr {"milestone":"<slug>","id":"SYNC"} -->`. That pull request is the only item this cycle: skip steps 2 to 6, then review and merge it with `steps/7-review.md` and `steps/8-merge.md` (read them even when `next` left them out) and finish with `steps/10-report.md`.
