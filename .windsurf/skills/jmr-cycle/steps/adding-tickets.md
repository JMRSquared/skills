# Adding tickets

Add a ticket only for a broken feature, a failing scenario or work the milestone cannot ship without. A helper, type, refactor, test or doc never gets a ticket of its own: it goes inside the feature or fix that needs it. Review suggestions and nice-to-haves stay as follow-ups in a pull request body.

The new ticket's `type` is `feature` or `fix` and its title names what works once it merges. Under the lease, in the orchestrator:

1. Add the ticket to `docs/milestones/<slug>/tickets.json` with the next free id (highest plus one) and its `blockedBy`, `scenarios` and `serial`.
2. `$CYCLE validate --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`.
3. Commit with `jmr-commit` and `git push origin HEAD:milestone/<slug>`. On a rejected push: `git fetch origin milestone/<slug>`, `git rebase origin/milestone/<slug>`, push again.
4. `$CYCLE publish --milestone <slug> --tickets docs/milestones/<slug>/tickets.json`.
