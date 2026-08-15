/**
 * render-poster.mjs — regenerate src/three/poster.jpg from the live scene.
 *
 * The still shown to readers with reduced motion or no WebGL has to be the same
 * art direction as the canvas, or the two paths drift into two different sites.
 * Rendering it out of the running build is the only way to keep them honest.
 *
 * Playwright is not a dependency of this demo. Install it only when you need to
 * re-render:
 *
 *   npm i -D playwright && npx playwright install chromium
 *   npm run build && npm run preview &
 *   npm run poster
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/three/poster.jpg");
const URL = process.env.POSTER_URL ?? "http://localhost:4173/";

/** The product's box in act one, in CSS pixels at 1440x900. */
const CLIP = { x: 830, y: 150, width: 500, height: 660 };

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright is not installed. See the header of this file.");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(URL, { waitUntil: "networkidle" });

// The canvas has to have actually drawn, and the scene damps into its opening
// pose over about a second and a half.
await page.waitForFunction(() => document.documentElement.dataset.scenePath === "webgl");
await page.waitForTimeout(3000);

const canvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
if (canvases === 0) {
  await browser.close();
  throw new Error("No canvas on the page. The poster would be a picture of the fallback.");
}

// Hide the DOM so only the render lands in the file.
await page.addStyleTag({ content: "main,.hud,.dots,.loader{opacity:0 !important}" });
await page.waitForTimeout(500);

const buffer = await page.screenshot({ type: "jpeg", quality: 86, clip: CLIP });
writeFileSync(OUT, buffer);
await browser.close();

console.log(`wrote ${OUT} (${buffer.length} bytes)`);
