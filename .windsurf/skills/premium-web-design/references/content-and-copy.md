# Content and copy: layout and operations

`references/no-slop.md` is the copy **standard** and it wins any conflict
with this file. It defines AI slop in both forms, the rules, the banned
lists with replacements, the decode test, the hero formulas and the copy
pass scoring rubric. Read it before any string lands on the page.

This file covers what sits around the words: the small budgets that make a
page read as built rather than assembled and the placeholder operations
that decide what ships on a build without a real brief.

## Small budgets

### Middot-chained micro-labels: about six per page

The corpus pattern is `EST. 1998 · SHEFFIELD · MON–SAT`, set 10 to 12px
in caps or mono. This skill sets the same line in the small role instead:
15px, sentence case, text face (`Open since 1998 · Sheffield · Monday to
Saturday`), per `typographic-hierarchy.md` R6. It is a real corpus device.
Amrit flanks its hero with two 10px labels; Blind Barber runs 11.25px
chrome with a mono cut reserved for dates. It also costs one line to
type, which is why two pages built from this skill shipped **48** and
**39** of them. At that count the label stops being a label: every block
carries a caption, so no caption means anything and the page reads as a
spreadsheet in a display face.

The measured ceiling. Hagi's entire functional type layer is **24 leaf
nodes** of 11px sans across the whole homepage, nav links, footer links and
legal included. Blind Barber's mono label system is **76 nodes across 162
screens**, every one a date or a legal line. Six chained labels on a
nine-screen page is already generous against both. The `eyebrow-density`
WARN is a separate, looser check and clearing it says nothing about this
budget.

Each label that survives carries something the composition cannot say: a
date, a place, a price, a state. Delete the ones restating the heading
beneath them.

### A marquee carries the page's most interesting string

The content rule (what to run through one) lives in `no-slop.md` under
**Practical expansions**. This file covers what sits around it.

Mark the **duplicate** track `aria-hidden="true"` and leave the first one
readable, so a screen reader hears the line once. Hiding the whole marquee
and naming the section with `aria-label` also works and the auditor
accepts it, but hiding both tracks and giving the section no accessible
name at all means the loudest string on the page reaches nobody using
assistive tech.

What the corpus runs through one:

- Hagi's: `SELF-CARE AS IDENTITY. RITUAL AS EXPRESSION.` at 150px cream
  on `#151515`, two rows, clipped at both edges on desktop and still
  clipped at 390px. They did not shrink it to fit.
- Tripletta: city names at about 130px with a photographed burrata plate
  dropped inline between two of them at cap height, so the location list
  reads as a ticker you have to wait for. The band appears twice, in two
  themes, at 1.5 screens and 6.5 screens.

Give the list a photograph as punctuation. Then let it clip.

## Names, faces and facts

If the brief supplies real staff names, hours, prices and addresses, use
them exactly. If it does not, invent details that read as real, keep them
internally consistent across the whole page and tell the user in one
line which details you invented so they can be replaced before launch.
Never present invented credentials, licence numbers, review counts or
awards as real.

### When that rule collides with a steal list, this rule wins

`plomberie-5-etoiles.md` rates a registration number in the footer as one
of the strongest trust devices on the page and it is right about real
businesses. On a placeholder build the two instructions collide and the
resolution is not a judgement call:

| Device | Real business | Placeholder build |
|---|---|---|
| Registration or licence number | Print it. Falsifiable beats decorative | **Omit it.** A plausible fake number is worse than none |
| Review count and star rating | Print it, linked to the individual reviews | Ship the *layout* with obvious placeholders, or omit |
| Awards, certifications, memberships | Print them | Omit |

A fabricated licence number is not a placeholder, it is a false credential,
and it stays false after the client swaps the phone number. Leave the slot
and the styling in place with a note in `NOTES.md` saying what belongs
there. The same goes for a rating linked to a search URL rather than to the
reviews themselves: that satisfies a checker while proving nothing, which
is the shape of a claim the reader cannot verify.

## What the auditor reads and what it cannot

The auditor catches the structural patterns: lorem ipsum, Acme/Nexus,
Jane/John Doe, `@example.com`, a 555 number, `99.99%`, "10x faster",
"trusted by thousands" all fail as `copy-placeholder`. The openers and the
marketing words fail as `copy-tells` (WARN), along with a `Scroll` cue and
four or more `SECTION 0n` eyebrows. `Chapter 01` in a chapter-based layout
is content and is not counted. `headline-cryptic` (WARN) flags a visible
`h1`/`h2` under four words or a short verbless fragment ending in a full
stop. `rating-unsourced` catches `<a href="#">4.9</a>` and similar.

Two words on the banned list are deliberately **not** in the machine list:
`robust` and `leverage`. Both have ordinary uses (amritpalace.com describes
a robust curry) and a tell that fires on a real award site is a tell
everyone learns to ignore. They stay banned as marketing adjectives. That
one is on you. `seamless` stayed in the machine list and it fires on
amritpalace.com: *"our experienced staff provides courteous, attentive
service so your event runs seamlessly."* That is not a false positive; it
is the word doing exactly what the list says it does, on a Site of the Day.
Winning an award does not make a sentence good and one filler adverb in a
catering paragraph is the cheapest thing on any page to fix.

The auditor is a rough net, not a reader. Nothing it prints tells you
whether a heading is clear, whether a name you invented reads as real, or
whether a sentence says what the business does. Run the decode test from
`no-slop.md` and read the copy aloud.