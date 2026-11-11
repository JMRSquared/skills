#!/usr/bin/env node
// Keeps the films of one series from sharing a template. Each film's SPEC.md lists its
// devices under "## Devices"; this compares them with the last films in the same series.
// Three reels for one client ended on the same fake comment box with the same caption pill,
// and each one passed every check on its own.
//
//   series.mjs <out> [--series <name>] [--log <file>]
//
// The series defaults to the name of the folder that holds <out>. The log defaults to
// ${XDG_CACHE_HOME:-~/.cache}/jmr-generate-video/series/<name>.jsonl. A device the client
// fixed (their opener, their end slate) is written "fixed: ..." and is never compared.
// Exit 0 and the film is logged, 1 a device repeats, 2 bad usage or no "## Devices".
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED = ['opening', 'captions', 'end card', 'call to action', 'transitions'];
export const COMPARED_FILMS = 5;
// Share of content words two descriptions have in common before they count as one device.
export const SAME_DEVICE = 0.5;
const STOP = new Set(['a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'and', 'or', 'but', 'is', 'are', 'each', 'every', 'its', 'it', 'that', 'then', 'into', 'over', 'as', 'one', 'two']);

const words = (text) => new Set(text.toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)));

export const overlap = (a, b) => {
  const x = words(a);
  const y = words(b);
  if (!x.size || !y.size) return 0;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared += 1;
  return shared / Math.min(x.size, y.size);
};

export const readDevices = (spec) => {
  const section = spec.split(/^## /m).find((part) => /^Devices\b/i.test(part));
  if (!section) return null;
  const devices = {};
  for (const line of section.split('\n').slice(1)) {
    const m = line.match(/^\s*[-*]\s*\**([a-z ]+?)\**\s*:\s*(.+)$/i);
    if (m) devices[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return devices;
};

export const repeats = (devices, earlier) => {
  const found = [];
  for (const film of earlier) {
    for (const key of REQUIRED) {
      const mine = devices[key] ?? '';
      const theirs = film.devices[key] ?? '';
      if (/^fixed:/i.test(mine) || /^fixed:/i.test(theirs)) continue;
      if (overlap(mine, theirs) >= SAME_DEVICE) found.push(`${key} repeats ${film.out}: "${theirs}"`);
    }
  }
  return found;
};

const option = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};

const main = () => {
  const out = process.argv[2] && resolve(process.argv[2]);
  if (!out || !existsSync(out)) {
    console.error('series needs the output folder, for example video-output-<timestamp>.');
    process.exit(2);
  }
  const specPath = [join(out, 'composition', 'SPEC.md'), join(out, 'SPEC.md')].find(existsSync);
  const devices = specPath ? readDevices(readFileSync(specPath, 'utf8')) : null;
  if (!devices) {
    console.error(`series: no "## Devices" section in SPEC.md. List ${REQUIRED.join(', ')}, one "- key: description" line each.`);
    process.exit(2);
  }
  const missing = REQUIRED.filter((key) => !devices[key]);
  if (missing.length) {
    console.error(`series: "## Devices" lacks ${missing.join(', ')}. Describe each in a plain sentence.`);
    process.exit(2);
  }
  const name = option('--series') ?? basename(dirname(out));
  const log = option('--log') ?? join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'jmr-generate-video', 'series', `${name}.jsonl`);
  const films = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line)) : [];
  const earlier = films.filter((film) => film.out !== out).slice(-COMPARED_FILMS);
  const found = repeats(devices, earlier);
  for (const problem of found) console.log(`SERIES: ${problem}`);
  if (found.length) {
    console.error(`${found.length} devices repeat the last films in "${name}". Choose new ones, or mark a device the client fixed as "fixed: ...".`);
    process.exit(1);
  }
  mkdirSync(dirname(log), { recursive: true });
  const kept = films.filter((film) => film.out !== out);
  kept.push({ out, at: new Date().toISOString(), devices });
  writeFileSync(log, kept.map((film) => JSON.stringify(film)).join('\n') + '\n');
  console.log(`series: compared with ${earlier.length} earlier films in "${name}" and logged this one.`);
};

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
