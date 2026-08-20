/**
 * Prints the bounding box of a glTF/glb, in scene units.
 *
 * The act table asks for `subject: { w, h }` per act, and those numbers decide
 * where the camera stands. Guessing them is how a build ends up with the
 * subject filling 14% of a phone screen.
 *
 * This runs in headless Chromium rather than in node, and not by choice:
 * GLTFLoader reaches for `self`, `URL.createObjectURL` and `fetch` of a blob,
 * none of which node provides. Trying to `import` three's loader in a plain
 * node script fails in a way that looks like a broken install.
 *
 *   PW_DIR=<dir with node_modules/playwright> \
 *     node scripts/measure-model.mjs ./public/models/thing.glb
 *
 * Measure the WHOLE model first, then re-run with a node name to measure one
 * part when an act frames a detail:
 *
 *   node scripts/measure-model.mjs ./public/models/car.glb Wheel_FL
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, dirname, basename } from "node:path";

const argv = process.argv.slice(2);
// The act table wants SCENE units, and a model is almost always mounted under a
// group scale. Measuring the raw file and pasting the result into the table is
// how the camera ends up solving for an object six times the size of the one on
// screen.
const scaleFlag = argv.find((a) => a.startsWith("--scale="));
const SCALE = scaleFlag ? Number(scaleFlag.split("=")[1]) : 1;
const [modelArg, nodeName] = argv.filter((a) => !a.startsWith("--"));
if (!modelArg) {
  console.error("usage: node scripts/measure-model.mjs <path-to-model> [nodeName] [--scale=N]");
  process.exit(1);
}

const pwDir = process.env.PW_DIR ?? process.cwd();
const { chromium } = await import(`${resolve(pwDir)}/node_modules/playwright/index.mjs`);

const threeRoot = resolve(process.cwd(), "node_modules/three");
const modelPath = resolve(modelArg);
const modelDir = dirname(modelPath);
const MIME = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ktx2": "image/ktx2",
  ".js": "text/javascript",
  ".wasm": "application/wasm",
};

// Serve the model's own directory so external .bin and texture files resolve
// exactly as they will in the build.
const server = createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent((req.url ?? "/").split("?")[0]);
    // A real origin. Dynamic import from about:blank has none, and the module
    // fetch is rejected before it ever reaches a handler.
    if (rel === "/") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<!doctype html><meta charset=utf-8><title>measure</title>");
      return;
    }
    // three, out of the project's own node_modules, so the measurement uses the
    // same version the site renders with.
    // The example loaders, served under a path that preserves their own folder
    // structure: GLTFLoader reaches sideways for `../utils/BufferGeometryUtils`
    // and flattening it into one directory 404s on that import.
    if (rel.startsWith("/__jsm/")) {
      const src = await readFile(resolve(threeRoot, "examples/jsm", rel.slice("/__jsm/".length)), "utf8");
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(src.replace(/from\s+["']three["']/g, 'from "/__three/three.module.js"'));
      return;
    }
    // The whole build directory: three.module.js re-exports three.core.js, and
    // serving only the entry point 404s on the very next request.
    if (rel.startsWith("/__three/")) {
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(await readFile(resolve(threeRoot, "build", rel.slice("/__three/".length))));
      return;
    }
    const file = resolve(modelDir, `.${rel}`);
    if (!file.startsWith(modelDir)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
      "access-control-allow-origin": "*",
    });
    res.end(body);
  } catch (error) {
    if (process.env.DEBUG_MEASURE) console.error("  server 404:", req.url, String(error).slice(0, 160));
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.error("  browser:", m.text());
});

const threeUrl = `http://127.0.0.1:${port}/__three/three.module.js`;
// Resolve three and its loader out of the project's own node_modules so the
// measurement uses the same version the site renders with.

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });

const result = await page.evaluate(
  async ({ url, threeUrl, nodeName }) => {
    const THREE = await import(threeUrl);
    const { GLTFLoader } = await import("/__jsm/loaders/GLTFLoader.js");
    const gltf = await new GLTFLoader().loadAsync(url);
    const root = nodeName ? gltf.scene.getObjectByName(nodeName) : gltf.scene;
    if (!root) {
      const names = [];
      gltf.scene.traverse((o) => o.name && names.push(o.name));
      return { error: `No node named "${nodeName}"`, names: names.slice(0, 60) };
    }
    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    let meshes = 0;
    let triangles = 0;
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      meshes += 1;
      const index = o.geometry.getIndex();
      triangles += index ? index.count / 3 : o.geometry.getAttribute("position").count / 3;
    });
    const names = [];
    gltf.scene.traverse((o) => o.name && names.push(o.name));
    return {
      size: size.toArray(),
      centre: centre.toArray(),
      min: box.min.toArray(),
      max: box.max.toArray(),
      meshes,
      triangles,
      names: names.slice(0, 40),
    };
  },
  { url: `http://127.0.0.1:${port}/${basename(modelPath)}`, threeUrl, nodeName: nodeName ?? null },
);

await browser.close();
server.close();

if (result.error) {
  console.error(result.error);
  console.error("Nodes in this file:\n  " + result.names.join("\n  "));
  process.exit(1);
}

const [w, h, d] = result.size.map((n) => Math.round(n * SCALE * 1000) / 1000);
const round = (n) => Math.round(n * 1000) / 1000;
console.log(`\n${basename(modelPath)}${nodeName ? ` — node "${nodeName}"` : ""}`);
console.log(`  size    ${w} x ${h} x ${d}   (x, y, z in scene units)`);
console.log(`  centre  ${result.centre.map(round).join(", ")}`);
console.log(`  bounds  min ${result.min.map(round).join(", ")}   max ${result.max.map(round).join(", ")}`);
console.log(`  meshes  ${result.meshes}   triangles ${Math.round(result.triangles).toLocaleString()}`);
console.log(
  `\nFor the act table:  subject: { w: ${w}, h: ${h} }` +
    (SCALE === 1
      ? "\n  (raw file units. If the model is mounted under a group scale, re-run\n" +
        "   with --scale=<that number>: the table is in SCENE units, not file units.)"
      : `   [x${SCALE} group scale applied]`),
);
if (d > w * 1.3) {
  console.log(
    `\n  This model is deeper (${d}) than it is wide (${w}). Framing either END of it\n` +
      `  means moving the look-at in Z, so give TARGET_Z real keys. Confirm which way\n` +
      `  the nose points by RENDERING it: a manifest that says "-Z" and a model that\n` +
      `  faces +Z look identical to every automated check.`,
  );
}
