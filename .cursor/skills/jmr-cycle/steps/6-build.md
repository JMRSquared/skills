# Step 6: build

Renew the lease first (see "How a cycle runs" in `SKILL.md`).

Start one implementer subagent per claimed ticket, in the background, at most `--parallel` at a time. Give each only pointers, never pasted text:

- the issue URL and `docs/milestones/<slug>/`;
- its branch, plus `resumeBranch` when `claim` printed one that exists on `origin`;
- `$RUN`;
- the instruction to read `<this skill's directory>/briefs/implementer.md` before anything else.

Wait for every implementer from steps 5 and 6 to report before step 7. Keep only each report's verdict, pull request URL and `needs_*` items.
