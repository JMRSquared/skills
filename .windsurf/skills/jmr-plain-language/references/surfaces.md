# Rules by surface

Each section lists what agents get wrong on that surface, then the rule that fixes it and where the rule comes from.

## Chat replies

What goes wrong:

- Reflexive agreement. Claude Code issue #3382 (179 comments) logged "You're absolutely right!" twelve times in one conversation, including after the user typed "Yes please". A Washington Post analysis of 47,000 shared ChatGPT chats found replies opening with "yes" or "correct" about ten times as often as "no".
- Verbal tics. A Hacker News thread on Claude's habits named "load-bearing", "honest take", "key insight", "smoking gun" and "it's not X, it's Y".
- Claimed success that didn't happen. Agents report "all tests pass" without running them or say a file was written when it wasn't.
- Recap blocks and recap files. Cursor staff call SUMMARY.md and REPORT.md creation a known issue with Claude models.
- Length. Studies of RLHF found that a reward for length alone reproduces most of the measured gains (Singhal et al. 2023). Raters also prefer lists, bold and emoji (Zhang et al. 2024). Models learn to pad.

Rules:

- Put the answer first. Microsoft's style guide says "get to the point fast".
- Report what you ran and what it printed. When you skipped a check, say which one and why.
- Keep the report to what changed, what you verified and what is left. Leave out the play-by-play of how you got there unless it explains a decision.
- Don't open with praise or agreement. If the user is right, act on it. If they're wrong, say so and give the reason.
- Avoid "let's", exclamation points, "please note", "simply" and "easy" (Google developer style guide, tone).
- Use headers only when a reply has several distinct parts that the reader will jump between.

## Commit messages

What goes wrong:

- Bodies that restate the diff file by file and leave out the reason. Kenton Varda (Cloudflare) banned AI-written commit messages and PR descriptions on his team for this reason.
- Vague verbs: enhance, improve, streamline, update, refactor (with no object).
- Added references nobody asked for, such as "Resolves: #N".

Rules:

- Use an imperative subject that says what the commit does: "Refresh the session token before it expires" (Chris Beams, "How to Write a Git Commit Message"). In this repo the subject follows `jmr-commit`: one leading Gitmoji, Conventional Commits `type(scope): subject`, lowercase, no trailing period.
- Use the body for what was wrong and why this fix, never for how. The diff shows how.
- Describe the problem and its visible effect (Linux kernel, "Describe your changes").
- Skip the body for a trivial change.
- Mark breaking changes with `!` or a `BREAKING CHANGE:` footer (Conventional Commits).

## PR titles and descriptions

What goes wrong:

- Descriptions that claim changes the diff doesn't contain. Gong et al. (arXiv 2601.04886) studied 23,247 agent-authored PRs. Among the inconsistent ones, 45.4% of faults were claims of changes that were never made. Inconsistent PRs were merged 28.3% of the time against 80.0% for consistent ones.
- A "wall of slop" that walks through every file ("This block was added to path/to/file...").
- Boilerplate sections that aren't filled in honestly, such as a "Test plan" checklist with unchecked guesses.

Rules:

- Write a title that stands on its own as a short imperative summary (Google eng-practices, CL descriptions). "Fix bug" and "Phase 1" don't qualify.
- Use the body for the problem, the approach and its limits. Put the reasoning for any choice a reviewer might question here.
- List only tests you ran, with the command. Put anything you didn't verify under a plain "Not tested" line.
- Re-read the description before merge. The change drifts during review and the description has to follow it.

## Code comments

What goes wrong:

- Comments written in the same pass as the code paraphrase it and go stale at the first refactor.
- Docstrings on every function, including ones that only restate the name.
- History comments: "// Updated to use the new API", "// Fixed the bug", "// Changed from X".
- Shouting: "IMPORTANT:", "NOTE:", "CRITICAL:" on ordinary comments.
- About 20% of comments from the best-performing LLM in one study contained factual errors (arXiv 2406.14836).

Rules:

- Explain why the code exists. If the code needs a comment to say what it does, simplify the code (Google eng-practices, reviewer guide; Linux kernel coding style).
- Put history in the commit, not the comment.
- Leave out docstrings that add nothing beyond the signature.
- Comment regexes, non-obvious algorithms, workarounds with a link to the bug and constraints the code can't express.
- Match the comment density of the surrounding file.

## Docs, READMEs and changelogs

What goes wrong:

- Emoji headers ("🚀 Features", "✨ Highlights") and marketing adjectives.
- "No X, just Y" phrasing and sections that repeat each other.
- Files nobody asked for: ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, NOTES.md.
- Changelogs that paste the commit log.

Rules:

- Open with what the thing does and who it's for in one or two sentences.
- Keep sentences under about 25 words and paragraphs to five sentences or fewer (GOV.UK writing guidelines).
- Use active voice and plain verbs. "We analyze the data", not "We conduct an analysis of the data" (US Federal Plain Language Guidelines).
- Write headings in sentence case with no trailing period (Microsoft Writing Style Guide).
- Write changelogs for humans. Group entries by Added, Changed, Deprecated, Removed, Fixed and Security. Date them in ISO 8601 and call out breaking changes (Keep a Changelog).
- Create a new doc file only when the user asks for one or the project already has a place for it.

## Error messages, logs and UI copy

What goes wrong:

- "Oops! Something went wrong", "An error occurred", "Invalid input".
- Jokes in error paths, which grate the second time.
- Blaming words like "illegal", "invalid" and "bad".

Rules:

- Say what went wrong and how to fix it (Google technical writing, error messages).
- Name the actual value and the limit: "photo.png is 12 MB and the limit is 10 MB."
- Give an example of valid input when the format is the problem: "Enter an email like someone@example.com" (Microsoft).
- Keep what the user typed so they can correct it (Nielsen Norman Group, error message guidelines).
- Use buttons that say what they do ("Delete project", not "OK").
- Log messages state the event and the identifiers needed to trace it. Leave out adjectives.
