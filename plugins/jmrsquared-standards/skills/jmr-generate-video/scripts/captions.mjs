#!/usr/bin/env node
// Checks caption groups for breaks a viewer trips over: a group that ends on a word that
// needs the next one ("carried the" / "whole family") and a number split across two
// groups ("Nissan fourteen" / "hundred"). Reels shipped with both, and every other check passed.
//
//   captions.mjs <composition folder> [voiceover.txt]
//
// With the script, a group that ends where the script has a full stop, comma or question
// mark passes whatever its last word ("Nobody taught us that.").
// Groups are elements marked data-caption-group. A captions file without the marker is
// read one group per line, which is how generated caption markup is usually written.
// Exit 0 clean, 1 breaks found, 2 bad usage or no captions found.
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const NEEDS_NEXT = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by', 'into', 'onto', 'over', 'under', 'about', 'than',
  'and', 'or', 'but', 'so', 'that', 'because', 'if', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'is', 'was', 'are', 'were', 'be', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'i', 'we', 'very',
]);
const NUMBER = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|\d[\d,. ]*)$/;
const SKIPPED_FOLDERS = new Set(['node_modules', '.hyperframes', 'assets']);

const words = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, ' ').split(/\s+/).filter(Boolean);

// Every word of the script with whether a pause mark follows it.
export const pauseAfter = (script) => script.split(/\s+/).filter((token) => words(token).length)
  .flatMap((token) => words(token).map((word, i, all) => ({ word, pause: i === all.length - 1 && /[.,!?;:]["')\]]*$/.test(token) })));

// Captions often leave out the opener or a line shown as a title, so each caption word is
// matched to its next use in the script. Returns the pause flag for each caption word, or []
// when the words are not all in the script in that order.
export const alignPauses = (groups, script) => {
  const pauses = [];
  let at = 0;
  for (const word of groups.flatMap(words)) {
    while (at < script.length && script[at].word !== word) at += 1;
    if (at === script.length) return [];
    pauses.push(script[at].pause);
    at += 1;
  }
  return pauses;
};

export const captionProblems = (groups, pauses = []) => {
  const found = [];
  const aligned = pauses.length > 0;
  let seen = 0;
  groups.forEach((group, i) => {
    const these = words(group);
    seen += these.length;
    const last = these[these.length - 1];
    if (!last) return;
    const next = groups[i + 1] ? words(groups[i + 1])[0] : undefined;
    if (aligned && pauses[seen - 1]) return;
    if (NUMBER.test(last) && next && NUMBER.test(next)) {
      found.push(`"${group}" / "${groups[i + 1]}" splits a number. Keep it in one group`);
    } else if (NEEDS_NEXT.has(last) && next) {
      found.push(`"${group}" ends on "${last}", which needs the next word. Break the group after a whole phrase`);
    }
  });
  return found;
};

const stripTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export const readGroups = (html) => {
  const marked = [...html.matchAll(/<([a-z0-9]+)\b[^>]*\bdata-caption-group\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => stripTags(m[2]));
  if (marked.length) return marked;
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  return body.split('\n').filter((line) => /<span\b/i.test(line)).map(stripTags).filter(Boolean);
};

const captionFiles = (dir) => {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIPPED_FOLDERS.has(name)) files.push(...captionFiles(path));
    } else if (name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      if (/data-caption-group|data-track-kind="captions"|data-composition-id="captions"/.test(html) || /caption/i.test(name)) files.push({ path, html });
    }
  }
  return files;
};

const main = () => {
  const dir = process.argv[2];
  if (!dir) {
    console.error('captions needs the composition folder, for example <out>/composition.');
    process.exit(2);
  }
  const files = captionFiles(dir);
  const groups = files.flatMap((file) => readGroups(file.html));
  if (!groups.length) {
    console.log('captions: none found. Mark each caption group with data-caption-group if the film has captions.');
    process.exit(0);
  }
  const script = process.argv[3] ? readFileSync(process.argv[3], 'utf8') : '';
  const pauses = alignPauses(groups, pauseAfter(script));
  const found = captionProblems(groups, pauses);
  if (script && !pauses.length) {
    console.log('captions: the groups do not hold the same words as the script, so every group was judged without its punctuation.');
  }
  for (const problem of found) console.log(`CAPTIONS: ${problem}`);
  if (found.length) {
    console.error(`${found.length} caption breaks in ${groups.length} groups. Regroup them; the words on screen stay the same.`);
    process.exit(1);
  }
  console.log(`captions: ${groups.length} groups break at whole phrases.`);
};

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
