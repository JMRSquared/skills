# Standards for implementers and reviewers

Apply the jmrsquared skills that match your files. Load model-invoked skills through the Skill tool. Load user-invoked ones by reading their `SKILL.md` from `~/.agents/skills/` or `~/.claude/skills/`.

| Applies to | Skills |
|---|---|
| Every change | the repo's `CLAUDE.md` or `AGENTS.md`, `tdd`, `code-quality`, `naming-imports-exports` |
| A new module, interface or domain term | `codebase-design`, `domain-modeling` (the repo's glossary terms; an ADR only for a decision that changes how the system is built) |
| Files of a stack | the matching skill: `trpc-procedure`, `bdd-router-tests`, `react-tsx-component`, `tanstack-trpc-query`, `kysley-db`, `knex-migration`, `supabase`, `supabase-auth`, `better-auth`, `sst-infra`, `react-native`, `nativewind` and the rest of `jmr-review`'s table |
| Commits | `jmr-commit` |
| Prose: docs, pull request bodies, comments, UI copy | `jmr-plain-language` |
| Before a pull request | `jmr-build-test-lint-gate` plus `milestone.json` `fix` then `gate` |
| Review | `jmr-review`, `code-review`, read through the review bar in `briefs/reviewer.md`: only blockers block |
