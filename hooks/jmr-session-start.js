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

function readSkill(name) {
  try {
    const p = path.join(__dirname, '..', 'skills', name, 'SKILL.md');
    const raw = fs.readFileSync(p, 'utf8');
    return raw.replace(/^---[\s\S]*?---\n/, '').trim();
  } catch (_) {
    return '';
  }
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

  const standing = readSkill('jmr-standing-rules');
  const gate = readSkill('jmr-build-test-lint-gate');

  const parts = [];
  if (standing) parts.push(standing);
  if (gate) parts.push(gate);
  parts.push(
    [
      '## Stack-scoped skills available on demand',
      '',
      'Task-scoped skills activate when the relevant files are edited:',
      '- `trpc-procedure`, `bdd-router-tests` — API procedures.',
      '- `knex-migration` — DB migrations.',
      '- `react-tsx-component`, `supabase-auth`, `tanstack-trpc-query` — web.',
      '- `sst-infra` — infrastructure.',
      '- `naming-imports-exports`, `code-quality` — everything.',
      '',
      'Run `/jmr-help` for the full catalogue.',
    ].join('\n')
  );

  if (!checkStatuslineConfigured()) {
    parts.push(
      '\n_Tip: the jmrsquared-standards statusline shows `[JMR: <branch>@<stage>]`. Add `hooks/jmr-statusline.sh` to your Claude Code `settings.json` `statusLine.command` to enable it._'
    );
  }

  process.stdout.write(parts.join('\n\n'));
  process.stdout.write('\n');
  process.exit(0);
})();
