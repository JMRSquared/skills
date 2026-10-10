# Gathering context, by source type

The video is only as specific as this step. A promo built from the homepage alone sounds like every other promo. Read everything the user pointed at, then keep only what earns screen time.

Everything lands in `<out>/context/`. Never copy secrets, real customer names, emails or phone numbers of private people into it (a business's own public contact details are fine).

## Website URL

1. **Map the site.** Fetch `/robots.txt` and `/sitemap.xml` (and any sitemap index it links). Then open the homepage and collect every same-origin link from the header, footer and body. Merge both lists, drop duplicates, anchors, query-string variants, login, cart, legal boilerplate and asset files.
2. **Read every page** up to 30. Over 30, keep the homepage, every page in the main nav, then the rest by depth. For each page write in `context.md`: URL, page title, headline, the main sections and their copy, every feature, service, price, testimonial (business attribution only), location, opening hours and call to action. Note what each page is *for*.
3. **Capture visuals.** Run once for the homepage:

   ```bash
   npx hyperframes capture <url> --skip-vision -o <out>/context/capture
   ```

   Then take screenshots of the other important pages (pricing, product, services, about, contact, any page with a strong visual) with whatever headless browser or screenshot tool the agent has. Match the viewport to the format:
   - portrait: 430x932 at device scale 2 or 3, so UI text stays readable full-frame;
   - landscape: 1440x900 at scale 2;
   - square: 1080x1080.

   Capture the hero above the fold, then one screenshot per section worth showing. Dismiss cookie banners by declining non-essential cookies. Save to `<out>/context/screens/<page-slug>-<nn>.png`.
4. **Strip trackers.** The capture keeps the site's own scripts. Before any captured HTML is reused in the composition, delete analytics, ad and session-replay code: Google Analytics / Tag Manager (`gtag`, `googletagmanager`), Meta pixel (`fbq`, `connect.facebook.net`), Hotjar, Microsoft Clarity, Segment, PostHog, Plausible, Umami, Mixpanel, TikTok and LinkedIn pixels, chat widgets and cookie-consent loaders. Keep fonts, images and CSS.
5. **Brand.** Pull logo (SVG first), CSS custom properties for colors, font families and the favicon. Note the photography style.

## Images (photos, screenshots, logos, flyers)

1. Copy each into `<out>/context/images/` with a descriptive name.
2. Look at every image. Record what it shows, any text in it, its orientation and pixel size (`ffprobe -v error -show_entries stream=width,height <file>`).
3. Mark which ones work full-frame in the requested format and which need a crop, a device frame or a blurred-fill background. Never stretch.
4. A logo image goes in the brand section; a flyer or menu gets its text transcribed into the fact sheet.

## PDF (business profile, deck, brochure, menu)

1. Read the text: `pdftotext -layout <file>.pdf <out>/context/pdf/<name>.txt` when available, or the agent's own PDF reader.
2. Render pages: `pdftoppm -r 150 -png <file>.pdf <out>/context/pdf/<name>-page`.
3. Look at every page image. Note pages with product photos, team or premises photos, charts, the logo and the brand colors.
4. Crop strong visuals out of pages (`ffmpeg -i page.png -vf "crop=w:h:x:y" out.png`) rather than showing a whole PDF page, which is unreadable on a phone.
5. Business profiles often have registration numbers, BEE levels, client lists and certifications. Use only what the user would want public. Quote them exactly.

## Source code (a project folder or repo)

1. Follow brag's `references/step-1-inspect.md` as written, including its skip list and its no-secrets rule. Never open `.env*` or key files.
2. If the project runs locally with a documented dev command and the user's message or the README makes it plain how, start it, take screenshots of the real screens (entry, key action, result) at the format viewport and stop the server afterwards. Do not install or run anything the README does not describe.
3. When it cannot run, build scenes from the real markup and styles instead of inventing UI.

## Written brief or pasted text

Treat it as the primary source. Record every fact and phrase in `context.md`. If it names a URL, image or file, gather that too.

## Idea only (concept mode, nothing built yet)

The user's words are the only source. Do not fill the gaps with invented facts; fill them with clearly framed intent ("will", "is being built for").

1. Pull out of the brief: the working name, the problem, who has it, how the idea solves it (as 3-5 steps a person would go through), what makes it different and the stage (idea, building, waitlist, raising, launching on a date).
2. **No name given:** use a plain descriptive working title and flag it in the defaults note ("working title: ..., tell me the real name").
3. **No call to action given:** use one that needs no link ("Coming soon", "Follow along", "Get in touch") plus whatever handle, email or site the user did give. Never make up a URL, phone number, price or launch date.
4. **No brand given:** design a small one and mark it "invented for this video" in the fact sheet: 2-3 colors that fit the audience and tone, a display font and a body font, a wordmark of the working name set in the display font. Pick fonts Hyperframes bundles so the render needs no font download: Archivo Black, Montserrat, Oswald, League Gothic, Space Mono, IBM Plex Mono or JetBrains Mono (see `hyperframes-creative` → `references/typography.md`). Reuse any logo, colors or fonts the user did provide.
5. Write the shot list as **planned visuals**, one per idea in the script, chosen from section 9 of brag-overrides.md. Note which ones need a stock photo.

## Several sources at once

Gather each, then merge in `context.md`. When sources disagree (an old PDF price vs the live website), prefer the newest and list the conflict under "Claims you must not make".

## The fact sheet (`<out>/context.md`)

```markdown
# <Name>
One line: what it is, for whom, the problem it solves (source's own words).

## Facts (each tagged with its source)
- ... (https://site/pricing)
- ... (profile.pdf p.4)

## Brand
Logo: context/... | Colors: ... | Fonts: ... | Imagery: ...

## Shot list
| Path | Shows | Fits format? |

## Calls to action
Website, phone, WhatsApp, address, booking link: exactly as published.

## Claims you must not make
- ...

## Skipped
- <url or file>: <reason>
```
