# Step 9: close out

Runs only when every ticket is done, or when the landing pull request has merged (`next` says `phase` `landed`: go straight to 9.4). Renew the lease first.

1. **Final review, once per milestone.** When `$CYCLE marks --milestone <slug>` shows no `finalReview`, run two reviewer subagents in parallel, one for Standards and one for the Spec, over `git diff origin/<base>...origin/milestone/<slug>`. Each reads `<this skill's directory>/briefs/reviewer.md` for the review bar plus `briefs/standards.md`, then runs `jmr-review` and `code-review`. Add each blocker as a `fix` ticket (`steps/adding-tickets.md`) and comment `jmr-cycle final review <sha>: <n> findings` on the status issue, where `<n>` counts blockers. Suggestions go under "Follow-ups" in the landing pull request body, never into tickets. When findings exist, go to `steps/10-report.md`: the next cycles build them. Never run the final review twice. Fixed findings are checked by their own tests.
2. **Gate.** Skip this when `gatePass` from `$CYCLE marks --milestone <slug>` holds the current tip sha. Otherwise run `gate` and every `testReports` command (with `JMR_RESULTS=$RUN/results`). A pass gets a `jmr-cycle gate pass <sha>` comment. A failure becomes a fix ticket and a `jmr-cycle gate fail <sha>` comment. When `gateFail` already holds two entries, this third failure escalates (rule 5).
3. **Land.** `$CYCLE landing --milestone <slug>`. With `state` `none`, open the pull request from `milestone/<slug>` into the base branch. Its body starts with `<!-- jmr-land {"milestone":"<slug>"} -->`, then the outcome, the tickets merged, decisions, follow-ups and the status issue link. Then `$CYCLE checks --pr <n> --wait` must say `pass` or `none`.
   - `land` `merge`: `gh pr merge <n> --merge`, or `--squash` when the repository refuses merge commits. When branch protection refuses both, escalate (rule 7).
   - `land` `pr`: escalate (rule 7) and go to `steps/10-report.md`. Each later cycle reaches step 0.5 and finishes once the owner merges.
4. **Done.** Run `$CYCLE deploy --milestone <slug> --pr <landing pr>` from the orchestrator. It posts a mark on the status issue before and after each step, so a rerun skips the steps already done. Never run deploy commands by hand.
   - Exit 1: a step failed. Escalate (rule 9).
   - Exit 4: a `once` step was cut off and may have run. Escalate (rule 9) and ask the owner to check it, then comment `jmr-cycle deploy done <pr> <index>` when it finished or `jmr-cycle deploy fail <pr> <index>` to run it again.
   - Either exit ends the cycle with `waiting`; the next cycle retries from step 0.5.
   - When every step is done, `$CYCLE finish --milestone <slug> --pr <landing pr>` closes the status issue and `git push origin --delete milestone/<slug>` removes the branch when it still exists. In `steps/10-report.md`, skip steps 10 and 11.

The milestone is done when the landing pull request is merged into the base branch, not when its tickets close.
