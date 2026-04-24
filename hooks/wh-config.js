'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

function getConfigDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function getFlagPath() {
  return path.join(getConfigDir(), '.wh-active');
}

function safeWriteFlag(flagPath, content) {
  try {
    const parent = path.dirname(flagPath);

    let parentStat;
    try {
      parentStat = fs.lstatSync(parent);
    } catch (_) {
      return false;
    }
    if (parentStat.isSymbolicLink()) return false;

    try {
      const existing = fs.lstatSync(flagPath);
      if (existing.isSymbolicLink()) return false;
    } catch (_) {
      // OK — file doesn't exist yet
    }

    const tmp = `${flagPath}.tmp.${process.pid}.${Date.now()}`;
    const flags = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC |
                  (fs.constants.O_NOFOLLOW || 0);
    const fd = fs.openSync(tmp, flags, 0o600);
    try {
      fs.writeSync(fd, String(content));
    } finally {
      fs.closeSync(fd);
    }

    fs.renameSync(tmp, flagPath);
    return true;
  } catch (_) {
    return false;
  }
}

function resolveWorktreeContext() {
  try {
    const branch = execSync('git branch --show-current', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
      timeout: 1000,
    }).trim();

    let stage = '';
    try {
      const cwd = process.cwd();
      const candidate = path.join(cwd, 'CLAUDE.md');
      if (fs.existsSync(candidate)) {
        const text = fs.readFileSync(candidate, 'utf8');
        const m = text.match(/Active Development Setup[\s\S]*?stage[:\s]+([A-Za-z0-9_-]+)/i);
        if (m) stage = m[1];
      }
    } catch (_) { /* ignore */ }

    return { branch, stage };
  } catch (_) {
    return { branch: '', stage: '' };
  }
}

module.exports = {
  getConfigDir,
  getFlagPath,
  safeWriteFlag,
  resolveWorktreeContext,
};
