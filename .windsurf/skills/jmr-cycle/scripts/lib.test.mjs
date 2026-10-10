import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildIssueBody,
  checksVerdict,
  leaseDecision,
  reviewState,
  statusMarks,
  computeStatus,
  decideClaim,
  findScenarioTitles,
  isStaleClaim,
  parseMarker,
  parseResults,
  renderStatusMarkdown,
  ticketBranch,
  validateMilestone,
  validateTickets,
} from './lib.mjs'

const HOUR = 3600 * 1000
const NOW = Date.parse('2026-10-10T12:00:00Z')
const ago = (hours) => new Date(NOW - hours * HOUR).toISOString()

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

const ticket = (id, extra = {}) => ({
  id,
  title: `ticket ${id}`,
  body: 'Do the thing.',
  blockedBy: [],
  scenarios: [],
  ...extra,
})

const issue = (t, extra = {}) => ({
  number: Number(t.id.slice(1)) + 100,
  title: `[payments] ${t.id} ${t.title}`,
  body: buildIssueBody('payments', t),
  state: 'OPEN',
  labels: [{ name: 'milestone:payments' }, { name: 'jmr:ticket' }],
  url: `https://github.com/o/r/issues/${Number(t.id.slice(1)) + 100}`,
  ...extra,
})

describe('validateMilestone', () => {
  it('accepts a complete milestone', () => {
    assert.deepEqual(validateMilestone(milestone), [])
  })

  it('requires the milestone branch to be milestone/<slug>', () => {
    const errors = validateMilestone({ ...milestone, branch: 'feature/payments' })
    assert.ok(errors.some((e) => e.includes('milestone/payments')))
  })

  it('accepts fix commands and rejects a fix that is not a list', () => {
    assert.deepEqual(validateMilestone({ ...milestone, fix: ['yarn lint:fix'] }), [])
    assert.equal(validateMilestone({ ...milestone, fix: 'yarn lint:fix' }).length, 1)
  })

  it('rejects an unknown land mode and a lowercase scenario prefix', () => {
    const errors = validateMilestone({ ...milestone, land: 'none', scenarioPrefix: 'pay' })
    assert.equal(errors.length, 2)
  })
})

describe('validateTickets', () => {
  it('accepts a valid graph', () => {
    const tickets = [ticket('T01', { scenarios: ['PAY-001'] }), ticket('T02', { blockedBy: ['T01'] })]
    assert.deepEqual(validateTickets(milestone, tickets), [])
  })

  it('reports unknown blockers, duplicate ids and duplicate scenarios', () => {
    const tickets = [
      ticket('T01', { scenarios: ['PAY-001'] }),
      ticket('T01', { scenarios: ['PAY-001'] }),
      ticket('T03', { blockedBy: ['T09'] }),
    ]
    const errors = validateTickets(milestone, tickets)
    assert.ok(errors.some((e) => e.includes('duplicate ticket id T01')))
    assert.ok(errors.some((e) => e.includes('PAY-001')))
    assert.ok(errors.some((e) => e.includes('T09')))
  })

  it('reports a dependency cycle', () => {
    const tickets = [ticket('T01', { blockedBy: ['T02'] }), ticket('T02', { blockedBy: ['T01'] })]
    assert.ok(validateTickets(milestone, tickets).some((e) => e.includes('cycle')))
  })

  it('reports an unknown ticket type', () => {
    const errors = validateTickets(milestone, [ticket('T01', { type: 'feat' })])
    assert.ok(errors.some((e) => e.includes('type')))
  })

  it('reports a scenario id with the wrong prefix', () => {
    const errors = validateTickets(milestone, [ticket('T01', { scenarios: ['AT-001'] })])
    assert.ok(errors.some((e) => e.includes('AT-001')))
  })
})

describe('markers', () => {
  it('round-trips ticket data through the issue body', () => {
    const t = ticket('T02', { blockedBy: ['T01'], scenarios: ['PAY-002'], serial: 'db' })
    const marker = parseMarker('jmr-ticket', buildIssueBody('payments', t))
    assert.deepEqual(marker, {
      milestone: 'payments',
      id: 'T02',
      blockedBy: ['T01'],
      type: 'feature',
      scenarios: ['PAY-002'],
      serial: 'db',
    })
  })

  it('returns null when the marker is missing or broken', () => {
    assert.equal(parseMarker('jmr-ticket', 'plain body'), null)
    assert.equal(parseMarker('jmr-ticket', '<!-- jmr-ticket {broken -->'), null)
  })
})

describe('ticketBranch', () => {
  it('names the branch by ticket type so it never nests under milestone/<slug>', () => {
    assert.equal(ticketBranch('payments', { id: 'T03', title: 'Refund API!', type: 'fix' }), 'fix/payments-t03-refund-api')
    assert.equal(ticketBranch('payments', { id: 'T04', title: 'Card form' }), 'feature/payments-t04-card-form')
  })
})

describe('computeStatus', () => {
  const t1 = ticket('T01', { scenarios: ['PAY-001'] })
  const t2 = ticket('T02', { blockedBy: ['T01'], scenarios: ['PAY-002'] })
  const t3 = ticket('T03', { scenarios: ['PAY-003'] })
  const t4 = ticket('T04')

  it('derives each ticket state and the frontier', () => {
    const issues = [
      issue(t1, { state: 'CLOSED' }),
      issue(t2),
      issue(t3, { labels: [{ name: 'milestone:payments' }, { name: 'jmr:in-progress' }] }),
      issue(t4, { labels: [{ name: 'milestone:payments' }, { name: 'needs:owner' }] }),
    ]
    const status = computeStatus({ milestone, issues, prs: [], titles: {}, results: null })
    const states = Object.fromEntries(status.tickets.map((t) => [t.id, t.state]))
    assert.deepEqual(states, { T01: 'done', T02: 'ready', T03: 'building', T04: 'owner' })
    assert.deepEqual(status.frontier, ['T02'])
    assert.equal(status.phase, 'build')
  })

  it('marks a ticket with an open pull request as in review', () => {
    const pr = {
      number: 7,
      url: 'u',
      state: 'OPEN',
      headRefName: 'feature/payments-t03-x',
      body: '<!-- jmr-pr {"milestone":"payments","id":"T03"} -->',
    }
    const status = computeStatus({ milestone, issues: [issue(t3)], prs: [pr], titles: {}, results: null })
    assert.equal(status.tickets[0].state, 'review')
    assert.equal(status.tickets[0].pr, 7)
  })

  it('keeps a ticket blocked while a blocker is open', () => {
    const status = computeStatus({ milestone, issues: [issue(t1), issue(t2)], prs: [], titles: {}, results: null })
    assert.equal(status.tickets.find((t) => t.id === 'T02').state, 'blocked')
    assert.deepEqual(status.frontier, ['T01'])
  })

  it('reaches closeout only when every ticket is done', () => {
    const issues = [issue(t1, { state: 'CLOSED' }), issue(t2, { state: 'CLOSED' })]
    const titles = { 'PAY-001': ['a.test.ts'], 'PAY-002': ['b.test.ts'] }
    const results = { 'PAY-001': 'passed', 'PAY-002': 'failed' }
    const status = computeStatus({ milestone, issues, prs: [], titles, results })
    assert.equal(status.phase, 'closeout')
    assert.equal(status.scenarios.tested, 2)
    assert.equal(status.scenarios.passed, 1)
    assert.equal(status.scenarios.failing.length, 1)
  })

  it('ignores issues from other milestones and issues without a marker', () => {
    const other = { ...issue(t1), body: buildIssueBody('search', t1) }
    const bare = { ...issue(t2), body: 'no marker' }
    const status = computeStatus({ milestone, issues: [other, bare], prs: [], titles: {}, results: null })
    assert.equal(status.tickets.length, 0)
  })

  it('ignores pull requests from forks', () => {
    const pr = {
      number: 8,
      url: 'u',
      state: 'OPEN',
      isCrossRepository: true,
      body: '<!-- jmr-pr {"milestone":"payments","id":"T03"} -->',
    }
    const status = computeStatus({ milestone, issues: [issue(t3)], prs: [pr], titles: {}, results: null })
    assert.equal(status.tickets[0].state, 'ready')
  })

  it('sorts the frontier by ticket number, not string order', () => {
    const issues = [issue(ticket('T10')), issue(ticket('T09'))]
    const status = computeStatus({ milestone, issues, prs: [], titles: {}, results: null })
    assert.deepEqual(status.frontier, ['T09', 'T10'])
  })
})

describe('decideClaim', () => {
  const claim = (run, hours, id) => ({
    body: `jmr-cycle claim ${run} feature/payments-t01-x`,
    createdAt: ago(hours),
    url: `https://github.com/o/r/issues/1#issuecomment-${id}`,
  })

  it('gives the claim to the earliest fresh comment', () => {
    const comments = [claim('b', 1, 20), claim('a', 2, 10)]
    assert.equal(decideClaim(comments, 'a', NOW).won, true)
    const lost = decideClaim(comments, 'b', NOW)
    assert.equal(lost.won, false)
    assert.deepEqual(lost.mine, ['20'])
  })

  it('ignores claims older than 24 hours', () => {
    const comments = [claim('old', 30, 5), claim('new', 1, 6)]
    assert.equal(decideClaim(comments, 'new', NOW).won, true)
  })

  it('breaks a same-second tie by comment id', () => {
    const comments = [claim('b', 1, 12), claim('a', 1, 11)]
    assert.equal(decideClaim(comments, 'a', NOW).won, true)
  })
})

describe('leaseDecision', () => {
  const lease = { run: 'r1', holder: 'mac:/repo', expiresAt: NOW + 60e3 }

  it('lets anyone take a missing or expired lease', () => {
    assert.equal(leaseDecision(null, 'other', NOW), 'free')
    assert.equal(leaseDecision({ ...lease, expiresAt: NOW - 1 }, 'other', NOW), 'expired')
  })

  it('lets the same holder renew or take over after a crash', () => {
    assert.equal(leaseDecision(lease, 'mac:/repo', NOW), 'mine')
  })

  it('refuses a live lease held by someone else', () => {
    assert.equal(leaseDecision(lease, 'other', NOW), 'held')
  })
})

describe('reviewState', () => {
  const mark = (body, minutesAgo) => ({ body, createdAt: new Date(NOW - minutesAgo * 60e3).toISOString() })

  it('approves only the reviewed head', () => {
    const marks = [mark('jmr-cycle review round 1: approve abc1234', 5)]
    assert.equal(reviewState({ comments: marks, headSha: 'abc1234def', lastCommitAt: ago(1) }).approved, true)
    assert.equal(reviewState({ comments: marks, headSha: 'fff0000', lastCommitAt: ago(0) }).approved, false)
  })

  it('needs a fix when the newest verdict asks for changes and nothing was pushed since', () => {
    const marks = [mark('jmr-cycle review round 1: changes\n- rename x', 30)]
    const waiting = reviewState({ comments: marks, headSha: 'a1b2c3d', lastCommitAt: ago(1) })
    assert.deepEqual([waiting.needsFix, waiting.nextRound], [true, 2])
    const pushed = reviewState({ comments: marks, headSha: 'a1b2c3d', lastCommitAt: new Date(NOW - 5 * 60e3).toISOString() })
    assert.equal(pushed.needsFix, false)
  })

  it('counts rounds and ignores other comments', () => {
    const marks = [
      mark('jmr-cycle review round 1: changes', 50),
      mark('looks good to me', 40),
      mark('jmr-cycle review round 2: changes', 30),
    ]
    assert.equal(reviewState({ comments: marks, headSha: 'a', lastCommitAt: ago(0) }).nextRound, 3)
  })
})

describe('statusMarks', () => {
  it('reads final review and gate verdicts', () => {
    const comments = [
      { body: 'jmr-cycle final review abc1234: 2 findings', createdAt: ago(3) },
      { body: 'jmr-cycle gate fail abc1234', createdAt: ago(2) },
      { body: 'jmr-cycle gate pass def5678', createdAt: ago(1) },
    ]
    assert.deepEqual(statusMarks(comments), { finalReview: 'abc1234', gatePass: ['def5678'], gateFail: ['abc1234'] })
  })
})

describe('checksVerdict', () => {
  it('reads gh pr checks buckets', () => {
    assert.equal(checksVerdict([]), 'none')
    assert.equal(checksVerdict([{ bucket: 'pass' }, { bucket: 'skipping' }]), 'pass')
    assert.equal(checksVerdict([{ bucket: 'pass' }, { bucket: 'pending' }]), 'pending')
    assert.equal(checksVerdict([{ bucket: 'pending' }, { bucket: 'fail' }]), 'fail')
    assert.equal(checksVerdict([{ bucket: 'cancel' }]), 'fail')
  })
})

describe('isStaleClaim', () => {
  const comments = [{ body: 'jmr-cycle claim r1 b', createdAt: ago(30), url: 'x#issuecomment-1' }]

  it('releases a claim with no recent claim, commit or pull request', () => {
    assert.equal(isStaleClaim({ comments, lastCommitAt: ago(26), hasOpenPr: false, now: NOW }), true)
  })

  it('keeps a claim whose branch has a recent commit', () => {
    assert.equal(isStaleClaim({ comments, lastCommitAt: ago(2), hasOpenPr: false, now: NOW }), false)
  })

  it('keeps a claim with an open pull request', () => {
    assert.equal(isStaleClaim({ comments, lastCommitAt: null, hasOpenPr: true, now: NOW }), false)
  })
})

describe('findScenarioTitles', () => {
  it('counts ids in test titles and ignores comments and fixtures', () => {
    const source = [
      "// PAY-009 is not a title",
      "const fixture = 'PAY-008'",
      "it('PAY-001 refuses an expired card', () => {})",
      'test("PAY-002 charges once", async () => {})',
      'describe.each([1])(`PAY-003 handles %s`, () => {})',
    ].join('\n')
    const found = findScenarioTitles('PAY', 'pay.test.ts', source)
    assert.deepEqual(found.sort(), ['PAY-001', 'PAY-002', 'PAY-003'])
  })

  it('reads a title that a formatter moved onto the next line', () => {
    const source = "it(\n  'PAY-004 retries a timeout',\n  () => {},\n)"
    assert.deepEqual(findScenarioTitles('PAY', 'x.spec.ts', source), ['PAY-004'])
  })

  it('reads Gherkin scenarios and Python or Go test names', () => {
    assert.deepEqual(findScenarioTitles('PAY', 'a.feature', 'Scenario: PAY-005 refund'), ['PAY-005'])
    assert.deepEqual(findScenarioTitles('PAY', 'test_pay.py', 'def test_pay_006_refund():'), ['PAY-006'])
    assert.deepEqual(findScenarioTitles('PAY', 'pay_test.go', 'func TestPAY_007Refund(t *testing.T) {'), ['PAY-007'])
  })

  it('skips files that are not tests', () => {
    assert.deepEqual(findScenarioTitles('PAY', 'pay.ts', "it('PAY-001 x', () => {})"), [])
  })
})

describe('parseResults', () => {
  it('reads Jest and Vitest JSON reports', () => {
    const report = JSON.stringify({
      testResults: [
        {
          assertionResults: [
            { fullName: 'pay PAY-001 refuses', status: 'passed' },
            { fullName: 'pay PAY-002 charges', status: 'failed' },
            { fullName: 'pay PAY-003 later', status: 'skipped' },
          ],
        },
      ],
    })
    assert.deepEqual(parseResults('PAY', 'vitest.json', report), {
      'PAY-001': 'passed',
      'PAY-002': 'failed',
      'PAY-003': 'skipped',
    })
  })

  it('reads JUnit XML and lets a failure win over a pass', () => {
    const xml = `<testsuite>
      <testcase classname="pay" name="PAY-001 refuses"/>
      <testcase classname="pay" name="PAY-001 refuses again"><failure message="x"/></testcase>
      <testcase classname="pay" name="test_pay_002_charges"></testcase>
      <testcase classname="pay" name="PAY-003 later"><skipped/></testcase>
    </testsuite>`
    assert.deepEqual(parseResults('PAY', 'junit.xml', xml), {
      'PAY-001': 'failed',
      'PAY-002': 'passed',
      'PAY-003': 'skipped',
    })
  })
})

describe('renderStatusMarkdown', () => {
  it('lists the frontier, owner items and scenario counts', () => {
    const t1 = ticket('T01', { scenarios: ['PAY-001'] })
    const t2 = ticket('T02', { blockedBy: ['T01'] })
    const status = computeStatus({
      milestone,
      issues: [issue(t1, { labels: [{ name: 'needs:owner' }] }), issue(t2)],
      prs: [],
      titles: {},
      results: null,
    })
    const md = renderStatusMarkdown(status, { runId: 'r1', now: NOW })
    assert.match(md, /Card payments/)
    assert.match(md, /Waiting on the owner/)
    assert.match(md, /0 of 1 scenarios have a test/)
    assert.match(md, /r1/)
    assert.match(md, /"base":"main"/)
  })
})
