#!/usr/bin/env node
// jmr-cycle: tracker, claims and status for a milestone. Run from the repo root
// (the orchestrator worktree). `node cycle.mjs help` lists commands.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import {
  LABELS,
  buildIssueBody,
  checksVerdict,
  computeStatus,
  decideClaim,
  leaseDecision,
  findScenarioTitles,
  isStaleClaim,
  isTestFile,
  issueTitle,
  reviewState,
  statusMarks,
  latestClaim,
  marker,
  mergeResults,
  milestoneLabel,
  parseMarker,
  parseResults,
  renderStatusMarkdown,
  shouldSkipDir,
  ticketBranch,
  validateMilestone,
  validateTickets,
} from './lib.mjs'

const GH = process.env.JMR_CYCLE_GH || 'gh'
// Lets a rival run's claim comment land before this run reads the thread back.
const SETTLE_MS = Number(process.env.JMR_CYCLE_SETTLE_MS ?? 4000)
const EXIT = { ok: 0, error: 1, invalid: 2, lost: 3, unclaimable: 4, notGithub: 5 }
const GITHUB_REQUIRED =
  'agents-execute and jmr-cycle need a GitHub repository you can push to: GitHub issues hold the tickets and claims, ' +
  'and pull requests carry every review. Ask the owner to put the project on GitHub and grant write access, ' +
  'sign in with gh auth login, then run it again.'
const WRITE_ROLES = new Set(['admin', 'maintain', 'write'])

const HELP = `node cycle.mjs <command> [flags]

  preflight                                      fail with exit 5 unless this is a GitHub repo you can push to
  milestones                                     open milestones in this repo (from status issues)
  lease     --milestone <slug> --run <id> --holder <h> [--minutes 120]
                                                 take, renew or take over the one-orchestrator lease (git ref
                                                 refs/jmr-leases/<slug>); exit 3 when another holder has it
  unlease   --milestone <slug> --run <id>        give the lease back when this run holds it
  marks     --pr <n> | --milestone <slug>        trusted review verdicts on a pull request, or final review and
                                                 gate verdicts on the status issue
  landing   --milestone <slug>                   state of the pull request from milestone/<slug> into its base
  checks    --pr <n> [--wait] [--timeout-minutes 60]
                                                 CI verdict: pass, fail, pending or none (no checks configured)
  finish    --milestone <slug> --pr <n>          close the status issue after the landing merge
  validate  --milestone <slug> [--tickets f]     check milestone.json and a tickets file
  publish   --milestone <slug> --tickets f [--dry-run]
                                               create or update ticket issues and the status issue
  status    --milestone <slug> [--json] [--results-dir d] [--write --run <id>]
                                               state, frontier and scenarios; --write updates the status issue
  claim     --milestone <slug> --ticket T03 --run <id> [--branch b]
                                               exit 0 won, 3 taken or lost, 4 closed or waiting on the owner
  release-stale --milestone <slug> --run <id>    release claims with no progress in 24 hours
  close     --milestone <slug> --ticket T03 --pr <n>
  escalate  --milestone <slug> (--ticket T03 | --status) --question-file f

Commands that read milestone.json look in docs/milestones/<slug>/ under the current directory, or under --dir.
Exit codes: 0 ok, 1 a git or gh call failed, 2 invalid input, 3 claim or lease held by another run,
4 ticket closed or waiting on the owner, 5 not a GitHub repository you can push to.`

const die = (message, code = EXIT.error) => {
  process.stderr.write(`jmr-cycle: ${message}\n`)
  process.exit(code)
}

const parseArgs = (argv) => {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) positional.push(arg)
    else if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) flags[arg.slice(2)] = true
    else flags[arg.slice(2)] = argv[++i]
  }
  return { command: positional[0], flags }
}

const run = (cmd, args, { input, env, allowFail = false } = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', input, env, maxBuffer: 64 * 1024 * 1024 })
  if (r.error) die(`${cmd} could not start: ${r.error.message}. Install it and sign in (gh auth login).`)
  if (r.status !== 0 && !allowFail) die(`${cmd} ${args.join(' ')} failed: ${(r.stderr || r.stdout).trim()}`)
  return r
}
const gh = (args, opts) => run(GH, args, opts).stdout
const ghJson = (args) => JSON.parse(gh(args) || 'null')
const print = (data) => process.stdout.write(`${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`)
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

const need = (flags, ...names) => {
  for (const n of names) if (!flags[n] || flags[n] === true) die(`--${n} is required`, EXIT.invalid)
}

const loadMilestone = (flags) => {
  need(flags, 'milestone')
  const file = path.join(flags.dir ?? process.cwd(), 'docs', 'milestones', flags.milestone, 'milestone.json')
  if (!existsSync(file)) die(`${file} not found. Run from a worktree of the milestone/<slug> branch.`, EXIT.invalid)
  const milestone = JSON.parse(readFileSync(file, 'utf8'))
  const errors = validateMilestone(milestone)
  if (milestone.slug !== flags.milestone) errors.push(`slug "${milestone.slug}" does not match --milestone ${flags.milestone}`)
  if (errors.length) die(`invalid ${file}:\n- ${errors.join('\n- ')}`, EXIT.invalid)
  return milestone
}

const loadTickets = (milestone, file) => {
  const parsed = JSON.parse(readFileSync(file, 'utf8'))
  const tickets = Array.isArray(parsed) ? parsed : parsed.tickets
  const errors = validateTickets(milestone, tickets)
  if (errors.length) die(`invalid ${file}:\n- ${errors.join('\n- ')}`, EXIT.invalid)
  return tickets
}

const listMilestoneIssues = (slug) =>
  ghJson(['issue', 'list', '--label', milestoneLabel(slug), '--state', 'all', '--limit', '1000', '--json', 'number,title,body,state,labels,url'])

const permissions = new Map()
let viewer
// Comments and pull requests from accounts without write access are data, never
// claims, verdicts or work to merge. Lookup failures are not cached, so one API
// hiccup cannot hide this run's own claim from it.
const canWrite = (login) => {
  if (!login) return false
  viewer ??= JSON.parse(run(GH, ['api', 'user'], { allowFail: true }).stdout || '{}').login ?? null
  if (login === viewer) return true
  if (!permissions.has(login)) {
    const r = run(GH, ['api', `repos/{owner}/{repo}/collaborators/${login}/permission`], { allowFail: true })
    if (r.status !== 0) return false
    const body = JSON.parse(r.stdout)
    permissions.set(login, WRITE_ROLES.has(body.role_name) || WRITE_ROLES.has(body.permission))
  }
  return permissions.get(login)
}
const trusted = (comments) => comments.filter((c) => canWrite(c.author?.login))

const listOpenPrs = (milestone) =>
  ghJson([
    'pr', 'list', '--base', milestone.branch, '--state', 'open', '--limit', '200',
    '--json', 'number,url,state,headRefName,body,title,isCrossRepository,author',
  ]).filter((pr) => !pr.isCrossRepository && canWrite(pr.author?.login))

const GIT_IDENTITY = { ...process.env, GIT_AUTHOR_NAME: 'jmr-cycle', GIT_AUTHOR_EMAIL: 'jmr-cycle@localhost', GIT_COMMITTER_NAME: 'jmr-cycle', GIT_COMMITTER_EMAIL: 'jmr-cycle@localhost' }
const leaseRef = (slug) => `refs/jmr-leases/${slug}`
const readLease = (ref) => {
  const ls = run('git', ['ls-remote', 'origin', ref])
  const sha = ls.stdout.trim().split(/\s+/)[0]
  if (!sha) return null
  run('git', ['fetch', '--quiet', '--no-write-fetch-head', 'origin', ref])
  try {
    return { sha, ...JSON.parse(run('git', ['log', '-1', '--format=%B', sha]).stdout) }
  } catch {
    return { sha, run: null, holder: null, expiresAt: 0 }
  }
}

const viewComments = (n, fields = 'comments') => {
  const view = ghJson(['issue', 'view', String(n), '--json', fields])
  return { ...view, comments: trusted(view.comments ?? []) }
}

// Found by label rather than milestone.json, so it works before the worktree
// exists and after the milestone branch is deleted.
const statusIssueBySlug = (slug) => {
  const issues = ghJson([
    'issue', 'list', '--label', LABELS.status, '--label', milestoneLabel(slug), '--state', 'all', '--limit', '50',
    '--json', 'number,body,state,url,labels',
  ]).filter((i) => parseMarker('jmr-status', i.body)?.milestone === slug)
  const sorted = issues.sort((a, b) => (a.state === b.state ? a.number - b.number : a.state === 'OPEN' ? -1 : 1))
  return sorted[0] ?? die(`no status issue for milestone ${slug}; run publish first`, EXIT.invalid)
}

const issueNumber = (url) => Number(/\/issues\/(\d+)/.exec(url)?.[1] ?? die(`unexpected gh output: ${url}`))

const ticketIssues = (slug, issues) => {
  const byId = new Map()
  for (const issue of [...issues].sort((a, b) => a.number - b.number)) {
    const data = parseMarker('jmr-ticket', issue.body)
    if (data?.milestone === slug && !byId.has(data.id)) byId.set(data.id, issue)
  }
  return byId
}

const statusIssueOf = (slug, issues) =>
  issues
    .filter((i) => i.state === 'OPEN' && parseMarker('jmr-status', i.body)?.milestone === slug)
    .sort((a, b) => a.number - b.number)[0] ?? null

const findTicket = (milestone, id) => {
  const issue = ticketIssues(milestone.slug, listMilestoneIssues(milestone.slug)).get(id)
  if (!issue) die(`no issue for ticket ${id} in milestone ${milestone.slug}`, EXIT.invalid)
  return issue
}

const ensureLabels = (slug) => {
  const labels = [
    [milestoneLabel(slug), '1d76db', `jmr-cycle milestone ${slug}`],
    [LABELS.ticket, 'c5def5', 'jmr-cycle ticket'],
    [LABELS.claim, 'fbca04', 'A jmr-cycle run is building this'],
    [LABELS.owner, 'd93f0b', 'Waiting on the owner'],
    [LABELS.status, '0e8a16', 'jmr-cycle status issue'],
  ]
  for (const [name, color, description] of labels) {
    gh(['label', 'create', name, '--color', color, '--description', description, '--force'])
  }
}

const createIssue = (title, body, labels) =>
  issueNumber(gh(['issue', 'create', '--title', title, '--body-file', '-', ...labels.flatMap((l) => ['--label', l])], { input: body }).trim())

const scanTitles = (root, prefix) => {
  const titles = {}
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name) && !entry.name.startsWith('.')) walk(full)
        continue
      }
      const rel = path.relative(root, full)
      if (!entry.isFile() || !isTestFile(rel) || statSync(full).size > 1024 * 1024) continue
      for (const id of findScenarioTitles(prefix, rel, readFileSync(full, 'utf8'))) (titles[id] ??= []).push(rel)
    }
  }
  walk(root)
  return titles
}

const readResults = (dir, prefix) => {
  if (!existsSync(dir)) return null
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') || f.endsWith('.xml'))
  if (files.length === 0) {
    process.stderr.write(`jmr-cycle: no .json or .xml test reports in ${dir}; pass and fail stay unknown\n`)
    return null
  }
  const maps = []
  for (const f of files) {
    try {
      maps.push(parseResults(prefix, f, readFileSync(path.join(dir, f), 'utf8')))
    } catch (err) {
      process.stderr.write(`jmr-cycle: skipped unreadable report ${f}: ${err.message}\n`)
    }
  }
  return mergeResults(maps)
}

const commands = {
  help: () => print(HELP),

  preflight: () => {
    const fail = (reason) => die(`${reason}\n${GITHUB_REQUIRED}`, EXIT.notGithub)
    if (spawnSync(GH, ['--version'], { encoding: 'utf8' }).error) fail('The GitHub CLI (gh) is not installed.')
    if (run('git', ['rev-parse', '--is-inside-work-tree'], { allowFail: true }).status !== 0) fail('This folder is not a git repository.')
    const remote = run('git', ['remote', 'get-url', 'origin'], { allowFail: true })
    if (remote.status !== 0) fail('This repository has no "origin" remote.')
    if (run(GH, ['auth', 'status'], { allowFail: true }).status !== 0) fail('gh is not signed in.')
    const view = run(GH, ['repo', 'view', '--json', 'nameWithOwner,url,viewerPermission,defaultBranchRef'], { allowFail: true })
    if (view.status !== 0) fail(`origin (${remote.stdout.trim()}) is not a GitHub repository gh can reach.`)
    const repo = JSON.parse(view.stdout)
    if (!['ADMIN', 'MAINTAIN', 'WRITE'].includes(repo.viewerPermission)) {
      fail(`Your GitHub account has ${repo.viewerPermission || 'no'} access to ${repo.nameWithOwner}; it needs write access.`)
    }
    print({ ok: true, repo: repo.nameWithOwner, url: repo.url, defaultBranch: repo.defaultBranchRef?.name ?? null, permission: repo.viewerPermission })
  },

  milestones: () => {
    const issues = ghJson(['issue', 'list', '--label', LABELS.status, '--state', 'open', '--limit', '200', '--json', 'number,body,url'])
    print(
      issues
        .map((i) => ({ ...parseMarker('jmr-status', i.body), statusIssue: i.number, url: i.url }))
        .filter((m) => m.milestone),
    )
  },

  validate: (flags) => {
    const milestone = loadMilestone(flags)
    const tickets = flags.tickets ? loadTickets(milestone, flags.tickets) : []
    print({ ok: true, milestone: milestone.slug, tickets: tickets.length })
  },

  publish: (flags) => {
    need(flags, 'tickets')
    const milestone = loadMilestone(flags)
    const tickets = loadTickets(milestone, flags.tickets)
    const dry = flags['dry-run'] === true
    if (!dry) ensureLabels(milestone.slug)
    const issues = dry ? [] : listMilestoneIssues(milestone.slug)
    const existing = ticketIssues(milestone.slug, issues)
    const report = { created: [], updated: [], unchanged: [], orphans: [], statusIssue: null }
    for (const t of tickets) {
      const title = issueTitle(milestone.slug, t)
      const body = buildIssueBody(milestone.slug, t)
      const issue = existing.get(t.id)
      if (!issue) {
        report.created.push(dry ? { id: t.id } : { id: t.id, number: createIssue(title, body, [milestoneLabel(milestone.slug), LABELS.ticket]) })
      } else if (issue.state === 'OPEN' && (issue.body.trim() !== body.trim() || issue.title !== title)) {
        gh(['issue', 'edit', String(issue.number), '--title', title, '--body-file', '-'], { input: body })
        report.updated.push({ id: t.id, number: issue.number })
      } else {
        report.unchanged.push({ id: t.id, number: issue.number })
      }
    }
    const wanted = new Set(tickets.map((t) => t.id))
    for (const [id, issue] of existing) if (!wanted.has(id) && issue.state === 'OPEN') report.orphans.push({ id, number: issue.number })
    const statusIssue = statusIssueOf(milestone.slug, issues)
    if (statusIssue) report.statusIssue = statusIssue.number
    else if (!dry) {
      const body = `${marker('jmr-status', { milestone: milestone.slug, branch: milestone.branch, base: milestone.base })}\n# ${milestone.title}: build status\n\nThe first cycle fills this in.`
      report.statusIssue = createIssue(`[${milestone.slug}] Build status`, body, [milestoneLabel(milestone.slug), LABELS.status])
    }
    print(report)
  },

  status: (flags) => {
    const milestone = loadMilestone(flags)
    const issues = listMilestoneIssues(milestone.slug)
    const results = flags['results-dir'] ? readResults(flags['results-dir'], milestone.scenarioPrefix) : null
    const titles = scanTitles(flags.dir ?? process.cwd(), milestone.scenarioPrefix)
    const status = computeStatus({ milestone, issues, prs: listOpenPrs(milestone), titles, results })
    const statusIssue = statusIssueOf(milestone.slug, issues)
    status.statusIssue = statusIssue ? { number: statusIssue.number, url: statusIssue.url } : null
    if (flags.write) {
      need(flags, 'run')
      if (!statusIssue) die('no open status issue; run publish first')
      const body = renderStatusMarkdown(status, { runId: flags.run, now: Date.now() })
      gh(['issue', 'edit', String(statusIssue.number), '--body-file', '-'], { input: body })
    }
    print(flags.json ? status : renderStatusMarkdown(status, { runId: flags.run ?? 'local', now: Date.now() }))
  },

  claim: (flags) => {
    need(flags, 'ticket', 'run')
    const milestone = loadMilestone(flags)
    const issue = findTicket(milestone, flags.ticket)
    const n = String(issue.number)
    const view = viewComments(n, 'state,labels,comments')
    const labels = view.labels.map((l) => l.name)
    const previous = latestClaim(view.comments)
    const branch =
      flags.branch && flags.branch !== true
        ? flags.branch
        : previous?.branch ??
          ticketBranch(milestone.slug, {
            id: flags.ticket,
            title: issue.title.replace(/^\[[^\]]*\]\s*T\d+\s*/, ''),
            type: parseMarker('jmr-ticket', issue.body)?.type,
          })
    const base = { ticket: flags.ticket, issue: issue.number, branch, resumeBranch: previous?.branch ?? null }
    if (view.state === 'CLOSED') return print({ ...base, result: 'closed' }), process.exit(EXIT.unclaimable)
    if (labels.includes(LABELS.owner)) return print({ ...base, result: 'owner' }), process.exit(EXIT.unclaimable)
    if (labels.includes(LABELS.claim)) {
      const held = decideClaim(view.comments, flags.run, Date.now())
      if (held.won) return print({ ...base, result: 'won' })
      return print({ ...base, result: 'taken', holder: held.winner }), process.exit(EXIT.lost)
    }
    gh(['issue', 'edit', n, '--add-label', LABELS.claim])
    gh(['issue', 'comment', n, '--body', `jmr-cycle claim ${flags.run} ${branch}`])
    sleep(SETTLE_MS)
    const after = viewComments(n)
    const decision = decideClaim(after.comments, flags.run, Date.now())
    for (const id of decision.mine) gh(['api', '-X', 'DELETE', `repos/{owner}/{repo}/issues/comments/${id}`], { allowFail: true })
    if (decision.won) return print({ ...base, result: 'won' })
    print({ ...base, result: 'lost', holder: decision.winner })
    process.exit(EXIT.lost)
  },

  'release-stale': (flags) => {
    need(flags, 'run')
    const milestone = loadMilestone(flags)
    const prIds = new Set(listOpenPrs(milestone).map((pr) => parseMarker('jmr-pr', pr.body)?.id).filter(Boolean))
    const released = []
    for (const [id, issue] of ticketIssues(milestone.slug, listMilestoneIssues(milestone.slug))) {
      const labels = issue.labels.map((l) => l.name)
      if (issue.state !== 'OPEN' || !labels.includes(LABELS.claim)) continue
      const { comments } = viewComments(issue.number)
      const branch = latestClaim(comments)?.branch
      let lastCommitAt = null
      if (branch && run('git', ['fetch', 'origin', branch], { allowFail: true }).status === 0) {
        lastCommitAt = run('git', ['log', '-1', '--format=%cI', `origin/${branch}`], { allowFail: true }).stdout.trim() || null
      }
      if (!isStaleClaim({ comments, lastCommitAt, hasOpenPr: prIds.has(id), now: Date.now() })) continue
      gh(['issue', 'edit', String(issue.number), '--remove-label', LABELS.claim])
      gh(['issue', 'comment', String(issue.number), '--body', `jmr-cycle release ${flags.run}: no progress in 24 hours`])
      released.push({ id, number: issue.number, branch: branch ?? null })
    }
    print({ released })
  },

  close: (flags) => {
    need(flags, 'ticket', 'pr')
    const milestone = loadMilestone(flags)
    const issue = findTicket(milestone, flags.ticket)
    const n = String(issue.number)
    if (issue.state === 'OPEN') gh(['issue', 'close', n, '--comment', `Done in #${flags.pr}`])
    gh(['issue', 'edit', n, '--remove-label', LABELS.claim], { allowFail: true })
    print({ ticket: flags.ticket, issue: issue.number, closed: true })
  },

  lease: (flags) => {
    need(flags, 'milestone', 'run', 'holder')
    const ref = leaseRef(flags.milestone)
    const current = readLease(ref)
    const decision = leaseDecision(current, flags.holder, Date.now())
    if (decision === 'held') return print({ result: 'held', holder: current.holder, run: current.run }), process.exit(EXIT.lost)
    const expiresAt = Date.now() + Number(flags.minutes ?? 120) * 60e3
    const tree = run('git', ['mktree'], { input: '' }).stdout.trim()
    const commit = run('git', ['commit-tree', tree, '-m', JSON.stringify({ run: flags.run, holder: flags.holder, expiresAt })], {
      env: GIT_IDENTITY,
    }).stdout.trim()
    // Compare-and-swap on the server: the push fails when another run moved the
    // ref since it was read. --no-verify skips repo hooks; this ref holds no code.
    const push = run('git', ['push', '--quiet', '--no-verify', `--force-with-lease=${ref}:${current?.sha ?? ''}`, 'origin', `${commit}:${ref}`], {
      allowFail: true,
    })
    if (push.status !== 0) return print({ result: 'lost' }), process.exit(EXIT.lost)
    print({ result: { free: 'won', expired: 'won', mine: current?.run === flags.run ? 'renewed' : 'took-over' }[decision], expiresAt })
  },

  unlease: (flags) => {
    need(flags, 'milestone', 'run')
    const ref = leaseRef(flags.milestone)
    const current = readLease(ref)
    if (current?.run !== flags.run) return print({ result: 'not-held' })
    run('git', ['push', '--quiet', '--no-verify', `--force-with-lease=${ref}:${current.sha}`, 'origin', `:${ref}`], { allowFail: true })
    print({ result: 'released' })
  },

  marks: (flags) => {
    if (flags.pr && flags.pr !== true) {
      const pr = ghJson(['pr', 'view', String(flags.pr), '--json', 'comments,headRefOid,commits'])
      const lastCommitAt = pr.commits.map((c) => c.committedDate).sort().at(-1) ?? null
      return print({ pr: Number(flags.pr), headSha: pr.headRefOid, ...reviewState({ comments: trusted(pr.comments), headSha: pr.headRefOid, lastCommitAt }) })
    }
    need(flags, 'milestone')
    const { comments } = viewComments(statusIssueBySlug(flags.milestone).number)
    print(statusMarks(comments))
  },

  landing: (flags) => {
    need(flags, 'milestone')
    const data = parseMarker('jmr-status', statusIssueBySlug(flags.milestone).body)
    data.base ??= ghJson(['repo', 'view', '--json', 'defaultBranchRef']).defaultBranchRef.name
    const prs = ghJson([
      'pr', 'list', '--head', data.branch, '--base', data.base, '--state', 'all', '--limit', '20',
      '--json', 'number,url,state,headRefOid,isCrossRepository',
    ]).filter((pr) => !pr.isCrossRepository)
    const pr = prs.find((p) => p.state === 'OPEN') ?? prs.find((p) => p.state === 'MERGED') ?? null
    print({ state: pr ? pr.state.toLowerCase() : 'none', number: pr?.number ?? null, url: pr?.url ?? null, headSha: pr?.headRefOid ?? null, base: data.base, branch: data.branch })
  },

  checks: (flags) => {
    need(flags, 'pr')
    const deadline = Date.now() + Number(flags['timeout-minutes'] ?? 60) * 60e3
    for (;;) {
      const r = run(GH, ['pr', 'checks', String(flags.pr), '--json', 'name,bucket'], { allowFail: true })
      // gh exits 1 with "no checks reported" when no workflow runs for this base branch.
      const rows = r.stdout.trim() ? JSON.parse(r.stdout) : /no checks/i.test(r.stderr) ? [] : die(`gh pr checks failed: ${r.stderr.trim()}`)
      const verdict = checksVerdict(rows)
      if (verdict !== 'pending' || !flags.wait || Date.now() > deadline) {
        return print({ verdict, failing: rows.filter((c) => ['fail', 'cancel'].includes(c.bucket)).map((c) => c.name) })
      }
      sleep(30e3)
    }
  },

  finish: (flags) => {
    need(flags, 'milestone', 'pr')
    const issue = statusIssueBySlug(flags.milestone)
    if (issue.state === 'OPEN') {
      gh(['issue', 'edit', String(issue.number), '--remove-label', LABELS.owner], { allowFail: true })
      gh(['issue', 'close', String(issue.number), '--comment', `Milestone landed in #${flags.pr}.`])
    }
    print({ statusIssue: issue.number, closed: true })
  },

  escalate: (flags) => {
    need(flags, 'question-file')
    const milestone = loadMilestone(flags)
    const issues = listMilestoneIssues(milestone.slug)
    const issue = flags.status ? statusIssueOf(milestone.slug, issues) : ticketIssues(milestone.slug, issues).get(flags.ticket)
    if (!issue) die(flags.status ? 'no open status issue' : `no issue for ticket ${flags.ticket}`, EXIT.invalid)
    if (issue.labels.some((l) => l.name === LABELS.owner)) return print({ issue: issue.number, url: issue.url, result: 'already' })
    const question = readFileSync(flags['question-file'], 'utf8').trim()
    gh(['issue', 'comment', String(issue.number), '--body', `jmr-cycle needs the owner:\n\n${question}`])
    gh(['issue', 'edit', String(issue.number), '--add-label', LABELS.owner])
    print({ issue: issue.number, url: issue.url, result: 'escalated' })
  },
}

const { command, flags } = parseArgs(process.argv.slice(2))
const handler = commands[command ?? 'help']
if (!handler) die(`unknown command "${command}"\n\n${HELP}`, EXIT.invalid)
handler(flags)
