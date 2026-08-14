#!/usr/bin/env node
/**
 * study-site.mjs — capture the craft of a reference site.
 *
 * Loads a URL in real Chromium, scrolls the whole page in steps, screenshots
 * each step (desktop + mobile), and extracts the measurable design facts:
 * fonts actually rendered, type scale, color histogram, motion libraries in
 * use, canvas/video/scroll signals.
 *
 * Usage:
 *   PW_DIR=/path/with/node_modules node study-site.mjs <url> <slug> <outRoot>
 */

const [, , url, slug, outRoot] = process.argv;
if (!url || !slug || !outRoot) {
  console.error('usage: study-site.mjs <url> <slug> <outRoot>');
  process.exit(2);
}

const pwDir = process.env.PW_DIR;
const { chromium } = pwDir
  ? await import(`${pwDir}/node_modules/playwright/index.mjs`)
  : await import('playwright');

const fs = await import('node:fs/promises');
const path = await import('node:path');

const shotDir = path.join(outRoot, slug);
await fs.mkdir(shotDir, { recursive: true });

const STEPS = Number(process.env.STEPS || 9);
const SETTLE = Number(process.env.SETTLE || 1400);
const NAV_TIMEOUT = Number(process.env.NAV_TIMEOUT || 60000);

const probe = () => {
  const w = window;
  const seen = (k) => typeof w[k] !== 'undefined';
  const styleOf = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      sel,
      text: (el.textContent || '').trim().slice(0, 80),
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      textTransform: s.textTransform,
      color: s.color,
    };
  };

  const colorCount = {};
  const bgCount = {};
  const fontCount = {};
  const els = Array.from(document.querySelectorAll('*')).slice(0, 4000);
  for (const el of els) {
    const s = getComputedStyle(el);
    if (s.color) colorCount[s.color] = (colorCount[s.color] || 0) + 1;
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)')
      bgCount[s.backgroundColor] = (bgCount[s.backgroundColor] || 0) + 1;
    const t = (el.textContent || '').trim();
    if (t.length > 1 && el.children.length === 0) {
      const key = `${s.fontFamily}|${s.fontWeight}`;
      fontCount[key] = (fontCount[key] || 0) + 1;
    }
  }
  const top = (obj, n) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, count: v }));

  const fontFaces = [];
  try {
    document.fonts.forEach((f) => fontFaces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  } catch {}

  const scripts = Array.from(document.querySelectorAll('script[src]')).map((s) => s.src);
  const stylesheets = Array.from(document.querySelectorAll('link[rel=stylesheet]')).map((l) => l.href);

  return {
    title: document.title,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    screens: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(1),
    libs: {
      gsap: seen('gsap'),
      ScrollTrigger: !!(w.gsap && w.gsap.core && w.ScrollTrigger) || seen('ScrollTrigger'),
      three: seen('THREE'),
      lenis: seen('Lenis') || seen('lenis'),
      barba: seen('barba'),
      rive: seen('rive'),
      matter: seen('Matter'),
      pixi: seen('PIXI'),
      swiper: seen('Swiper'),
      splitting: seen('Splitting') || seen('SplitText'),
      locomotive: seen('LocomotiveScroll'),
      react: !!document.querySelector('#__next, [data-reactroot], #root'),
      next: seen('__NEXT_DATA__'),
      webflow: !!document.querySelector('[data-wf-page]'),
    },
    counts: {
      canvas: document.querySelectorAll('canvas').length,
      video: document.querySelectorAll('video').length,
      img: document.querySelectorAll('img').length,
      svg: document.querySelectorAll('svg').length,
      sections: document.querySelectorAll('section').length,
      buttons: document.querySelectorAll('button, a[class*=btn], a[class*=button]').length,
    },
    body: styleOf('body'),
    type: [
      styleOf('h1'), styleOf('h2'), styleOf('h3'), styleOf('p'),
      styleOf('nav a'), styleOf('button'), styleOf('footer'),
    ].filter(Boolean),
    topTextColors: top(colorCount, 8),
    topBackgrounds: top(bgCount, 8),
    topFonts: top(fontCount, 8),
    fontFaces: fontFaces.slice(0, 40),
    scripts: scripts.slice(0, 40),
    stylesheets: stylesheets.slice(0, 20),
    html: document.documentElement.outerHTML.length,
  };
};

const scrollY = (page) => page.evaluate(() => window.scrollY || document.documentElement.scrollTop || 0);

/**
 * Scroll with real wheel events, in small increments.
 * Sites that hijack scroll (Lenis, Locomotive, custom virtual scroll, pinned
 * GSAP timelines) ignore window.scrollTo — they only advance on wheel input.
 */
const wheelTo = async (page, target) => {
  let last = -1;
  for (let i = 0; i < 400; i++) {
    const y = await scrollY(page);
    if (y >= target - 8) return y;
    if (y === last && i > 8) {
      // scroll position frozen (pinned section) — keep feeding wheel a bit
      if (i > 60) return y;
    }
    last = y;
    await page.mouse.wheel(0, Math.min(500, Math.max(120, target - y)));
    await page.waitForTimeout(45);
  }
  return scrollY(page);
};

const shoot = async (page, prefix, steps) => {
  const shots = [];
  const vh = await page.evaluate(() => window.innerHeight);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const usable = Math.max(total - vh, 0);
  await page.mouse.move(720, 450);
  for (let i = 0; i < steps; i++) {
    const target = steps === 1 ? 0 : Math.round((usable * i) / (steps - 1));
    const reached = i === 0 ? 0 : await wheelTo(page, target);
    await page.waitForTimeout(SETTLE);
    const file = path.join(shotDir, `${prefix}-${String(i).padStart(2, '0')}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 68 });
    shots.push({
      file: path.basename(file),
      targetY: target,
      reachedY: reached,
      pct: usable ? Math.round((reached / usable) * 100) : 0,
    });
  }
  return shots;
};

/** Fingerprint motion/3D libraries inside bundled JS, where globals are hidden. */
const LIB_PATTERNS = [
  ['gsap', /\bgsap\b|greensock/i],
  ['ScrollTrigger', /ScrollTrigger/],
  ['SplitText', /SplitText|splitting/i],
  ['three', /THREE\.|three\.module|WebGLRenderer/],
  ['r3f', /react-three|@react-three|useFrame/],
  ['drei', /@react-three\/drei|drei/],
  ['lenis', /lenis|studio-freight/i],
  ['locomotive', /locomotive-scroll/i],
  ['barba', /barba/i],
  ['rive', /rive-(js|app)|@rive-app/i],
  ['matter', /matter-js|Matter\.Engine/],
  ['pixi', /PIXI\.|pixi\.js/],
  ['framer-motion', /framer-motion|motion-dom|useMotionValue/],
  ['swiper', /swiper/i],
  ['shader', /gl_FragColor|precision highp float|varying vec2/],
  ['webgl', /createShader|WEBGL_|getContext\(["\x27]webgl/],
  ['video', /\.mp4|\.webm/i],
];

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || 'chromium',
  args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
});

const result = { url, slug, capturedAt: null, errors: [] };

try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));

  const libHits = new Set();
  let sniffed = 0;
  page.on('response', async (res) => {
    try {
      const ct = res.headers()['content-type'] || '';
      if (!/javascript|text\/css|html/.test(ct)) return;
      if (sniffed > 12_000_000) return;
      const body = await res.text();
      sniffed += body.length;
      for (const [name, re] of LIB_PATTERNS) if (re.test(body)) libHits.add(name);
    } catch {}
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await page.waitForTimeout(2500);
  // let the intro/loader play out
  try { await page.waitForLoadState('networkidle', { timeout: 25000 }); } catch {}
  await page.waitForTimeout(3500);

  await page.screenshot({ path: path.join(shotDir, 'desktop-hero.jpg'), type: 'jpeg', quality: 72 });
  result.desktop = await shoot(page, 'desktop', STEPS);
  result.data = await page.evaluate(probe);
  result.bundleLibs = [...libHits].sort();
  result.assetUrls = { fonts: [], media: [] };
  result.pageErrors = consoleErrors.slice(0, 10);

  // hover probe on the first prominent CTA
  try {
    const cta = page.locator('a, button').filter({ hasText: /./ }).first();
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.waitForTimeout(600);
    await cta.hover({ timeout: 4000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(shotDir, 'desktop-hover.jpg'), type: 'jpeg', quality: 72 });
  } catch (e) { result.errors.push(`hover: ${String(e).slice(0, 120)}`); }

  await ctx.close();

  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mpage = await mctx.newPage();
  await mpage.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await mpage.waitForTimeout(4500);
  result.mobile = await shoot(mpage, 'mobile', 4);
  result.mobileData = await mpage.evaluate(probe);
  await mctx.close();
} catch (e) {
  result.errors.push(String(e).slice(0, 400));
} finally {
  await browser.close();
}

await fs.writeFile(path.join(shotDir, 'data.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ slug, ok: result.errors.length === 0, shots: (result.desktop || []).length, errors: result.errors }, null, 2));
