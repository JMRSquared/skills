# Plomberie 5 Étoiles — https://www.plomberie5etoiles.com/

**Captured:** 2026-08-14 · **Award:** Awwwards **Nominee** (not Site of the Day), 15 May 2025, listed as "MONTREAL PLUMBER"; community scores span 4–8 across design / usability / creativity / content (verified on the awwwards entry). **Read this study as the conversion reference, not the art-direction reference** — it is the only site in this set that did not clear the SOTD bar, and the contrast is the lesson.
**Stack (measured):** Grav CMS (`user/themes/interwest/`, `user/plugins/form/`) + Bootstrap 4.3.1 + jQuery 3.6.0 + Popper 1.14.7 + AOS 2.3.1 + Modernizr. Self-hosted Raleway (`themes/interwest/css/raleway.css`). Third party: tawk.to live chat (6 scripts), GTM `GTM-PPZ8MWP`, GA4 `G-TQHMXXCTKW`, Ahrefs analytics (loaded twice), embedded Google Maps. Bundle sniff reported `barba` / `webgl` / `video` — almost certainly false positives from the tawk.to vendor bundle; **no barba transitions, no canvas and no `<video>` were observed** (`counts.canvas: 0`, `counts.video: 0`). Treat as `unverified`.
**Page length:** 12.3 screens desktop (scrollHeight **11 032px** @ 900px viewport) · **21.8 screens mobile** · **Sections:** 0 `<section>` elements (pure Bootstrap `div` rows) · **Canvas/video/img/svg:** 0 canvas · 0 video · **38 img** · **50 svg** · **33 buttons**

## Art direction in one line
A Québec trade site built as a trust machine: a caped cartoon-plumber mascot, a blue-to-teal gradient hero, four saturated service cards, and a persistent two-button header (quote + phone) that is visible in 8 of 8 desktop frames — legible and fast, but with no editorial system holding the eight competing colours together.

## First 3 seconds
`desktop-hero.jpg`: white band, ~220px tall. Left, the mascot badge logo (a smiling plumber in hard hat and cape on a shield) plus two certification marks — `CAA Recommandé` and `CMMTQ`. Right, **two stacked rows**: on top, a teal `Obtenez Un Devis` button (~205×58, calendar icon) beside a **red `514-447-3700`** button (~235×58, phone icon); beneath, seven nav links at ~16px plus a grey `English` toggle.

Below, a hero band on a **blue gradient running from `#0B3D66`-ish top-left to `#328FB6` right**, ~575px tall. Left column: h1 at **38.4px / 44.16px lh (1.15) / weight 800 / −0.5px ls**, white — `Services de Plomberie à Montréal — Plomberie 5 Étoiles`; a 2-line 18.4px sub; then **three trust pills** with 1px translucent-white strokes: `★★★★★ 4.9 / 5 Google`, `🕐 Urgence 24/7`, `📍 Montréal & région`; then two more CTAs — a white `Obtenez Un Devis` and an outlined `514-447-3700`.

Right column: the mascot rendered at ~330×320 with the CAA badge floating beside him.

**Time to first phone number: zero scroll, and it is one of the two largest elements in the header.** Time to first social proof: also zero scroll.

## Palette (measured)
| Role | Value | Where |
|---|---|---|
| Body grey | `rgb(85, 85, 85)` `#555555` | **571 text elements** — all body copy, at weight 600 |
| White | `rgb(255, 255, 255)` | 174 text elements + **42 backgrounds** — the dominant ground |
| Brand blue | `rgb(50, 143, 182)` `#328FB6` | 142 text elements + 9 backgrounds — h3s, links, primary CTA |
| Navy | `rgb(0, 51, 102)` `#003366` | 28 elements — hero gradient dark stop, headings on light |
| Slate | `rgb(39, 58, 65)` `#273A41` | 14 text + 4 backgrounds — the dark CTA sidebar card and footer band |
| CTA green | `rgb(53, 181, 27)` `#35B51B` | 4 backgrounds — `Cliquez Pour Appeler` |
| Amber | `rgb(255, 152, 0)` `#FF9800` | 6 backgrounds — FAQ band, service card |
| Brown | `rgb(141, 110, 99)` `#8D6E63` | 6 backgrounds |
| Near-white | `rgb(244, 244, 244)` / `rgb(248, 250, 252)` / `rgb(229, 229, 229)` | alternating section grounds |

Plus, in-frame and not in the histogram because they are inside images: card reds, card greens, card teals, card oranges, and a full-width **yellow FAQ band**. **Count of distinct hues in play: eight or more.** Compare Pizzato (two) and Hagi's (four near-neutrals + one sticker). This is the measurable difference between "nominee" and "site of the day".

## Typography (measured)
- **One family:** self-hosted `Raleway` at 400 / 600 / 700 / 800 / 900. Nineteen `@font-face` records, of which **10 are `unloaded`** — roughly half the shipped font payload is never rendered. Plus `Roboto` (24 nodes) injected by the embedded Google Map.
- **`body` is set at weight 600** (`16px / 32px lh`, `#555555`, 152 leaf nodes). Setting body copy at semibold is the single biggest reason the page reads dense: there is no light mass anywhere.
- h1 `38.4px / 44.16px lh (1.15) / −0.5px ls / w800 / #FFFFFF`
- h2 `35.2px / 42.24px lh (1.20) / −0.3px ls / w800 / #FFFFFF`
- h3 `36px / 43.2px lh (1.20) / ls normal / w800 / #328FB6`
- p `18.4px / 27.6px lh (1.50) / w600 / #FFFFFF` (in hero)
- nav a `26px / 52px lh / uppercase / w800` (drawer state)
- **h1 : h2 : h3 = 38.4 : 35.2 : 36.** Three heading levels within 3px of each other — there is effectively **one heading size**, so hierarchy is carried entirely by colour and by which coloured band the heading sits on.
- Type contrast headline:body = **38.4 : 16 = 2.4 : 1**. (Hagi's is 5.9:1; Blind Barber is 10.6:1.)
- Mobile: h1 `25.6px / 29.44px`, h2 `27.2px`, h3 `28px`, p `16px / 24px`. Same collapse — headings still within 3px of one another.

## Structure, screen by screen
| Frame | Scroll | What happens |
|---|---|---|
| `desktop-hero` | 0% | Two-row header (CTA pair + nav). Gradient hero: h1, sub, three trust pills, two CTAs, mascot + CAA badge. Below the fold, a **4-up card row** in red / green / teal / orange begins. |
| `desktop-01` | 15% | **Google review cards, 3-up**: circular avatar, reviewer name in blue, `2 années plus tôt`, five orange stars, 3–5 lines of real French review text naming the individual plumber (*"Mon plombier était Zoiubir. Merci à Alex."*), and a `Voir l'avis sur Google` link with the Google glyph repeated bottom-right. Then a centred outlined button `Voir tous nos avis Google`. Then `Nos certifications & partenaires` in 36px blue over a **6-logo wall**: CAA, CMMTQ, Régie du bâtiment Québec, Home Depot Pro, ACQ, Consumer Choice Award. |
| `desktop-02` | 29% | SEO body copy on `#F4F4F4`, ~18px, with an inline blue bold link (`plombiers de premier choix à Montréal`). Terminated by a CTA pair: teal `Obtenez Un Devis` + **green `Cliquez Pour Appeler`**. Then a navy band, `Nos interventions en photos`, over a 3-up row of **real job photographs** (drain camera rig on a concrete floor, sump pump install in a basement). |
| `desktop-03` | 43% | Slate `#273A41` band with a 2×2 grid of service cards: each is a saturated colour block (red / green / teal / orange) containing a glossy circular icon, over a white card body with a 36px blue h3 and 4 lines of grey copy. |
| `desktop-04` | 57% | Gradient band repeats with a third CTA pair and **four check-pills**: `Certifié RBQ & CMMTQ`, `Urgence 24/7`, `Devis gratuit`, `Entreprise locale`. Then a pale-blue band, `Plombiers certifiés et dévoués à Montréal`, and a 3-up icon/benefit row (`Entreprise locale à Montréal`, `Rendez-vous planifiés et ponctualité`, `Service client et accompagnement`). |
| `desktop-05` | 71% | Teal band: a left column of six white service-link bars, beside a **dark `#273A41` sticky-feeling CTA card** — `Parlez-en à un plombier dès aujourd'hui!` with teal quote button + green call button. Then a **full-width yellow band**: `Foire Aux Questions` with a 4+ row white accordion. |
| `desktop-06` | 86% | **Service-area lists by borough** — four columns per region, ~30 municipality names (Auteuil, Chomedey, Laval sur le Lac, Pont-Viau, Terrebonne…), then a `Rive-sud` heading with 16 more. Then `Nos derniers articles du blog` with 3 article cards. |
| `desktop-07` | 100% | Footer on `#273A41`: a dark contact card (`Obtenez Votre Devis Gratuit` button, then `Ou appelez-nous au` and the phone in **green at ~42px across two lines**), three link columns (`Urgences` 6 links, `Services` 8 links), and an **embedded live Google Map** with the business pin. Bottom bar in `#328FB6`: six social glyphs, legal links, four partner logos, `License CMMTQ RBQ 5663-4538-01`, `© 2026`, and the full postal address `5979 Boul Henri-Bourassa E, suite 308, Montréal-Nord, QC H1G 2V1`. |

Band rhythm: white → gradient → white → grey → navy → slate → gradient → pale blue → teal → **yellow** → white → slate. Twelve ground changes in 12.3 screens — **roughly one per screen**, and no two adjacent bands share a palette relationship.

## Motion inventory
| # | Element | Motion | Evidence |
|---|---|---|---|
| 1 | Header | Sticky/fixed — the CTA pair and nav are pixel-identical at y=0 in **all 8 desktop frames** and both mobile frames, at every scroll depth | 8 desktop frames + `mobile-00`…`mobile-03` |
| 2 | Scroll reveals | AOS 2.3.1 loaded (`unpkg.com/aos@2.3.1/dist/aos.js` + `aos.css`) — fade/slide-up on scroll entry. Per-element `data-aos` values `unverified` | script + stylesheet list |
| 3 | FAQ accordion | Bootstrap 4.3.1 collapse; 4+ closed rows visible in `desktop-05`, none expanded at capture | frame + Bootstrap in script list |
| 4 | Services / Urgences nav | Bootstrap dropdowns (caret glyphs on both nav items) driven by Popper 1.14.7 | `desktop-hero` frame; Popper in script list |
| 5 | Live chat | tawk.to widget (6 chunks: runtime, vendor, common, app, main) — a floating launcher, bottom-right | script list |
| 6 | Mobile top CTA bar | On mobile a **second full-width CTA row is bolted above the logo** (teal quote + green phone, ~100px tall) and stays fixed through all four mobile frames | `mobile-00`…`mobile-03` |
| 7 | Hover states | Not captured — the hover probe timed out (`hover: TimeoutError: locator.hover: Timeout 4000ms exceeded`). Hover behaviour is `unverified` | `data.json errors` |
| 8 | Embedded map | Live Google Maps iframe with an `Open in Maps` affordance and draggable pan | `desktop-07`; `Roboto` + `Google Sans` in the font histogram |
| 9 | Page transitions | None observed. `barba` in `bundleLibs` is treated as a tawk.to false positive | 8 frames, no transition artefacts |

## How it sells a LOCAL SERVICE
This is the most complete trust architecture in the reference set, and every element of it is transferable to a vet, dentist or garage.

**Where booking/contact lives — the quote CTA appears at least 7 times and the phone at least 8:**
1. Fixed header, top-right, on every screen (teal `Obtenez Un Devis` + red `514-447-3700`).
2. Hero body, below the trust pills (white quote button + outlined phone).
3. After the SEO copy block (`desktop-02`) — teal quote + **green `Cliquez Pour Appeler`**.
4. Mid-page gradient band (`desktop-04`) — quote + phone, above the four check-pills.
5. Dark sidebar card beside the service list (`desktop-05`) — `Parlez-en à un plombier dès aujourd'hui!` + both buttons.
6. Footer contact card — `Obtenez Votre Devis Gratuit` + `Ou appelez-nous au` + phone at ~42px in green.
7. Mobile only: an additional fixed CTA bar above the logo (`mobile-00`…`mobile-03`).

**Two channels are offered every single time** — a form for people who won't call, a tel: link for people in an emergency — and they are colour-coded consistently (**teal = quote form, red/green = phone**). The colour split is the one piece of the palette that is doing real work.

**Trust stack, in the order the page presents it:**
| Device | Detail as printed |
|---|---|
| Rating | `4.9 / 5 Google` with five orange stars, in the hero, above the fold |
| Availability | `Urgence 24/7` — repeated as a hero pill, a check-pill, an h2, and a nav item |
| Coverage | `Montréal & région` pill, then ~46 named municipalities in the footer, grouped by `Laval` / `Rive-sud` / `Rive-Nord` |
| Reviews | 3 full Google reviews with avatars, real French text, dates, and per-review deep links; plus `Voir tous nos avis Google` |
| Named staff | Reviews name individual plumbers (`Zoiubir`, `Alex`) — trust attaches to people, not to a company |
| Certification | 6-logo wall: CAA Recommandé, CMMTQ, Régie du bâtiment Québec, Home Depot Pro, ACQ, Consumer Choice Award |
| Licence number | `License CMMTQ RBQ 5663-4538-01` printed in the footer — the single most credible line on the site |
| Work proof | `Nos interventions en photos` — real, unstyled job photos (drain camera rig, sump pump install), not stock |
| Address | Full postal address + live embedded map with pin |
| Objection handling | FAQ accordion answering emergency service, camera inspection, sump pump replacement |
| Recruiting | `Carrières` in the nav — a hiring page signals a business with staff, not a one-van operation |
| Language | `English` toggle, correct for Montréal |
| Price posture | `Devis gratuit` check-pill and `Rabais` (discounts) nav item — no prices published |

**How it survives inside the art direction — and where it doesn't.** The trust content is excellent and the conversion path is faultless. What fails is the *system*: eight-plus hues with no relationship, three heading levels at the same size, body copy at weight 600, four glossy 2010-era circular icons, and a mascot illustration in a different rendering style from every other asset. Compare Hagi's, which carries the same job (two branches, real staff, real premises) inside four near-neutral values and 11px chrome. **The lesson for the skill: this trust architecture is the content spec; Hagi's and Pizzato are the visual spec. Ship both.**

## Why it reads expensive — and why it doesn't
Genuinely strong:
1. **Real job photography.** `desktop-02`'s drain-camera rig and basement sump install are unglamorous, correctly exposed, and unmistakably this company's own work.
2. **Deep-linked reviews.** Each review card links to the individual Google review, not to a rating summary. Verifiable claims.
3. **The licence number in the footer.** `RBQ 5663-4538-01` — falsifiable, checkable, and almost nobody publishes it.
4. **Colour-coded conversion channels** held consistent across seven placements.
5. **Named municipalities rather than "Greater Montréal"** — 46 of them, which is both an SEO asset and a genuine answer to "do you come to me?".

What costs it the SOTD bar (measured):
6. **Eight-plus unrelated hues**; adjacent bands (navy → slate → gradient → pale blue → teal → yellow) share no tonal logic.
7. **h1/h2/h3 within 3px of each other** — no type scale, so no visual hierarchy independent of colour.
8. **Body copy at weight 600** across 152 nodes; nothing on the page is light.
9. **Glossy circular icons with inner bevels and specular highlights** — a 2010 aesthetic sitting beside 2024 outline icons in the same viewport (`desktop-03` vs `desktop-04`).
10. **Half the font payload never loads** — 10 of 19 Raleway faces `unloaded`.
11. **Ahrefs analytics injected twice**, plus GTM + GA4 + tawk.to's six chunks, in front of a page with no video and no canvas.
12. **21.8 screens on mobile** against 12.3 on desktop — the mobile page is 1.8× longer, i.e. nothing was condensed for phones.

## Mobile adaptation
- **21.8 screens.** Every desktop row restacks to one column with no consolidation, so the phone experience is nearly twice as long as the desktop one. This is the study's clearest anti-pattern.
- A **second fixed CTA bar is added above the logo** — full-width teal `Obtenez Un Devis` + green `514-447-3700`, ~100px tall, present in all four mobile frames. Between it and the logo/`Menu` row, roughly 260px (31% of an 844px viewport) is permanently occupied by chrome.
- h1 `38.4 → 25.6px`, p `18.4 → 16px`. The heading collapse is mild; the layout does the work.
- Hero trust pills reflow from one row of three to **two rows (2 + 1)**, centred.
- Hero CTAs go full-width and stack; the mascot illustration is dropped from the mobile hero and reappears later as the header image of the `Parlez-en à un plombier` card (`mobile-02`) — a good instinct: on mobile the mascot becomes a card, not a hero.
- Job photos become **stacked full-width cards with rounded corners** (`mobile-01`) — the strongest-looking part of the mobile build.
- Footer reflows to a single centred column: six social glyphs → legal links → four partner logos stacked vertically → licence number → copyright → full postal address. It runs ~2 screens on its own.

## Steal list
| Component | How to rebuild | Cost |
|---|---|---|
| **Two-channel CTA pair, colour-coded** | One form CTA and one `tel:` CTA, always adjacent, always the same two colours, repeated 5–7 times down the page and pinned in the header. Form colour ≠ phone colour, and never swap them. | **S** |
| **Above-the-fold trust pill row** | Three pills with 1px translucent-white strokes on the hero band: `★ 4.9/5 Google`, `Urgence 24/7`, `Montréal & région`. Rating + availability + coverage answers the three questions every local visitor has. | **S** |
| **Licence / registration number in the footer** | One line of plain text: `License CMMTQ RBQ 5663-4538-01`. Costs nothing, is falsifiable, and outperforms every badge on the page. | **S** |
| **Deep-linked review cards** | Avatar + name + relative date + star row + verbatim quote + `Voir l'avis sur Google` linking to the *individual* review. Three cards, then one outlined `see all` button. Never a rating average alone. | **S** |
| **Named-staff reviews** | Select reviews that name the technician. `"Mon plombier était Zoiubir"` converts better than any adjective you can write. | **S** |
| **Service-area name list** | Four columns of real municipality/suburb names, grouped by region, above the footer. Answers "do you come to me?" and earns local search at the same time. | **S** |
| **Certification logo wall** | 6 marks in a single row on white, all optically sized to the same height, under a 36px heading. Trade bodies, insurers, manufacturer-approvals. | **S** |
| **Real job photography block** | `Nos interventions en photos` — 3 unstyled, correctly-exposed photographs of your own work, captioned by region. Beats stock at any budget. | **S** |
| **Objection-handling FAQ accordion** | 4–6 rows, each phrased as the customer's literal question (`Offrez-vous un service d'urgence en plomberie ?`). Bootstrap collapse or `<details>`. | **S** |
| **Dark inline CTA card** | A `#273A41` card dropped into a light band, carrying a one-line ask plus both CTAs. Reads as a sidebar without needing a sidebar. | **S** |
| **Mobile fixed action bar** | Full-width quote + call bar pinned to the viewport. **Pin it to the *bottom*, not the top** — Plomberie's top placement costs 31% of the mobile viewport before content starts. | **S** |
| **What to fix while stealing it** | Cap the palette at 3 hues + 2 neutrals; set a real type scale (e.g. 64 / 36 / 20 / 16); drop body weight to 400; replace glossy bevelled icons with a single outline set; condense the mobile page to ≤ desktop length. | **M** |

## Screenshots
`assets/studies/plomberie-5-etoiles/` — `desktop-hero.jpg`, `desktop-01.jpg` … `desktop-07.jpg`, `mobile-00.jpg` … `mobile-03.jpg`, `data.json`. (`desktop-00.jpg` was a pixel-duplicate of `desktop-hero` and was deleted; `desktop-hover.jpg` was never produced — the hover probe timed out.)
