#!/usr/bin/env node
/**
 * audit-page.mjs — look at your own work, then measure it.
 *
 * Screenshots a page you just built (desktop + mobile + reduced-motion) and
 * runs objective design checks against the RENDERED result: contrast, display
 * font, hero type scale, palette discipline, spacing grid, card-grid smell,
 * image resolution, tap targets, motion presence.
 *
 * It also measures AMBITION, not just restraint. Those findings are reported at
 * level `sparse`: image density, a second type event below the fold, layering,
 * edge bleed, ground flips, motion vocabulary. SPARSE never changes the exit
 * code — it describes what is absent, and absence is a design note, not a bug.
 *
 * A third class, level `craft`, measures whether the AMBITION TIER the page
 * claims was actually built: a declared tier, a scroll-driven pin, a scrub, a
 * split reveal, a loader, responsive image payloads, the conversion parts the
 * corpus wins on, a sourced rating. Everything above this line can be satisfied
 * by a well-set static document; CRAFT is what cannot. CRAFT never changes the
 * exit code either.
 *
 * Self-scoring is worthless without a rendered artifact. This produces one.
 *
 * Usage:
 *   PW_DIR=/path/with/node_modules node audit-page.mjs <url> <outDir> [--json]
 *   url may be http(s)://… or file:///abs/path/index.html
 */

const args = process.argv.slice(2);
const url = args[0];
const outDir = args[1] || 'audit';
if (!url) {
  console.error('usage: audit-page.mjs <url> <outDir>');
  process.exit(2);
}

const pwDir = process.env.PW_DIR;
const { chromium } = pwDir
  ? await import(`${pwDir}/node_modules/playwright/index.mjs`)
  : await import('playwright');
const fs = await import('node:fs/promises');
const path = await import('node:path');

await fs.mkdir(outDir, { recursive: true });

const audit = (opts = {}) => {
  /* Every face a browser can already draw without being asked. The old list
     stopped at the nine names SKILL.md printed, so "Georgia" and "Times New
     Roman" — the two system faces a model reaches for the moment a sans is
     banned — were both a clean pass for the brand's loudest word. */
  const GENERIC_FONTS = /^(inter|roboto|arial|helvetica( neue)?|system-ui|-apple-system|blinkmacsystemfont|segoe|open sans|lato|noto sans|ui-sans-serif|sans-serif|ui-serif|serif|ui-monospace|monospace|cursive|fantasy|times( new roman)?|georgia|garamond|palatino|book antiqua|courier( new)?|verdana|tahoma|trebuchet|impact|calibri|cambria|geneva|menlo|monaco|consolas|arimo|tinos|liberation|dejavu|source sans|pt sans|ibm plex sans)/i;
  /* The second trap, named in prose by SKILL.md and by typography.md and
     measured by nothing: ban Inter and the model reaches for the next most
     likely face instead. These read as "generated" exactly as loudly. */
  const ESCAPE_FONTS = /^(space grotesk|poppins|montserrat|raleway|nunito|dm sans|plus jakarta|outfit|sora|figtree|urbanist|quicksand)/i;
  /* ---------- helpers ---------- */
  const parseRGB = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrast = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const blend = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.15;
  };
  const textOf = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    return t.trim();
  };

  /** Does a `background-image` actually PAINT anything?
   *  An all-transparent gradient satisfies every string test for media, and one
   *  such declaration on a wrapper used to switch the contrast FAIL off for a
   *  whole page: text over media is judged from the frame rather than from the
   *  DOM, so the check steps aside — and a page that paints nothing had nothing
   *  for it to step aside for. `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))`
   *  on every box cleared contrast AND text-over-media in one line of CSS. */
  const paintedImage = (bi) => {
    const v = String(bi || '');
    if (!v || v === 'none') return false;
    if (/url\(/i.test(v)) return true;
    if (!/gradient/i.test(v)) return false;
    const stops = v.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b|\b(?:black|white|red|blue|green|yellow|orange|purple|currentcolor)\b/gi) || [];
    if (!stops.length) return true;                       /* named/var stops we cannot read */
    for (const st of stops) {
      const m = /rgba?\(([^)]+)\)/.exec(st);
      if (m) {
        const q = m[1].split(',').map((x) => parseFloat(x));
        if ((q.length > 3 ? q[3] : 1) >= 0.35) return true;
        continue;
      }
      const h8 = /^#([0-9a-f]{8})$/i.exec(st);
      if (h8) { if (parseInt(h8[1].slice(6), 16) / 255 >= 0.35) return true; continue; }
      return true;                                        /* opaque hex or keyword */
    }
    return false;
  };

  /** Effective background behind an element: walk up until an opaque paint. */
  const effectiveBg = (el) => {
    let node = el;
    let overMedia = false;
    let acc = null;
    while (node && node !== document.documentElement.parentNode) {
      const s = getComputedStyle(node);
      if (paintedImage(s.backgroundImage)) overMedia = true;
      const c = parseRGB(s.backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? blend(acc, c) : c;
        if (c.a >= 0.999) return { color: acc.a >= 0.999 ? acc : blend(acc, { r: 255, g: 255, b: 255, a: 1 }), overMedia };
      }
      node = node.parentElement;
    }
    return { color: acc || { r: 255, g: 255, b: 255, a: 1 }, overMedia };
  };

  /* ---------- collect ---------- */
  const allRaw = Array.from(document.querySelectorAll('body *'));
  const all = allRaw.filter(visible);
  const textEls = all.filter((el) => textOf(el).length > 1);

  const findings = [];
  const add = (level, code, msg, detail) => findings.push({ level, code, msg, detail });

  /* fonts */
  const familyUse = {};
  let biggest = null;
  let belowBiggest = null;
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const size = parseFloat(s.fontSize);
    familyUse[fam] = (familyUse[fam] || 0) + textOf(el).length;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && (!biggest || size > biggest.size)) {
      biggest = { size, fam, weight: s.fontWeight, text: textOf(el).slice(0, 60), tracking: s.letterSpacing, lh: s.lineHeight };
    }
    /* A type EVENT has to occupy the room its size implies. A 420px word in an
       8px-tall clipped box reads as a second peak to a font-size probe and as
       nothing at all to a reader, so measure the box, not the declaration. */
    if (r.top >= window.innerHeight && r.height >= size * 0.45 && r.width >= size * 0.5
        && (!belowBiggest || size > belowBiggest.size)) {
      belowBiggest = { size, fam, weight: s.fontWeight, text: textOf(el).slice(0, 60), top: Math.round(r.top), boxW: Math.round(r.width), boxH: Math.round(r.height) };
    }
  }
  const families = Object.entries(familyUse).sort((a, b) => b[1] - a[1]);

  if (biggest && GENERIC_FONTS.test(biggest.fam))
    add('fail', 'display-font-generic',
      `Display voice is "${biggest.fam}" — a system/default face. The largest type on the first screen is the brand's voice; a default face makes the page read as a template.`,
      biggest);
  else if (biggest && ESCAPE_FONTS.test(biggest.fam))
    add('fail', 'display-font-escape-default',
      `Display voice is "${biggest.fam}" — the face a model reaches for the moment Inter is banned. typography.md names this trap by name: "Ban Inter and a model reaches for the next most likely face — Space Grotesk, Poppins, Montserrat — which now signals generated just as loudly." Pick a row from the verified pairings table instead.`,
      biggest);

  /* A family NAME is not a font. `font-family: "Awwwards Display"` renders as
     the browser default and every check above still reads the string the author
     typed — the one class of defect this skill says is "invisible in source".
     Two questions separate a real face from a typed one: is it declared
     anywhere (@font-face / FontFaceSet), and does naming it change the metrics
     of rendered text? A local system face answers no/yes, a webfont yes/yes, a
     name someone invented answers no/no. Only no/no fires, so a webfont whose
     CDN was slow in this run is never reported. */
  const familyResolves = (fam) => {
    try {
      const c = document.createElement('canvas').getContext('2d');
      if (!c) return true;
      const q = `"${String(fam).replace(/"/g, '')}"`;
      const probe = 'mmmiiiwwwWWW@#$%0123';
      for (const gen of ['serif', 'monospace', 'sans-serif']) {
        c.font = `72px ${gen}`;
        const base = c.measureText(probe).width;
        c.font = `72px ${q}, ${gen}`;
        if (Math.abs(c.measureText(probe).width - base) > 0.5) return true;
      }
      return false;
    } catch { return true; }
  };
  const familyDeclared = (fam) => {
    try {
      const want = String(fam).replace(/["']/g, '').toLowerCase();
      let hit = false;
      document.fonts.forEach((f) => { if (String(f.family).replace(/["']/g, '').toLowerCase() === want) hit = true; });
      return hit;
    } catch { return true; }
  };
  if (biggest && !GENERIC_FONTS.test(biggest.fam) && !familyDeclared(biggest.fam) && !familyResolves(biggest.fam))
    add('fail', 'display-font-unavailable',
      `The display face is declared as "${biggest.fam}" and no such font exists on this page: nothing in @font-face declares it and naming it changes no glyph metric, so the browser is drawing its own default and calling it that name. The font checks above read the string you typed, not the type on screen.`,
      { family: biggest.fam, size: Math.round(biggest.size), text: biggest.text });
  if (families.length > 3)
    add('warn', 'font-sprawl', `${families.length} font families rendered. Use 2 (display + text), 3 at most.`, families.slice(0, 6));

  if (biggest && biggest.size < window.innerWidth * 0.045)
    add('warn', 'hero-type-small',
      `Largest first-screen type is ${Math.round(biggest.size)}px (${(biggest.size / window.innerWidth * 100).toFixed(1)}vw). Award-grade heroes run 6–14vw.`,
      biggest);

  /* contrast */
  /* A tint mark is a giant aria-hidden letterform set a shade off its own ground
     — tripletta's WALLOVE in sage, banzai's 1.2:1 marquee, blindbarber's year
     numerals. Near-invisibility is the device. Exempt it, but only when the same
     string is also on the page as real content, so the exemption cannot be used
     to hide information in unreadable type. */
  const normText = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const isAriaHidden = (el) => { try { return !!el.closest('[aria-hidden="true"]'); } catch { return false; } };
  const readableCorpus = [];
  for (const el of textEls) {
    if (isAriaHidden(el)) continue;
    const n = normText(textOf(el));
    if (n) readableCorpus.push(n);
  }
  const tintMarks = [];
  const badContrast = [];
  const overMediaNoScrim = [];
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const fg = parseRGB(s.color);
    if (!fg) continue;
    if (isAriaHidden(el)) {
      const n = normText(textOf(el));
      const markSize = parseFloat(s.fontSize) || 0;
      /* density-and-devices.md describes this device as a GIANT tinted brand
         word set 1.2:1 to 1.6:1 against its own ground. A 12px aria-hidden
         label a shade off its ground is not that device, it is hidden text, and
         a bare substring test let a one-letter mark inherit the exemption from
         any sentence on the page. Giant, and the whole word. */
      const giant = markSize >= 48 || markSize >= window.innerWidth * 0.05;
      const whole = n ? new RegExp(`(^|\\s)${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`) : null;
      if (giant && n && whole && readableCorpus.some((c) => whole.test(c))) {
        tintMarks.push({ text: textOf(el).slice(0, 40), size: Math.round(parseFloat(s.fontSize)), color: s.color });
        continue;
      }
    }
    const { color: bg, overMedia } = effectiveBg(el);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const ratio = contrast(fg.a < 1 ? blend(fg, bg) : fg, bg);
    const min = large ? 3 : 4.5;
    const sample = { text: textOf(el).slice(0, 50), size: Math.round(size), ratio: +ratio.toFixed(2), color: s.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})` };
    if (overMedia) {
      const hasScrim = s.textShadow !== 'none' || paintedImage(getComputedStyle(el.parentElement || el).backgroundImage);
      if (!hasScrim) overMediaNoScrim.push(sample);
    } else if (ratio < min) badContrast.push(sample);
  }
  if (badContrast.length) {
    const pairs = {};
    for (const s2 of badContrast) {
      const k = `${s2.color} on ${s2.bg}`;
      if (!pairs[k]) pairs[k] = { pairing: k, worstRatio: s2.ratio, count: 0, example: s2.text, sizes: new Set() };
      pairs[k].count++;
      pairs[k].sizes.add(s2.size);
      pairs[k].worstRatio = Math.min(pairs[k].worstRatio, s2.ratio);
    }
    const grouped = Object.values(pairs)
      .map((p2) => ({ ...p2, sizes: [...p2.sizes].sort((a, b) => a - b) }))
      .sort((a, b) => a.worstRatio - b.worstRatio);
    add('fail', 'contrast',
      `${badContrast.length} text elements below WCAG AA, across ${grouped.length} distinct colour pairings (worst ${grouped[0].worstRatio}:1).`,
      grouped.slice(0, 8));
  }
  if (overMediaNoScrim.length)
    add('warn', 'text-over-media', `${overMediaNoScrim.length} text elements sit on an image/gradient with no scrim or text-shadow. Text over photography needs a gradient scrim, not hope.`, overMediaNoScrim.slice(0, 8));

  /* palette discipline */
  const bgCount = {};
  for (const el of all) {
    const s = getComputedStyle(el);
    const c = parseRGB(s.backgroundColor);
    if (c && c.a > 0.6) {
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      const k = `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
      bgCount[k] = (bgCount[k] || 0) + area;
    }
  }
  const totalArea = window.innerWidth * document.documentElement.scrollHeight;
  const significantBgs = Object.entries(bgCount).filter(([, a]) => a > totalArea * 0.005);
  const hues = new Set(
    significantBgs.map(([k]) => {
      const c = parseRGB(k);
      const max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b);
      if (max - min < 12) return 'neutral';
      let h = 0;
      if (max === c.r) h = ((c.g - c.b) / (max - min)) % 6;
      else if (max === c.g) h = (c.b - c.r) / (max - min) + 2;
      else h = (c.r - c.g) / (max - min) + 4;
      return Math.round(((h * 60) + 360) % 360 / 30);
    })
  );
  const areaPct = (k) => (totalArea ? ((bgCount[k] || 0) / totalArea) * 100 : 0);
  const blackPct = areaPct('rgb(0, 0, 0)');
  const whitePct = areaPct('rgb(255, 255, 255)');
  if (blackPct >= 12 || whitePct >= 12)
    add('warn', 'pure-black-white',
      `Pure ${blackPct >= 12 ? `#000 carries ${blackPct.toFixed(0)}%` : ''}${blackPct >= 12 && whitePct >= 12 ? ' and ' : ''}${whitePct >= 12 ? `#fff carries ${whitePct.toFixed(0)}%` : ''} of the painted area. SKILL.md's Instant Fails table asks for a tinted off-black and off-white — every study in the corpus lands a few points off the poles (blindbarber #141414 on #F1F1F1, amrit #292622 on #D8CBB8).`,
      { blackPct: +blackPct.toFixed(1), whitePct: +whitePct.toFixed(1) });
  if (hues.size > 4)
    add('warn', 'palette-sprawl', `${hues.size} distinct hue families carry significant area. Hold to 1 dominant + 1 accent + neutrals.`, significantBgs.slice(0, 10).map(([k, a]) => ({ color: k, areaPct: +(a / totalArea * 100).toFixed(1) })));

  /* Three rows of the Instant Fails table that nothing used to measure:
     gradient text, the 250–290 purple→blue band, and pure #000 / #fff. A ban
     printed in a table and absent from the auditor is a ban an agent can read,
     obey nowhere, and still exit 0. */
  const hueSat = (c) => {
    const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
    const d = mx - mn;
    if (!d) return { h: 0, s: 0 };
    let h = 0;
    if (mx === c.r) h = ((c.g - c.b) / d) % 6;
    else if (mx === c.g) h = (c.b - c.r) / d + 2;
    else h = (c.r - c.g) / d + 4;
    return { h: ((h * 60) + 360) % 360, s: mx ? d / mx : 0 };
  };
  const clipTextEls = [];
  const bandGradients = [];
  for (const el of all) {
    let s2; try { s2 = getComputedStyle(el); } catch { continue; }
    const bi = s2.backgroundImage || '';
    if (!/gradient/i.test(bi)) continue;
    if ((s2.webkitBackgroundClip === 'text' || s2.backgroundClip === 'text') && textOf(el).length > 1 && clipTextEls.length < 6)
      clipTextEls.push({ text: textOf(el).slice(0, 40), size: Math.round(parseFloat(s2.fontSize) || 0), gradient: bi.slice(0, 90) });
    if (bandGradients.length >= 6) continue;
    let band = 0, total = 0;
    for (const m of bi.match(/rgba?\([^)]+\)/g) || []) {
      const c = parseRGB(m);
      if (!c || (c.a == null ? 1 : c.a) < 0.3) continue;
      total++;
      const hs = hueSat(c);
      if (hs.s >= 0.25 && hs.h >= 250 && hs.h <= 290) band++;
    }
    const r2 = el.getBoundingClientRect();
    if (band && total >= 2 && r2.width * r2.height > 20000)
      bandGradients.push({ el: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''}`, gradient: bi.slice(0, 90), areaPx: Math.round(r2.width * r2.height) });
  }
  if (clipTextEls.length)
    add('fail', 'gradient-text',
      `${clipTextEls.length} text element${clipTextEls.length === 1 ? '' : 's'} painted with a \`background-clip: text\` gradient. SKILL.md lists this as an instant fail: one solid colour, and emphasis by size or weight.`,
      clipTextEls);
  if (bandGradients.length)
    add('fail', 'gradient-purple-blue',
      `${bandGradients.length} gradient${bandGradients.length === 1 ? '' : 's'} carry a stop in the 250–290 hue band — the purple→blue every generated page ships. Use whatever the brief actually justifies.`,
      bandGradients);

  /* radius + card-grid smell */
  const radii = {};
  let cardish = 0;
  for (const el of all) {
    const s = getComputedStyle(el);
    const r = parseFloat(s.borderTopLeftRadius) || 0;
    if (r > 0) radii[Math.round(r)] = (radii[Math.round(r)] || 0) + 1;
    const box = el.getBoundingClientRect();
    const hasShadow = s.boxShadow && s.boxShadow !== 'none';
    const hasBorder = parseFloat(s.borderTopWidth) > 0;
    const pad = parseFloat(s.paddingTop) || 0;
    /* SKILL.md bans "rounded, bordered OR shadowed" padded boxes; the code used
       to demand rounded AND (bordered or shadowed), so eight bordered cards at
       `border-radius: 4px` were a clean pass. Match the written rule — then
       subtract the one shape it never meant: a tile whose job is to hold a
       picture. Tripletta's video rail is six bordered boxes and is the opposite
       of a template. What the brief bans is the padded box holding only words. */
    const border4 = ['Top', 'Right', 'Bottom', 'Left'].every((k) => (parseFloat(s[`border${k}Width`]) || 0) > 0);
    const surfaced = r >= 6 || hasShadow || border4;
    if (surfaced && pad >= 12 && box.width > 160 && box.height > 100 && box.width < window.innerWidth * 0.8) {
      let inner = 0;
      try {
        for (const k of el.querySelectorAll('img,video,canvas,picture,svg')) {
          const kr = k.getBoundingClientRect();
          inner = Math.max(inner, kr.width * kr.height);
        }
      } catch { /* ignore */ }
      const holdsPicture = inner >= box.width * box.height * 0.35 || /url\(/i.test(s.backgroundImage || '');
      if (!holdsPicture) cardish++;
    }
    void hasBorder;
  }
  const radiusKeys = Object.keys(radii).map(Number).sort((a, b) => a - b);
  if (radiusKeys.length > 4)
    add('warn', 'radius-chaos', `${radiusKeys.length} distinct corner radii. Pick 2 (small + large) and hold them.`, radii);
  if (cardish >= 6)
    add('fail', 'card-grid-template', `${cardish} rounded-bordered-padded boxes rendered. This is the SaaS card-grid template the brief exists to avoid.`, { cardish });

  /* spacing grid */
  const spacings = {};
  for (const el of all) {
    const s = getComputedStyle(el);
    for (const p of ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'gap', 'rowGap']) {
      const v = Math.round(parseFloat(s[p]) || 0);
      if (v > 0) spacings[v] = (spacings[v] || 0) + 1;
    }
  }
  const offGrid = Object.keys(spacings).map(Number).filter((v) => v % 4 !== 0 && spacings[v] > 1);
  if (offGrid.length > 3)
    add('warn', 'spacing-off-grid', `${offGrid.length} repeated spacing values are not multiples of 4px.`, offGrid.slice(0, 12));

  /* section rhythm */
  const sections = Array.from(document.querySelectorAll('section, main > div, [data-section]')).filter(visible);
  const thin = sections.filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return r.height > 200 && (parseFloat(s.paddingTop) || 0) < 48 && (parseFloat(s.marginTop) || 0) < 48;
  });
  if (sections.length && thin.length > sections.length / 2)
    add('warn', 'section-rhythm', `${thin.length}/${sections.length} full sections have <48px of vertical breathing room. Award pages run 96–200px between movements.`, null);

  /* imagery */
  const imgs = Array.from(document.images).filter(visible);
  const upscaled = imgs
    .filter((im) => im.naturalWidth > 0 && im.getBoundingClientRect().width > im.naturalWidth * 1.15)
    .map((im) => ({ src: im.currentSrc.slice(-80), natural: im.naturalWidth, displayed: Math.round(im.getBoundingClientRect().width) }));
  if (upscaled.length)
    add('fail', 'image-upscaled', `${upscaled.length} images render larger than their source pixels — visibly soft.`, upscaled.slice(0, 8));
  /* `complete && naturalWidth === 0` is a real failure — the browser tried and
     got nothing. `!complete` is a loading="lazy" image that never entered the
     viewport path (a horizontal rail, the cloned half of a marquee track). Those
     are not the author's bug and must not fail the build. */
  const srcOf = (im) => (im.currentSrc || im.src || '').slice(-80);
  const brokenImgs = imgs.filter((im) => im.complete && im.naturalWidth === 0).map(srcOf);
  const neverLoaded = imgs.filter((im) => !im.complete && im.naturalWidth === 0).map(srcOf);
  if (brokenImgs.length) add('fail', 'image-broken', `${brokenImgs.length} images attempted to load and returned nothing — a real 404 or a bad path.`, brokenImgs.slice(0, 8));
  if (neverLoaded.length)
    add('warn', 'image-never-loaded', `${neverLoaded.length} lazy images were never scrolled into view, so the browser never requested them — they sit off the vertical scroll path (a horizontal rail, a cloned marquee half). Not broken; open one yourself to confirm the URL is good.`, neverLoaded.slice(0, 8));

  /* measure */
  const longLines = textEls.filter((el) => {
    const t = textOf(el);
    if (t.length < 120) return false;
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize);
    return el.getBoundingClientRect().width / (size * 0.5) > 92;
  }).length;
  if (longLines) add('warn', 'measure-too-wide', `${longLines} paragraphs exceed ~92 characters per line. Cap body measure at 60–75ch.`, null);

  /* motion presence */
  let animated = 0;
  for (const el of all.slice(0, 1500)) {
    const s = getComputedStyle(el);
    if ((s.transitionDuration && s.transitionDuration !== '0s') || (s.animationName && s.animationName !== 'none')) animated++;
  }
  if (animated < 3) add('warn', 'no-motion', 'Almost nothing on the page declares a transition or animation.', { animated });

  /* overflow */
  const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;
  if (overflowX) add('fail', 'overflow-x', `Page scrolls horizontally (${document.documentElement.scrollWidth}px in a ${window.innerWidth}px viewport).`, null);
  if (opts.expectWidth && window.innerWidth > opts.expectWidth * 1.1)
    add('fail', 'mobile-viewport-blown', `Layout forced the visual viewport to ${window.innerWidth}px on a ${opts.expectWidth}px device — a fixed-width child is pushing the page wider, so the phone zooms out and every type size shrinks.`, { innerWidth: window.innerWidth, expected: opts.expectWidth });

  /* ---------- copy tells ----------
     content-and-copy.md bans a specific list of words, openers, placeholders and
     furniture, and SKILL.md's Instant Fails table says every row has "a
     threshold the auditor measures". This row had none, so "Welcome to",
     "Jane Doe" and a 555 number were a clean exit 0. */
  const pageText = (() => {
    try { return String(document.body ? document.body.innerText || '' : '').replace(/\s+/g, ' ').trim(); }
    catch { return ''; }
  })();
  const PLACEHOLDERS = [
    [/\blorem ipsum\b/i, 'lorem ipsum'],
    [/\b(jane|john)\s+(doe|smith|roe)\b/i, 'a placeholder person'],
    [/\b(acme|nexus|novacore)\b/i, 'a placeholder company name'],
    [/[\w.+-]+@example\.(com|org|net)\b/i, 'an example.com address'],
    [/(\(555\)|\b555)[\s.-]?\d{3}[\s.-]?\d{4}\b/, 'a 555 phone number'],
    [/\b99\.99\s*%/, 'a 99.99% claim'],
    [/\b10x\s+(faster|better|more|cheaper)\b/i, 'a "10x" claim'],
    [/\btrusted by thousands\b/i, '"trusted by thousands"'],
  ];
  const placeholderHits = [];
  for (const [re, name] of PLACEHOLDERS) {
    const m = re.exec(pageText);
    if (m) placeholderHits.push({ tell: name, match: m[0].slice(0, 48) });
  }
  if (placeholderHits.length)
    add('fail', 'copy-placeholder',
      `${placeholderHits.length} placeholder${placeholderHits.length === 1 ? '' : 's'} survived into the shipped copy: ${placeholderHits.map((h) => h.tell).join('; ')}. content-and-copy.md lists these under "Placeholders that survived" — they are the fastest signal a visitor gets that nobody read the page.`,
      placeholderHits);

  const TELLS = [
    [/\bwelcome to\b/i, '"Welcome to"'],
    [/\bunlock the power of\b/i, '"Unlock the power of"'],
    [/\ball[- ]in[- ]one solution\b/i, '"all-in-one solution"'],
    [/\bin today'?s fast[- ]paced world\b/i, '"in today\u2019s fast-paced world"'],
    [/\bdiscover the difference\b/i, '"Discover the difference"'],
    /* `robust` and `leverage` are on content-and-copy.md's list as MARKETING
       adjectives, and both have ordinary uses that have nothing to do with
       generated prose — amritpalace.com describes a robust curry. A tell that
       fires on a real award site is a tell that gets ignored, so they are out
       of the machine list and stay in the written one. */
    [/\b(elevat(e|ing|ion)|seamless(ly)?|unleash(ing)?|empower(ing)?|revolutioni[sz]e|next[- ]gen|game[- ]?changer|cutting[- ]edge|delve)\b/i, 'a banned marketing word'],
  ];
  const tellHits = [];
  for (const [re, name] of TELLS) {
    const m = re.exec(pageText);
    if (m) tellHits.push({ tell: name, match: m[0].slice(0, 48) });
  }
  const ownShort = [];
  for (const el of textEls) {
    const t = textOf(el).replace(/\s+/g, ' ').trim();
    if (t && t.length <= 24) ownShort.push(t);
  }
  /* "Chapter 01" in a chapter-based layout is content — layout-archetypes.md
     builds two archetypes out of chapters and demos/horizontal-chapter.html
     numbers four of them. The banned furniture is generic numbering stamped on
     every block, so `SECTION`/`PART` only, and only once there are four. */
  const numberedEyebrows = ownShort.filter((t) => /^(section|part)\s*[-\u2013\u2014]?\s*0?\d{1,2}$/i.test(t)).length;
  const scrollCues = ownShort.filter((t) => /^scroll\b/i.test(t)).length;
  if (numberedEyebrows >= 4) tellHits.push({ tell: `${numberedEyebrows} numbered "SECTION 0n" eyebrows`, match: 'furniture' });
  if (scrollCues) tellHits.push({ tell: `${scrollCues} "Scroll" cue${scrollCues === 1 ? '' : 's'}`, match: 'furniture' });
  if (tellHits.length)
    add('warn', 'copy-tells',
      `${tellHits.length} copy tell${tellHits.length === 1 ? '' : 's'} from content-and-copy.md's banned list: ${tellHits.map((h) => h.tell).join('; ')}. Specificity is what a real business has and a generated page does not — "Open until 8pm on weekdays" beats "convenient hours".`,
      tellHits);

  /* tap targets (mobile only, caller decides) */
  const smallTargets = Array.from(document.querySelectorAll('a, button, [role=button], input, select'))
    .filter(visible)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height < 40 || r.width < 40;
    }).length;

  if (opts.expectWidth && smallTargets > 0)
    add('warn', 'tap-targets', `${smallTargets} interactive elements are under 40px on the phone.`, { smallTargets });

  /* ======================================================================
   * AMBITION (level `sparse`) — the checks above measure restraint; these
   * measure whether anything was risked. Ground truth is the study corpus in
   * assets/studies/[slug]/data.json, re-measured live at 1440x900 because the
   * stored `counts.img` is a raw tag count: amrit-palace ships 69 <img> tags and
   * renders exactly 10 photographs — the other 59 are 16-33px icons and star
   * glyphs. Rendered media over 8000px², the 10 studies longer than 5 screens:
   * fizzi 1 · apple-iphone14 7 · pizzato 7 · amrit-palace 10 · planetono 10 ·
   * nimbus 12 · macbook-ui 17 · plomberie 17 · tripletta 47 · blindbarber 254.
   * Median 11. Largest measured type: 902px (blindbarber), 270px (tripletta),
   * 208px (fizzi), 115px (amrit).
   * Every measurement below is guarded: a page that lacks the thing must not
   * throw, it must simply report the absence.
   * ==================================================================== */
  const CORPUS = { renderedMedian: 11, rawTagMedian: 22, screens: 9.9 };
  const MIN_MEDIA_AREA = 8000;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const screensNow = vh > 0 ? document.documentElement.scrollHeight / vh : 0;
  const rectOf = (el) => { try { return el.getBoundingClientRect(); } catch { return null; } };
  const describe = (el) => {
    try {
      const cls = (el.className && typeof el.className === 'string') ? `.${el.className.trim().split(/\s+/)[0]}` : '';
      const t = textOf(el).slice(0, 28);
      return `${el.tagName.toLowerCase()}${cls}${t ? ` "${t}"` : ''}`;
    } catch { return '?'; }
  };

  /* --- 1. image-density: rendered img + CSS background-image + video + canvas --- */
  const mediaSeen = new Set();
  const media = [];
  /* Laid out, not currently painted: a scroll-reveal image sitting at opacity 0
     and a lazy image below the fold are both images the page ships. Filtering
     on live opacity here undercounted amrit-palace at 10 against a real 69. */
  const laidOut = (el) => {
    const r = rectOf(el);
    if (!r || r.width * r.height < MIN_MEDIA_AREA) return null;
    let st;
    try { st = getComputedStyle(el); } catch { return null; }
    if (st.display === 'none' || st.visibility === 'hidden') return null;
    return r;
  };
  const pushMedia = (el, kind) => {
    if (!el || mediaSeen.has(el)) return;
    const r = laidOut(el);
    if (!r) return;
    mediaSeen.add(el);
    media.push({ el, kind, r });
  };
  for (const el of allRaw) {
    const tag = el.tagName;
    if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS') pushMedia(el, tag.toLowerCase());
  }
  for (const el of allRaw) {
    let bi = '';
    try { bi = getComputedStyle(el).backgroundImage || ''; } catch { bi = ''; }
    if (bi && bi !== 'none' && /url\(/i.test(bi)) pushMedia(el, 'css-background');
  }
  const mediaByKind = {};
  for (const m of media) mediaByKind[m.kind] = (mediaByKind[m.kind] || 0) + 1;
  /* A canvas or video covering half the viewport is a live scene: fizzi and
     apple-iphone14 carry whole pages on one WebGL stage and ship almost no
     stills. Their imagery is rendered, not sourced, so counting files is the
     wrong question and the check steps aside. */
  /* A canvas earns the step-aside by PAINTING. A 900x500 element with a CSS
     background colour and no draw call is a coloured rectangle, and one of them
     used to switch this whole check off. The craft probe reads the pixels. */
  const craftEarly = (opts && opts.craft && opts.craft.ok) ? opts.craft : null;
  const sceneIsLive = !!(craftEarly && (craftEarly.webgl || craftEarly.three || craftEarly.canvasPainted));
  let liveScene = null;
  for (const m of media) {
    if (m.kind !== 'canvas' && m.kind !== 'video') continue;
    if (m.kind === 'canvas' && !sceneIsLive) continue;
    if (m.r.width * m.r.height >= vw * vh * 0.5) { liveScene = m.kind; break; }
  }
  /* Eight placements of one photograph is one photograph. density-and-devices.md
     asks for ">= 6 distinct source photos, each cropped >= 2 ways" and nothing
     measured the first half of that sentence. */
  const mediaKeyOf = (m) => {
    try {
      if (m.kind === 'img') return `i:${(m.el.currentSrc || m.el.src || '').split('?')[0]}`;
      if (m.kind === 'video') return `v:${(m.el.currentSrc || m.el.src || 'v')}`;
      if (m.kind === 'canvas') return `c:${m.el.id || 'canvas'}`;
      const bi = getComputedStyle(m.el).backgroundImage || '';
      return `b:${((/url\(([^)]*)\)/.exec(bi) || ['', ''])[1] || '').replace(/["']/g, '').split('?')[0]}`;
    } catch { return 'x'; }
  };
  const distinctMedia = new Set(media.map(mediaKeyOf)).size;
  if (screensNow > 5 && !liveScene && media.length < 8)
    add('sparse', 'image-density',
      `${media.length} rendered images over ${screensNow.toFixed(1)} screens (img + CSS background + video + canvas, each over 8000px²). Median for this measure across the 10 corpus studies longer than 5 screens is ${CORPUS.renderedMedian}; the image-led ones run 47 (tripletta) and 254 (blindbarber). A long page carried by type and whitespace alone reads as a template.`,
      { rendered: media.length, byKind: mediaByKind, distinctSources: distinctMedia, screens: +screensNow.toFixed(1), corpusRenderedMedian: CORPUS.renderedMedian, corpusRawTagMedian: CORPUS.rawTagMedian, liveScene });
  if (screensNow > 5 && !liveScene && media.length >= 6 && distinctMedia < 5)
    add('sparse', 'image-repetition',
      `${media.length} media placements resolve to ${distinctMedia} distinct source${distinctMedia === 1 ? '' : 's'}. density-and-devices.md counts placements, not files — but it asks for at least six distinct photographs, each cropped two or more ways. Repeating one frame eight times fills the density count and shows the reader one picture.`,
      { rendered: media.length, distinctSources: distinctMedia, wanted: 5, byKind: mediaByKind });

  /* --- 2. hero-is-the-peak: a second type event at or near hero scale --- */
  let heroPeak = null;
  if (biggest && biggest.size > 0 && screensNow >= 2) {
    const belowSize = belowBiggest ? belowBiggest.size : 0;
    const ratio = belowSize / biggest.size;
    heroPeak = { heroSize: Math.round(biggest.size), largestBelowFold: Math.round(belowSize), ratio: +ratio.toFixed(2), belowText: belowBiggest ? belowBiggest.text : null };
    if (ratio < 0.8)
      add('sparse', 'hero-is-the-peak',
        `Hero type is ${Math.round(biggest.size)}px and nothing below the first screen passes ${Math.round(belowSize)}px (${Math.round(ratio * 100)}% of it). Every study has a second type event at or above hero scale — a year numeral, a wordmark, a giant brand word. One peak in screen one and a decline after it is a brochure.`,
        heroPeak);
  }

  /* --- 3. no-overlap: layering, not a stack of rows --- */
  const OVERLAP_MIN = 12;
  /* A transparent nav sitting on the hero photo is on every page ever shipped,
     template or not — counting it would make this check unfireable. Chrome is
     nav/menu furniture and anything riding on a fixed ancestor. */
  const chromeCache = new WeakMap();
  const isChrome = (el) => {
    if (chromeCache.has(el)) return chromeCache.get(el);
    let v = false;
    try {
      if (el.closest('nav, [role="navigation"], [role="menubar"], .nav, .navbar, .site-nav, .site-header')) v = true;
      else {
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          if (getComputedStyle(n).position === 'fixed') { v = true; break; }
        }
      }
    } catch { v = false; }
    chromeCache.set(el, v);
    return v;
  };
  const paintedNow = new Set(all);
  const contentSet = new Set();
  for (const el of textEls) contentSet.add(el);
  for (const m of media) if (paintedNow.has(m.el)) contentSet.add(m.el);
  /* Text and raster media were the only things that could layer, which quietly
     excluded the two mediums this skill spends most of its words on: the
     signature device ("draw it once as SVG with fill: currentColor") and the
     hairline rule that archetype E is built from. A wordmark pulled up over a
     footer rule, or an SVG mark crossing a photograph, is the layering the
     brief asks for and neither could ever be counted.
     A hairline is also the honest device on a phone, where a single column
     removes horizontal crossings by construction: pull a full-width wordmark or
     numeral up over the rule above it and the pair crosses in the vertical
     axis, which counts. */
  for (const el of all) {
    if (contentSet.has(el)) continue;
    const r = rectOf(el);
    if (!r) continue;
    let st; try { st = getComputedStyle(el); } catch { continue; }
    const tag = el.tagName.toLowerCase();
    if (tag === 'svg') {
      let nested = false;
      try { nested = !!(el.parentElement && el.parentElement.closest('svg')); } catch { nested = false; }
      if (!nested && r.width * r.height >= MIN_MEDIA_AREA) { contentSet.add(el); continue; }
    }
    /* a rule: thin in one axis, long in the other, and actually painted */
    const thin = Math.min(r.width, r.height) <= 6;
    const long = Math.max(r.width, r.height) >= vw * 0.25;
    if (!thin || !long) continue;
    const painted = (parseFloat(st.borderTopWidth) || 0) > 0 || (parseFloat(st.borderLeftWidth) || 0) > 0
      || (parseRGB(st.backgroundColor) || { a: 0 }).a > 0.5;
    if (painted) contentSet.add(el);
  }
  const boxes = [];
  for (const el of contentSet) {
    if (boxes.length >= 2200) break;
    const r = rectOf(el);
    if (!r || r.width < 8 || r.height < 8) continue;
    boxes.push({ el, l: r.left, t: r.top, r: r.right, b: r.bottom });
  }
  boxes.sort((a, b) => a.t - b.t);
  const covers = (X, Y) => X.l <= Y.l && X.t <= Y.t && X.r >= Y.r && X.b >= Y.b;
  let overlapPairs = 0;
  const overlapSamples = [];
  sweep:
  for (let i = 0; i < boxes.length; i++) {
    const A = boxes[i];
    for (let j = i + 1; j < boxes.length; j++) {
      const B = boxes[j];
      if (B.t >= A.b - OVERLAP_MIN) break;
      const ox = Math.min(A.r, B.r) - Math.max(A.l, B.l);
      if (ox <= OVERLAP_MIN) continue;
      const oy = Math.min(A.b, B.b) - Math.max(A.t, B.t);
      if (oy <= OVERLAP_MIN) continue;
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      if (isChrome(A.el) || isChrome(B.el)) continue;
      /* Containment is a backdrop, not a layer: a headline inside the bounds of
         a full-bleed hero photo is the most-shipped layout on the web. Layering
         is a PARTIAL crossing — one thing cutting across the edge of another. */
      if (covers(A, B) || covers(B, A)) continue;
      /* One of the two has to be a real element on the page. Two 24x24 labels
         nudged into each other satisfy "something crosses something else" and
         are invisible as layering — the device is a photo across a caption, a
         rail crossing an image, copy over a numeral. */
      const areaA = (A.r - A.l) * (A.b - A.t);
      const areaB = (B.r - B.l) * (B.b - B.t);
      if (Math.max(areaA, areaB) < vw * vh * 0.012) continue;
      overlapPairs++;
      if (overlapSamples.length < 6) overlapSamples.push({ a: describe(A.el), b: describe(B.el), overlapX: Math.round(ox), overlapY: Math.round(oy) });
      if (overlapPairs >= 500) break sweep;
    }
  }
  if (boxes.length > 1 && overlapPairs === 0)
    add('sparse', 'no-overlap',
      `Zero partially-overlapping content pairs across ${boxes.length} text/image/rule elements (nav chrome and text-inside-a-hero-photo excluded — both are free; at least one of the pair must cover 1.2% of the viewport, so two nudged labels do not count). Nothing cuts across anything else, so the page is a stack of rows. Layering — copy over a numeral, a photo dropped across a caption, a rail crossing an image — is what separates a designed page from a document. On a phone a single column removes horizontal crossings by construction, so the device there is vertical: pull a full-width wordmark, numeral or photo up over the rule or block above it with a negative margin. The pair overlaps in one axis and that counts.`,
      { pairs: 0, contentElements: boxes.length, minOverlapPx: OVERLAP_MIN, excluded: 'chrome + full containment' });

  /* --- 4. no-bleed: something crosses the viewport edge --- */
  const BLEED_MIN = 24;
  let bleeders = 0;
  const bleedSamples = [];
  /* A bleed is a rail, a marquee, a wordmark or a photo running past the frame
     — something a reader watches leave. A 300x10 empty spacer parked at
     `left: -200px` used to clear this check on its own. */
  const bleedContent = new Set(textEls);
  for (const m of media) bleedContent.add(m.el);
  if (!overflowX) {
    for (const el of all) {
      const r = rectOf(el);
      if (!r || r.width < 24 || r.height < 8) continue;
      if (r.right <= 0 || r.left >= vw) continue;
      const past = Math.max(-r.left, r.right - vw);
      if (past <= BLEED_MIN) continue;
      if (!bleedContent.has(el) && r.width * r.height < vw * vh * 0.02) continue;
      bleeders++;
      if (bleedSamples.length < 6) bleedSamples.push({ el: describe(el), pastPx: Math.round(past), side: (-r.left > r.right - vw) ? 'left' : 'right' });
    }
    if (bleeders === 0)
      add('sparse', 'no-bleed',
        `Nothing crosses the viewport edge. Every element stops inside the container, so the page announces its own margins. Award pages run a rail, a wordmark or a photo row past the edge so the frame reads as a window onto something larger.`,
        { bleeders: 0, minPastPx: BLEED_MIN });
  }

  /* --- 5. ground-flips: sampled by the driver across the scroll, passed in --- */
  const ground = (opts.ground && Array.isArray(opts.ground.keys) && opts.ground.keys.length >= 3) ? opts.ground : null;
  if (ground && screensNow > 6 && ground.flips < 3)
    add('sparse', 'ground-flips',
      `The ground changes ${ground.flips} time${ground.flips === 1 ? '' : 's'} in ${screensNow.toFixed(1)} screens (sampled at ${ground.keys.length} scroll positions). Blind Barber flips paper to ink every ~2 chapters and deletes every divider; Amrit runs sand, dark photo, saffron panel, sand. One ground for a whole page makes the scroll feel like one long section.`,
      { flips: ground.flips, samples: ground.keys, mediaAtSample: ground.media || null, sampled: ground.keys.length, mode: ground.mode || null, screens: +screensNow.toFixed(1) });

  /* --- 6. motion-vocabulary: distinct declarations, not animated element count --- */
  const motionVocab = new Set();
  for (const el of all.slice(0, 2500)) {
    let s;
    try { s = getComputedStyle(el); } catch { continue; }
    /* Split a CSS value list on top-level commas only — cubic-bezier(...) and
       steps(...) carry their own commas and must not be shredded. */
    const parts = (v) => {
      const out = [];
      let depth = 0, buf = '';
      for (const ch of String(v || '')) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (ch === ',' && depth === 0) { out.push(buf.trim()); buf = ''; continue; }
        buf += ch;
      }
      if (buf.trim()) out.push(buf.trim());
      return out.filter(Boolean);
    };
    const tProps = parts(s.transitionProperty);
    const tDur = parts(s.transitionDuration);
    const tEase = parts(s.transitionTimingFunction);
    for (let i = 0; i < tProps.length; i++) {
      const d = tDur.length ? tDur[i % tDur.length] : '0s';
      if (!(parseFloat(d) > 0)) continue;
      if (tProps[i] === 'none') continue;
      motionVocab.add(`transition:${tProps[i]}|${d}|${tEase.length ? tEase[i % tEase.length] : ''}`);
    }
    const aNames = parts(s.animationName);
    const aDur = parts(s.animationDuration);
    const aEase = parts(s.animationTimingFunction);
    for (let i = 0; i < aNames.length; i++) {
      if (aNames[i] === 'none') continue;
      motionVocab.add(`animation:${aNames[i]}|${aDur.length ? aDur[i % aDur.length] : ''}|${aEase.length ? aEase[i % aEase.length] : ''}`);
    }
  }
  /* A bundled motion runtime exposes no global — blindbarber ships GSAP fully
     scoped. Its fingerprint is the inline transforms and will-change hints it
     writes onto the elements it drives. Read those instead of the globals. */
  const jsMotion = (() => {
    try {
      if (window.gsap || window.ScrollTrigger || window.Lenis || window.lenis || window.THREE || window.anime || window.Motion || window.motion || window.Rive || window.SplitType) return true;
      if (document.querySelector('[data-scroll],[data-scroll-container],[data-gsap],[data-lenis],[data-barba],[data-swup]')) return true;
      /* A runtime WRITES transforms onto the elements it drives. `will-change`
         in a stylesheet is a hint an author typed once, and six of them used to
         be enough to claim a motion runtime on a page carrying no script at
         all — which switched the motion-vocabulary check off entirely. Read the
         inline transforms a live library leaves behind, nothing else. */
      let driven = 0;
      for (const el of all.slice(0, 2500)) {
        const inline = el.getAttribute && el.getAttribute('style');
        if (inline && /(transform|translate3d)\s*:/i.test(inline)) driven++;
        if (driven >= 6) return true;
      }
      return false;
    } catch { return false; }
  })();
  if (screensNow > 6 && motionVocab.size < 4 && !jsMotion)
    add('sparse', 'motion-vocabulary',
      `${motionVocab.size} distinct motion declaration${motionVocab.size === 1 ? '' : 's'} (unique property + duration + easing) across ${screensNow.toFixed(1)} screens, and no JS motion runtime on the page. One easing curve repeated everywhere is a default, not a vocabulary — a page this long wants at least 4: a state change, an enter, a scroll-linked move, and a slow ambient one.`,
      { distinct: motionVocab.size, sample: [...motionVocab].slice(0, 8), jsMotion });


  /* ======================================================================
   * CRAFT (level `craft`) — FAIL/WARN measure restraint. SPARSE measures what
   * is absent from the composition. Neither one can tell whether the AMBITION
   * the skill sells was actually built, because every check above them can be
   * satisfied by a well-set static document. Two sites shipped from this skill
   * with zero pins, zero scrubs, zero transitions and zero canvas and passed
   * everything.
   * references/ambition-tiers.md makes Tier B the default and says it plainly:
   * "a page over 6 screens is at Tier B unless you can defend Tier A". Nothing
   * measured that claim. This does.
   * CRAFT never changes the exit code. Like SPARSE it is a design note — but it
   * is a note about work that was promised and not done, not about taste.
   * The dynamic evidence (pins, scrubs, loaders, cursors) is measured by the
   * driver on its own throwaway page and handed in as opts.craft; everything
   * here is guarded so a page that cannot be probed reports "not measured".
   * ==================================================================== */
  const craftIn = (opts && opts.craft && typeof opts.craft === 'object') ? opts.craft : null;
  const craftOk = !!(craftIn && craftIn.ok);
  const techniques = (craftOk && craftIn.techniques && typeof craftIn.techniques === 'object') ? craftIn.techniques : {};
  const techPresent = (craftOk && Array.isArray(craftIn.present)) ? craftIn.present : [];
  const TECHNIQUE_NAMES = [
    'scroll-pinned section', 'scrubbed sequence', 'split/masked type reveal',
    'cursor-driven preview', 'horizontal chapter', 'loader into hero',
    'page transition', 'magnetic element', 'canvas/3D scene',
  ];
  const LONG_PAGE_SCREENS = 6;   /* ambition-tiers.md, Tier A entry clause */
  const longPage = screensNow > LONG_PAGE_SCREENS;

  /* --- C1. tier-undeclared: the tier has to be a claim someone can check --- */
  /* `premium-web-design: tier=C mobile=B` — the optional `mobile=` is not a
     let-off, it is the Tier C requirement written down. ambition-tiers.md asks
     for "a defined fallback for phones" and says never ship a 4MB model to one,
     so a page that renders on desktop and art-directs a still on the phone is
     obeying the skill. Declaring that is how it gets read as obedience rather
     than as a tier that was never built. tier-fallback-missing below is what
     stops the clause becoming the new loophole. */
  const parseDecl = (hay) => {
    if (!hay) return null;
    const anchor = /premium-web-design\b[^\n\r]{0,320}/i.exec(String(hay));
    if (!anchor) return null;
    const kindM = /\bkind\s*[:=]\s*(demo|page)\b/i.exec(anchor[0]);
    const t = /\btier\s*[:=]\s*([abc])\b/i.exec(anchor[0]);
    if (!t) return kindM ? { tier: null, mobile: null, kind: kindM[1].toLowerCase(), because: null } : null;
    const mob = /\bmobile\s*[:=]\s*([abc])\b/i.exec(anchor[0]);
    /* ambition-tiers.md's Tier A entry test is one sentence: name the
       award-winning page you are matching and say why yours needs less motion.
       Only the length clause is machine-checkable; the rest is checked by
       making the author write it down where a reviewer will read it. */
    const why = /\b(because|matching|matches)\s*[:=]\s*("([^"]{4,})"|'([^']{4,})'|([^\s][^-]{4,}?))(?=\s*(-->|$|;))/i.exec(anchor[0]);
    const because = why ? String(why[3] || why[4] || why[5] || '').trim() : null;
    return { tier: t[1].toUpperCase(), mobile: mob ? mob[1].toUpperCase() : null, kind: kindM ? kindM[1].toLowerCase() : null, because: because || null };
  };
  const tierDecl = (() => {
    try {
      const w = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null);
      let n, guard = 0;
      while ((n = w.nextNode()) && ++guard < 800) {
        const d = parseDecl(n.nodeValue);
        if (d) return { ...d, via: 'html comment' };
      }
    } catch { /* unreadable comment tree */ }
    try {
      for (const meta of document.querySelectorAll('meta')) {
        const name = (meta.getAttribute('name') || meta.getAttribute('property') || '').trim();
        const content = meta.getAttribute('content') || '';
        const d = parseDecl(`${name} ${content}`);
        if (d) return { ...d, via: 'meta' };
        if (/^premium-web-design$/i.test(name)) {
          const t = /\btier\s*[:=]?\s*([abc])\b/i.exec(content);
          if (t) {
            const mob = /\bmobile\s*[:=]?\s*([abc])\b/i.exec(content);
            const kd = /\bkind\s*[:=]?\s*(demo|page)\b/i.exec(content);
            const wh = /\b(because|matching|matches)\s*[:=]?\s*(.{4,})$/i.exec(content);
            return { tier: t[1].toUpperCase(), mobile: mob ? mob[1].toUpperCase() : null, kind: kd ? kd[1].toLowerCase() : null, because: wh ? wh[2].trim() : null, via: 'meta' };
          }
        }
      }
    } catch { /* ignore */ }
    try {
      const src = document.documentElement.outerHTML;
      if (src && src.length < 4000000) {
        const d = parseDecl(src);
        if (d) return { ...d, via: 'page source' };
      }
    } catch { /* ignore */ }
    return null;
  })();
  const declaredTier = tierDecl ? tierDecl.tier : null;
  const declaredKind = tierDecl && tierDecl.kind ? tierDecl.kind : null;
  const declaredMobileTier = tierDecl ? tierDecl.mobile : null;
  const onPhone = !!opts.expectWidth;
  /* The phone pass answers to `mobile=` when the author set one; with no
     `mobile=` the declared tier stands at both widths, because a page that
     claims C everywhere and delivers nothing on phones still has to hear it. */
  const viewportTier = (onPhone && declaredMobileTier) ? declaredMobileTier : declaredTier;
  /* No declaration means the default applies, not that the question goes away. */
  const measuredAgainst = viewportTier || 'B';
  if (!declaredTier)
    add('craft', 'tier-undeclared',
      `No ambition tier declared on the page. Emit \`<!-- premium-web-design: tier=B -->\` (or \`<meta name="premium-web-design" content="tier=B">\`; add \`mobile=A\` when the phone build is deliberately a tier lower) so the tier is a claim that can be checked against what shipped. Measuring this page against Tier B, the documented default for anything over ${LONG_PAGE_SCREENS} screens.`,
      { found: null, measuredAgainst: 'B', screens: +screensNow.toFixed(1) });

  /* --- C2. tier-unmet / tier-floor: what the page SHIPS vs what it claims --- */
  /* ambition-tiers.md, Tier B "Ships:" — pinned sections, scrubbed sequences,
     split-text reveals, horizontal chapters, page transitions, magnetic cursor
     elements. Checking a shorter list than the document defines would call a
     page unmet for shipping something the document names as the tier. */
  const B_EVIDENCE = ['scroll-pinned section', 'scrubbed sequence', 'split/masked type reveal', 'page transition', 'horizontal chapter', 'magnetic element'];
  const evidenceB = B_EVIDENCE.filter((k) => techniques[k]);
  const evidenceC = [];
  if (craftOk) {
    if (craftIn.webgl) evidenceC.push('webgl canvas');
    if (craftIn.three) evidenceC.push('three/R3F');
  }
  const tierEvidence = {
    declared: declaredTier, declaredMobile: declaredMobileTier, viewport: onPhone ? 'mobile' : 'desktop', measuredAgainst,
    tierB: evidenceB, tierC: evidenceC,
    detected: techPresent, screens: +screensNow.toFixed(1),
    probe: craftOk ? (craftIn.mode || 'ok') : 'not measured',
  };
  /* An undeclared page is measured against the default, but the default itself
     only bites over 6 screens — Tier A is a legitimate answer for a short page,
     and firing on one would punish the demos for their own mobile fallbacks. A
     tier the author DECLARED is checked at any length: they named it. */
  const tierApplies = craftOk && (viewportTier ? true : longPage);
  if (tierApplies) {
    if (measuredAgainst === 'C' && evidenceC.length === 0)
      add('craft', 'tier-unmet',
        `Tier C ${onPhone && declaredMobileTier ? 'declared for the phone' : 'declared'} and nothing rendered: no <canvas> holds a WebGL/WebGL2 context and no three/R3F runtime is on the page. Tier C is "a real-time 3D object the scroll drives" — ${evidenceB.length ? `the page ships ${evidenceB.join(' + ')}, which is Tier B` : 'and the page does not even reach Tier B'}.${onPhone && !declaredMobileTier ? ' If the phone build drops to a still on purpose, say so: `premium-web-design: tier=C mobile=B`.' : ' Drop the declaration to the tier you built, or build the tier you declared.'}${(opts.capabilityNotes && opts.capabilityNotes.length) ? ` The page logged ${opts.capabilityNotes.length} capability note(s), so it knows it stepped down.` : ' Nothing was logged to say the page took a fallback path: a capability gate that can silently downgrade the experience must announce the failed condition with `console.info`. Three investigations on this skill have been lost to exactly that silence — GLTFLoader over `file://`, a Tier C page taking its phone fallback on desktop, and a 3D demo rendering an image sequence with WebGL2 available and a clean console.'}`,
        tierEvidence);
    else if (measuredAgainst === 'B' && evidenceB.length === 0 && evidenceC.length === 0)
      add('craft', 'tier-unmet',
        `${viewportTier ? `Tier B declared${onPhone && declaredMobileTier ? ' for the phone' : ''}` : `No tier declared, so Tier B applies (${screensNow.toFixed(1)} screens)`} and none of its evidence is on the page: no scroll-driven pin, no scrubbed transform or canvas draw, no split/masked type reveal, no horizontal chapter, no page transition, no magnetic element. Tier B is "a real timeline library driving scroll" — a page with scroll-reveal fades and hover states is Tier A wearing a Tier B label.`,
        tierEvidence);
  }

  /* --- C2b. tier-fallback-missing: a declared step down has to land somewhere.
     `mobile=B` under `tier=C` is a promise that the scene was REPLACED, not
     switched off. The driver records where the canvas lives on desktop; this
     resolves the same host at 390px and asks what is painted there now. An
     empty sticky section is the exact failure this whole class of check exists
     to catch, and it must not become the cheap way to pass. */
  let fallback = null;
  if (onPhone && declaredMobileTier && declaredTier && declaredMobileTier !== declaredTier && opts.desktopScene) {
    const ref = opts.desktopScene;
    const host = (() => {
      try {
        if (ref.canvasId) {
          const c = document.getElementById(ref.canvasId);
          if (c) return c.closest('section,[data-section],article,header,figure') || c.parentElement;
        }
        if (ref.id) { const h = document.getElementById(ref.id); if (h) return h; }
        if (ref.cls) {
          const h = document.querySelector(`${ref.tag || '*'}.${CSS.escape(ref.cls)}`);
          if (h) return h;
        }
        if (ref.sectionIndex >= 0) {
          const list = document.querySelectorAll('section');
          if (list[ref.sectionIndex]) return list[ref.sectionIndex];
        }
        if (ref.path) return document.querySelector(ref.path);
      } catch { /* fall through */ }
      return null;
    })();
    if (host) {
      const inside = media.filter((m) => { try { return host.contains(m.el) || m.el === host; } catch { return false; } });
      const biggest = inside.reduce((acc, m) => Math.max(acc, m.r.width * m.r.height), 0);
      const need = vw * vh * 0.15;
      fallback = { host: describe(host), mediaInside: inside.length, biggestAreaPct: +((biggest / (vw * vh)) * 100).toFixed(1), needAreaPct: 15, resolvedFrom: ref };
      if (biggest < need)
        add('craft', 'tier-fallback-missing',
          `Tier ${declaredTier} declares \`mobile=${declaredMobileTier}\`, but the section that carries the 3D on desktop paints nothing in its place on the phone: ${inside.length} media element${inside.length === 1 ? '' : 's'} inside it, largest covering ${fallback.biggestAreaPct}% of the viewport (needs 15%). ambition-tiers.md asks for "a defined fallback", and "the still composition must be complete on its own" — a scene switched off is not a fallback, it is a hole.`,
          fallback);
    } else {
      fallback = { host: null, note: 'desktop scene host did not resolve at this width', resolvedFrom: ref };
    }
  }
  /* The Tier A entry clause is the loophole: "it is a static site" satisfied it
     on every brief forever. Length is the one clause that cannot be argued. */
  /* The length clause is one of three, and it is the only one a machine can
     read. ambition-tiers.md: "name the award-winning page you are matching, and
     say why yours needs less motion than that one. If the answer is about your
     convenience rather than the brief, you are at the wrong tier." A short page
     used to clear every craft gate simply by declaring A and stopping at 5.9
     screens; now the declaration has to carry its own defence. */
  if (viewportTier === 'A' && !longPage && !(tierDecl && tierDecl.because && tierDecl.because.length >= 8))
    add('craft', 'tier-a-undefended',
      `Tier A declared with no defence written down. ambition-tiers.md makes the entry test one sentence — name the award-winning page you are matching and say why yours needs less motion than that one — and only the "under ${LONG_PAGE_SCREENS} screens" clause can be measured. Put the other two in the declaration: \`<!-- premium-web-design: tier=A because="plomberie5etoiles.com — four screens, and the photography carries every one" -->\`.`,
      { declared: 'A', screens: +screensNow.toFixed(1), because: null, detected: techPresent });
  if (viewportTier === 'A' && longPage)
    add('craft', 'tier-floor',
      `Tier A declared on a ${screensNow.toFixed(1)}-screen page. Tier A requires the page to be UNDER ${LONG_PAGE_SCREENS} viewport heights — "a long page held at Tier A becomes a scroll with nothing in it". Either cut the page under ${LONG_PAGE_SCREENS} screens or move to Tier B.`,
      { declared: 'A', viewport: onPhone ? 'mobile' : 'desktop', screens: +screensNow.toFixed(1), ceiling: LONG_PAGE_SCREENS, detected: techPresent });

  /* --- C3. motion-techniques: how many weight-carrying moments ship ---
     Everything craft-gated used to start at 6 screens, so a desktop page parked
     at 5.9 cleared the tier check, the technique floor and the loader check in
     one move — and SKILL.md's own composition rule ("the page runs 5–12
     viewport heights") makes 5.9 a legal length. Desktop keeps a floor of 2
     from 4 screens up. The phone is left at the 6-screen rule on purpose: a
     mobile build that drops to a still is the documented Tier C fallback, and
     horizontal-chapter.html releases its pin at 390px by design. */
  const SHORT_PAGE_SCREENS = 4;
  const techFloor = longPage ? 3 : ((!onPhone && screensNow > SHORT_PAGE_SCREENS) ? 2 : 0);
  if (craftOk && techFloor && techPresent.length < techFloor)
    add('craft', 'motion-techniques',
      `${techPresent.length} of 9 weight-carrying motion techniques over ${screensNow.toFixed(1)} screens${techPresent.length ? ` — detected: ${techPresent.join(', ')}` : ' — none detected'}. A page this long wants at least ${techFloor} from: ${TECHNIQUE_NAMES.join(', ')}. Scroll-reveal fades and hover states are the floor, not a technique.`,
      { detected: techPresent, count: techPresent.length, wanted: techFloor, catalogue: TECHNIQUE_NAMES, evidence: techniques, screens: +screensNow.toFixed(1) });

  /* --- C4. no-loader: something has to run into the first paint --- */
  const loaderEvidence = craftOk ? (craftIn.loader || null) : null;
  if (craftOk && longPage && !loaderEvidence)
    add('craft', 'no-loader',
      `Nothing runs before or into the first paint: no overlay present at load and gone by 2500ms, no loading class dropped off the root, no \`data-loader\` hook. motion.md names the loader as a weight-carrying moment and demos/loader-to-hero.html builds one that resolves into the hero. A ${screensNow.toFixed(1)}-screen page that simply appears has thrown away its first second.`,
      { loader: null, probedAt: craftOk ? (craftIn.loaderProbe || null) : null, screens: +screensNow.toFixed(1) });

  /* --- C5. img-not-responsive: oversized payloads with no srcset --- */
  /* imagery.md asks for 2x the CSS display width. The flag sits at 2.5x — 25%
     of headroom over the contract — so a correct retina asset never trips it
     and a 4x/6x payload always does. Flagging at the literal 2x would fail the
     documented target itself, which would make the check unusable. */
  const RESP_RATIO = 2.5;
  const fatImgs = [];
  for (const im of imgs) {
    try {
      /* `srcset="hero.jpg"` is one candidate at one size. It satisfies the
         attribute, satisfies the Done checklist line that says "every image has
         srcset", and delivers a single payload to every device — which is the
         exact thing this check exists to catch. A source SET has alternatives. */
      const ss = String(im.srcset || '').trim();
      if (ss && (ss.split(',').filter((x) => x.trim()).length >= 2 || /\s\d+(\.\d+)?(w|x)$/i.test(ss))) continue;
      const pic = im.closest && im.closest('picture');
      if (pic && pic.querySelectorAll('source[srcset], source[src]').length >= 1) continue;
      const src = im.currentSrc || im.src || '';
      if (/\.svg(\?|#|$)/i.test(src)) continue;
      const nw = im.naturalWidth || 0;
      const rw = im.getBoundingClientRect().width;
      if (!nw || rw < 24) continue;
      const ratio = nw / rw;
      if (ratio > RESP_RATIO)
        fatImgs.push({ src: src.slice(-70), naturalWidth: nw, renderedWidth: Math.round(rw), ratio: +ratio.toFixed(1), wastedPx: Math.round(nw - rw * 2) });
    } catch { /* skip this image */ }
  }
  fatImgs.sort((a, b) => b.ratio - a.ratio);
  if (fatImgs.length) {
    const w = fatImgs[0];
    add('craft', 'img-not-responsive',
      `${fatImgs.length} image${fatImgs.length === 1 ? '' : 's'} ship${fatImgs.length === 1 ? 's' : ''} no \`srcset\` and no \`<picture>\` and decode${fatImgs.length === 1 ? 's' : ''} at over ${RESP_RATIO}x the width ${fatImgs.length === 1 ? 'it renders' : 'they render'} at. Worst: ${w.naturalWidth}px natural into ${w.renderedWidth}px rendered (${w.ratio}x). imagery.md asks for 2x display width — this is a payload the phone pays for and never sees.`,
      { count: fatImgs.length, threshold: RESP_RATIO, worst: w, offenders: fatImgs.slice(0, 8) });
  }

  /* --- C6. conversion-incomplete (local business only) --- */
  const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
  /* A `tel:` link on its own is a support number — every global product page has
     one, and reading Apple as a plumber produced four findings about a shop that
     does not exist. A local business also puts an address, its hours, a map or
     LocalBusiness structured data on the page. Require one of those too. */
  const localSignal = (() => {
    try {
      if (document.querySelector('address')) return 'address element';
      for (const sc of document.querySelectorAll('script[type="application/ld+json"]')) {
        const t = String(sc.textContent || '').slice(0, 20000);
        if (/"@type"\s*:\s*"?\[?[^\]"]*(LocalBusiness|Restaurant|Store|Hotel|Lodging|MedicalClinic|VeterinaryCare|Dentist|Physician|HealthAndBeauty|SportsActivityLocation|BarOrPub|CafeOrCoffeeShop|Bakery|HomeAndConstruction|Plumber|HairSalon|DaySpa)/i.test(t))
          return 'LocalBusiness structured data';
        if (/"(streetAddress|openingHours|openingHoursSpecification)"/i.test(t)) return 'address/hours structured data';
      }
      if (document.querySelector('iframe[src*="google.com/maps"],iframe[src*="maps.google"],iframe[src*="openstreetmap"]')) return 'embedded map';
      const body = String(document.body.innerText || '').slice(0, 30000);
      if (/\b(opening hours|opening times|mon(day)?\s*[–\-—]\s*(fri|sat|sun)|monday to (friday|sunday|saturday)|book a table|our address|how to find us|get directions)\b/i.test(body)) return 'opening hours / directions copy';
    } catch { /* ignore */ }
    return null;
  })();
  let conversion = null;
  if (telLinks.length && localSignal) {
    /* One flat text stream in document order, so "what happens next" can be read
       as the 200 characters that FOLLOW a CTA rather than as a DOM guess. */
    const stream = (() => {
      const out = { buf: '', map: new WeakMap() };
      try {
        if (!document.body) return out;
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let n, guard = 0;
        while ((n = w.nextNode()) && ++guard < 40000) {
          const v = String(n.nodeValue || '').replace(/\s+/g, ' ');
          if (!v.trim()) continue;
          out.map.set(n, out.buf.length);
          out.buf += v + ' ';
        }
      } catch { /* partial stream is still useful */ }
      return out;
    })();
    const endOffset = (el) => {
      try {
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let n, last = -1, guard = 0;
        while ((n = w.nextNode()) && ++guard < 4000) {
          const o = stream.map.get(n);
          if (o != null) last = o + String(n.nodeValue || '').replace(/\s+/g, ' ').length;
        }
        return last;
      } catch { return -1; }
    };

    /* (a) fixed bottom action bar — mobile only. Measured live here AND across
       the driver's scroll samples, because plenty of bars only appear on scroll. */
    const bottomBarHere = (() => {
      if (!opts.expectWidth) return null;   /* n/a on desktop */
      try {
        for (const el of all) {
          const s = getComputedStyle(el);
          if (s.position !== 'fixed') continue;
          const r = el.getBoundingClientRect();
          if (r.width < vw * 0.5 || r.height < 28) continue;
          if (r.top < vh * 0.4) continue;                 /* a full-height overlay is not a bar */
          if (vh - r.bottom > 120) continue;              /* must be anchored to the bottom */
          if (!el.querySelector('a[href], button')) continue;
          return { width: Math.round(r.width), height: Math.round(r.height), bottomGap: Math.round(vh - r.bottom), el: describe(el) };
        }
      } catch { /* ignore */ }
      return null;
    })();
    const bottomBar = bottomBarHere || (craftOk && craftIn.bottomBar ? craftIn.bottomBar : null);

    /* (b) what happens next, within 200 characters after a primary CTA */
    const CTA_RE = /\b(book|booking|reserve|enquire|enquiry|inquiry|get in touch|contact us|call us|call now|request|arrange|register|apply|quote|appointment|make a booking|talk to)\b/i;
    const NEXT_RE = /\b(confirm(s|ed|ation)?|repl(y|ies|ied)|call (you )?back|we'?ll (call|ring|email|text|be in touch)|hear (back )?from|get back to you|respond|response|within (a|an|one|two|three|24|48|\d)|same day|by (return|email)|no obligation)\b/i;
    const ctas = [];
    try {
      for (const el of Array.from(document.querySelectorAll('a[href], button')).filter(visible)) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const href = el.getAttribute('href') || '';
        if (!CTA_RE.test(t) && !/^tel:|^mailto:/i.test(href)) continue;
        if (t.length > 60) continue;
        ctas.push({ el, text: t.slice(0, 40) });
        if (ctas.length >= 40) break;
      }
    } catch { /* ignore */ }
    let whatNext = null;
    for (const c of ctas) {
      const off = endOffset(c.el);
      if (off < 0) continue;
      const after = stream.buf.slice(off, off + 200);
      if (NEXT_RE.test(after)) { whatNext = { cta: c.text, follows: after.trim().slice(0, 120) }; break; }
    }

    /* (c) an FAQ / objection block */
    /* An empty `<details>` and a heading that says FAQ both used to clear this.
       The device is "answers the question that stops the booking" — so find the
       answers, not the furniture. */
    const faq = (() => {
      try {
        const ds = Array.from(document.querySelectorAll('details'));
        const answered = ds.filter((d) => {
          const sum = d.querySelector('summary');
          const whole = String(d.textContent || '').replace(/\s+/g, ' ').trim();
          const q = sum ? String(sum.textContent || '').replace(/\s+/g, ' ').trim() : '';
          return whole.length - q.length >= 40;
        });
        if (answered.length >= 2) return { kind: 'details', answered: answered.length, of: ds.length };
        for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6,summary,dt,[role="heading"]')) {
          const t = (h.textContent || '').replace(/\s+/g, ' ').trim();
          if (t.length > 120) continue;
          if (!/question|faq|what if|do you|frequently asked/i.test(t)) continue;
          let body = '';
          let n = h.nextElementSibling;
          for (let k = 0; k < 8 && n; k++, n = n.nextElementSibling) body += ` ${String(n.textContent || '')}`;
          if (!body.replace(/\s+/g, ' ').trim().length && h.parentElement) body = String(h.parentElement.textContent || '');
          const len = body.replace(/\s+/g, ' ').trim().length;
          if (len >= 120) return { kind: 'heading', text: t.slice(0, 60), answerChars: len };
        }
      } catch { /* ignore */ }
      return null;
    })();

    /* (d) a named person who is not a reviewer */
    const ROLE_RE = /\b(manager|director|nurse|coach|surgeon|founder|head|owner|chef|principal|instructor|dentist|veterinar\w*|vet|physio\w*|therapist|proprietor)\b/i;
    const NAME_RE = /\b[A-Z][a-zà-öø-ÿ'’-]{1,}\s+[A-Z][A-Za-zà-öø-ÿ'’-]{1,}\b/;
    const namedPerson = (() => {
      try {
        for (const el of all) {
          const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
          if (t.length < 4 || t.length > 140) continue;
          if (!ROLE_RE.test(t)) continue;
          if (el.querySelector('*') && el.children.length > 6) continue;
          let reviewish = false;
          try { reviewish = !!el.closest('blockquote, q, [class*="review" i], [class*="testimonial" i], [id*="review" i], [id*="testimonial" i]'); } catch { reviewish = false; }
          if (reviewish) continue;
          const near = [t];
          if (el.previousElementSibling) near.push((el.previousElementSibling.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80));
          if (el.parentElement) {
            const h = el.parentElement.querySelector('h1,h2,h3,h4,h5,h6,dt,strong,b');
            if (h) near.push((h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80));
          }
          for (const hay of near) {
            const m = NAME_RE.exec(hay);
            if (!m) continue;
            if (ROLE_RE.test(m[0])) continue;          /* "Head Coach" is the role, not a name */
            if (/\b(jane|john)\s+(doe|smith|roe)\b/i.test(m[0])) continue;   /* a placeholder is not a person */
            return { name: m[0], context: t.slice(0, 80) };
          }
        }
      } catch { /* ignore */ }
      return null;
    })();

    const missing = [];
    if (opts.expectWidth && !bottomBar) missing.push('fixed bottom action bar (mobile)');
    if (!whatNext) missing.push('what happens next after the CTA');
    if (!faq) missing.push('FAQ / objection block');
    if (!namedPerson) missing.push('a named person who is not a reviewer');
    conversion = {
      telLinks: telLinks.length,
      localSignal,
      bottomBar: opts.expectWidth ? bottomBar : 'n/a (desktop)',
      whatNext, faq, namedPerson, missing,
    };
    if (missing.length)
      add('craft', 'conversion-incomplete',
        `Local-business page (${telLinks.length} \`tel:\` link${telLinks.length === 1 ? '' : 's'}, ${localSignal}) missing ${missing.length} of the ${opts.expectWidth ? 4 : 3} conversion parts the corpus wins on: ${missing.join('; ')}. Plomberie ships a bottom-pinned mobile action bar and a 4-row objection FAQ; Amrit names the people. These are S-cost components with a direct line to booked work.`,
        conversion);
  }

  /* --- C7. rating-unsourced: a number that asks to be believed --- */
  const RATING_CTX_RE = /\b(review|reviews|rating|rated|star|stars|out of 5|google|trustpilot|tripadvisor)\b/i;
  const unsourcedRatings = [];
  for (const el of textEls) {
    try {
      const own = textOf(el).replace(/\s+/g, ' ').trim();
      if (!own || own.length > 14) continue;
      const m = /^([3-5](?:[.,]\d)?)(?:\s*(?:\/|out of)\s*5)?$/i.exec(own);
      if (!m) continue;
      const val = parseFloat(m[1].replace(',', '.'));
      if (!(val >= 3 && val <= 5)) continue;
      /* Climb only until the claim is legible — the tightest container that
         carries both the number and the word "review" is the one to quote. */
      let ctx = el, ctxText = '';
      for (let k = 0; k < 4; k++) {
        const t = String(ctx.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length <= 320 && RATING_CTX_RE.test(t)) { ctxText = t; break; }
        if (!ctx.parentElement || ctx.parentElement === document.body) break;
        ctx = ctx.parentElement;
      }
      if (!ctxText) continue;
      /* `<a href="#">4.9</a>` used to clear this. A source is somewhere the
         reader can go and see the reviews — an in-page anchor, an empty href
         and a `javascript:` handler are all the same claim with a link
         painted on it. */
      const realLink = (a) => {
        if (!a || a.tagName !== 'A') return false;
        const h = String(a.getAttribute('href') || '').trim();
        if (!h || h === '#' || h.startsWith('#')) return false;
        if (/^javascript:/i.test(h)) return false;
        return true;
      };
      const anyRealLinkIn = (node) => {
        if (!node || !node.querySelectorAll) return false;
        for (const a of node.querySelectorAll('a[href]')) if (realLink(a)) return true;
        return false;
      };
      let sourced = false;
      if (realLink(el.closest('a[href]'))) sourced = true;
      else if (anyRealLinkIn(ctx)) sourced = true;
      else {
        for (const sib of [el.previousElementSibling, el.nextElementSibling, ctx.previousElementSibling, ctx.nextElementSibling]) {
          if (!sib) continue;
          if (realLink(sib) || anyRealLinkIn(sib)) { sourced = true; break; }
        }
      }
      if (!sourced) unsourcedRatings.push({ rating: val, text: own, context: ctxText.slice(0, 100) });
      if (unsourcedRatings.length >= 6) break;
    } catch { /* skip */ }
  }
  if (unsourcedRatings.length)
    add('craft', 'rating-unsourced',
      `${unsourcedRatings.length} numeric rating${unsourcedRatings.length === 1 ? '' : 's'} with no link to the source (worst: "${unsourcedRatings[0].context}"). content-and-copy.md bans star ratings with no source — an unlinked ${unsourcedRatings[0].rating} is a number the visitor has to take on trust, which is exactly the trust the number was there to buy. Link it to the Google/Trustpilot listing.`,
      unsourcedRatings);

  /* ======================================================================
   * kind=demo — SPARSE and CRAFT are statements about a finished page.
   * demos/*.html are deliberately single-pattern fragments and SKILL.md sends
   * agents to them ("Open the nearest and copy it"), so an agent that copies
   * the recommended file and audits it used to collect six ambition findings on
   * work the skill had just endorsed. Same shape as the Tier A loophole: a rule
   * applied to something it was never scoped to.
   * The claim is guarded, because "kind=demo" must not become the next
   * loophole. A page that ships the parts of a deliverable — a phone number to
   * call, a form to fill in, or the length of a real site — is a deliverable,
   * whatever the comment says, and the claim is rejected out loud.
   * ==================================================================== */
  const demoDisqualifiers = [];
  if (declaredKind === 'demo') {
    /* A lone `tel:` link is NOT the disqualifier. Every demo in demos/ was
       briefed to carry a plausible business with real-sounding names and real
       prices, so a phone number is the brief being obeyed — and reading it as
       proof the file is a deliverable rejected the skill's own references.
       Reuse the local-business test the conversion check already uses: a phone
       number PLUS an address, hours, a map or LocalBusiness structured data.
       Length is the clause that is hardest to trip by accident. */
    try {
      if (telLinks.length && localSignal) demoDisqualifiers.push(`a tel: link and ${localSignal}`);
      if (document.querySelector('form, input[type="email"], input[type="tel"]')) demoDisqualifiers.push('a contact form');
    } catch { /* ignore */ }
    if (screensNow > 8) demoDisqualifiers.push(`${screensNow.toFixed(1)} screens — a pattern reference is not this long`);
  }
  const demoMode = declaredKind === 'demo' && demoDisqualifiers.length === 0;
  if (demoMode) {
    let dropped = 0;
    for (let i = findings.length - 1; i >= 0; i--) {
      if (findings[i].level === 'sparse' || findings[i].level === 'craft') { findings.splice(i, 1); dropped++; }
    }
    add('note', 'demo-scope',
      `Declared \`kind=demo\`: ${dropped} SPARSE/CRAFT finding${dropped === 1 ? '' : 's'} suppressed. A pattern reference is not a finished page — it has no loader, no conversion block and no density budget, and it is not supposed to. FAIL and WARN ran in full.`,
      { dropped, screens: +screensNow.toFixed(1) });
  } else if (declaredKind === 'demo') {
    add('craft', 'demo-claim-rejected',
      `The page declares \`kind=demo\` and ships ${demoDisqualifiers.join(' + ')} — that is a deliverable, not a pattern reference. SPARSE and CRAFT were measured in full.`,
      { disqualifiers: demoDisqualifiers, screens: +screensNow.toFixed(1) });
  }

  const craftReport = {
    probed: craftOk,
    kind: declaredKind,
    demoMode,
    demoDisqualifiers,
    probeMode: craftOk ? (craftIn.mode || null) : null,
    probeSamples: craftOk ? (craftIn.samples || 0) : 0,
    probeErrors: craftIn ? (craftIn.errors || []) : [],
    tierDeclared: declaredTier,
    tierDeclaredMobile: declaredMobileTier,
    tierDeclaredVia: tierDecl ? tierDecl.via : null,
    tierMeasuredAgainst: measuredAgainst,
    mobileFallback: fallback,
    tierBEvidence: evidenceB,
    tierCEvidence: evidenceC,
    techniques: techPresent,
    techniqueCount: techPresent.length,
    techniqueEvidence: techniques,
    loader: loaderEvidence,
    webgl: craftOk ? !!craftIn.webgl : null,
    three: craftOk ? !!craftIn.three : null,
    scrollTrigger: craftOk ? !!craftIn.scrollTrigger : null,
    pinSpacer: craftOk ? !!craftIn.pinSpacer : null,
    rejectedEvidence: craftOk ? (craftIn.rejected || null) : null,
    oversizedImages: fatImgs.length,
    oversizedWorst: fatImgs[0] || null,
    conversion,
    unsourcedRatings,
  };

  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    scrollHeight: document.documentElement.scrollHeight,
    screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1),
    display: biggest,
    families: families.slice(0, 6),
    palette: significantBgs.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, a]) => ({ color: k, areaPct: +(a / totalArea * 100).toFixed(1) })),
    counts: { elements: all.length, text: textEls.length, images: imgs.length, canvas: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length, sections: sections.length, cardish, animated, smallTargets },
    ambition: {
      tintMarks: tintMarks.length,
      tintMarkSamples: tintMarks.slice(0, 4),
      renderedMedia: media.length,
      mediaByKind,
      liveScene,
      heroSize: biggest ? Math.round(biggest.size) : 0,
      largestBelowFold: belowBiggest ? Math.round(belowBiggest.size) : 0,
      heroPeakRatio: heroPeak ? heroPeak.ratio : null,
      overlapPairs,
      overlapSamples,
      bleeders,
      bleedSamples,
      groundFlips: ground ? ground.flips : null,
      groundMode: ground ? ground.mode : null,
      groundSteps: ground ? ground.steps : null,
      groundSamples: ground ? ground.keys : null,
      motionVocabulary: motionVocab.size,
      motionVocabularySample: [...motionVocab].slice(0, 10),
      jsMotion,
    },
    craft: craftReport,
    findings,
  };
};

/** Screenshot that survives pages animating forever. */
const snap = async (page, file, quality) => {
  try {
    await page.screenshot({ path: file, type: 'jpeg', quality, timeout: 15000 });
  } catch {
    await page.screenshot({ path: file, type: 'jpeg', quality, timeout: 20000, animations: 'disabled', caret: 'hide' });
  }
};

const shootScroll = async (page, prefix, steps) => {
  const shots = [];
  const vh = await page.evaluate(() => window.innerHeight);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const usable = Math.max(total - vh, 0);
  for (let i = 0; i < steps; i++) {
    const y = steps === 1 ? 0 : Math.round((usable * i) / (steps - 1));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'auto' }), y);
    await page.waitForTimeout(900);
    const file = path.join(outDir, `${prefix}-${String(i).padStart(2, '0')}.jpg`);
    await snap(page, file, 76);
    shots.push(path.basename(file));
  }
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  return shots;
};

/**
 * Sample the painted ground at evenly spaced scroll positions.
 * Runs in the driver, not in the audit, because it needs real scroll + a frame
 * to settle: scroll-driven and virtualised pages only repaint on rAF. Returns
 * one key per position — either an "r,g,b" ground colour or the token "media"
 * when a large photo/video/canvas is what is actually painted there.
 * Never throws: on any failure it returns no samples and the check is skipped.
 */
const groundKeyAt = () => {
  const parse = (v) => {
    const m = String(v).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const W = window.innerWidth, H = window.innerHeight;
  const tally = {};
  let mediaHits = 0, points = 0;
  for (const fx of [0.1, 0.5, 0.9]) {
    for (const fy of [0.2, 0.5, 0.8]) {
      points++;
      let node = null;
      try { node = document.elementFromPoint(Math.round(W * fx), Math.round(H * fy)); } catch { node = null; }
      let key = '';
      let sawMedia = false;
      for (let n = node; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
        let st;
        try { st = getComputedStyle(n); } catch { break; }
        const r = n.getBoundingClientRect();
        const big = r.width * r.height > (W * H) / 12;
        const tag = n.tagName;
        if (big && (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS')) sawMedia = true;
        if (big && st.backgroundImage && st.backgroundImage !== 'none' && /url\(/i.test(st.backgroundImage)) sawMedia = true;
        const c = parse(st.backgroundColor);
        /* Media is treated as transparent: the question is what COLOUR the page
           is painted, and a photo section still sits on a ground. */
        if (c && c.a >= 0.85 && big) { key = `${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)}`; break; }
      }
      if (!key) {
        const c = parse(getComputedStyle(document.body).backgroundColor) || parse(getComputedStyle(document.documentElement).backgroundColor);
        key = (c && c.a > 0) ? `${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)}` : 'none';
      }
      if (sawMedia) mediaHits++;
      tally[key] = (tally[key] || 0) + 1;
    }
  }
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return { colour: ranked.length ? ranked[0][0] : 'none', media: mediaHits > points / 2 };
};

/** Two ground colours differ when the paint moved perceptibly, not by a shade. */
const groundDiffers = (a, b) => {
  if (a === b) return false;
  const pa = String(a).split(','), pb = String(b).split(',');
  if (pa.length !== 3 || pb.length !== 3) return true;
  const d = Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]) + Math.abs(pa[2] - pb[2]);
  return d > 36;
};

const sampleGround = async (page, steps = 12, force = null) => {
  try {
    const vh = await page.evaluate(() => window.innerHeight);
    const vw = await page.evaluate(() => window.innerWidth);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const usable = Math.max(total - vh, 0);
    const at = () => page.evaluate(() => window.scrollY || document.documentElement.scrollTop || 0);
    await page.mouse.move(Math.round(vw / 2), Math.round(vh / 2));

    /* Does this page RENDER differently when it is scrolled? Not the same
       question as whether it accepts window.scrollTo.
       Blind Barber accepts the jump and writes scrollY happily, then paints
       the identical frame, because the visuals hang off a wheel-driven proxy.
       Probing scrollY alone marks it native, the sampler jumps around, and
       every one of the 12 samples reads the same ground. The site that
       DEFINES the ground-flip pattern then fails the ground-flip check.
       So probe the painted result: jump, and compare a render fingerprint. */
    const fingerprint = async () => page.evaluate(() => {
      const W = window.innerWidth, H = window.innerHeight;
      let node = null;
      try { node = document.elementFromPoint(Math.round(W / 2), Math.round(H / 2)); } catch { node = null; }
      let bg = '';
      for (let n = node; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
        const st = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        if (r.width * r.height > (W * H) / 12 && !/rgba\(0, 0, 0, 0\)/.test(st.backgroundColor)) { bg = st.backgroundColor; break; }
      }
      const txt = (node && node.innerText ? node.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 120);
      return bg + '|' + txt;
    });

    let native = true;
    if (usable > 0) {
      const before = await fingerprint();
      const probeY = Math.max(600, Math.round(usable / Math.max(steps, 1)));
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), probeY);
      await page.waitForTimeout(500);
      const got = await at();
      const after = await fingerprint();
      const moved = Math.abs(got - probeY) < Math.max(24, probeY * 0.25);
      /* native only when the offset took AND the paint actually changed */
      native = moved && after !== before;
      if (force === 'wheel') native = false;
      if (force === 'scroll') native = true;
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
      await page.waitForTimeout(500);
    }
    /* Wheel path: real wheel events are the only input a hijacked scroller
       listens to. ~500px a tick, budgeted so the ticks span the page. */
    const ticks = Math.min(30, Math.max(8, Math.ceil(usable / steps / 500)));

    const keys = [];
    const media = [];
    for (let i = 0; i < steps; i++) {
      if (native) {
        const y = steps === 1 ? 0 : Math.round((usable * i) / (steps - 1));
        await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'auto' }), y);
        await page.waitForTimeout(700);
      } else if (i > 0) {
        for (let t = 0; t < ticks; t++) {
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(45);
        }
        await page.waitForTimeout(400);
      }
      const sample = await page.evaluate(groundKeyAt);
      keys.push(sample.colour);
      media.push(sample.media ? 1 : 0);
    }
    let flips = 0;
    for (let i = 1; i < keys.length; i++) if (groundDiffers(keys[i - 1], keys[i])) flips++;
    return { keys, media, flips, steps, mode: native ? 'scroll' : 'wheel' };
  } catch {
    return { keys: [], media: [], flips: 0, mode: 'failed' };
  }
};

/**
 * Ground sampling gets its own page. The wheel path cannot be rewound on a
 * virtualised scroller, and leaving the audit page parked deep in the
 * experience would corrupt every first-screen measurement after it.
 */
const groundFor = async (ctx, target, steps = 12) => {
  let page = null;
  try {
    page = await ctx.newPage();
    await page.goto(target, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(2500);
    /* Sample density has to track page length or long pages read as one ground.
       Blind Barber runs 162 screens and flips paper/ink every ~2 chapters. At a
       fixed 12 samples that is one probe every 13.5 screens, every dark chapter
       falls between two probes, and the site that defines the pattern scores 0
       flips. Roughly one sample per 4 screens, floor 12, ceiling 40. */
    const screens = await page.evaluate(
      () => document.documentElement.scrollHeight / Math.max(window.innerHeight, 1)
    ).catch(() => 1);
    const adaptive = Math.min(40, Math.max(steps, Math.ceil(screens / 4)));

    const first = await sampleGround(page, adaptive);

    /* Native scroll is not always enough to SEE a ground change. Blind Barber's
       document scrolls natively and its copy advances, but the paper/ink class
       is driven by its own wheel accumulator, so a jumped page paints the same
       ground at every offset and reports 0 flips across 162 screens.
       A probe cannot distinguish that from a genuinely single-ground page, so
       do not try: only retry the expensive wheel path when a long page comes
       back with nothing, and keep whichever pass saw more. */
    if (first.mode === 'scroll' && first.flips === 0 && screens > 6) {
      try {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
        await page.waitForTimeout(400);
        const second = await sampleGround(page, Math.min(adaptive, 16), 'wheel');
        if (second.flips > first.flips) return second;
      } catch { /* keep the native pass */ }
    }
    return first;
  } catch {
    return { keys: [], media: [], flips: 0, mode: 'failed' };
  } finally {
    try { if (page) await page.close(); } catch { /* ignore */ }
  }
};

/* ======================================================================
 * CRAFT probe — evidence that cannot be read from one still frame.
 *
 * A pin, a scrub, a loader and a cursor follower are all TIME. None of them
 * exist in the DOM snapshot the audit reads, which is exactly why two pages
 * shipped from this skill with none of them and passed every check.
 *
 * Runs on its own throwaway page for the same reason ground sampling does:
 * it navigates early to catch the loader, scrolls the whole page, moves the
 * mouse and hovers buttons. Doing any of that to the audit page would corrupt
 * every measurement taken after it.
 *
 * Never throws. Every stage is independently guarded; a stage that fails
 * records an error string and leaves its evidence null, and null is reported
 * as "not detected", never as "absent".
 * ==================================================================== */

/** Longest strictly-monotonic run in a series. Scrubs saturate — a tween that
 *  runs across four samples and then holds is still a scrub, so scoring the
 *  whole series for monotonicity finds nothing. Score the best run instead. */
const longestRun = (vals, eps) => {
  let best = { len: 0, start: 0, end: 0, dir: 0 };
  let i = 0;
  while (i < vals.length - 1) {
    const d0 = vals[i + 1] - vals[i];
    if (Math.abs(d0) <= eps) { i++; continue; }
    const dir = d0 > 0 ? 1 : -1;
    let j = i + 1;
    while (j < vals.length - 1) {
      const d = vals[j + 1] - vals[j];
      if (Math.abs(d) <= eps || (d > 0 ? 1 : -1) !== dir) break;
      j++;
    }
    if (j - i > best.len) best = { len: j - i, start: i, end: j, dir };
    i = Math.max(j, i + 1);
  }
  return best;
};

/* --- in-page probes. Kept as top-level consts so they serialise cleanly. --- */

/** Overlay/class/hook census, run four times across the first 2.5 seconds. */
const loaderScan = () => {
  const W = window.innerWidth, H = window.innerHeight;
  const res = { rootClass: '', overlays: [], hook: false };
  const shown = (s, r) => {
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (!(parseFloat(s.opacity) > 0.05)) return false;
    const clip = String(s.clipPath || 'none');
    if (/inset\([^)]*100%/.test(clip)) return false;
    if (/circle\(\s*0(px|%)?[\s)]/.test(clip)) return false;
    if (r.width * r.height < W * H * 0.25) return false;
    if (r.bottom <= 4 || r.top >= H - 4 || r.right <= 4 || r.left >= W - 4) return false;
    return true;
  };
  try {
    res.rootClass = `${document.documentElement.className || ''} ${document.body ? String(document.body.className || '') : ''}`.trim().slice(0, 240);
    /* The hook used to be its own proof: `<div data-loader></div>` satisfied
       both the loader technique and the no-loader check, and on amritpalace.com
       a `data-loading` attribute on a custom CURSOR was read as an intro
       sequence. Record whether the hooked element is actually painting like a
       loader — a large overlay — so the driver can check that it goes away. */
    const hooks = Array.from(document.querySelectorAll('[data-loader],[data-preloader],[data-loading]'));
    res.hook = hooks.length > 0;
    res.hookShown = hooks.some((el) => {
      try {
        const st = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return shown(st, r) && r.width * r.height >= W * H * 0.25;
      } catch { return false; }
    });
  } catch { /* ignore */ }
  try {
    if (!document.body) return res;
    const already = document.querySelectorAll('[data-pwd-ov]');
    let n = already.length;
    const seen = new Set(already);
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 4000 || n >= 12) break;
      if (seen.has(el)) continue;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if (s.position !== 'fixed' && s.position !== 'absolute') continue;
      const r = el.getBoundingClientRect();
      if (r.width < W * 0.6 || r.height < H * 0.6) continue;
      if (!shown(s, r)) continue;
      el.setAttribute('data-pwd-ov', String(n++));
    }
    for (const el of document.querySelectorAll('[data-pwd-ov]')) {
      let s; try { s = getComputedStyle(el); } catch { continue; }
      const r = el.getBoundingClientRect();
      res.overlays.push({
        id: el.getAttribute('data-pwd-ov'),
        shown: shown(s, r),
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 48),
      });
    }
  } catch { /* ignore */ }
  return res;
};

/** Adopt new candidates, then read geometry + transform for every candidate. */
const craftRead = () => {
  const W = window.innerWidth, H = window.innerHeight;
  const mat = (v) => {
    if (!v || v === 'none') return null;
    let m = /matrix3d\(([^)]+)\)/.exec(v);
    if (m) { const p = m[1].split(',').map(Number); return { tx: p[12], ty: p[13], sc: p[0] }; }
    m = /matrix\(([^)]+)\)/.exec(v);
    if (m) { const p = m[1].split(',').map(Number); return { tx: p[4], ty: p[5], sc: p[0] }; }
    return null;
  };
  /* A 6x6 redraw is enough to tell "this canvas is painting different frames"
     from "this canvas is a still". WebGL without preserveDrawingBuffer and any
     cross-origin taint both throw — both are caught and reported as no hash. */
  const canvasHash = (c) => {
    try {
      const o = document.createElement('canvas');
      o.width = 6; o.height = 6;
      const g = o.getContext('2d');
      if (!g) return null;
      g.drawImage(c, 0, 0, 6, 6);
      const d = g.getImageData(0, 0, 6, 6).data;
      let h = 0;
      for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) % 1000003;
      return h;
    } catch { return null; }
  };
  const out = { sy: 0, els: [], bottomBar: null, pinSpacer: false };
  try { out.sy = window.scrollY || document.documentElement.scrollTop || 0; } catch { /* ignore */ }
  try { out.pinSpacer = !!document.querySelector('.pin-spacer,[class*="pin-spacer"]'); } catch { /* ignore */ }
  try {
    let n = document.querySelectorAll('[data-pwd-cx]').length;
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 6000 || n >= 320) break;
      if (el.hasAttribute('data-pwd-cx')) continue;
      const tag = el.tagName;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      let want = false;
      if (tag === 'CANVAS' || tag === 'VIDEO') want = true;
      else if (s.transform && s.transform !== 'none') want = true;
      else if ((s.position === 'sticky' || s.position === 'fixed') && area >= W * H * 0.1) want = true;
      else if (/pin-spacer/.test(String(el.className || ''))) want = true;
      else if (area >= W * H * 0.25 && r.width >= W * 0.4) want = true;
      if (want) el.setAttribute('data-pwd-cx', String(n++));
      /* A pin holds something. An empty 70vh sticky div in a 220vh parent has
         the exact geometry of a pinned stage and none of its content, and the
         measured-hold path could not tell them apart. */
      if (want) {
        let holds = false;
        try {
          if (String(el.textContent || '').replace(/\s+/g, ' ').trim().length >= 12) holds = true;
          if (!holds) {
            for (const k of el.querySelectorAll('img,video,canvas,picture,svg')) {
              const kr = k.getBoundingClientRect();
              if (kr.width * kr.height >= W * H * 0.05) { holds = true; break; }
            }
          }
          if (!holds && /url\(/i.test(s.backgroundImage || '')) holds = true;
        } catch { holds = true; }
        el.setAttribute('data-pwd-holds', holds ? '1' : '0');
      }
    }
  } catch { /* ignore */ }
  try {
    for (const el of document.querySelectorAll('[data-pwd-cx]')) {
      let s; try { s = getComputedStyle(el); } catch { continue; }
      const r = el.getBoundingClientRect();
      const m = mat(s.transform);
      const rec = {
        id: el.getAttribute('data-pwd-cx'),
        tag: el.tagName,
        holds: el.getAttribute('data-pwd-holds') !== '0',
        cls: String(el.className || '').slice(0, 40),
        top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width),
        pos: s.position,
        anim: !!(s.animationName && s.animationName !== 'none'),
        tx: m ? +m.tx.toFixed(1) : 0,
        ty: m ? +m.ty.toFixed(1) : 0,
        sc: m ? +m.sc.toFixed(4) : 1,
      };
      if (el.tagName === 'VIDEO') { try { rec.ct = +(el.currentTime || 0).toFixed(2); } catch { /* ignore */ } }
      if (el.tagName === 'CANVAS') rec.hash = canvasHash(el);
      out.els.push(rec);
    }
  } catch { /* ignore */ }
  /* Bottom action bars are a phone component; scanning for one at 1440px is
     wasted work on every sample of every desktop page. */
  if (W < 600) {
    try {
      let i = 0;
      for (const el of document.body.querySelectorAll('*')) {
        if (++i > 3000) break;
        let s; try { s = getComputedStyle(el); } catch { continue; }
        if (s.position !== 'fixed') continue;
        const r = el.getBoundingClientRect();
        if (r.width < W * 0.5 || r.height < 28 || r.height > H * 0.45) continue;
        if (r.top < H * 0.4 || H - r.bottom > 120) continue;
        if (s.display === 'none' || s.visibility === 'hidden' || !(parseFloat(s.opacity) > 0.05)) continue;
        if (!el.querySelector('a[href], button')) continue;
        out.bottomBar = { width: Math.round(r.width), height: Math.round(r.height), bottomGap: Math.round(H - r.bottom), cls: String(el.className || '').slice(0, 40) };
        break;
      }
    } catch { /* ignore */ }
  }
  return out;
};

/** Positions of every small absolutely-placed element, read between mouse moves. */
const cursorRead = () => {
  const W = window.innerWidth, H = window.innerHeight;
  const out = [];
  try {
    let n = document.querySelectorAll('[data-pwd-cu]').length;
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 4000 || n >= 80) break;
      if (el.hasAttribute('data-pwd-cu')) continue;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if (s.position !== 'fixed' && s.position !== 'absolute') continue;
      const r = el.getBoundingClientRect();
      const a = r.width * r.height;
      if (a < 400 || a > W * H * 0.5) continue;
      el.setAttribute('data-pwd-cu', String(n++));
    }
    for (const el of document.querySelectorAll('[data-pwd-cu]')) {
      let s; try { s = getComputedStyle(el); } catch { continue; }
      const r = el.getBoundingClientRect();
      out.push({
        id: el.getAttribute('data-pwd-cu'),
        cx: Math.round(r.left + r.width / 2),
        cy: Math.round(r.top + r.height / 2),
        vis: s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.05,
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 40),
      });
    }
  } catch { /* ignore */ }
  return out;
};

/** Everything readable from the settled DOM once: runtimes, WebGL, split type,
 *  view transitions, a native sticky stage, a native horizontal rail. */
const craftFinalScan = () => {
  const W = window.innerWidth, H = window.innerHeight;
  const res = {
    gsap: false, scrollTrigger: false, three: false, webgl: false,
    canvasCount: 0, canvasBig: false, canvasPainted: false, canvasRejected: null,
    split: null, splitHits: 0, splitMarkers: 0,
    transition: null, rail: null, railRejected: null, stickyStage: null, sceneSection: null,
  };
  try {
    res.gsap = !!(window.gsap || window.TweenMax || window.TweenLite);
    res.scrollTrigger = !!(window.ScrollTrigger || (window.gsap && window.gsap.plugins && window.gsap.plugins.scrollTrigger));
    res.three = !!(window.THREE || window.__THREE__ || window.__THREE_DEVTOOLS__);
  } catch { /* ignore */ }
  try {
    for (const c of document.querySelectorAll('canvas')) {
      res.canvasCount++;
      const r = c.getBoundingClientRect();
      const big = r.width * r.height >= W * H * 0.25;
      if (big) res.canvasBig = true;
      /* An empty <canvas> is a coloured rectangle. Read its pixels BEFORE the
         context probes below claim the 2d slot: an 8x8 redraw with two or more
         distinct values means something was drawn. A tainted or WebGL canvas
         throws, and a throw is treated as painted — those are the cases where
         the context probe answers instead. */
      if (big && !res.canvasPainted) {
        try {
          const o = document.createElement('canvas');
          o.width = 8; o.height = 8;
          const g2 = o.getContext('2d');
          if (g2) {
            g2.drawImage(c, 0, 0, 8, 8);
            const d = g2.getImageData(0, 0, 8, 8).data;
            const seen = new Set();
            for (let i = 0; i < d.length; i += 4) seen.add(`${d[i]},${d[i + 1]},${d[i + 2]},${d[i + 3]}`);
            if (seen.size >= 2) res.canvasPainted = true;
            else res.canvasRejected = { reason: 'canvas is uniform — nothing was drawn on it', w: Math.round(r.width), h: Math.round(r.height) };
          }
        } catch { res.canvasPainted = true; }
      }
      if (c.getAttribute('data-engine')) res.three = true;   /* R3F stamps this */
      /* Ask for 2d FIRST: on a canvas that already holds a WebGL context this
         returns null, and on a canvas with no context at all it claims the 2d
         slot so the WebGL probe below cannot invent a false positive. */
      let two = null;
      try { two = c.getContext('2d'); } catch { two = null; }
      if (two) continue;
      try { if (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')) res.webgl = true; } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  /* split / masked type reveal at display scale */
  try {
    const MIN = W < 600 ? 24 : 30;
    const hits = [];
    res.splitMarkers = document.querySelectorAll('[data-split-lines],[data-splitting],[data-split],.splitting,.split-line,.split-word,.split-char').length;
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 6000 || hits.length >= 4) break;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if ((parseFloat(s.fontSize) || 0) < MIN) continue;
      const kids = el.children;
      if (kids.length < 2 || kids.length > 400) continue;
      const whole = String(el.textContent || '').trim();
      if (whole.length < 6) continue;
      /* An overflow-hidden wrapper on its own proves nothing — plenty of
         headings clip for other reasons. The wrapper has to hold something
         that MOVES: a live transform/animation, or a declared transition on
         transform/clip-path waiting for its trigger. Otherwise a mask with a
         static word in it would read as a reveal. */
      const willMove = (st) => {
        if (!st) return false;
        if (st.transform && st.transform !== 'none') return true;
        if (st.animationName && st.animationName !== 'none') return true;
        if (st.clipPath && st.clipPath !== 'none') return true;
        return parseFloat(st.transitionDuration) > 0 && /transform|clip-path|all|translate/.test(String(st.transitionProperty || ''));
      };
      let parts = 0, masked = 0, moved = 0, revealing = 0;
      for (const k of kids) {
        if (!String(k.textContent || '').trim()) continue;
        parts++;
        let ks; try { ks = getComputedStyle(k); } catch { continue; }
        const clipped = ks.overflow === 'hidden' || ks.overflowY === 'hidden' || (ks.clipPath && ks.clipPath !== 'none');
        if (clipped) masked++;
        if ((ks.transform && ks.transform !== 'none') || (ks.animationName && ks.animationName !== 'none')) moved++;
        if (willMove(ks)) revealing++;
        else if (k.children.length) {
          let gs; try { gs = getComputedStyle(k.children[0]); } catch { gs = null; }
          if (willMove(gs)) revealing++;
          if (gs && ((gs.transform && gs.transform !== 'none') || (gs.animationName && gs.animationName !== 'none'))) moved++;
        }
      }
      if (parts >= 2 && parts >= kids.length * 0.6 && ((masked >= 2 && revealing >= 1) || moved >= 2))
        hits.push({ fontSize: Math.round(parseFloat(s.fontSize)), parts, masked, moved, revealing, text: whole.slice(0, 40) });
    }
    res.splitHits = hits.length;
    if (hits.length) res.split = hits[0];
  } catch { /* ignore */ }
  /* page / view transition */
  try {
    const lib = !!(window.barba || window.Barba || window.Swup || window.swup || window.Highway || window.Taxi || window.taxi);
    const attr = !!document.querySelector('[data-barba],[data-swup],#swup,[data-taxi],[data-router-view],[data-transition-name],meta[name="view-transition"]');
    let vtCss = false;
    try {
      for (const sh of document.styleSheets) {
        let rules = null;
        try { rules = sh.cssRules; } catch { continue; }
        if (!rules) continue;
        /* `view-transition-name:` is a PROPERTY — one div carrying it in a
           stylesheet used to satisfy this. The cross-document transition is
           declared by the `@view-transition` at-rule; that is the signal. */
        for (const r of rules) if (/@view-transition\b/.test(String(r.cssText || ''))) { vtCss = true; break; }
        if (vtCss) break;
      }
    } catch { /* ignore */ }
    /* One div carrying `view-transition-name: x` used to count as a page
       transition. A real cross-document transition names the elements that
       persist across the navigation — three or more of them — or declares
       `@view-transition` in CSS, or calls startViewTransition. */
    const vtNames = new Set();
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 2500) break;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if (s.viewTransitionName && s.viewTransitionName !== 'none') vtNames.add(s.viewTransitionName);
      if (vtNames.size >= 3) break;
    }
    const vtName = vtNames.size >= 3;
    const called = !!(window.__pwdCraft && window.__pwdCraft.vt > 0);
    if (lib || attr || vtCss || vtName || called) res.transition = { lib, attr, vtCss, vtName, namedElements: vtNames.size, called };
    else if (vtNames.size) res.transitionRejected = { reason: `${vtNames.size} element(s) name a view transition and nothing drives one`, named: vtNames.size };
  } catch { /* ignore */ }
  /* Native horizontal chapter — NOT a card rail. A bleeding review rail with
     `overflow-x: auto` satisfies every loose test for "content wider than its
     box" and is a different device entirely: the reader swipes it, nothing
     drives it. A chapter takes the whole viewport and pans as a movement, so
     gate on full-viewport width AND near-full height. The scroll-DRIVEN case
     (vertical scroll translating a track) is caught separately as `track`. */
  try {
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 6000) break;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if (s.overflowX !== 'auto' && s.overflowX !== 'scroll') continue;
      if (el.clientWidth < W * 0.9) continue;
      if (el.scrollWidth <= el.clientWidth * 1.8) continue;
      const rh = el.getBoundingClientRect().height;
      if (rh < H * 0.7) { res.railRejected = { reason: 'too short for a chapter', heightPx: Math.round(rh), needPx: Math.round(H * 0.7), cls: String(el.className || '').slice(0, 40) }; continue; }
      res.rail = { via: 'full-viewport overflow chapter', scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, heightPx: Math.round(rh), snap: String(s.scrollSnapType || 'none'), cls: String(el.className || '').slice(0, 40) };
      break;
    }
  } catch { /* ignore */ }
  /* native sticky stage — a pin built without a library is still a pin */
  try {
    let i = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (++i > 6000) break;
      let s; try { s = getComputedStyle(el); } catch { continue; }
      if (s.position !== 'sticky') continue;
      if (s.top === 'auto' && s.bottom === 'auto') continue;
      const r = el.getBoundingClientRect();
      if (r.height < H * 0.6 || r.width < W * 0.5) continue;
      const p = el.parentElement;
      if (!p) continue;
      const pr = p.getBoundingClientRect();
      if (pr.height < r.height * 1.8) continue;
      /* A pin holds something. An empty 70vh sticky div in a 220vh parent is
         the cheapest thing on the web that reads as a pinned stage, and it
         reads as one to a geometry probe. Ask what is being held. */
      let holds = false;
      try {
        if (String(el.textContent || '').replace(/\s+/g, ' ').trim().length >= 12) holds = true;
        if (!holds) {
          for (const k of el.querySelectorAll('img,video,canvas,picture,svg')) {
            const kr = k.getBoundingClientRect();
            if (kr.width * kr.height >= W * H * 0.05) { holds = true; break; }
          }
        }
        if (!holds && /url\(/i.test(s.backgroundImage || '')) holds = true;
      } catch { holds = true; }
      if (!holds) { res.stickyRejected = { reason: 'sticky stage holds no content', height: Math.round(r.height), cls: String(el.className || '').slice(0, 40) }; continue; }
      res.stickyStage = { via: 'css sticky stage', height: Math.round(r.height), parentHeight: Math.round(pr.height), cls: String(el.className || '').slice(0, 40) };
      break;
    }
  } catch { /* ignore */ }
  /* Where the scene lives, so the mobile pass can ask whether the documented
     Tier C phone fallback actually rendered something in its place. Recorded
     four ways because a rebuilt DOM at 390px will not match on all of them. */
  try {
    let cv = null;
    for (const c of document.querySelectorAll('canvas')) {
      const r = c.getBoundingClientRect();
      if (r.width * r.height < W * H * 0.2) continue;
      cv = c; break;
    }
    if (cv) {
      const host = cv.closest('section,[data-section],article,header,figure') || cv.parentElement;
      if (host) {
        const chain = [];
        for (let n = host; n && n !== document.body && n.parentElement && chain.length < 12; n = n.parentElement)
          chain.unshift(`${n.tagName.toLowerCase()}:nth-child(${Array.prototype.indexOf.call(n.parentElement.children, n) + 1})`);
        res.sceneSection = {
          canvasId: cv.id || null,
          id: host.id || null,
          cls: (String(host.className || '').trim().split(/\s+/)[0] || null),
          tag: host.tagName.toLowerCase(),
          sectionIndex: Array.prototype.indexOf.call(document.querySelectorAll('section'), host),
          path: chain.length ? `body > ${chain.join(' > ')}` : null,
          canvasAreaPct: +((cv.getBoundingClientRect().width * cv.getBoundingClientRect().height) / (W * H)).toFixed(2),
        };
      }
    }
  } catch { /* ignore */ }
  return res;
};

const craftProbe = async (ctx, target) => {
  const out = {
    ok: false, mode: null, samples: 0, screens: null, errors: [],
    techniques: {}, present: [],
    loader: null, loaderProbe: null, loaderHookRejected: null, bottomBar: null, sceneSection: null, railRejected: null, rejected: null,
    webgl: false, three: false, canvasPainted: false, gsap: false, scrollTrigger: false, pinSpacer: false,
  };
  let page = null;
  try {
    page = await ctx.newPage();
    page.on('pageerror', () => { /* the audited page's errors are reported elsewhere */ });
    await page.addInitScript(() => {
      try {
        window.__pwdCraft = { vt: 0 };
        const orig = document.startViewTransition;
        if (typeof orig === 'function')
          document.startViewTransition = function (...a) { try { window.__pwdCraft.vt++; } catch { /* ignore */ } return orig.apply(this, a); };
      } catch { /* ignore */ }
    });

    /* ---- stage 1: the first 2.5 seconds ---- */
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const AT = [120, 500, 1100, 2500];
    const t0 = Date.now();
    const scans = [];
    for (const at of AT) {
      const wait = at - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      scans.push(await page.evaluate(loaderScan).catch(() => null));
    }
    const good = scans.filter(Boolean);
    out.loaderProbe = { sampledAtMs: AT, captured: good.length, rootClassFirst: good[0] ? good[0].rootClass : null, rootClassLast: good.length ? good[good.length - 1].rootClass : null, overlaysSeen: good[0] ? good[0].overlays.length : 0 };
    if (good.length >= 2) {
      const first = good[0];
      for (const o of first.overlays) {
        if (!o.shown || out.loader) continue;
        for (let k = 1; k < good.length; k++) {
          const later = good[k].overlays.find((x) => x.id === o.id);
          if (!later || !later.shown) { out.loader = { via: 'overlay', el: `${o.tag}${o.cls ? `.${o.cls.split(/\s+/)[0]}` : ''}`, presentAtMs: AT[0], goneByMs: AT[k] }; break; }
        }
      }
      if (!out.loader) {
        /* A loader that lives in a root class is still a loader — loader-to-hero
           swaps `is-loading` for `is-done` and never removes an element. */
        const m = /\b[\w-]*(?:loading|preload|preloader|is-load|intro|splash|loader)[\w-]*\b/i.exec(first.rootClass || '');
        const last = good[good.length - 1].rootClass || '';
        if (m && !last.includes(m[0])) out.loader = { via: 'root class', token: m[0], presentAtMs: AT[0], goneByMs: AT[AT.length - 1] };
      }
      /* A hook counts when it behaves like a loader: painting over the page at
         first scan and gone by the last. A hook that is still on screen at
         2500ms is furniture wearing a loader's attribute. */
      if (!out.loader && good[0].hookShown && !good[good.length - 1].hookShown)
        out.loader = { via: 'data-loader hook', shownAtMs: AT[0], goneByMs: AT[AT.length - 1] };
      else if (!out.loader && good.some((g) => g.hook))
        out.loaderHookRejected = { reason: good[0].hookShown ? 'hooked element never went away' : 'hooked element never painted over the page', shownFirst: !!good[0].hookShown, shownLast: !!good[good.length - 1].hookShown };
    }

    /* ---- stage 2: scroll sampling ---- */
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => { /* keep going */ });
    await page.waitForTimeout(1500);
    const geom = await page.evaluate(() => ({
      vw: window.innerWidth, vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
    }));
    /* Scan once BEFORE scrolling: every below-fold split reveal is still in its
       from-state here, and after a full scroll pass they have all played and
       their transforms are back to none. Scan again after, because a sticky
       stage and a WebGL context can both arrive late. Merge, preferring
       whichever pass actually saw the thing. */
    const finPre = await page.evaluate(craftFinalScan).catch(() => null);
    const usable = Math.max(geom.docH - geom.vh, 0);
    const screens = geom.vh > 0 ? geom.docH / geom.vh : 1;
    out.screens = +screens.toFixed(1);
    /* The spec floor is 8 offsets. Eight is not enough on a long page: a pin
       that holds for one screen out of twelve falls between two probes and the
       page reads as unpinned. Two samples per screen, floored at 10, capped at
       26 so a 160-screen site does not take an hour. */
    const N = Math.min(26, Math.max(10, Math.ceil(screens * 2)));
    out.samples = N;

    let native = true;
    if (usable > 0) {
      const probeY = Math.max(400, Math.round(usable / N));
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), probeY);
      await page.waitForTimeout(400);
      const got = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop || 0).catch(() => 0);
      native = Math.abs(got - probeY) < Math.max(24, probeY * 0.3);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' })).catch(() => { /* ignore */ });
      await page.waitForTimeout(400);
    }
    out.mode = native ? 'scroll' : 'wheel';
    const ticks = Math.min(30, Math.max(6, Math.ceil(usable / Math.max(N, 1) / 500)));

    const series = [];
    let cursorHit = null;
    for (let i = 0; i < N; i++) {
      if (native) {
        const y = N === 1 ? 0 : Math.round((usable * i) / (N - 1));
        await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'auto' }), y).catch(() => { /* ignore */ });
        await page.waitForTimeout(560);
      } else if (i > 0) {
        for (let t = 0; t < ticks; t++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(40); }
        await page.waitForTimeout(400);
      }
      const s = await page.evaluate(craftRead).catch(() => null);
      if (s) {
        s.prog = native ? s.sy : i * ticks * 500;
        series.push(s);
        if (s.pinSpacer) out.pinSpacer = true;
        if (s.bottomBar && !out.bottomBar) out.bottomBar = s.bottomBar;
      }
      /* Cursor-driven previews live at a scroll position, so probe as we go and
         stop the moment one answers. Hover is meaningless under touch emulation. */
      if (!cursorHit && geom.vw >= 600 && i < 9) {
        try {
          const ax = Math.round(geom.vw * 0.28), ay = Math.round(geom.vh * 0.34);
          const bx = Math.round(geom.vw * 0.72), by = Math.round(geom.vh * 0.68);
          await page.mouse.move(ax, ay);
          await page.waitForTimeout(190);
          const A = await page.evaluate(cursorRead).catch(() => []);
          await page.mouse.move(bx, by);
          await page.waitForTimeout(210);
          const B = await page.evaluate(cursorRead).catch(() => []);
          const mapA = new Map(A.map((e) => [e.id, e]));
          for (const b of B) {
            if (!b.vis) continue;
            const a = mapA.get(b.id);
            if (!a) continue;
            const dx = b.cx - a.cx, dy = b.cy - a.cy;
            if (dx >= (bx - ax) * 0.4 && dy >= (by - ay) * 0.3) {
              cursorHit = { el: `${b.tag}${b.cls ? `.${b.cls.split(/\s+/)[0]}` : ''}`, movedX: dx, movedY: dy, mouseDx: bx - ax, mouseDy: by - ay, atSample: i };
              break;
            }
          }
        } catch (e) { out.errors.push(`cursor: ${String(e).slice(0, 80)}`); }
      }
    }

    /* ---- stage 3: magnetic hover, two scroll positions ---- */
    let magnetic = null;
    if (native && geom.vw >= 600) {
      for (const frac of [0, 0.35]) {
        if (magnetic) break;
        try {
          await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), Math.round(usable * frac));
          await page.waitForTimeout(500);
          const cands = await page.evaluate(() => {
            const W = window.innerWidth, H = window.innerHeight;
            for (const e of document.querySelectorAll('[data-pwd-mg]')) e.removeAttribute('data-pwd-mg');
            const list = [];
            let n = 0;
            for (const el of document.querySelectorAll('a[href], button')) {
              const r = el.getBoundingClientRect();
              if (r.top < 40 || r.bottom > H - 20) continue;
              if (r.width < 90 || r.height < 32 || r.width > W * 0.7) continue;
              let s; try { s = getComputedStyle(el); } catch { continue; }
              if (s.visibility === 'hidden' || s.display === 'none' || !(parseFloat(s.opacity) > 0.2)) continue;
              el.setAttribute('data-pwd-mg', String(n));
              list.push({ id: String(n), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2), w: Math.round(r.width), text: String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) });
              if (++n >= 3) break;
            }
            return list;
          }).catch(() => []);
          const tx = (id) => page.evaluate((i2) => {
            const el = document.querySelector(`[data-pwd-mg="${i2}"]`);
            if (!el) return null;
            const v = getComputedStyle(el).transform;
            let m = /matrix3d\(([^)]+)\)/.exec(v);
            if (m) return +m[1].split(',').map(Number)[12];
            m = /matrix\(([^)]+)\)/.exec(v);
            if (m) return +m[1].split(',').map(Number)[4];
            return 0;
          }, id).catch(() => null);
          for (const c of cands) {
            const off = Math.max(12, Math.round(c.w * 0.32));
            await page.mouse.move(c.cx - off, c.cy);
            await page.waitForTimeout(250);
            const L = await tx(c.id);
            await page.mouse.move(c.cx + off, c.cy);
            await page.waitForTimeout(250);
            const R = await tx(c.id);
            /* A hover lift moves the same way whichever side you approach from.
               Magnetism reverses with the cursor — that is the whole test. */
            if (L != null && R != null && R - L >= 4) { magnetic = { el: c.text, dxLeft: +L.toFixed(1), dxRight: +R.toFixed(1), width: c.w }; break; }
          }
        } catch (e) { out.errors.push(`magnetic: ${String(e).slice(0, 80)}`); }
      }
    }

    /* ---- stage 4: settled-DOM scan ---- */
    const finPost = await page.evaluate(craftFinalScan).catch(() => null);
    const fin = (finPre || finPost) ? {
      gsap: !!((finPre && finPre.gsap) || (finPost && finPost.gsap)),
      scrollTrigger: !!((finPre && finPre.scrollTrigger) || (finPost && finPost.scrollTrigger)),
      three: !!((finPre && finPre.three) || (finPost && finPost.three)),
      webgl: !!((finPre && finPre.webgl) || (finPost && finPost.webgl)),
      canvasCount: Math.max(finPre ? finPre.canvasCount : 0, finPost ? finPost.canvasCount : 0),
      canvasBig: !!((finPre && finPre.canvasBig) || (finPost && finPost.canvasBig)),
      canvasPainted: !!((finPre && finPre.canvasPainted) || (finPost && finPost.canvasPainted)),
      canvasRejected: (finPost && finPost.canvasRejected) || (finPre && finPre.canvasRejected) || null,
      transitionRejected: (finPost && finPost.transitionRejected) || (finPre && finPre.transitionRejected) || null,
      stickyRejected: (finPost && finPost.stickyRejected) || (finPre && finPre.stickyRejected) || null,
      split: (finPre && finPre.split) || (finPost && finPost.split) || null,
      splitHits: Math.max(finPre ? finPre.splitHits : 0, finPost ? finPost.splitHits : 0),
      splitMarkers: Math.max(finPre ? finPre.splitMarkers : 0, finPost ? finPost.splitMarkers : 0),
      transition: (finPre && finPre.transition) || (finPost && finPost.transition) || null,
      rail: (finPre && finPre.rail) || (finPost && finPost.rail) || null,
      railRejected: (finPost && finPost.railRejected) || (finPre && finPre.railRejected) || null,
      sceneSection: (finPre && finPre.sceneSection) || (finPost && finPost.sceneSection) || null,
      stickyStage: (finPre && finPre.stickyStage) || (finPost && finPost.stickyStage) || null,
    } : null;
    if (fin) {
      out.webgl = !!fin.webgl;
      out.three = !!fin.three;
      out.canvasPainted = !!fin.canvasPainted;
      out.rejected = { canvas: fin.canvasRejected || null, transition: fin.transitionRejected || null, sticky: fin.stickyRejected || null, loaderHook: out.loaderHookRejected || null };
      out.gsap = !!fin.gsap;
      out.scrollTrigger = !!fin.scrollTrigger;
      out.sceneSection = fin.sceneSection || null;
      out.railRejected = fin.railRejected || null;
    }

    /* ---- analysis ---- */
    const byId = new Map();
    for (let i = 0; i < series.length; i++) {
      for (const e of (series[i].els || [])) {
        if (!byId.has(e.id)) byId.set(e.id, []);
        byId.get(e.id).push({ ...e, i, prog: series[i].prog });
      }
    }
    const vw = geom.vw, vh = geom.vh;
    const GAP_MIN = Math.max(80, vh * 0.3);
    let pin = null, scrub = null, track = null;
    for (const [id, rec] of byId) {
      if (rec.length < 3) continue;
      if (!pin) {
        const big = rec.some((r) => r.h >= vh * 0.45 && r.w >= vw * 0.45);
        const stickyish = rec.some((r) => r.pos === 'fixed' || r.pos === 'sticky');
        const holdsSomething = rec.some((r) => r.holds !== false);
        if (big && stickyish && holdsSomething) {
          let held = 0, gaps = 0;
          for (let k = 1; k < rec.length; k++) {
            if (rec[k].i !== rec[k - 1].i + 1) continue;
            if (Math.abs(rec[k].prog - rec[k - 1].prog) < GAP_MIN) continue;
            gaps++;
            if (Math.abs(rec[k].top - rec[k - 1].top) <= 8) held++;
          }
          /* held >= 1 says it stopped moving while the page moved.
             held <= gaps - 1 says it let go again — a permanently fixed
             background is not a pinned section. */
          if (gaps >= 2 && held >= 1 && held <= gaps - 1)
            pin = { via: 'measured hold', el: `${rec[0].tag.toLowerCase()}${rec[0].cls ? `.${rec[0].cls.split(/\s+/)[0]}` : ''}`, heldGaps: held, totalGaps: gaps, position: rec.find((r) => r.pos === 'fixed' || r.pos === 'sticky').pos, heightPx: rec[0].h };
        }
      }
      const still = rec.filter((r) => !r.anim);
      if (still.length >= 5) {
        for (const ch of ['tx', 'ty', 'sc']) {
          const vals = still.map((r) => r[ch]);
          const eps = ch === 'sc' ? 0.004 : 1.5;
          const need = ch === 'sc' ? 0.12 : 60;
          const run = longestRun(vals, eps);
          if (run.len < 3) continue;
          const moved = Math.abs(vals[run.end] - vals[run.start]);
          if (moved < need) continue;
          const hit = { via: `${ch} monotonic across ${run.len + 1} scroll offsets`, el: `${still[0].tag.toLowerCase()}${still[0].cls ? `.${still[0].cls.split(/\s+/)[0]}` : ''}`, channel: ch, from: vals[run.start], to: vals[run.end], moved: +moved.toFixed(1) };
          if (!scrub) scrub = hit;
          if (!track && ch === 'tx' && still[0].w >= vw * 1.2 && moved >= vw * 0.4)
            track = { via: 'pinned horizontal track', widthPx: still[0].w, movedPx: +moved.toFixed(0) };
          break;
        }
      }
      /* a canvas that repaints across the scroll is a scrubbed sequence */
      if (!scrub && rec[0].tag === 'CANVAS') {
        const hashes = rec.map((r) => r.hash).filter((h) => h != null);
        const distinct = new Set(hashes).size;
        if (hashes.length >= 4 && distinct >= 3)
          scrub = { via: 'canvas repaint across scroll', el: 'canvas', distinctFrames: distinct, sampled: hashes.length };
      }
      if (!scrub && rec[0].tag === 'VIDEO') {
        const t = rec.map((r) => r.ct).filter((v) => v != null);
        if (t.length >= 5) {
          const run = longestRun(t, 0.05);
          if (run.len >= 3 && Math.abs(t[run.end] - t[run.start]) >= 0.3)
            scrub = { via: 'video currentTime tracks scroll', el: 'video', fromSec: t[run.start], toSec: t[run.end] };
        }
      }
    }
    /* A pin-spacer in the DOM only exists because ScrollTrigger built a pin. */
    if (!pin && out.pinSpacer && (out.scrollTrigger || out.gsap)) pin = { via: 'gsap pin-spacer in the DOM', pinSpacer: true, scrollTrigger: out.scrollTrigger };
    if (!pin && fin && fin.stickyStage) pin = fin.stickyStage;

    const techniques = {
      'scroll-pinned section': pin,
      'scrubbed sequence': scrub,
      'split/masked type reveal': fin ? fin.split : null,
      'cursor-driven preview': cursorHit,
      'horizontal chapter': track || (fin ? fin.rail : null),
      'loader into hero': out.loader,
      'page transition': fin ? fin.transition : null,
      'magnetic element': magnetic,
      /* A big canvas is only a scene when something rendered into it. */
      'canvas/3D scene': (fin && (fin.webgl || fin.three || (fin.canvasBig && fin.canvasPainted)))
        ? { webgl: fin.webgl, three: fin.three, bigCanvas: fin.canvasBig, painted: fin.canvasPainted, canvases: fin.canvasCount }
        : null,
    };
    out.techniques = techniques;
    out.present = Object.keys(techniques).filter((k) => techniques[k]);
    out.ok = series.length >= 3;
    if (!out.ok) out.errors.push(`only ${series.length} scroll samples returned`);
  } catch (e) {
    out.errors.push(String(e).slice(0, 200));
  } finally {
    try { if (page) await page.close(); } catch { /* ignore */ }
  }
  return out;
};

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chromium' });
const report = { url, capturedAt: new Date().toISOString(), desktop: null, mobile: null, console: [], capability: [] };
/* A capability gate that can silently downgrade the experience has now cost
   three investigations on this skill. Anything the page logs about taking a
   fallback path is collected here and printed, so the downgrade is visible
   next to the frames instead of being reconstructed later. */
const CAPABILITY_RE = /(fallback|downgrade|degrad|unavailable|unsupported|not supported|disabled|no webgl|webgl (is )?off|reduced motion)/i;

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') report.console.push(t.slice(0, 200));
    else if ((m.type() === 'info' || m.type() === 'warning' || m.type() === 'log') && CAPABILITY_RE.test(t) && report.capability.length < 12)
      report.capability.push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => report.console.push(`pageerror: ${String(e).slice(0, 200)}`));
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500);
  report.desktopShots = await shootScroll(page, 'desktop', Number(process.env.STEPS || 6));
  const desktopGround = await groundFor(ctx, url, 12);
  const desktopCraft = await craftProbe(ctx, url);
  report.desktop = await page.evaluate(audit, { expectWidth: 0, ground: desktopGround, craft: desktopCraft, capabilityNotes: report.capability });
  await ctx.close();

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'load', timeout: 45000 });
  await mpage.waitForTimeout(2500);
  report.mobileShots = await shootScroll(mpage, 'mobile', 4);
  const mobileGround = await groundFor(mctx, url, 12);
  const mobileCraft = await craftProbe(mctx, url);
  /* The phone pass cannot see the desktop DOM, and the whole question for a
     `mobile=` declaration is what replaced the desktop scene. Carry the
     reference across. */
  report.mobile = await mpage.evaluate(audit, { expectWidth: 390, ground: mobileGround, craft: mobileCraft, desktopScene: (desktopCraft && desktopCraft.sceneSection) || null, capabilityNotes: report.capability });
  await mctx.close();

  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rpage = await rctx.newPage();
  await rpage.goto(url, { waitUntil: 'load', timeout: 45000 });
  await rpage.waitForTimeout(2000);
  await rpage.screenshot({ path: path.join(outDir, 'reduced-motion.jpg'), type: 'jpeg', quality: 76 });
  await rctx.close();
} catch (e) {
  report.error = String(e).slice(0, 500);
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outDir, 'audit.json'), JSON.stringify(report, null, 2));

/* ---------- console report ---------- */
const fmt = (label, a) => {
  if (!a) return `${label}: NOT CAPTURED`;
  const fails = a.findings.filter((f) => f.level === 'fail');
  const warns = a.findings.filter((f) => f.level === 'warn');
  const sparse = a.findings.filter((f) => f.level === 'sparse');
  const craftF = a.findings.filter((f) => f.level === 'craft');
  const notes = a.findings.filter((f) => f.level === 'note');
  const amb = a.ambition || {};
  const cr = a.craft || {};
  const lines = [
    `\n── ${label} (${a.viewport.w}×${a.viewport.h}, ${a.screens} screens) ──`,
    `display: ${a.display ? `${Math.round(a.display.size)}px ${a.display.fam} ${a.display.weight}` : 'none'}`,
    `families: ${a.families.map((f) => f[0]).join(', ')}`,
    `palette: ${a.palette.map((p) => `${p.color} ${p.areaPct}%`).join(' | ')}`,
    `counts: ${JSON.stringify(a.counts)}`,
    `ambition: media ${amb.renderedMedia ?? '?'} · hero ${amb.heroSize ?? '?'}px vs ${amb.largestBelowFold ?? '?'}px below · overlaps ${amb.overlapPairs ?? '?'} · bleeds ${amb.bleeders ?? '?'} · ground flips ${amb.groundFlips ?? 'n/a'} · motion ${amb.motionVocabulary ?? '?'} · tint marks ${amb.tintMarks ?? 0}`,
    `craft: kind ${cr.kind || 'page'}${cr.demoMode ? ' (SPARSE+CRAFT skipped)' : ''} · tier ${cr.tierDeclared || 'undeclared'}${cr.tierDeclaredMobile ? `/mobile=${cr.tierDeclaredMobile}` : ''} (measured vs ${cr.tierMeasuredAgainst || '?'}) · techniques ${cr.techniqueCount ?? '?'}/9${cr.techniques && cr.techniques.length ? ` [${cr.techniques.join(', ')}]` : ''} · loader ${cr.loader ? cr.loader.via : 'none'} · webgl ${cr.webgl === null ? 'n/a' : cr.webgl} · probe ${cr.probed ? `${cr.probeMode}/${cr.probeSamples}` : 'not measured'}`,
    `FAIL ${fails.length} · WARN ${warns.length} · SPARSE ${sparse.length} · CRAFT ${craftF.length}`,
  ];
  for (const f of notes) lines.push(`  [NOTE] ${f.code} — ${f.msg}`);
  for (const f of [...fails, ...warns]) lines.push(`  [${f.level.toUpperCase()}] ${f.code} — ${f.msg}`);
  if (sparse.length) {
    lines.push('  ┄ ambition — SPARSE: absence, not error. Does not affect exit code. ┄');
    for (const f of sparse) lines.push(`  [SPARSE] ${f.code} — ${f.msg}`);
  }
  if (craftF.length) {
    lines.push('  ┄ craft — CRAFT: ambition declared vs ambition built. Does not affect exit code. ┄');
    for (const f of craftF) lines.push(`  [CRAFT] ${f.code} — ${f.msg}`);
  }
  return lines.join('\n');
};

console.log(fmt('DESKTOP', report.desktop));
console.log(fmt('MOBILE', report.mobile));
if (report.console.length) console.log(`\nconsole errors: ${report.console.length}\n  ${report.console.slice(0, 5).join('\n  ')}`);
if (report.capability.length) console.log(`\ncapability notes the page logged: ${report.capability.length}\n  ${report.capability.slice(0, 6).join('\n  ')}`);
if (report.error) console.log(`\nERROR: ${report.error}`);
console.log(`\nframes → ${outDir}  (LOOK AT THEM with the Read tool before you claim done)`);

const totalFails = (report.desktop?.findings || []).filter((f) => f.level === 'fail').length + (report.mobile?.findings || []).filter((f) => f.level === 'fail').length;
const totalAmbition = [...(report.desktop?.findings || []), ...(report.mobile?.findings || [])].filter((f) => f.level === 'sparse' || f.level === 'craft').length;
/* Exit 0 is not the Done bar and never was. SKILL.md's checklist asks for zero
   SPARSE and zero CRAFT as well, and an exit code that ignores both is easy to
   read as permission to stop. Say it out loud instead of changing it. */
if (totalFails === 0 && totalAmbition > 0)
  console.log(`\nexit 0, but NOT done: ${totalAmbition} SPARSE/CRAFT finding${totalAmbition === 1 ? '' : 's'} stand. SKILL.md's Done checklist asks for zero of both — the exit code only tracks FAILs.`);
process.exit(totalFails > 0 ? 1 : 0);
