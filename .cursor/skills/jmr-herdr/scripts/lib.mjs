// Pure logic for jmr-herdr. Everything here is deterministic so it can be
// tested; helper.mjs owns every call to herdr and the filesystem.

import path from 'node:path'

export const MAX_HELPERS = 4
// Helpers 1-3 stack in a column beside the parent. A fourth would leave each
// pane too short to read, so overflow goes to a tab of its own.
export const MAX_SPLIT_HELPERS = 3
export const HELPER_TAB_LABEL = 'jmr helpers'
// A pane narrower than this cannot hold two readable agent UIs side by side.
const WIDE_PANE_COLS = 120

// The user's own naming: one letter for the agent kind, then the project.
const KIND_LETTERS = {
  claude: 'c',
  pi: 'p',
  cursor: 'u',
  opencode: 'o',
  codex: 'x',
  gemini: 'g',
  copilot: 'h',
  amp: 'a',
  droid: 'd',
}

// Herdr reports the agent label it detected; `agent start` wants a kind.
// The two only differ for Antigravity.
const LABEL_TO_KIND = { antigravity: 'agy' }
export const kindFromAgentLabel = (label) =>
  typeof label === 'string' && label ? LABEL_TO_KIND[label] ?? label : null

// When a pane's foreground process is not an agent (a loop runner, or a
// `claude -p` started by one), the agent that called this script is one of
// its ancestors. `chain` lists them nearest first, each as its command line.
// A node or bun shim counts by the script it runs (`node …/bin/claude`), and
// a versioned install by its folder (`~/.local/share/claude/versions/2.1.308`).
const SHIMS = new Set(['node', 'bun', 'deno'])
const VERSIONED = /\/([a-z]+)\/versions\/[^/]+$/
const commandName = (word) => VERSIONED.exec(word ?? '')?.[1] ?? path.basename(word ?? '').replace(/\.(c|m)?js$/, '')
export const agentFromAncestors = (chain) => {
  for (const args of chain ?? []) {
    const argv = String(args).trim().split(/\s+/).filter(Boolean)
    const head = commandName(argv[0])
    const name = SHIMS.has(head) ? commandName(argv[1]) : head
    const kind = kindFromAgentLabel(name)
    if (kind && Object.hasOwn(KIND_LETTERS, kind)) return { kind, argv }
  }
  return null
}

const NAME = /^[a-z][a-z0-9_-]{0,31}$/
export const isAgentName = (value) => typeof value === 'string' && NAME.test(value)

export const slugify = (text, max = 32) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '')

// `c-skills-review`: kind letter, repo, role. Herdr caps names at 32 chars,
// so the repo part gives way first and the role always survives.
export const helperName = ({ kind, repo, role }) => {
  const letter = KIND_LETTERS[kind] ?? (slugify(kind, 3) || 'a')
  const r = slugify(role, 20) || 'helper'
  const room = 32 - letter.length - r.length - 2
  const p = room > 0 ? slugify(repo, room) : ''
  const name = [letter, p, r].filter(Boolean).join('-')
  return /^[a-z]/.test(name) ? name : `a-${name}`.slice(0, 32)
}

// Copy only the flags that set how much the helper may do without asking,
// and only between agents of the same kind. A helper must never run with
// more permission than the agent that started it.
const PASSTHROUGH = {
  claude: { bare: ['--dangerously-skip-permissions'], valued: ['--permission-mode', '--model'] },
  codex: {
    bare: ['--dangerously-bypass-approvals-and-sandbox', '--full-auto'],
    valued: ['--ask-for-approval', '-a', '--sandbox', '-s', '--model', '-m'],
  },
}
export const inheritedFlags = (parentKind, helperKind, argv) => {
  if (parentKind !== helperKind) return []
  const rules = PASSTHROUGH[helperKind]
  if (!rules || !Array.isArray(argv)) return []
  const out = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const [flag, inline] = arg.split(/=(.*)/s)
    if (rules.bare.includes(arg)) out.push(arg)
    else if (rules.valued.includes(flag)) {
      if (inline !== undefined) out.push(arg)
      else if (i + 1 < argv.length) out.push(arg, argv[++i])
    }
  }
  return out
}

// Where the next helper goes. The first splits off the parent; the rest
// stack under the previous helper so the parent keeps its full height.
export const placement = ({ parentRect, liveSplitHelpers, lastHelperPane, helperTab }) => {
  if (liveSplitHelpers >= MAX_SPLIT_HELPERS) {
    return helperTab ? { mode: 'split', target: helperTab.lastPane, direction: 'down' } : { mode: 'tab' }
  }
  if (liveSplitHelpers > 0 && lastHelperPane) {
    return { mode: 'split', target: lastHelperPane, direction: 'down' }
  }
  const wide = (parentRect?.width ?? 0) >= WIDE_PANE_COLS
  return { mode: 'split', target: null, direction: wide ? 'right' : 'down' }
}

// The protocol every helper follows, appended to whatever the parent wrote.
// The marker file is the completion signal because screen scraping is not
// reliable across agent UIs.
export const briefWithProtocol = ({ brief, name, reportPath, donePath, depth, mayNest = false }) =>
  [
    brief.trim(),
    '',
    '---',
    '',
    `You are \`${name}\`, a helper agent started by another agent in a Herdr pane beside it.`,
    'Work only on the task above. The parent agent reads your report; the user may watch this pane.',
    '',
    'When you finish, or if you cannot continue:',
    `1. Write your full report as Markdown to \`${reportPath}\`. Lead with the answer or the outcome, then the evidence (files, commands run and their results).`,
    `2. As your very last action, create the empty file \`${donePath}\`.`,
    '3. Reply in this pane with one line: `JMR-DONE` followed by the report path.',
    '',
    'Do not commit, push, merge or deploy unless the task above says to. If you need a decision from the user, write the question in the report and finish.',
    depth >= 1 && !mayNest
      ? 'Do not start helper agents of your own. Use your built-in subagents if you must split this work further.'
      : '',
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n')
    .trim() + '\n'

export const kickoffPrompt = (briefPath) =>
  `Read your brief at ${briefPath} and carry it out. Follow its reporting steps exactly.`

// `once` hands an agent one task, often a slash command such as
// `/jmr-cycle payments`. The brief says how to run it, and that the report is
// the final reply, so a caller that parses the reply's last lines (the
// `jmr-cycle` loop reads `CYCLE_RESULT`) can parse the report the same way.
export const onceBrief = (task) =>
  [
    `Your task: ${task.trim()}`,
    '',
    task.trim().startsWith('/')
      ? 'That is a slash command: run the skill it names with the arguments after it, exactly as if the user had typed it.'
      : '',
    'Your report is your final reply, word for word, including its last lines.',
  ]
    .filter(Boolean)
    .join('\n')

// The task is the last argument, which is where `$CYCLE loop` appends its
// prompt. Anything between `--` and the task is passed to the agent as flags.
export const splitOnceArgs = ({ positional, rest }) => {
  if (rest?.length) return { task: rest.at(-1), agentFlags: rest.slice(0, -1) }
  return { task: positional?.at(-1) ?? null, agentFlags: [] }
}
