#!/usr/bin/env node
// Stand-in for the gh CLI in cycle.test.mjs. Keeps issues, comments and pull
// requests in the JSON file named by FAKE_GH_STATE. A mkdir lock serialises
// writers, because the claim test runs two cycle processes at once.

import { mkdirSync, readFileSync, rmdirSync, writeFileSync } from 'node:fs'

const STATE = process.env.FAKE_GH_STATE
const LOCK = `${STATE}.lock`
const URL = 'https://github.com/o/r'

const lock = () => {
  for (let i = 0; i < 2000; i++) {
    try {
      mkdirSync(LOCK)
      return
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5)
    }
  }
  throw new Error('fake gh lock timeout')
}

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const flags = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []))
const stdin = () => readFileSync(0, 'utf8')
const USER = process.env.FAKE_GH_USER || 'owner'
const comment = (s, issue, body) =>
  s.comments.push({ id: ++s.commentCounter, issue: Number(issue), body, author: USER, createdAt: new Date().toISOString() })

const pick = (obj, fields) => Object.fromEntries(fields.split(',').map((f) => [f, obj[f]]))
const issueOut = (s, issue) => ({
  ...issue,
  url: `${URL}/issues/${issue.number}`,
  labels: issue.labels.map((name) => ({ name })),
  comments: s.comments.filter((c) => c.issue === issue.number).map(({ body, createdAt, id, author }) => ({
    author: { login: author },
    body,
    createdAt,
    url: `${URL}/issues/${issue.number}#issuecomment-${id}`,
  })),
})

lock()
let out = ''
let code = 0
try {
  const s = JSON.parse(readFileSync(STATE, 'utf8'))
  const find = (n) => s.issues.find((i) => i.number === Number(n))
  const [group, verb] = args
  const key = `${group} ${verb}`

  if (group === '--version' || key === 'auth status') out = 'gh fake'
  else if (key === 'repo view') {
    if (s.repo) out = JSON.stringify(s.repo)
    else code = 1
  } else if (key === 'label create') s.labels = [...new Set([...(s.labels ?? []), args[2]])]
  else if (key === 'issue list') {
    const labels = flags('label')
    const state = flag('state')
    const rows = s.issues
      .filter((i) => labels.every((l) => i.labels.includes(l)))
      .filter((i) => state === 'all' || i.state === state.toUpperCase())
    out = JSON.stringify(rows.map((i) => pick(issueOut(s, i), flag('json'))))
  } else if (key === 'issue create') {
    const number = ++s.counter
    s.issues.push({ number, title: flag('title'), body: stdin(), state: 'OPEN', labels: flags('label') })
    out = `${URL}/issues/${number}`
  } else if (key === 'issue edit') {
    const issue = find(args[2])
    if (flag('title')) issue.title = flag('title')
    if (flag('body-file')) issue.body = stdin()
    for (const l of flags('add-label')) if (!issue.labels.includes(l)) issue.labels.push(l)
    for (const l of flags('remove-label')) issue.labels = issue.labels.filter((x) => x !== l)
  } else if (key === 'issue view') out = JSON.stringify(pick(issueOut(s, find(args[2])), flag('json')))
  else if (key === 'issue comment') {
    comment(s, args[2], flag('body'))
  } else if (key === 'issue close') {
    find(args[2]).state = 'CLOSED'
    comment(s, args[2], flag('comment'))
  } else if (key === 'pr list') {
    const state = flag('state')
    const rows = s.prs
      .filter((p) => p.baseRefName === flag('base'))
      .filter((p) => !flag('head') || p.headRefName === flag('head'))
      .filter((p) => state === 'all' || p.state === state.toUpperCase())
    out = JSON.stringify(rows)
  } else if (key === 'pr view') {
    const pr = s.prs.find((p) => p.number === Number(args[2]))
    const comments = (pr.comments ?? []).map((c) => ({ author: { login: c.author }, body: c.body, createdAt: c.createdAt }))
    out = JSON.stringify(pick({ ...pr, comments, commits: pr.commits ?? [] }, flag('json')))
  } else if (key === 'api user') {
    out = JSON.stringify({ login: USER })
  } else if (key === 'pr checks') {
    const rows = s.checks?.[args[2]]
    if (rows) out = JSON.stringify(rows)
    else {
      process.stderr.write("no checks reported on the 'x' branch\n")
      code = 1
    }
  } else if (group === 'api' && /collaborators\/[^/]+\/permission$/.test(args[1])) {
    const login = args[1].split('/').at(-2)
    out = JSON.stringify({ permission: s.permissions?.[login] ?? 'none' })
  } else if (group === 'api' && args.includes('DELETE')) {
    const id = Number(args.at(-1).split('/').at(-1))
    s.comments = s.comments.filter((c) => c.id !== id)
  } else {
    process.stderr.write(`fake gh: unsupported ${args.join(' ')}\n`)
    code = 1
  }
  writeFileSync(STATE, JSON.stringify(s, null, 2))
} finally {
  rmdirSync(LOCK)
}
if (out) process.stdout.write(`${out}\n`)
process.exit(code)
