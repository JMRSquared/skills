#!/usr/bin/env node
// Checks published words (video scripts, on-screen text, page copy) against the
// jmr-plain-language rules a search can catch. It cannot judge meaning, so a clean
// result only means the read-through in references/surfaces.md is still worth doing.
//
//   check-copy.mjs [--allow FILE] [--json] PATH...
//
// PATH is a .html, .txt or .md file or a folder of .html files. The allow file holds
// wording the client wrote or the user asked for, one phrase per line.
// Exit 0 clean, 1 hits found, 2 bad usage or no text to check.

import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRAGMENT_MAX_WORDS = 6;
const SLOGAN_SENTENCE_MAX_WORDS = 5;
const REPEATED_LINE_MIN_WORDS = 3;
const SKIPPED_FOLDERS = new Set(['node_modules', '.hyperframes', 'assets', 'context', 'qa', 'work']);

const NUMBER_WORD = '(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\\d+)';
// The noun can't be another number, so a spoken phone number ("seven four, eight four") passes.
const COUNT_PAIR = new RegExp(`\\b${NUMBER_WORD} (?!${NUMBER_WORD}\\b)[a-z-]+, ${NUMBER_WORD} (?!${NUMBER_WORD}\\b)[a-z-]+\\b`, 'i');
const STARTS_WITH_NUMBER = new RegExp(`^(?:${NUMBER_WORD}|one|fifty|hundred)(?:\\W|$)`, 'i');

const PATTERNS = [
  ['em-dash', /—|\s–\s/, 'Use a comma, colon or full stop.'],
  ['comma-and', /,\s+and\b/i, 'Drop the comma or split the sentence.'],
  ['count-pair', COUNT_PAIR, 'Write a sentence: "The code is in five apps and three shared packages."'],
  ['no-x-just-y', /\bno [^.!?]{1,40}[.!?]\s+(?:no [^.!?]{1,40}[.!?]\s+)*just\b/i, 'State the positive fact on its own.'],
  ['contrast', /\b(?:not just\b|not only\b|less [a-z]+, more [a-z]+|(?:it|this|that)(?:'s| is) not [^.!?]{1,40}[,;.] (?:it|this|that)(?:'s| is)\b|(?:it|this|that) isn't [^.!?]{1,40}[,;.] (?:it|this|that)(?:'s| is)\b)/i, 'State the positive fact on its own.'],
  ['stock-phrase', /\b(?:here's the (?:thing|trap|catch|twist|kicker|trick)|the best part|let that sink in|read that again|that is the real|that's the real|at its core|the real question|look no further|welcome to the future|meet the future)\b/i, 'Delete the setup and state the fact.'],
  ['puffery', /\b(?:delv(?:e|es|ing)|showcas(?:e|es|ing)|underscor(?:e|es|ing)|boasts?|garners?|bolsters?|empower(?:s|ing)?|leverag(?:e|es|ing)|utili[sz](?:e|es|ing)|harness(?:es|ing)?|unveil(?:s|ing)?|embark(?:s|ing)?|seamless(?:ly)?|crucial|pivotal|intricate|meticulous(?:ly)?|multifaceted|groundbreaking|cutting[- ]edge|tapestry|testament|synerg(?:y|ies)|elevat(?:e|es|ing)|unlock(?:s|ing)?|supercharg(?:e|es|ing)|revolutioni[sz](?:e|es|ing)|game[- ]chang(?:er|ing))\b/i, 'Say what it does in plain words.'],
  ['emoji', /\p{Emoji_Presentation}/u, 'Remove the emoji.'],
];

const VERB_BASES = 'be am is are was were been being do does did done have has had can could will would shall should may might must get got book call see run put make take find send ask choose pick know need want pay start reach help work give show tell keep come go cut build fix print install place quote use try visit order plan open sell buy cover carry drive bring serve hire rent check compare read watch meet join learn save win grow look feel hear say talk speak write text email let lets love like trust count earn reply answer deliver move travel park stay live leave wear cook eat drink sleep clean paint repair care treat teach train cost mean last arrive stand sit ride add follow agree accept decide'.split(' ');
const VERBISH = new Set(['we', 'you', 'i', 'they', 'he', 'she', 'it']);
for (const verb of VERB_BASES) {
  VERBISH.add(verb);
  VERBISH.add(`${verb}s`);
  VERBISH.add(`${verb}es`);
}

const words = (text) => text.toLowerCase().replace(/[‘’]/g, "'").replace(/[^\p{L}\p{N}'\s-]/gu, ' ').split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));

// A later word ending in -s is usually a verb ("Flippy introduces people"), unless the
// sentence opens with a count ("Five apps."). Missing a fragment costs less than a false alarm.
const hasVerb = (sentence, list) => list.some((word, index) => (
  VERBISH.has(word)
  || /n't$|'(re|ll|ve|d|m|s)$/.test(word)
  || (index > 0 && /[a-z]s$/.test(word) && !STARTS_WITH_NUMBER.test(sentence))
));

// A full stop inside a domain or a number has no space after it, so this splits only at
// real sentence ends.
const sentencesOf = (block) => (block.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)|[.!?]+/g) ?? [])
  .map((part) => part.trim())
  .filter(Boolean);

// Code cards in a film are often styled divs, not <pre>, so their text reaches this check.
const looksLikeCode = (block) => /^(?:\/\/|#!|\/\*|\*\s)|=>|\(\);?$|[{};]$|\b(?:const|import|return|await|function)\b.*[=(]/.test(block);

const removeAllowed = (block, allow) => allow.reduce(
  (text, phrase) => text.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' '),
  block,
).replace(/\s+/g, ' ').trim();

const isFullStopSentence = (sentence) => /[^.]\.$/.test(sentence);

export function checkBlocks(blocks, { allow = [], flagRepeats = false, pairAcrossBlocks = true } = {}) {
  const hits = [];
  const add = (code, text, fix) => hits.push({ code, text: text.slice(0, 140), fix });
  const cleaned = blocks.filter((block) => !looksLikeCode(block)).map((block) => removeAllowed(block, allow)).filter(Boolean);
  const seen = new Map();
  let previous = null;

  for (const block of cleaned) {
    if (!pairAcrossBlocks) previous = null;
    const sentences = sentencesOf(block);

    for (const [code, pattern, fix] of PATTERNS) {
      if (pattern.test(block)) add(code, block, fix);
    }

    for (const sentence of sentences) {
      const list = words(sentence);
      const endsInFullStop = isFullStopSentence(sentence) && list.length > 0;

      // Mid-paragraph, "Now follow one message." is ordinary speech. Alone, as a heading or a
      // label, the same shape is the ad-copy fragment.
      if (sentences.length === 1 && endsInFullStop && list.length <= FRAGMENT_MAX_WORDS && !hasVerb(sentence, list)) {
        add('fragment', sentence, 'Write a whole sentence that says what this is.');
      }

      // A figure makes a line a fact people can use ("Drop it off by 10."), so it can't be a slogan.
      const isSloganLength = endsInFullStop && list.length <= SLOGAN_SENTENCE_MAX_WORDS && !/\d/.test(sentence);
      if (isSloganLength && previous) {
        add('slogan-pair', `${previous} ${sentence}`, 'Join them into one ordinary sentence a person would say out loud.');
      }
      previous = isSloganLength ? sentence : null;

      const key = list.join(' ');
      if (flagRepeats && list.length >= REPEATED_LINE_MIN_WORDS) {
        if (seen.has(key)) add('repeated-line', sentence, 'Say it once. A line repeated as a refrain reads as a slogan.');
        seen.set(key, true);
      }
    }
  }
  return hits;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…' };

const decodeEntities = (text) => text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, name) => {
  if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? match;
  const isHex = name[1].toLowerCase() === 'x';
  return String.fromCodePoint(Number.parseInt(name.slice(isHex ? 2 : 1), isHex ? 16 : 10));
});

const BLOCK_TAGS = 'address|article|aside|blockquote|button|caption|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|label|li|main|nav|ol|p|section|summary|table|td|th|tr|ul';

const isWording = (value) => typeof value === 'string'
  && /\s|^\p{L}+$/u.test(value.trim())
  && !/^(?:#|https?:|data:|\.{0,2}\/|assets\/)/.test(value.trim());

// Hyperframes can hold on-screen text in JSON attributes: `default` in
// data-composition-variables and each value in data-variable-values.
const variableWording = (html) => [...html.matchAll(/\bdata-(composition-variables|variable-values)\s*=\s*(?:'([^']*)'|"([^"]*)")/gi)]
  .flatMap(([, kind, single, double]) => {
    try {
      const parsed = JSON.parse(decodeEntities(single ?? double));
      const values = kind.toLowerCase() === 'variable-values'
        ? Object.values(parsed)
        : parsed.filter((variable) => variable.type === 'string').map((variable) => variable.default);
      return values.filter(isWording);
    } catch {
      return [];
    }
  });

export function htmlToBlocks(html) {
  const uncommented = html.replace(/<!--[\s\S]*?-->/g, ' ');
  // A <template> stays in: Hyperframes requires every scene's markup to live inside one.
  const visible = uncommented
    .replace(/<(head|script|style|svg|pre|code|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\b[^>]*>/gi, ' ')
    .replace(new RegExp(`</?(?:${BLOCK_TAGS})\\b[^>]*>`, 'gi'), '\n')
    .replace(/<[^>]+>/g, '');
  const blocks = decodeEntities(visible).split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return [...blocks, ...variableWording(uncommented)];
}

export function textToBlocks(text) {
  return text.replace(/^```[\s\S]*?^```/gm, ' ').split('\n')
    .map((line) => line.replace(/^\s*\d+\s*\|\s*/, '').trim())
    .filter(Boolean);
}

const fail = (message) => {
  console.error(message);
  process.exit(2);
};

const htmlFilesIn = (folder) => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
  if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : htmlFilesIn(join(folder, entry.name));
  return extname(entry.name) === '.html' ? [join(folder, entry.name)] : [];
});

const expandPath = (path) => {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) fail(`check-copy: ${path} does not exist.`);
  return stat.isDirectory() ? htmlFilesIn(path) : [path];
};

const parseArgs = (argv) => {
  const options = { allowFile: null, json: false, paths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--json') options.json = true;
    else if (argv[index] === '--allow') options.allowFile = argv[++index];
    else options.paths.push(argv[index]);
  }
  return options;
};

const readAllowList = (file) => {
  if (!file) return [];
  return readFileSync(file, 'utf8').split('\n').map((line) => line.trim()).filter(Boolean);
};

const main = () => {
  const { allowFile, json, paths } = parseArgs(process.argv.slice(2));
  if (!paths.length) fail('usage: check-copy.mjs [--allow FILE] [--json] PATH...');

  const allow = readAllowList(allowFile);
  const files = paths.flatMap(expandPath);
  let blockCount = 0;
  const results = files.flatMap((file) => {
    const raw = readFileSync(file, 'utf8');
    const isHtml = extname(file) === '.html';
    const blocks = isHtml ? htmlToBlocks(raw) : textToBlocks(raw);
    blockCount += blocks.length;
    return checkBlocks(blocks, { allow, flagRepeats: !isHtml, pairAcrossBlocks: isHtml }).map((hit) => ({ file, ...hit }));
  });

  if (!blockCount) fail(`check-copy: found no text in ${paths.join(', ')}. A check that read nothing is not a pass.`);

  if (json) console.log(JSON.stringify(results, null, 2));
  else {
    for (const { file, code, text, fix } of results) console.log(`${code}: "${text}" (${file}). ${fix}`);
    console.log(results.length
      ? `${results.length} plain-language hits in ${files.length} files. Rewrite each one. Add a phrase to the allow file only if the client wrote it or the user asked for it.`
      : `plain language: nothing a search can catch in ${blockCount} lines. Now do the read-through; slogans with a verb need a person's eye.`);
  }
  process.exit(results.length ? 1 : 0);
};

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
