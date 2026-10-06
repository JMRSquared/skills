# Words and phrases

These words and phrases show up far more often in model output than in human writing. Read each entry literally. Synonyms of a listed word aren't overused. One or two hits in a long document can be coincidence. A cluster of them is one of the strongest signs that a model wrote the text.

Literal technical use is always fine. "Optimize the query plan", "the npm ecosystem", "a robust estimator" (statistics) and "navigate to /settings" mean something specific. The problem is figurative use that adds tone without information.

## Measured excess vocabulary

Studies of PubMed abstracts, peer reviews and scientific papers from 2023 to 2025 found these words rising many times faster than any earlier vocabulary shift. Juzek and Ward traced the effect to fine-tuning, so it shows up across vendors.

| Word | Measured excess | Plain alternative |
|------|-----------------|-------------------|
| delve, delves, delving | 28x in abstracts, +6697% | look at, cover, dig into |
| underscore, underscores | 13.8x | show, confirm, or cut |
| showcase, showcasing | 10.7x | show |
| meticulous, meticulously | 34.7x in peer reviews | careful, or cut |
| intricate, intricacies | 11x | complex, detailed, or name the parts |
| commendable | 9.8x | good, or say what's good about it |
| boast, boasts | +918% | has |
| garner, garnered | +437% | got, received |
| surpass, surpasses | +667% | beat, exceed |
| realm | +381% | area, field |
| advancements | +278% | advances, improvements, or name them |
| align with, aligns | +267% | match, fit, agree with |
| tapestry | 155x in GPT-4o text | cut and name the actual mix |
| camaraderie | 162x | friendship |
| amidst | 100x | during, among |
| palpable | 95x | name what people could see or hear |

Sources: Kobak et al. 2025 (Science Advances, arXiv 2406.07016), Liang et al. 2024 (arXiv 2403.07183, 2404.01268), Juzek and Ward 2025 (arXiv 2412.11385), Reinhart et al. 2025 (PNAS, arXiv 2410.16107).

## Vocabulary by model era

Wikipedia's AI Cleanup editors track which words each model generation overuses.

- GPT-4 era (2023 to mid-2024): additionally, boasts, bolstered, crucial, delve, emphasizing, enduring, garner, intricate, interplay, key, landscape, meticulous, pivotal, underscore, tapestry, testament, valuable, vibrant.
- GPT-4o era (mid-2024 to mid-2025): align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant.
- GPT-5 era (mid-2025 on): emphasizing, enhance, highlighting, showcasing, plus media-coverage phrasing ("featured in prominent outlets", "independent coverage").
- Grok: pseudo-scientific words such as causal, empirical and correlate.
- Claude in coding sessions (developer reports): load-bearing, honest take, genuine/genuinely, key insight, smoking gun, belt and suspenders, the unlock, "You're absolutely right!".

"Delve" dropped sharply in 2025 once people noticed it. The newer words replace it, so watch the current list as well as the famous one.

## Puffery and hype

| Avoid | Use instead |
|-------|-------------|
| leverage, utilize, harness | use |
| enhance, elevate, empower, bolster | improve, help, or say what changed |
| seamless, seamlessly | say what the user no longer has to do |
| robust | name the failure it handles |
| comprehensive | say what it covers |
| crucial, pivotal, vital, key (adjective) | important, or cut and let the fact show it |
| groundbreaking, revolutionary, cutting-edge, game-changer | new, first, or the measured result |
| unlock, unveil | let, release, show |
| navigate (figurative) | handle, deal with |
| embark on, journey | start, process |
| landscape, ecosystem, realm (figurative) | field, market, tools |
| foster, cultivate | build, encourage |
| multifaceted, nuanced | name the facets |
| profound, notable, renowned | say what happened |
| vibrant, nestled, in the heart of, rich heritage, breathtaking, must-see | describe the place |
| synergy, interplay | how A affects B |
| diverse array, wide range of | name the items or give the count |
| indelible mark, deeply rooted, setting the stage, focal point | state the effect |

## Plain-word swaps

From GOV.UK and the US Federal Plain Language Guidelines.

| Avoid | Use |
|-------|-----|
| utilize | use |
| impact (verb) | affect |
| challenge (meaning problem) | problem |
| assist, facilitate | help |
| purchase | buy |
| approximately | about |
| commence | start |
| in order to | to |
| prior to | before |
| a number of | some, or the number |
| at this point in time | now |
| due to the fact that | because |
| conduct an analysis of | analyze |
| make a decision | decide |
| provide an explanation | explain |
| is able to | can |

## Filler adverbs

Cut these unless they change the meaning: simply, just, really, truly, genuinely, honestly, actually, basically, essentially, fundamentally, inherently, notably, particularly, importantly, crucially, interestingly, seamlessly, effortlessly, meticulously.

## Copula avoidance

Models avoid "is" and "has". Put them back.

| Model wording | Plain |
|---------------|-------|
| serves as, stands as, functions as, acts as | is |
| represents (when it means is) | is |
| boasts, features, offers, maintains | has |
| X refers to Y | X is Y |
| plays a crucial role in | does, causes, or name the effect |
| marks a shift, reflects broader trends | state the change |

## Significance tails

A present-participle clause at the end of a sentence, used to tell the reader why the fact matters. Models use these 2 to 5 times as often as people (Reinhart et al.). Delete the clause.

- highlighting the importance of
- underscoring its significance
- emphasizing the need for
- reflecting the continued relevance of
- showcasing its commitment to
- ensuring that
- paving the way for
- contributing to the broader

## Contrast formulas

These measure at up to 6.3 times the human rate (Paech et al., antislop). State the positive claim alone.

- It's not X, it's Y. / This isn't X. It's Y.
- Not only X but also Y.
- Y rather than X.
- No X. No Y. Just Z.
- Not because X, but because Y.
- X isn't the problem. Y is.
- The question isn't X. It's Y.

## Setup and hook phrases

Delete the phrase and start with the point.

- It's worth noting that / It's important to note / It's important to remember
- Here's the thing: / Here's why / Here's what matters
- The best part? / The kicker? / And here's the kicker
- Enter: X
- Let's dive in / Let's break it down / Let me walk you through
- In today's fast-paced world / In a world where
- At its core / At the end of the day / When it comes to
- No discussion would be complete without
- In this article we will / In this section we'll

## Openers and closers

Openers: Great question! / You're absolutely right! / Perfect! / Excellent point! / Great catch! / Certainly! / Absolutely! / I'd be happy to help / Sure thing!

Closers: I hope this helps! / Let me know if you need anything else / Feel free to reach out / Happy coding! / Would you like me to also...?

A specific question that unblocks the next step is fine ("Commit to `main`?"). A generic offer to do more isn't.

## Hedges and vague attribution

Say what you checked, cite the source or say you don't know.

- based on available information
- while specific details are limited
- not widely documented
- some experts say / observers note / critics argue
- industry reports suggest / research indicates (with no citation)
- several sources (backed by one source)
- has generated debate / prompted broader reflection

## Edit-summary and change-report formulas

These show up in commit bodies, PR descriptions and end-of-task reports.

- improved clarity, flow and readability
- while preserving the original meaning / functionality
- ensured consistency across
- addressed feedback
- comprehensive refactor / comprehensive test coverage
- streamlined the workflow

Say what you changed and why.

## Weak signals

Wikipedia's editors list these as poor evidence of AI writing. Don't "fix" them.

- Perfect grammar.
- A mix of casual and formal registers.
- A single transition word such as "additionally" or "however".
- Formal or academic prose in general. Only the specific listed words count.
- Curly quotes on their own, since Word and macOS produce them.
