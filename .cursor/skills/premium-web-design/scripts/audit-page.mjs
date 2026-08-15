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
  const GENERIC_FONTS = /^(inter|roboto|arial|helvetica|system-ui|-apple-system|segoe|open sans|lato|noto sans|ui-sans-serif|sans-serif)/i;
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

  /** Effective background behind an element: walk up until an opaque paint. */
  const effectiveBg = (el) => {
    let node = el;
    let overMedia = false;
    let acc = null;
    while (node && node !== document.documentElement.parentNode) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== 'none') overMedia = true;
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
    if (r.top >= window.innerHeight && (!belowBiggest || size > belowBiggest.size)) {
      belowBiggest = { size, fam, weight: s.fontWeight, text: textOf(el).slice(0, 60), top: Math.round(r.top) };
    }
  }
  const families = Object.entries(familyUse).sort((a, b) => b[1] - a[1]);

  if (biggest && GENERIC_FONTS.test(biggest.fam))
    add('fail', 'display-font-generic',
      `Display voice is "${biggest.fam}" — a system/default face. The largest type on the first screen is the brand's voice; a default face makes the page read as a template.`,
      biggest);
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
      if (n && readableCorpus.some((c) => c.includes(n))) {
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
      const hasScrim = s.textShadow !== 'none' || /gradient/.test(getComputedStyle(el.parentElement || el).backgroundImage || '');
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
  if (hues.size > 4)
    add('warn', 'palette-sprawl', `${hues.size} distinct hue families carry significant area. Hold to 1 dominant + 1 accent + neutrals.`, significantBgs.slice(0, 10).map(([k, a]) => ({ color: k, areaPct: +(a / totalArea * 100).toFixed(1) })));

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
    if (r >= 6 && (hasShadow || hasBorder) && pad >= 12 && box.width > 160 && box.height > 100) cardish++;
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
  let liveScene = null;
  for (const m of media) {
    if (m.kind !== 'canvas' && m.kind !== 'video') continue;
    if (m.r.width * m.r.height >= vw * vh * 0.5) { liveScene = m.kind; break; }
  }
  if (screensNow > 5 && !liveScene && media.length < 8)
    add('sparse', 'image-density',
      `${media.length} rendered images over ${screensNow.toFixed(1)} screens (img + CSS background + video + canvas, each over 8000px²). Median for this measure across the 10 corpus studies longer than 5 screens is ${CORPUS.renderedMedian}; the image-led ones run 47 (tripletta) and 254 (blindbarber). A long page carried by type and whitespace alone reads as a template.`,
      { rendered: media.length, byKind: mediaByKind, screens: +screensNow.toFixed(1), corpusRenderedMedian: CORPUS.renderedMedian, corpusRawTagMedian: CORPUS.rawTagMedian, liveScene });

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
      overlapPairs++;
      if (overlapSamples.length < 6) overlapSamples.push({ a: describe(A.el), b: describe(B.el), overlapX: Math.round(ox), overlapY: Math.round(oy) });
      if (overlapPairs >= 500) break sweep;
    }
  }
  if (boxes.length > 1 && overlapPairs === 0)
    add('sparse', 'no-overlap',
      `Zero partially-overlapping content pairs across ${boxes.length} text/image elements (nav chrome and text-inside-a-hero-photo excluded — both are free). Nothing cuts across anything else, so the page is a stack of rows. Layering — copy over a numeral, a photo dropped across a caption, a rail crossing an image — is what separates a designed page from a document.`,
      { pairs: 0, contentElements: boxes.length, minOverlapPx: OVERLAP_MIN, excluded: 'chrome + full containment' });

  /* --- 4. no-bleed: something crosses the viewport edge --- */
  const BLEED_MIN = 24;
  let bleeders = 0;
  const bleedSamples = [];
  if (!overflowX) {
    for (const el of all) {
      const r = rectOf(el);
      if (!r || r.width < 24 || r.height < 8) continue;
      if (r.right <= 0 || r.left >= vw) continue;
      const past = Math.max(-r.left, r.right - vw);
      if (past <= BLEED_MIN) continue;
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
      if (document.querySelector('[data-scroll],[data-scroll-container],[data-gsap],[data-animate],[data-lenis]')) return true;
      let driven = 0;
      for (const el of all.slice(0, 2500)) {
        const inline = el.getAttribute && el.getAttribute('style');
        if (inline && /(transform|translate3d|will-change)\s*:/i.test(inline)) driven++;
        else {
          let st;
          try { st = getComputedStyle(el); } catch { continue; }
          if (st.willChange && st.willChange !== 'auto') driven++;
        }
        if (driven >= 6) return true;
      }
      return false;
    } catch { return false; }
  })();
  if (screensNow > 6 && motionVocab.size < 4 && !jsMotion)
    add('sparse', 'motion-vocabulary',
      `${motionVocab.size} distinct motion declaration${motionVocab.size === 1 ? '' : 's'} (unique property + duration + easing) across ${screensNow.toFixed(1)} screens, and no JS motion runtime on the page. One easing curve repeated everywhere is a default, not a vocabulary — a page this long wants at least 4: a state change, an enter, a scroll-linked move, and a slow ambient one.`,
      { distinct: motionVocab.size, sample: [...motionVocab].slice(0, 8), jsMotion });

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

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chromium' });
const report = { url, capturedAt: new Date().toISOString(), desktop: null, mobile: null, console: [] };

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') report.console.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => report.console.push(`pageerror: ${String(e).slice(0, 200)}`));
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500);
  report.desktopShots = await shootScroll(page, 'desktop', Number(process.env.STEPS || 6));
  const desktopGround = await groundFor(ctx, url, 12);
  report.desktop = await page.evaluate(audit, { expectWidth: 0, ground: desktopGround });
  await ctx.close();

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'load', timeout: 45000 });
  await mpage.waitForTimeout(2500);
  report.mobileShots = await shootScroll(mpage, 'mobile', 4);
  const mobileGround = await groundFor(mctx, url, 12);
  report.mobile = await mpage.evaluate(audit, { expectWidth: 390, ground: mobileGround });
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
  const amb = a.ambition || {};
  const lines = [
    `\n── ${label} (${a.viewport.w}×${a.viewport.h}, ${a.screens} screens) ──`,
    `display: ${a.display ? `${Math.round(a.display.size)}px ${a.display.fam} ${a.display.weight}` : 'none'}`,
    `families: ${a.families.map((f) => f[0]).join(', ')}`,
    `palette: ${a.palette.map((p) => `${p.color} ${p.areaPct}%`).join(' | ')}`,
    `counts: ${JSON.stringify(a.counts)}`,
    `ambition: media ${amb.renderedMedia ?? '?'} · hero ${amb.heroSize ?? '?'}px vs ${amb.largestBelowFold ?? '?'}px below · overlaps ${amb.overlapPairs ?? '?'} · bleeds ${amb.bleeders ?? '?'} · ground flips ${amb.groundFlips ?? 'n/a'} · motion ${amb.motionVocabulary ?? '?'} · tint marks ${amb.tintMarks ?? 0}`,
    `FAIL ${fails.length} · WARN ${warns.length} · SPARSE ${sparse.length}`,
  ];
  for (const f of [...fails, ...warns]) lines.push(`  [${f.level.toUpperCase()}] ${f.code} — ${f.msg}`);
  if (sparse.length) {
    lines.push('  ┄ ambition — SPARSE: absence, not error. Does not affect exit code. ┄');
    for (const f of sparse) lines.push(`  [SPARSE] ${f.code} — ${f.msg}`);
  }
  return lines.join('\n');
};

console.log(fmt('DESKTOP', report.desktop));
console.log(fmt('MOBILE', report.mobile));
if (report.console.length) console.log(`\nconsole errors: ${report.console.length}\n  ${report.console.slice(0, 5).join('\n  ')}`);
if (report.error) console.log(`\nERROR: ${report.error}`);
console.log(`\nframes → ${outDir}  (LOOK AT THEM with the Read tool before you claim done)`);

const totalFails = (report.desktop?.findings || []).filter((f) => f.level === 'fail').length + (report.mobile?.findings || []).filter((f) => f.level === 'fail').length;
process.exit(totalFails > 0 ? 1 : 0);
