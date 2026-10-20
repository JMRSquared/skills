#!/usr/bin/env node
/* Storyboard capture for a story.js page: every [data-scene] at the start,
   middle and end of its scroll, plus one contact sheet of all of them in
   order. Read the sheet as a comic strip: if it does not tell the story
   without the copy, the page does not either.

   PW_DIR=<dir containing node_modules/playwright> \
     node scripts/story-frames.mjs "<url>" <out-dir> [width] [height] */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, outArg = './.story', width = '1440', height = '900'] = process.argv.slice(2);
if (!url) {
  console.error('Usage: PW_DIR=<dir with node_modules/playwright> node scripts/story-frames.mjs <url> [out-dir] [width] [height]');
  process.exit(2);
}

const pwDir = process.env.PW_DIR;
const pwEntry = pwDir ? pathToFileURL(join(pwDir, 'node_modules/playwright/index.mjs')).href : 'playwright';
const { chromium } = await import(pwEntry).catch(() => {
  console.error('Playwright not found. Set PW_DIR to the directory holding node_modules/playwright, or install it: mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install chromium');
  process.exit(2);
});

const out = resolve(outArg);
mkdirSync(out, { recursive: true });
const viewport = { width: Number(width), height: Number(height) };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport });
const logs = [];
page.on('console', (msg) => { if (msg.text().startsWith('[story]')) logs.push(msg.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const scenes = await page.evaluate(() => [...document.querySelectorAll('[data-scene]')].map((el, i) => {
  const r = el.getBoundingClientRect();
  return { id: el.id || `scene-${i + 1}`, top: r.top + scrollY, height: r.height };
}));
if (!scenes.length) {
  console.error('No [data-scene] elements found. This tool reads story.js pages; see references/scroll-story.md.');
  await browser.close();
  process.exit(1);
}

const frames = [];
for (const scene of scenes) {
  const travel = Math.max(0, scene.height - viewport.height);
  for (const at of [0, 0.5, 1]) {
    const y = Math.round(scene.top + travel * at);
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(650);
    const file = `${scene.id}-${String(at * 100).padStart(3, '0')}.jpg`;
    await page.screenshot({ path: join(out, file), type: 'jpeg', quality: 72 });
    frames.push({ file, label: `${scene.id} · ${at * 100}%` });
  }
}

const sheet = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#16181d;color:#e8e6e1;font:500 14px ui-monospace,monospace}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
figure{margin:0}img{width:100%;display:block;border:1px solid #333}
figcaption{padding:6px 0 0}</style><div class="grid">${frames
  .map((f) => `<figure><img src="${f.file}"><figcaption>${f.label}</figcaption></figure>`).join('')}</div>`;
writeFileSync(join(out, 'storyboard.html'), sheet);
const sheetPage = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await sheetPage.goto(pathToFileURL(join(out, 'storyboard.html')).href, { waitUntil: 'load' });
await sheetPage.screenshot({ path: join(out, 'storyboard.jpg'), type: 'jpeg', quality: 70, fullPage: true });
await browser.close();

logs.forEach((line) => console.log(line));
if (!logs.length) console.warn('No [story] log line: kit/story.js did not run. Check the script path and that it loads with defer.');
console.log(`${scenes.length} scenes, ${frames.length} frames → ${join(out, 'storyboard.jpg')}`);
console.log('Open storyboard.jpg and read it left to right, top to bottom. Each row is one scene.');
