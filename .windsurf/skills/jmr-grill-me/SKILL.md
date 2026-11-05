---
name: jmr-grill-me
description: Interview the user relentlessly about a plan, decision or idea until every decision is settled and nothing is silently assumed, in rounds of numbered questions with a recommended answer for each. Use only when the user runs /jmr-grill-me or asks to be grilled ("grill me", "grill this plan", "stress-test my thinking"). Never start it on your own. Works on any subject, code or not. Writes no files and acts on nothing until the user confirms the shared understanding.
version: 1.0.0
---

# /jmr-grill-me

Adapted from the `grill-me` and `grilling` skills in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, `LICENSE`) at commit `7739eae`.

Interview the user until you both understand the subject the same way. The subject can be a vague idea, a written plan or a single decision. It does not have to be software. If the user gave no subject, ask what they want grilled and wait.

## Map the decisions

Treat the subject as a design tree: every decision branches into the decisions that depend on it.

The frontier is every decision whose prerequisites are already settled. These are the questions you can ask now without guessing at answers you haven't heard.

## Ask in rounds

Ask the whole frontier in one round, then stop and wait for the answers. Write the round as plain text so the user can answer by number. Do not use a question dialog, because dialogs limit how many questions fit.

```
**Q1. <question title>**

<question body, with the options if there are options>

Recommended: <your answer and the main reason for it>

---

**Q2. <question title>**

<question body>

Recommended: <your answer and the main reason for it>
```

- Word each question so "yes" accepts your recommendation.
- Keep a question out of the round if its answer depends on another question still open in that round. It belongs to a later round.
- After each round, recompute the frontier from the answers and ask the next round.
- If an answer changes a decision that was already settled, reopen that decision in the next round and say why.
- If the user asks for one question at a time, in this session or in their agent instructions, do that.

## Facts are yours, decisions are theirs

Never ask the user for something you could look up. When a question needs a fact from the code, the filesystem or another tool, find it yourself. Use a read-only sub-agent for a broad search if your agent has one.

A running search must not hold up the round. Only the questions that depend on its result wait, so ask the rest now.

Put every decision to the user and wait for the answer, even when you are confident in your recommendation. An interview nobody answers only records your own opinion, so do not run this skill unattended or answer your own questions to keep moving.

## Keep the user deciding

The worst outcome is a plan you wrote and the user nodded at.

- When an answer contradicts an earlier one or carries a risk the user hasn't mentioned, say so and ask again.
- If the user accepts every recommendation for two rounds in a row, name the riskiest one and ask them to argue against it.
- "I don't know" is a real answer. Mark the decision as open, say what would settle it and carry on with the branches that don't depend on it.
- Some questions can't be settled by talking, such as how a screen should feel. Say so and suggest a throwaway prototype. Park that branch and keep going with the rest.
- If the subject is too big for one session, propose splitting it and grill one piece.
- If the user says to wrap up, stop asking and go straight to the finish.

## Finish

The interview is finished when the frontier is empty: every branch visited and nothing silently assumed.

1. List each settled decision in one line.
2. List anything still open and any assumption the user hasn't confirmed.
3. Ask whether this is your shared understanding, then wait.

Do not build, edit, commit or write any file during the interview. After the user confirms, ask what they want done with the result and act only on that.
