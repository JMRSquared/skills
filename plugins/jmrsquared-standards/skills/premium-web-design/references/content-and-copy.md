# Content and copy

A page can be perfectly typeset and still read as machine-made, because the
words give it away. Copy tells are the fastest signal a visitor gets, and they
cost nothing to fix.

## Banned outright

**Openers:** "Welcome to", "Unlock the power of", "Your all-in-one solution
for", "In today's fast-paced world", "Discover the difference".

**Words:** Elevate, Seamless, Unleash, Empower, Revolutionize, Next-Gen,
Game-changer, Cutting-edge, Delve, Robust, Leverage (as a verb), Journey (for
anything that is not travel).

**Placeholders that survived:** Acme, Nexus, NovaCore, Quantum-anything, Jane
Doe, John Smith, lorem ipsum, `hello@example.com`, `+1 (555) 123-4567`.

**Fake precision:** `99.99% uptime`, `10x faster`, `$100.00`, three identical
stat columns, "trusted by thousands", star ratings with no source.

A **search URL is not a source.** Linking `4.8 / 214 reviews` to a Google Maps
search query passes the letter of the rule and hands the reader the verification
you claimed to have done. The link has to land on the listing itself — a place
page, a profile, a Trustpilot page. The auditor rejects `href="#"`, a bare host,
any `/search` path and any `?q=`-style query.

**Furniture:** `SECTION 01` eyebrows on every block, `Scroll ↓` cues, decorative
status dots, live counters, an intro paragraph explaining how good the site is.

**Punctuation:** em dashes. They are the single most recognisable tell in
generated prose.

## What the auditor reads, and what it cannot

The placeholders are a FAIL (`copy-placeholder`): lorem ipsum, Jane/John Doe,
Acme/Nexus, `@example.com`, a 555 number, `99.99%`, "10x faster", "trusted by
thousands". The openers and the marketing words are a WARN (`copy-tells`), along
with a `Scroll` cue and four or more `SECTION 0n` eyebrows. `Chapter 01` in a
chapter-based layout is content and is not counted.

Two words on the banned list are deliberately **not** in the machine list:
`robust` and `leverage`. Both have ordinary uses — amritpalace.com describes a
robust curry — and a tell that fires on a real award site is a tell everyone
learns to ignore. They stay banned as marketing adjectives. That one is on you.

`seamless` stayed in, and it fires on amritpalace.com: *"our experienced staff
provides courteous, attentive service so your event runs seamlessly."* That is
not a false positive, it is the word doing exactly what the list says it does, on
a Site of the Day. Winning an award does not make a sentence good, and one
filler adverb in a catering paragraph is the cheapest thing on any page to fix.

Nothing measures em dashes, fake precision beyond the two patterns above, or
whether a name you invented reads as real. Read the copy aloud.

## What to write instead

**Be specific.** "Open until 8pm on weekdays" beats "convenient hours". "£64 for
a consultation" beats "affordable pricing". "Fourteen years on Bath Road" beats
"trusted local experts". Specificity is what a real business has and a generated
page does not.

**Use real numbers.** `47.2%`, `1,284 appointments last year`, `£64`,
`+44 117 924 8106`. Odd numbers read as measured; round numbers read as invented.

**Cut the hero to a statement.** The hero headline is 2–6 words, and it says
what this is or what it does for the visitor. The explanation goes in one line
beneath it, at most 20 words. If the hero needs three sentences, the idea is not
clear yet.

**Write like the business talks.** A veterinary clinic does not say "pet
wellness solutions". It says "we look after your dog". A barber does not say
"grooming experiences". Read the words back aloud: if no human would say them,
rewrite.

**One idea per section.** Six sections each making one clear point beats three
sections making eighteen.

## Conversion inside art direction

The award sites that sell a local service keep the transaction obvious without
breaking the composition:

- The primary action appears in the nav, once in the first screen, once mid-page
  at the moment of highest intent, and in the footer. Four times, not eleven.
- Price, hours, address, and phone number are on the page as text, not buried in
  an image or a PDF. People come to a local service site for exactly these.
- Trust sits where the eye lands last in the hero, not in a dedicated
  testimonial carousel halfway down — that is what Amrit Palace does with its
  review card.
- One phone number, tappable (`tel:`), formatted the way locals write it.
- Say what happens next after the button: "we confirm by text within the hour".

## Small budgets

**Middot-chained micro-labels: about six per page.** The pattern is
`EST. 1998 · SHEFFIELD · MON–SAT`, set 10–12px in caps or mono. It is a real
corpus device. Amrit flanks its hero with two 10px labels; Blind Barber runs
11.25px chrome with a mono cut reserved for dates. It also costs one line to
type, which is why two pages built from this skill shipped **48** and **39** of
them. At that count the label stops being a label: every block carries a caption,
so no caption means anything, and the page reads as a spreadsheet in a display
face.

The measured ceiling. Hagi's entire functional type layer is **24 leaf nodes** of
11px sans across the whole homepage, nav links, footer links and legal included.
Blind Barber's mono label system is **76 nodes across 162 screens**, every one a
date or a legal line. Six chained labels on a nine-screen page is already
generous against both, and the `eyebrow-density` WARN is a separate, looser
check, and clearing it says nothing about this.

Each label that survives carries something the composition cannot say: a date, a
place, a price, a state. Delete the ones restating the heading beneath them.

**A marquee carries the page's most interesting string.** Both pages from this
skill that shipped one ran their postal address through it. A marquee is the
largest type on the page moving under its own clock. It is the loudest thing you
own, and an address is what a footer is for.

Mark the **duplicate** track `aria-hidden="true"` and leave the first one
readable, so a screen reader hears the line once. Hiding the whole marquee and
naming the section with `aria-label` also works and the auditor accepts it, but
hiding both tracks and giving the section no accessible name at all means the
loudest string on the page reaches nobody using assistive tech.

What the corpus runs through one:

- Hagi's: `SELF-CARE AS IDENTITY. RITUAL AS EXPRESSION.` at 150px cream on
  `#151515`, two rows, clipped at both edges on desktop and still clipped at
  390px. They did not shrink it to fit.
- Tripletta: city names at ~130px with a photographed burrata plate dropped
  inline between two of them at cap height, so the location list reads as a
  ticker you have to wait for. The band appears twice, in two themes, at 1.5
  screens and 6.5 screens.

Both are the sentence the business would print on a shirt. Write that sentence,
or run the thing the reader came for, the services, the locations, the price,
and give it a photograph as punctuation. Then let it clip.

## Length

Award pages carry less copy than agencies expect and more than agents write.
Per section: one headline, one supporting line, and if the section earns it, one
short paragraph of 30–60 words. Anything longer belongs on an inner page.

The exception is the section that sells the thing itself — a menu, a service
list, a price list. Those want detail, and detail is what makes them credible.

## Names, faces, and facts

If the brief supplies real staff names, hours, prices, and addresses, use them
exactly. If it does not, invent details that read as real, keep them internally
consistent across the whole page, and tell the user in one line which details
you invented so they can be replaced before launch. Never present invented
credentials, licence numbers, review counts, or awards as real.

### When that rule collides with a steal list, this rule wins

`plomberie-5-etoiles.md` rates a registration number in the footer as one of the
strongest trust devices on the page, and it is right about real businesses. On a
placeholder build the two instructions collide, and the resolution is not a
judgement call:

| Device | Real business | Placeholder build |
|---|---|---|
| Registration or licence number | Print it. Falsifiable beats decorative | **Omit it.** A plausible fake number is worse than none |
| Review count and star rating | Print it, linked to the individual reviews | Ship the *layout* with obvious placeholders, or omit |
| Awards, certifications, memberships | Print them | Omit |

A fabricated licence number is not a placeholder, it is a false credential, and
it stays false after the client swaps the phone number. Leave the slot and the
styling in place with a note in `NOTES.md` saying what belongs there. The same
goes for a rating linked to a search URL rather than to the reviews themselves:
that satisfies a checker while proving nothing, which is the shape of a claim
the reader cannot verify.
