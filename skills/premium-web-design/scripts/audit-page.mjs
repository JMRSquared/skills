#!/usr/bin/env node
/**
 * audit-page.mjs — look at your own work, then measure it.
 *
 * Screenshots a page you just built (desktop + mobile + reduced-motion) and
 * runs objective design checks against the RENDERED result: contrast, display
 * font, hero type scale, palette discipline, spacing grid, card-grid smell,
 * image resolution, tap targets, motion presence.
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
  const all = Array.from(document.querySelectorAll('body *')).filter(visible);
  const textEls = all.filter((el) => textOf(el).length > 1);

  const findings = [];
  const add = (level, code, msg, detail) => findings.push({ level, code, msg, detail });

  /* fonts */
  const familyUse = {};
  let biggest = null;
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const size = parseFloat(s.fontSize);
    familyUse[fam] = (familyUse[fam] || 0) + textOf(el).length;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && (!biggest || size > biggest.size)) {
      biggest = { size, fam, weight: s.fontWeight, text: textOf(el).slice(0, 60), tracking: s.letterSpacing, lh: s.lineHeight };
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
  const badContrast = [];
  const overMediaNoScrim = [];
  for (const el of textEls) {
    const s = getComputedStyle(el);
    const fg = parseRGB(s.color);
    if (!fg) continue;
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
  const brokenImgs = imgs.filter((im) => im.naturalWidth === 0).map((im) => im.currentSrc.slice(-80) || im.src.slice(-80));
  if (brokenImgs.length) add('fail', 'image-broken', `${brokenImgs.length} images failed to load.`, brokenImgs.slice(0, 8));

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

  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    scrollHeight: document.documentElement.scrollHeight,
    screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1),
    display: biggest,
    families: families.slice(0, 6),
    palette: significantBgs.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, a]) => ({ color: k, areaPct: +(a / totalArea * 100).toFixed(1) })),
    counts: { elements: all.length, text: textEls.length, images: imgs.length, canvas: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length, sections: sections.length, cardish, animated, smallTargets },
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
  report.desktop = await page.evaluate(audit, { expectWidth: 0 });
  await ctx.close();

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'load', timeout: 45000 });
  await mpage.waitForTimeout(2500);
  report.mobileShots = await shootScroll(mpage, 'mobile', 4);
  report.mobile = await mpage.evaluate(audit, { expectWidth: 390 });
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
  const lines = [
    `\n── ${label} (${a.viewport.w}×${a.viewport.h}, ${a.screens} screens) ──`,
    `display: ${a.display ? `${Math.round(a.display.size)}px ${a.display.fam} ${a.display.weight}` : 'none'}`,
    `families: ${a.families.map((f) => f[0]).join(', ')}`,
    `palette: ${a.palette.map((p) => `${p.color} ${p.areaPct}%`).join(' | ')}`,
    `counts: ${JSON.stringify(a.counts)}`,
    `FAIL ${fails.length} · WARN ${warns.length}`,
  ];
  for (const f of [...fails, ...warns]) lines.push(`  [${f.level.toUpperCase()}] ${f.code} — ${f.msg}`);
  return lines.join('\n');
};

console.log(fmt('DESKTOP', report.desktop));
console.log(fmt('MOBILE', report.mobile));
if (report.console.length) console.log(`\nconsole errors: ${report.console.length}\n  ${report.console.slice(0, 5).join('\n  ')}`);
if (report.error) console.log(`\nERROR: ${report.error}`);
console.log(`\nframes → ${outDir}  (LOOK AT THEM with the Read tool before you claim done)`);

const totalFails = (report.desktop?.findings || []).filter((f) => f.level === 'fail').length + (report.mobile?.findings || []).filter((f) => f.level === 'fail').length;
process.exit(totalFails > 0 ? 1 : 0);
