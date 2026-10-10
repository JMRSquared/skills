import assert from 'node:assert/strict'
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CLI = path.join(HERE, 'cycle.mjs')

const milestone = {
  version: 1,
  slug: 'payments',
  title: 'Card payments',
  base: 'main',
  branch: 'milestone/payments',
  scenarioPrefix: 'PAY',
  install: 'yarn install',
  gate: ['yarn build', 'yarn test', 'yarn lint'],
  land: 'merge',
}

const tickets = [
  { id: 'T01', title: 'Card form', body: 'Build the card form.', scenarios: ['PAY-001'] },
  { id: 'T02', title: 'Charge API', body: 'Charge a card.', blockedBy: ['T01'], scenarios: ['PAY-002'], type: 'feature' },
  { id: 'T03', title: 'Refunds', body: 'Refund a charge.', scenarios: ['PAY-003'], type: 'fix' },
]

let dir
let leaseDir
let state
let env

const readState = () => JSON.parse(readFileSync(state, 'utf8'))
const writeState = (s) => writeFileSync(state, JSON.stringify(s))

const cli = (args, extraEnv = {}, cwd = dir) => {
  const r = spawnSync('node', [CLI, ...args], { cwd, env: { ...env, ...extraEnv }, encoding: 'utf8' })
  return { code: r.status, out: r.stdout.trim() ? JSON.parse(r.stdout) : null, err: r.stderr }
}

const cliAsync = (args, cwd = dir) =>
  new Promise((resolve) => {
    const child = spawn('node', [CLI, ...args], { cwd, env })
    let stdout = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.on('close', (code) => resolve({ code, out: JSON.parse(stdout) }))
  })

const issueById = (id) => readState().issues.find((i) => i.body.includes(`"id":"${id}"`))

before(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'jmr-cycle-'))
  state = path.join(dir, 'gh-state.json')
  const wrapper = path.join(dir, 'gh')
  writeFileSync(wrapper, `#!/bin/sh\nexec node "${path.join(HERE, 'fake-gh.mjs')}" "$@"\n`)
  chmodSync(wrapper, 0o755)
  writeState({
    counter: 0,
    commentCounter: 0,
    issues: [],
    comments: [],
    prs: [],
    permissions: { owner: 'admin', teammate: 'write', stranger: 'read' },
    repo: { nameWithOwner: 'o/r', url: 'https://github.com/o/r', viewerPermission: 'WRITE', defaultBranchRef: { name: 'main' } },
  })
  env = { ...process.env, JMR_CYCLE_GH: wrapper, FAKE_GH_STATE: state, JMR_CYCLE_SETTLE_MS: '300' }

  mkdirSync(path.join(dir, 'docs/milestones/payments'), { recursive: true })
  writeFileSync(path.join(dir, 'docs/milestones/payments/milestone.json'), JSON.stringify(milestone))
  writeFileSync(path.join(dir, 'tickets.json'), JSON.stringify({ tickets }))
  mkdirSync(path.join(dir, 'src'))
  writeFileSync(path.join(dir, 'src/card.test.ts'), "it('PAY-001 shows the card form', () => {})\n")
  execFileSync('git', ['init', '-q'], { cwd: dir })

  // The lease needs a real remote for its compare-and-swap push.
  const origin = path.join(dir, 'origin.git')
  leaseDir = path.join(dir, 'lease-checkout')
  execFileSync('git', ['init', '-q', '--bare', origin])
  execFileSync('git', ['init', '-q', leaseDir])
  execFileSync('git', ['remote', 'add', 'origin', origin], { cwd: leaseDir })
})

after(() => rmSync(dir, { recursive: true, force: true }))

describe('cycle CLI', () => {
  it('rejects a tickets file with a broken graph', () => {
    writeFileSync(path.join(dir, 'bad.json'), JSON.stringify([{ ...tickets[0], blockedBy: ['T09'] }]))
    const r = cli(['validate', '--milestone', 'payments', '--tickets', 'bad.json'])
    assert.equal(r.code, 2)
    assert.match(r.err, /unknown ticket T09/)
  })

  it('fails preflight with the GitHub message when origin is missing', () => {
    const r = cli(['preflight'])
    assert.equal(r.code, 5)
    assert.match(r.err, /no "origin" remote[\s\S]*need a GitHub repository/)
  })

  it('passes preflight on a GitHub repo with write access', () => {
    execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/o/r.git'], { cwd: dir })
    const r = cli(['preflight'])
    assert.equal(r.code, 0)
    assert.equal(r.out.defaultBranch, 'main')
  })

  it('publishes tickets and a status issue, then republishes without duplicates', () => {
    const first = cli(['publish', '--milestone', 'payments', '--tickets', 'tickets.json'])
    assert.equal(first.code, 0)
    assert.equal(first.out.created.length, 3)
    assert.ok(first.out.statusIssue)

    const changed = tickets.map((t) => (t.id === 'T03' ? { ...t, body: 'Refund a charge in full.' } : t))
    writeFileSync(path.join(dir, 'tickets.json'), JSON.stringify({ tickets: changed }))
    const second = cli(['publish', '--milestone', 'payments', '--tickets', 'tickets.json'])
    assert.equal(second.out.created.length, 0)
    assert.deepEqual(second.out.updated.map((u) => u.id), ['T03'])
    assert.equal(second.out.statusIssue, first.out.statusIssue)

    writeFileSync(path.join(dir, 'fewer.json'), JSON.stringify({ tickets: changed.slice(0, 2) }))
    const third = cli(['publish', '--milestone', 'payments', '--tickets', 'fewer.json'])
    assert.deepEqual(third.out.orphans.map((o) => o.id), ['T03'])
    assert.equal(readState().issues.length, 4)
  })

  it('reports the frontier and finds the scenario test in the repo', () => {
    const r = cli(['status', '--milestone', 'payments', '--json'])
    assert.deepEqual(r.out.frontier, ['T01', 'T03'])
    assert.equal(r.out.scenarios.tested, 1)
  })

  it('lets exactly one of two racing runs claim a ticket', async () => {
    const [a, b] = await Promise.all([
      cliAsync(['claim', '--milestone', 'payments', '--ticket', 'T01', '--run', 'run-a']),
      cliAsync(['claim', '--milestone', 'payments', '--ticket', 'T01', '--run', 'run-b']),
    ])
    assert.deepEqual([a.code, b.code].sort(), [0, 3])
    const winner = a.code === 0 ? a : b
    assert.equal(winner.out.branch, 'feature/payments-t01-card-form')
    const claims = readState().comments.filter((c) => c.issue === issueById('T01').number && c.body.startsWith('jmr-cycle claim'))
    assert.equal(claims.length, 1)
    assert.ok(issueById('T01').labels.includes('jmr:in-progress'))
  })

  it('ignores claim comments from accounts without write access', () => {
    const s = readState()
    const t03 = s.issues.find((i) => i.body.includes('"id":"T03"'))
    s.comments.push({ id: ++s.commentCounter, issue: t03.number, author: 'stranger', body: 'jmr-cycle claim evil x', createdAt: new Date(Date.now() - 60e3).toISOString() })
    t03.labels.push('jmr:in-progress')
    writeState(s)
    const r = cli(['claim', '--milestone', 'payments', '--ticket', 'T03', '--run', 'run-a'])
    assert.equal(r.code, 3)
    assert.equal(r.out.holder, null)
    const cleaned = readState()
    cleaned.issues.find((i) => i.number === t03.number).labels = ['milestone:payments', 'jmr:ticket']
    writeState(cleaned)
  })

  it('refuses a third run while the claim is fresh', () => {
    const r = cli(['claim', '--milestone', 'payments', '--ticket', 'T01', '--run', 'run-c'])
    assert.equal(r.code, 3)
    assert.equal(r.out.result, 'taken')
  })

  it('names a fix ticket branch by its type', () => {
    const r = cli(['claim', '--milestone', 'payments', '--ticket', 'T03', '--run', 'run-a'])
    assert.equal(r.code, 0)
    assert.equal(r.out.branch, 'fix/payments-t03-refunds')
  })

  it('releases a claim with no progress in 24 hours', () => {
    const s = readState()
    const t03 = s.issues.find((i) => i.body.includes('"id":"T03"'))
    for (const c of s.comments) if (c.issue === t03.number) c.createdAt = new Date(Date.now() - 30 * 3600e3).toISOString()
    writeState(s)
    const r = cli(['release-stale', '--milestone', 'payments', '--run', 'run-z'])
    assert.deepEqual(r.out.released.map((x) => x.id), ['T03'])
    assert.ok(!issueById('T03').labels.includes('jmr:in-progress'))
  })

  it('closes a merged ticket and moves its dependants to the frontier', () => {
    const r = cli(['close', '--milestone', 'payments', '--ticket', 'T01', '--pr', '42'])
    assert.equal(r.code, 0)
    const status = cli(['status', '--milestone', 'payments', '--json'])
    assert.ok(status.out.frontier.includes('T02'))
    assert.equal(issueById('T01').state, 'CLOSED')
    assert.ok(!issueById('T01').labels.includes('jmr:in-progress'))
  })

  it('escalates once and leaves the ticket out of the frontier', () => {
    writeFileSync(path.join(dir, 'q.md'), 'Which provider? Options: A or B. Recommend A.')
    const first = cli(['escalate', '--milestone', 'payments', '--ticket', 'T02', '--question-file', 'q.md'])
    const second = cli(['escalate', '--milestone', 'payments', '--ticket', 'T02', '--question-file', 'q.md'])
    assert.equal(first.out.result, 'escalated')
    assert.equal(second.out.result, 'already')
    const status = cli(['status', '--milestone', 'payments', '--json'])
    assert.ok(!status.out.frontier.includes('T02'))
    assert.equal(status.out.owner[0].id, 'T02')
  })

  it('writes the status issue body with the run id', () => {
    const r = spawnSync('node', [CLI, 'status', '--milestone', 'payments', '--write', '--run', 'run-q'], { cwd: dir, env, encoding: 'utf8' })
    assert.equal(r.status, 0)
    const statusIssue = readState().issues.find((i) => i.labels.includes('jmr:status'))
    assert.match(statusIssue.body, /run-q/)
    assert.match(statusIssue.body, /jmr-status/)
  })

  it('lists open milestones from status issues', () => {
    const r = cli(['milestones'])
    assert.deepEqual(r.out.map((m) => [m.milestone, m.branch, m.base]), [['payments', 'milestone/payments', 'main']])
  })

  it('gives the lease to one of two racing holders through a compare-and-swap push', async () => {
    const lease = (run, holder, extra = []) => ['lease', '--milestone', 'payments', '--run', run, '--holder', holder, ...extra]
    const [a, b] = await Promise.all([cliAsync(lease('r1', 'mac-a'), leaseDir), cliAsync(lease('r2', 'mac-b'), leaseDir)])
    assert.deepEqual([a.code, b.code].sort(), [0, 3])
    const [winner, loser] = a.code === 0 ? [['r1', 'mac-a'], ['r2', 'mac-b']] : [['r2', 'mac-b'], ['r1', 'mac-a']]

    assert.equal(cli(lease(...winner), {}, leaseDir).out.result, 'renewed')
    assert.equal(cli(lease(...loser), {}, leaseDir).code, 3)
    assert.equal(cli(lease('r9', winner[1]), {}, leaseDir).out.result, 'took-over')
    assert.equal(cli(['unlease', '--milestone', 'payments', '--run', winner[0]], {}, leaseDir).out.result, 'not-held')
    assert.equal(cli(['unlease', '--milestone', 'payments', '--run', 'r9'], {}, leaseDir).out.result, 'released')
    assert.equal(cli(lease(...loser, ['--minutes', '0']), {}, leaseDir).out.result, 'won')
    assert.equal(cli(lease('r5', 'mac-c'), {}, leaseDir).out.result, 'won')
  })

  it('reads review verdicts only from accounts with write access', () => {
    const s = readState()
    const at = (m) => new Date(Date.now() - m * 60e3).toISOString()
    s.prs.push({
      number: 70, state: 'OPEN', baseRefName: 'milestone/payments', headRefOid: 'abc1234ffff',
      commits: [{ committedDate: at(30) }],
      comments: [
        { author: 'owner', body: 'jmr-cycle review round 1: changes\n- fix naming', createdAt: at(20) },
        { author: 'stranger', body: 'jmr-cycle review round 2: approve abc1234', createdAt: at(10) },
      ],
    })
    writeState(s)
    const r = cli(['marks', '--pr', '70'])
    assert.deepEqual([r.out.approved, r.out.needsFix, r.out.nextRound], [false, true, 2])
  })

  it('reads final review and gate verdicts from the status issue', () => {
    const s = readState()
    const statusIssue = s.issues.find((i) => i.labels.includes('jmr:status'))
    s.comments.push({ id: ++s.commentCounter, issue: statusIssue.number, author: 'owner', body: 'jmr-cycle gate pass abc1234', createdAt: new Date().toISOString() })
    s.comments.push({ id: ++s.commentCounter, issue: statusIssue.number, author: 'stranger', body: 'jmr-cycle final review abc1234: 0 findings', createdAt: new Date().toISOString() })
    writeState(s)
    assert.deepEqual(cli(['marks', '--milestone', 'payments']).out, { finalReview: null, gatePass: ['abc1234'], gateFail: [] })
  })

  it('reports CI as none, pending, fail or pass', () => {
    assert.equal(cli(['checks', '--pr', '9']).out.verdict, 'none')
    const s = readState()
    s.checks = { 9: [{ name: 'ci', bucket: 'pending' }], 10: [{ name: 'ci', bucket: 'fail' }], 11: [{ name: 'ci', bucket: 'pass' }] }
    writeState(s)
    assert.equal(cli(['checks', '--pr', '9']).out.verdict, 'pending')
    assert.deepEqual(cli(['checks', '--pr', '10']).out, { verdict: 'fail', failing: ['ci'] })
    assert.equal(cli(['checks', '--pr', '11']).out.verdict, 'pass')
  })

  it('tracks the landing pull request and finishes the milestone once it merges', () => {
    assert.equal(cli(['landing', '--milestone', 'payments']).out.state, 'none')
    const s = readState()
    s.prs.push({ number: 50, url: 'u50', state: 'OPEN', baseRefName: 'main', headRefName: 'milestone/payments', headRefOid: 'abc', isCrossRepository: false })
    s.prs.push({ number: 51, url: 'u51', state: 'OPEN', baseRefName: 'main', headRefName: 'milestone/payments', headRefOid: 'evil', isCrossRepository: true })
    writeState(s)
    assert.deepEqual(cli(['landing', '--milestone', 'payments']).out.number, 50)
    const merged = readState()
    merged.prs.find((p) => p.number === 50).state = 'MERGED'
    writeState(merged)
    assert.equal(cli(['landing', '--milestone', 'payments']).out.state, 'merged')
    assert.equal(cli(['finish', '--milestone', 'payments', '--pr', '50']).code, 0)
    assert.ok(readState().issues.find((i) => i.labels.includes('jmr:status')).state === 'CLOSED')
    assert.deepEqual(cli(['milestones']).out, [])
    assert.equal(cli(['landing', '--milestone', 'payments']).out.state, 'merged')
  })

  it('ignores pull requests from accounts without write access', () => {
    const s = readState()
    s.prs.push({
      number: 60, url: 'u60', state: 'OPEN', baseRefName: 'milestone/payments', headRefName: 'feature/x',
      isCrossRepository: false, author: { login: 'stranger' },
      body: '<!-- jmr-pr {"milestone":"payments","id":"T03"} -->',
    })
    writeState(s)
    const status = cli(['status', '--milestone', 'payments', '--json'])
    assert.equal(status.out.tickets.find((t) => t.id === 'T03').pr, null)

    const teammate = readState()
    teammate.prs.find((p) => p.number === 60).author.login = 'teammate'
    writeState(teammate)
    const after = cli(['status', '--milestone', 'payments', '--json'])
    assert.equal(after.out.tickets.find((t) => t.id === 'T03').pr, 60)
  })
})
