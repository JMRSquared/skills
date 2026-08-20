#!/usr/bin/env node
/**
 * find-photos.mjs — source real photography, and look at it before choosing.
 *
 * "Use real photography" is unreachable advice if the agent has no way to find
 * any. This searches free-licence libraries in a real browser, writes a contact
 * sheet the agent can open with the Read tool, and prints ready-to-use URLs
 * with attribution.
 *
 * Usage:
 *   PW_DIR=<dir with node_modules/playwright> \
 *     node find-photos.mjs "veterinary clinic examination" ./photos [count]
 *
 * Sources: Unsplash and Pexels (free to use, no attribution required but
 * appreciated — check each library's current licence before commercial use).
 */

const [, , query, outDir = './photos', countArg] = process.argv;
if (!query) {
  console.error('usage: find-photos.mjs "<query>" [outDir] [count]');
  process.exit(2);
}
const COUNT = Number(countArg || 12);

const pwDir = process.env.PW_DIR;
const { chromium } = pwDir
  ? await import(`${pwDir}/node_modules/playwright/index.mjs`)
  : await import('playwright');
const fs = await import('node:fs/promises');
const path = await import('node:path');

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chromium' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
const results = [];

const scrapeUnsplash = async () => {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}?orientation=landscape`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(2500);
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('figure img[src*="images.unsplash.com/photo-"]'))
      .map((im) => {
        const fig = im.closest('figure');
        const link = fig?.querySelector('a[href*="/photos/"]');
        const credit = fig?.querySelector('a[href^="/@"]');
        const id = (im.src.match(/photo-([\w-]+)/) || [])[1];
        return {
          source: 'unsplash',
          id,
          thumb: im.src,
          full: id ? `https://images.unsplash.com/photo-${id}?w=2400&q=80&auto=format&fit=crop` : null,
          page: link ? new URL(link.getAttribute('href'), location.origin).href : null,
          author: credit ? credit.textContent.trim() : null,
          alt: im.alt || '',
        };
      })
      .filter((r) => r.id)
  );
  results.push(...found);
};

const scrapePexels = async () => {
  const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/?orientation=landscape`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3500);
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(2500);
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img[src*="images.pexels.com/photos/"]'))
      .map((im) => {
        const id = (im.src.match(/photos\/(\d+)\//) || [])[1];
        const link = im.closest('a[href*="/photo/"]') || im.parentElement?.querySelector('a[href*="/photo/"]');
        return {
          source: 'pexels',
          id,
          thumb: im.src,
          full: id ? im.src.replace(/\?.*$/, '?auto=compress&cs=tinysrgb&w=2400') : null,
          page: link ? new URL(link.getAttribute('href'), location.origin).href : null,
          author: im.alt || null,
          alt: im.alt || '',
        };
      })
      .filter((r) => r.id)
  );
  results.push(...found);
};

try { await scrapeUnsplash(); } catch (e) { console.error('unsplash:', String(e).slice(0, 120)); }
try { await scrapePexels(); } catch (e) { console.error('pexels:', String(e).slice(0, 120)); }

const seen = new Set();
const picks = results.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, COUNT);

/* contact sheet — the point is that you LOOK before you choose */
const sheet = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#111;color:#eee;font:13px/1.4 ui-monospace,monospace}
h1{font:600 15px/1.4 ui-monospace,monospace;padding:14px 16px;margin:0;border-bottom:1px solid #333}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
figure{margin:0;position:relative;background:#000}
img{width:100%;height:300px;object-fit:cover;display:block}
figcaption{position:absolute;left:0;bottom:0;right:0;padding:6px 8px;background:rgb(0 0 0/.72)}
</style><h1>${query} — ${picks.length} candidates</h1><div class=g>
${picks.map((p, i) => `<figure><img src="${p.thumb}" alt=""><figcaption>[${i}] ${p.source} · ${p.author || ''}</figcaption></figure>`).join('\n')}
</div>`;
await fs.writeFile(path.join(outDir, 'contact-sheet.html'), sheet);

/* render the sheet to an image so it can be read directly */
try {
  const sp = await ctx.newPage();
  await sp.goto(`file://${path.resolve(outDir, 'contact-sheet.html')}`, { waitUntil: 'load' });
  await sp.waitForTimeout(4000);
  await sp.screenshot({ path: path.join(outDir, 'contact-sheet.jpg'), fullPage: true, type: 'jpeg', quality: 75 });
  await sp.close();
} catch (e) {
  console.error('sheet render:', String(e).slice(0, 120));
}

await fs.writeFile(path.join(outDir, 'photos.json'), JSON.stringify({ query, picks }, null, 2));
await browser.close();

console.log(`\n${picks.length} candidates for "${query}"\n`);
picks.forEach((p, i) => {
  console.log(`[${i}] ${p.source.padEnd(8)} ${p.author || '—'}`);
  console.log(`     ${p.full}`);
  if (p.page) console.log(`     credit: ${p.page}`);
});
console.log(`\ncontact sheet → ${path.join(outDir, 'contact-sheet.jpg')}`);
console.log('Read it before you pick. A hero image chosen from a filename is a hero image chosen at random.');
