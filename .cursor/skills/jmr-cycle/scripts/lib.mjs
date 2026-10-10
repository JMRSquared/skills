// Pure logic for jmr-cycle. Everything here is deterministic so it can be
// tested; cycle.mjs owns every call to git and gh.

export const LABELS = {
  ticket: 'jmr:ticket',
  claim: 'jmr:in-progress',
  owner: 'needs:owner',
  status: 'jmr:status',
}

export const milestoneLabel = (slug) => `milestone:${slug}`

const CLAIM_TTL_MS = 24 * 3600 * 1000
const LAND_MODES = ['merge', 'pr']
const TICKET_ID = /^T\d{2,3}$/
const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/

const ticketNumber = (id) => Number(id.slice(1))
const byTicketNumber = (a, b) => ticketNumber(a) - ticketNumber(b)
const labelNames = (issue) => (issue.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name))
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

export const slugify = (text, max = 40) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '')

export const TICKET_TYPES = ['feature', 'fix', 'refactor', 'chore', 'docs', 'test', 'perf']

// Git cannot hold milestone/<slug> and milestone/<slug>/<ticket> as refs at
// once, so ticket branches sit under their type instead.
export const ticketBranch = (slug, t) =>
  `${t.type ?? 'feature'}/${slug}-${t.id.toLowerCase()}-${slugify(t.title)}`

export const validateMilestone = (m) => {
  const errors = []
  if (!m || typeof m !== 'object') return ['milestone.json must be an object']
  if (!SLUG.test(m.slug ?? '')) errors.push('slug must be lowercase letters, digits and dashes')
  if (!isNonEmptyString(m.title)) errors.push('title is required')
  if (!isNonEmptyString(m.base)) errors.push('base is required (the branch the milestone lands on)')
  if (m.branch !== `milestone/${m.slug}`) errors.push(`branch must be "milestone/${m.slug}"`)
  if (!/^[A-Z]{2,6}$/.test(m.scenarioPrefix ?? '')) errors.push('scenarioPrefix must be 2 to 6 uppercase letters')
  if (!Array.isArray(m.gate) || m.gate.length === 0 || !m.gate.every(isNonEmptyString)) {
    errors.push('gate must list at least one command')
  }
  if (!LAND_MODES.includes(m.land)) errors.push(`land must be one of ${LAND_MODES.join(', ')}`)
  for (const key of ['testReports', 'deploy', 'fix']) {
    if (m[key] !== undefined && !(Array.isArray(m[key]) && m[key].every(isNonEmptyString))) {
      errors.push(`${key} must be a list of commands`)
    }
  }
  if (m.install !== undefined && !isNonEmptyString(m.install)) errors.push('install must be a command')
  return errors
}

const findCycle = (tickets) => {
  const edges = new Map(tickets.map((t) => [t.id, t.blockedBy ?? []]))
  const state = new Map()
  const visit = (id, path) => {
    if (state.get(id) === 'done') return null
    if (state.get(id) === 'open') return [...path.slice(path.indexOf(id)), id]
    state.set(id, 'open')
    for (const next of edges.get(id) ?? []) {
      if (!edges.has(next)) continue
      const cycle = visit(next, [...path, id])
      if (cycle) return cycle
    }
    state.set(id, 'done')
    return null
  }
  for (const t of tickets) {
    const cycle = visit(t.id, [])
    if (cycle) return cycle
  }
  return null
}

export const validateTickets = (milestone, tickets) => {
  const errors = []
  if (!Array.isArray(tickets) || tickets.length === 0) return ['tickets must be a non-empty list']
  const ids = new Set()
  const scenarioOwner = new Map()
  const scenarioId = new RegExp(`^${milestone.scenarioPrefix}-\\d{3}$`)
  for (const t of tickets) {
    if (!TICKET_ID.test(t.id ?? '')) errors.push(`ticket id "${t.id}" must look like T01`)
    if (ids.has(t.id)) errors.push(`duplicate ticket id ${t.id}`)
    ids.add(t.id)
    if (!isNonEmptyString(t.title)) errors.push(`${t.id} needs a title`)
    if (!isNonEmptyString(t.body)) errors.push(`${t.id} needs a body`)
    if (t.type !== undefined && !TICKET_TYPES.includes(t.type)) {
      errors.push(`${t.id} type must be one of ${TICKET_TYPES.join(', ')}`)
    }
    if (t.serial !== undefined && t.serial !== null && !/^[a-z0-9-]+$/.test(t.serial)) {
      errors.push(`${t.id} serial must be lowercase letters, digits and dashes`)
    }
    for (const s of t.scenarios ?? []) {
      if (!scenarioId.test(s)) errors.push(`${t.id} scenario ${s} must look like ${milestone.scenarioPrefix}-001`)
      if (scenarioOwner.has(s)) errors.push(`scenario ${s} appears in ${scenarioOwner.get(s)} and ${t.id}`)
      scenarioOwner.set(s, t.id)
    }
  }
  for (const t of tickets) {
    for (const b of t.blockedBy ?? []) {
      if (b === t.id) errors.push(`${t.id} blocks itself`)
      else if (!ids.has(b)) errors.push(`${t.id} is blocked by unknown ticket ${b}`)
    }
  }
  const cycle = findCycle(tickets)
  if (cycle) errors.push(`dependency cycle: ${cycle.join(' -> ')}`)
  return errors
}

export const parseMarker = (name, body) => {
  const match = new RegExp(`<!--\\s*${name}\\s+(\\{[\\s\\S]*?\\})\\s*-->`).exec(body ?? '')
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

export const marker = (name, data) => `<!-- ${name} ${JSON.stringify(data)} -->`

export const ticketMarkerData = (slug, t) => ({
  milestone: slug,
  id: t.id,
  blockedBy: t.blockedBy ?? [],
  type: t.type ?? 'feature',
  scenarios: t.scenarios ?? [],
  ...(t.serial ? { serial: t.serial } : {}),
})

export const issueTitle = (slug, t) => `[${slug}] ${t.id} ${t.title}`

export const buildIssueBody = (slug, t) => {
  const blockers = (t.blockedBy ?? []).length ? t.blockedBy.join(', ') : 'nothing'
  const scenarios = (t.scenarios ?? []).length ? t.scenarios.join(', ') : 'none (keeps existing tests green)'
  return [
    marker('jmr-ticket', ticketMarkerData(slug, t)),
    '',
    t.body.trim(),
    '',
    `**Blocked by:** ${blockers}`,
    `**Scenarios:** ${scenarios}`,
    ...(t.serial ? [`**Runs alone with:** other \`${t.serial}\` tickets`] : []),
  ].join('\n')
}

const ticketState = ({ closed, labels, openPr, blockedBy, doneIds }) => {
  if (closed) return 'done'
  if (labels.includes(LABELS.owner)) return 'owner'
  if (openPr) return 'review'
  if (labels.includes(LABELS.claim)) return 'building'
  if (blockedBy.some((b) => !doneIds.has(b))) return 'blocked'
  return 'ready'
}

const resultRank = { failed: 3, passed: 2, skipped: 1 }
const mergeResult = (a, b) => ((resultRank[b] ?? 0) > (resultRank[a] ?? 0) ? b : a)

export const computeStatus = ({ milestone, issues, prs, titles, results }) => {
  const slug = milestone.slug
  const found = issues
    .map((issue) => ({ issue, data: parseMarker('jmr-ticket', issue.body) }))
    .filter(({ data }) => data?.milestone === slug && TICKET_ID.test(data.id ?? ''))

  const openPrs = new Map()
  for (const pr of prs) {
    const data = parseMarker('jmr-pr', pr.body)
    // A fork can carry a copied marker; only branches in this repo count.
    if (data?.milestone === slug && pr.state === 'OPEN' && !pr.isCrossRepository) openPrs.set(data.id, pr)
  }

  const doneIds = new Set(found.filter(({ issue }) => issue.state === 'CLOSED').map(({ data }) => data.id))
  const tickets = found
    .map(({ issue, data }) => {
      const labels = labelNames(issue)
      const openPr = openPrs.get(data.id)
      const blockedBy = data.blockedBy ?? []
      return {
        id: data.id,
        title: issue.title.replace(/^\[[^\]]*\]\s*T\d+\s*/, ''),
        number: issue.number,
        url: issue.url,
        blockedBy,
        scenarios: data.scenarios ?? [],
        type: data.type ?? 'feature',
        serial: data.serial ?? null,
        pr: openPr?.number ?? null,
        prUrl: openPr?.url ?? null,
        state: ticketState({ closed: issue.state === 'CLOSED', labels, openPr, blockedBy, doneIds }),
      }
    })
    .sort((a, b) => byTicketNumber(a.id, b.id))

  const count = (state) => tickets.filter((t) => t.state === state).length
  const scenarioList = tickets.flatMap((t) =>
    t.scenarios.map((id) => {
      const result = results?.[id] ?? null
      return { id, ticket: t.id, tested: (titles[id]?.length ?? 0) > 0 || result !== null, result }
    }),
  )

  const phase = tickets.length === 0 ? 'empty' : tickets.every((t) => t.state === 'done') ? 'closeout' : 'build'
  return {
    milestone: { slug, title: milestone.title, base: milestone.base, branch: milestone.branch, land: milestone.land },
    phase,
    tickets,
    counts: Object.fromEntries(['done', 'review', 'building', 'ready', 'blocked', 'owner'].map((s) => [s, count(s)])),
    frontier: tickets.filter((t) => t.state === 'ready').map((t) => t.id),
    busySerials: [...new Set(tickets.filter((t) => ['building', 'review'].includes(t.state) && t.serial).map((t) => t.serial))],
    owner: tickets.filter((t) => t.state === 'owner').map((t) => ({ id: t.id, number: t.number, url: t.url })),
    scenarios: {
      total: scenarioList.length,
      tested: scenarioList.filter((s) => s.tested).length,
      passed: scenarioList.filter((s) => s.result === 'passed').length,
      reported: results !== null,
      untested: scenarioList.filter((s) => !s.tested).map((s) => ({ id: s.id, ticket: s.ticket })),
      failing: scenarioList
        .filter((s) => s.result === 'failed' || s.result === 'skipped')
        .map((s) => ({ id: s.id, ticket: s.ticket, result: s.result })),
    },
  }
}

const CLAIM_LINE = /^jmr-cycle claim (\S+) (\S+)/
const commentId = (c) => /issuecomment-(\d+)/.exec(c.url ?? '')?.[1] ?? '0'

const freshClaims = (comments, now) =>
  comments
    .map((c) => ({ c, m: CLAIM_LINE.exec((c.body ?? '').trim()) }))
    .filter(({ c, m }) => m && now - Date.parse(c.createdAt) < CLAIM_TTL_MS)
    .map(({ c, m }) => ({ run: m[1], branch: m[2], at: Date.parse(c.createdAt), id: commentId(c) }))
    .sort((a, b) => a.at - b.at || Number(a.id) - Number(b.id))

export const decideClaim = (comments, runId, now) => {
  const claims = freshClaims(comments, now)
  const winner = claims[0] ?? null
  const won = winner?.run === runId
  const mine = claims.filter((c) => c.run === runId && !(won && c === winner)).map((c) => c.id)
  return { won, winner, mine }
}

// The lease lives on a git ref, so a run in the same checkout (the same /loop)
// can take over from a crashed predecessor without waiting out the TTL.
export const leaseDecision = (current, holder, now) => {
  if (!current) return 'free'
  if (current.expiresAt <= now) return 'expired'
  if (current.holder === holder) return 'mine'
  return 'held'
}

const REVIEW_LINE = /^jmr-cycle review round (\d+): (approve|changes)(?:\s+([0-9a-f]{7,40}))?/
const sameSha = (a, b) => Boolean(a && b) && (a.startsWith(b) || b.startsWith(a))

export const reviewState = ({ comments, headSha, lastCommitAt }) => {
  const reviews = comments
    .map((c) => ({ c, m: REVIEW_LINE.exec((c.body ?? '').trim()) }))
    .filter(({ m }) => m)
    .map(({ c, m }) => ({ round: Number(m[1]), verdict: m[2], sha: m[3] ?? null, at: Date.parse(c.createdAt) }))
    .sort((a, b) => a.at - b.at)
  const latest = reviews.at(-1) ?? null
  return {
    rounds: reviews.length,
    nextRound: reviews.length + 1,
    latest: latest?.verdict ?? null,
    approved: latest?.verdict === 'approve' && sameSha(latest.sha, headSha),
    needsFix: latest?.verdict === 'changes' && (!lastCommitAt || Date.parse(lastCommitAt) <= latest.at),
  }
}

const STATUS_LINE = /^jmr-cycle (final review|gate pass|gate fail) ([0-9a-f]{7,40})/
export const statusMarks = (comments) => {
  const marks = comments
    .map((c) => ({ m: STATUS_LINE.exec((c.body ?? '').trim()), at: Date.parse(c.createdAt) }))
    .filter(({ m }) => m)
    .sort((a, b) => a.at - b.at)
  const shas = (kind) => marks.filter(({ m }) => m[1] === kind).map(({ m }) => m[2])
  return { finalReview: shas('final review')[0] ?? null, gatePass: shas('gate pass'), gateFail: shas('gate fail') }
}

const CHECK_FAIL = new Set(['fail', 'cancel'])
export const checksVerdict = (rows) => {
  if (rows.length === 0) return 'none'
  if (rows.some((r) => CHECK_FAIL.has(r.bucket))) return 'fail'
  if (rows.some((r) => r.bucket === 'pending')) return 'pending'
  return 'pass'
}

export const latestClaim = (comments) => {
  const claims = comments
    .map((c) => ({ c, m: CLAIM_LINE.exec((c.body ?? '').trim()) }))
    .filter(({ m }) => m)
    .sort((a, b) => Date.parse(b.c.createdAt) - Date.parse(a.c.createdAt))
  return claims[0] ? { run: claims[0].m[1], branch: claims[0].m[2], at: Date.parse(claims[0].c.createdAt) } : null
}

export const isStaleClaim = ({ comments, lastCommitAt, hasOpenPr, now }) => {
  if (hasOpenPr) return false
  const claim = latestClaim(comments)
  if (claim && now - claim.at < CLAIM_TTL_MS) return false
  if (lastCommitAt && now - Date.parse(lastCommitAt) < CLAIM_TTL_MS) return false
  return true
}

const TEST_FILE =
  /(\.(test|spec)\.[cm]?[jt]sx?|\.feature|\.steps\.[jt]s|_test\.(go|py)|_spec\.rb|Tests?\.(cs|java|kt|swift))$|(^|\/)test_[^/]*\.py$/
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'vendor', 'target', '.turbo'])
export const isTestFile = (file) => TEST_FILE.test(file)
export const shouldSkipDir = (name) => SKIP_DIRS.has(name)

// "Test" may sit right before the id in Go and Python test names (TestPAY_007).
const idPattern = (prefix) => new RegExp(`(?:(?<![A-Za-z0-9])|(?<=[Tt]est))${prefix}[-_](\\d{3})(?!\\d)`, 'gi')
const idsIn = (prefix, text) => [...text.matchAll(idPattern(prefix))].map((m) => `${prefix}-${m[1]}`)

const TEST_CALL =
  /\b(?:it|test|describe|context|specify|suite|scenario|bench|Run|DisplayName)\b(?:\.[\w$]+(?:\([^)]*\))?)*\s*\(\s*(?:DisplayName\s*=\s*)?/g
const FUNCTION_NAME = /\b(?:def|func|fn|fun|void|function)\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/
const QUOTE = /^(['"`])((?:\\.|(?!\1)[^\\])*)\1/

const leadingString = (text) => QUOTE.exec(text.trimStart())?.[2] ?? null

// Only titles count: an id in a comment, fixture or assertion proves nothing.
export const findScenarioTitles = (prefix, file, source) => {
  if (!isTestFile(file)) return []
  const found = new Set()
  let previous = ''
  for (const line of source.split('\n')) {
    if (/^\s*Scenario(?: Outline)?:/.test(line)) idsIn(prefix, line).forEach((id) => found.add(id))
    for (const call of line.matchAll(TEST_CALL)) {
      const title = leadingString(line.slice(call.index + call[0].length))
      if (title) idsIn(prefix, title).forEach((id) => found.add(id))
    }
    if (/\(\s*$/.test(previous) && new RegExp(TEST_CALL.source).test(previous)) {
      const title = leadingString(line)
      if (title) idsIn(prefix, title).forEach((id) => found.add(id))
    }
    const fn = FUNCTION_NAME.exec(line)?.[1]
    if (fn && /test/i.test(fn)) idsIn(prefix, fn).forEach((id) => found.add(id))
    if (line.trim()) previous = line
  }
  return [...found]
}

const JEST_STATUS = { passed: 'passed', failed: 'failed', pending: 'skipped', skipped: 'skipped', todo: 'skipped', disabled: 'skipped' }

const decodeXml = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
const xmlAttr = (attrs, name) => decodeXml(new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1] ?? '')

const jestCases = (text) =>
  (JSON.parse(text).testResults ?? []).flatMap((file) =>
    (file.assertionResults ?? []).map((a) => ({ name: a.fullName ?? a.title ?? '', status: JEST_STATUS[a.status] })),
  )

const junitCases = (text) =>
  [...text.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)].map((m) => ({
    name: `${xmlAttr(m[1], 'classname')} ${xmlAttr(m[1], 'name')}`,
    status: /<(failure|error)\b/.test(m[2] ?? '') ? 'failed' : /<skipped\b/.test(m[2] ?? '') ? 'skipped' : 'passed',
  }))

// A failure anywhere beats a pass anywhere, and a pass beats a skip.
export const parseResults = (prefix, file, text) => {
  const cases = file.endsWith('.json') ? jestCases(text) : file.endsWith('.xml') ? junitCases(text) : []
  const out = {}
  for (const c of cases) {
    if (!c.status) continue
    for (const id of new Set(idsIn(prefix, c.name))) out[id] = mergeResult(out[id], c.status)
  }
  return out
}

export const mergeResults = (maps) => {
  const out = {}
  for (const map of maps) for (const [id, r] of Object.entries(map)) out[id] = mergeResult(out[id], r)
  return out
}

const STATE_TEXT = {
  done: 'done',
  review: 'in review',
  building: 'building',
  ready: 'ready',
  blocked: 'blocked',
  owner: 'waiting on the owner',
}

export const renderStatusMarkdown = (status, { runId, now }) => {
  const { counts, scenarios, tickets } = status
  const lines = [
    marker('jmr-status', { milestone: status.milestone.slug, branch: status.milestone.branch, base: status.milestone.base }),
    `# ${status.milestone.title}: build status`,
    '',
    `Phase: ${status.phase}. ${counts.done} of ${tickets.length} tickets done; ${counts.review} in review, ${counts.building} building, ${counts.ready} ready, ${counts.blocked} blocked and ${counts.owner} waiting on the owner.`,
    '',
    `Scenarios: ${scenarios.tested} of ${scenarios.total} scenarios have a test. ` +
      (scenarios.reported ? `${scenarios.passed} pass.` : 'No test report this run, so pass and fail are unknown.'),
    '',
    `Milestone branch: \`${status.milestone.branch}\`. Done when it is merged into \`${status.milestone.base}\` (${status.milestone.land === 'merge' ? 'the cycle merges it' : 'the owner merges it'}).`,
  ]
  if (status.owner.length) {
    lines.push('', '## Waiting on the owner', '', ...status.owner.map((o) => `- #${o.number} ${o.id}`))
  }
  if (status.frontier.length) lines.push('', '## Ready now', '', status.frontier.join(', '))
  lines.push('', '## Tickets', '', '| Ticket | Title | State | Issue | PR |', '|---|---|---|---|---|')
  for (const t of tickets) {
    lines.push(`| ${t.id} | ${t.title.replace(/\|/g, '\\|')} | ${STATE_TEXT[t.state]} | #${t.number} | ${t.pr ? `#${t.pr}` : ''} |`)
  }
  if (scenarios.failing.length) {
    lines.push('', '## Scenarios not passing', '', ...scenarios.failing.map((s) => `- ${s.id} (${s.ticket}): ${s.result}`))
  }
  if (scenarios.untested.length) {
    lines.push('', '## Scenarios without a test', '', scenarios.untested.map((s) => `${s.id} (${s.ticket})`).join(', '))
  }
  lines.push('', `Updated ${new Date(now).toISOString()} by run \`${runId}\`.`)
  return lines.join('\n')
}
