#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  getConfigDir,
  getFlagPath,
  safeWriteFlag,
  resolveWorktreeContext,
} = require('./jmr-config.js');

// Claude Code keeps only about 10k characters of hook output, and the full
// tier-1 skill bodies run past 25k. Inject the condensed rule body every
// other agent gets; the full skills stay available on demand. The repo and
// plugin keep it in ../rules; the standalone install copies it alongside.
function readRules() {
  const candidates = [
    path.join(__dirname, '..', 'rules', 'jmrsquared-activate.md'),
    path.join(__dirname, 'jmrsquared-activate.md'),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, 'utf8').trim();
    } catch (_) { /* try the next location */ }
  }
  return '';
}

function herdrSkillDir() {
  const dir = path.join(__dirname, '..', 'skills', 'jmr-herdr');
  return fs.existsSync(dir) ? dir : null;
}

// Outside a Herdr pane the section only costs context, so it is dropped.
function adaptHerdrSection(body) {
  const section = /## Inside Herdr[\s\S]*?\n---\n\n/;
  if (process.env.HERDR_ENV !== '1') return body.replace(section, '');
  const dir = herdrSkillDir();
  return dir ? body.split('<jmr-herdr skill dir>').join(dir) : body;
}

function checkStatuslineConfigured() {
  try {
    const settingsPath = path.join(getConfigDir(), 'settings.json');
    if (!fs.existsSync(settingsPath)) return false;
    const raw = fs.readFileSync(settingsPath, 'utf8');
    return /statusLine/.test(raw) && /jmr-statusline/.test(raw);
  } catch (_) {
    return true;
  }
}

(function main() {
  try {
    const ctx = resolveWorktreeContext();
    safeWriteFlag(getFlagPath(), `${ctx.branch}@${ctx.stage}`);
  } catch (_) { /* silent-fail */ }

  const rules = readRules();
  const parts = [];
  if (rules) parts.push(adaptHerdrSection(rules));

  if (!process.argv.includes('--cursor') && !checkStatuslineConfigured()) {
    parts.push(
      '\n_Tip: the jmrsquared-standards statusline shows `[JMR: <branch>@<stage>]`. Add `hooks/jmr-statusline.sh` to your Claude Code `settings.json` `statusLine.command` to enable it._'
    );
  }

  // Cursor's sessionStart hook takes JSON and injects `additional_context`;
  // Claude Code injects plain stdout.
  if (process.argv.includes('--cursor')) {
    process.stdout.write(JSON.stringify({ additional_context: parts.join('\n\n') }));
  } else {
    process.stdout.write(parts.join('\n\n'));
    process.stdout.write('\n');
  }
  process.exit(0);
})();
