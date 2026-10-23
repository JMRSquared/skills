import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_SPLIT_HELPERS,
  agentFromAncestors,
  onceBrief,
  splitOnceArgs,
  briefWithProtocol,
  helperName,
  inheritedFlags,
  isAgentName,
  kindFromAgentLabel,
  placement,
} from './lib.mjs'

test('helperName follows the kind-letter, repo, role convention', () => {
  assert.equal(helperName({ kind: 'claude', repo: 'skills', role: 'review' }), 'c-skills-review')
  assert.equal(helperName({ kind: 'pi', repo: 'mrmovers', role: 'tests' }), 'p-mrmovers-tests')
  assert.equal(helperName({ kind: 'cursor', repo: 'x', role: 'ui' }), 'u-x-ui')
})

test('helperName keeps the role when the repo name is long', () => {
  const name = helperName({ kind: 'claude', repo: 'jmrsquared-skills-and-more-stuff', role: 'security-review' })
  assert.ok(name.length <= 32, name)
  assert.ok(name.endsWith('-security-review'), name)
  assert.ok(isAgentName(name), name)
})

test('helperName always yields a valid herdr agent name', () => {
  for (const [kind, repo, role] of [['kimi', '123', 'R&D'], ['qodercli', '', ''], ['claude', '---', 'x']]) {
    const name = helperName({ kind, repo, role })
    assert.ok(isAgentName(name), `${kind}/${repo}/${role} -> ${name}`)
  }
})

test('kindFromAgentLabel maps antigravity and passes others through', () => {
  assert.equal(kindFromAgentLabel('antigravity'), 'agy')
  assert.equal(kindFromAgentLabel('claude'), 'claude')
  assert.equal(kindFromAgentLabel(undefined), null)
})

test('inheritedFlags copies permission flags between the same kind only', () => {
  const argv = ['/bin/claude', '--dangerously-skip-permissions', '--resume', 'abc', '--model', 'opus']
  assert.deepEqual(inheritedFlags('claude', 'claude', argv), ['--dangerously-skip-permissions', '--model', 'opus'])
  assert.deepEqual(inheritedFlags('claude', 'codex', argv), [])
  assert.deepEqual(inheritedFlags('pi', 'pi', ['pi', '--yolo']), [])
})

test('inheritedFlags handles --flag=value and a trailing valued flag', () => {
  assert.deepEqual(inheritedFlags('claude', 'claude', ['claude', '--permission-mode=plan']), ['--permission-mode=plan'])
  assert.deepEqual(inheritedFlags('codex', 'codex', ['codex', '-s', 'workspace-write', '-m']), ['-s', 'workspace-write'])
})

test('placement splits a wide parent right and a narrow one down', () => {
  assert.deepEqual(placement({ parentRect: { width: 200 }, liveSplitHelpers: 0 }), { mode: 'split', target: null, direction: 'right' })
  assert.deepEqual(placement({ parentRect: { width: 90 }, liveSplitHelpers: 0 }), { mode: 'split', target: null, direction: 'down' })
})

test('placement stacks later helpers under the last one', () => {
  assert.deepEqual(placement({ parentRect: { width: 200 }, liveSplitHelpers: 1, lastHelperPane: 'w1:p4' }), {
    mode: 'split',
    target: 'w1:p4',
    direction: 'down',
  })
})

test('placement overflows into a helper tab', () => {
  assert.deepEqual(placement({ liveSplitHelpers: MAX_SPLIT_HELPERS }), { mode: 'tab' })
  assert.deepEqual(placement({ liveSplitHelpers: MAX_SPLIT_HELPERS, helperTab: { lastPane: 'w1:p9' } }), {
    mode: 'split',
    target: 'w1:p9',
    direction: 'down',
  })
})

test('briefWithProtocol appends the report and done-marker steps', () => {
  const out = briefWithProtocol({ brief: 'Do X.\n', name: 'c-a-b', reportPath: '/r.md', donePath: '/r.done', depth: 1 })
  assert.match(out, /^Do X\./)
  assert.match(out, /`\/r\.md`/)
  assert.match(out, /create the empty file `\/r\.done`/)
  assert.match(out, /Do not start helper agents of your own/)
  assert.doesNotMatch(out, /\n\n\n/)
})

test('briefWithProtocol lets a top-level helper delegate', () => {
  const out = briefWithProtocol({ brief: 'Do X.', name: 'c-a-b', reportPath: '/r.md', donePath: '/r.done', depth: 0 })
  assert.doesNotMatch(out, /Do not start helper agents/)
})

test('agentFromAncestors finds the nearest agent above a loop runner', () => {
  const chain = [
    'node /home/u/.claude/skills/jmr-cycle/scripts/cycle.mjs loop --milestone pay',
    'claude -p --permission-mode acceptEdits /jmr-cycle pay',
    'claude --dangerously-skip-permissions',
  ]
  assert.deepEqual(agentFromAncestors(chain.slice(1)), {
    kind: 'claude',
    argv: ['claude', '-p', '--permission-mode', 'acceptEdits', '/jmr-cycle', 'pay'],
  })
  assert.equal(agentFromAncestors(chain).kind, 'claude')
  assert.equal(agentFromAncestors(chain).argv[2], '--permission-mode')
})

test('agentFromAncestors reads node shims by their script and ignores shells', () => {
  assert.equal(agentFromAncestors(['bash -c x', 'node /usr/lib/node_modules/@openai/codex/bin/codex.js --full-auto']).kind, 'codex')
  assert.equal(agentFromAncestors(['/home/u/.local/share/claude/versions/2.1.308 --dangerously-skip-permissions']).kind, 'claude')
  assert.equal(agentFromAncestors(['/usr/bin/zsh', 'herdr', 'node server.js']), null)
  assert.equal(agentFromAncestors([]), null)
})

test('briefWithProtocol lets an orchestrator start helpers of its own', () => {
  const base = { brief: 'Run it.', name: 'c-x-cycle', reportPath: '/r.md', donePath: '/r.done', depth: 1 }
  assert.match(briefWithProtocol(base), /Do not start helper agents/)
  assert.doesNotMatch(briefWithProtocol({ ...base, mayNest: true }), /Do not start helper agents/)
})

test('onceBrief runs a slash command as a skill and keeps the reply as the report', () => {
  assert.match(onceBrief('/jmr-cycle payments'), /slash command/)
  assert.match(onceBrief('/jmr-cycle payments'), /final reply, word for word/)
  assert.doesNotMatch(onceBrief('fix the build'), /slash command/)
})

test('splitOnceArgs takes the task from the end, where the cycle loop puts it', () => {
  assert.deepEqual(splitOnceArgs({ positional: [], rest: ['--permission-mode', 'acceptEdits', '/jmr-cycle pay'] }), {
    task: '/jmr-cycle pay',
    agentFlags: ['--permission-mode', 'acceptEdits'],
  })
  assert.deepEqual(splitOnceArgs({ positional: ['/jmr-cycle pay'] }), { task: '/jmr-cycle pay', agentFlags: [] })
  assert.deepEqual(splitOnceArgs({ positional: [] }), { task: null, agentFlags: [] })
})
