#!/usr/bin/env node
// Start, watch and close helper agents in Herdr panes. Any agent kind can call
// it, so it needs nothing beyond node and the herdr CLI (no jq).
//
//   node helper.mjs whoami
//   node helper.mjs spawn --role review --brief-file brief.md [--kind codex] [--worktree feat/x]
//   node helper.mjs run --label "dev server" -- yarn dev
//   node helper.mjs wait <name>... [--timeout 1200000]
//   node helper.mjs read <name> [--lines 80]
//   node helper.mjs list
//   node helper.mjs close <name>... | --all

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  HELPER_TAB_LABEL,
  MAX_HELPERS,
  briefWithProtocol,
  helperName,
  inheritedFlags,
  isAgentName,
  kickoffPrompt,
  kindFromAgentLabel,
  placement,
} from './lib.mjs'

const EXIT = { ok: 0, usage: 2, blocked: 3, timeout: 4, gone: 5 }

const fail = (message, code = 1) => {
  process.stderr.write(`jmr-herdr: ${message}\n`)
  process.exit(code)
}

const herdr = (...args) => {
  try {
    const out = execFileSync('herdr', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    return out.trim().startsWith('{') ? JSON.parse(out).result : out
  } catch (e) {
    let err
    try {
      err = JSON.parse(e.stderr).error
    } catch {
      err = { code: 'cli_error', message: String(e.stderr || e.message).trim() }
    }
    const wrapped = new Error(`herdr ${args.slice(0, 2).join(' ')}: ${err.message}`)
    wrapped.code = err.code
    throw wrapped
  }
}

const parseArgs = (argv) => {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--') {
      flags['--'] = argv.slice(i + 1)
      break
    }
    if (a.startsWith('--')) {
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) flags[a.slice(2)] = true
      else flags[a.slice(2)] = argv[++i]
    } else positional.push(a)
  }
  return { flags, positional }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- context

const parentPane = () => {
  if (process.env.HERDR_ENV !== '1') fail('not running inside a Herdr pane (HERDR_ENV is not 1)')
  const id = process.env.HERDR_PANE_ID
  if (!id) fail('HERDR_PANE_ID is not set; run this from the agent pane itself')
  return id
}

const depth = () => Number(process.env.JMR_HERDR_DEPTH || 0)

const stateDir = (pane) => {
  const dir = path.join(os.tmpdir(), 'jmr-herdr', pane.replace(/[^A-Za-z0-9_-]/g, '_'))
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  return dir
}

const ledgerPath = (dir) => path.join(dir, 'ledger.json')
const loadLedger = (dir) => {
  try {
    return JSON.parse(fs.readFileSync(ledgerPath(dir), 'utf8'))
  } catch {
    return { helpers: [], helperTab: null }
  }
}
const saveLedger = (dir, ledger) => {
  const tmp = `${ledgerPath(dir)}.${process.pid}`
  fs.writeFileSync(tmp, JSON.stringify(ledger, null, 2), { mode: 0o600 })
  fs.renameSync(tmp, ledgerPath(dir))
}

const paneInfo = (pane) => {
  try {
    return herdr('pane', 'get', pane).pane
  } catch (e) {
    if (e.code === 'pane_not_found' || /not found/.test(e.message)) return null
    throw e
  }
}

const whoami = () => {
  const pane = parentPane()
  const self = herdr('pane', 'current', '--current').pane
  const rect = herdr('pane', 'layout', '--pane', pane).layout.panes.find((p) => p.pane_id === pane)?.rect
  const argv = herdr('pane', 'process-info', '--pane', pane).process_info.foreground_processes?.[0]?.argv ?? []
  return {
    pane,
    tab: self.tab_id,
    workspace: self.workspace_id,
    cwd: self.cwd,
    kind: kindFromAgentLabel(self.agent_session?.agent),
    argv,
    rect,
    depth: depth(),
  }
}

const gitRoot = (cwd) => {
  try {
    return execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

// Other live agents in the same checkout can edit the same files. The parent
// should know before it writes so it can tell the user.
const peersInCheckout = (me, ledger) => {
  const root = gitRoot(me.cwd)
  if (!root) return []
  const mine = new Set([me.pane, ...ledger.helpers.map((h) => h.pane)])
  return herdr('agent', 'list')
    .agents.filter((a) => !mine.has(a.pane_id) && gitRoot(a.foreground_cwd || a.cwd) === root)
    .map((a) => ({ name: a.name ?? null, agent: a.agent, pane: a.pane_id, status: a.agent_status }))
}

// ---------------------------------------------------------------- layout

const newPane = (me, ledger, { cwd, env = [] }) => {
  const live = ledger.helpers.filter((h) => !h.inTab && !h.inWorktree && paneInfo(h.pane))
  const where = placement({
    parentRect: me.rect,
    liveSplitHelpers: live.length,
    lastHelperPane: live.at(-1)?.pane,
    helperTab: ledger.helperTab && paneInfo(ledger.helperTab.lastPane) ? ledger.helperTab : null,
  })
  const envArgs = env.flatMap((e) => ['--env', e])
  if (where.mode === 'tab') {
    const res = herdr('tab', 'create', '--workspace', me.workspace, '--cwd', cwd, '--label', HELPER_TAB_LABEL, ...envArgs, '--no-focus')
    const pane = res.root_pane.pane_id
    ledger.helperTab = { tab: res.tab.tab_id, lastPane: pane, created: true }
    return { pane, inTab: true }
  }
  const target = where.target ?? me.pane
  const res = herdr('pane', 'split', '--pane', target, '--direction', where.direction, '--cwd', cwd, ...envArgs, '--no-focus')
  const pane = res.pane.pane_id
  const inTab = Boolean(ledger.helperTab && target === ledger.helperTab.lastPane)
  if (inTab) ledger.helperTab.lastPane = pane
  return { pane, inTab }
}

// `worktree create` takes no --env, so this helper sees depth 0. The brief
// still tells it not to start helpers of its own.
const worktreePane = (me, branch) => {
  const res = herdr('worktree', 'create', '--cwd', me.cwd, '--branch', branch, '--label', branch, '--no-focus')
  const pane = res.root_pane?.pane_id
  if (!pane) fail(`worktree created but herdr returned no pane: ${JSON.stringify(res).slice(0, 300)}`)
  return {
    pane,
    workspace: res.workspace?.workspace_id,
    cwd: res.workspace?.worktree?.checkout_path ?? res.root_pane.cwd,
  }
}

// When herdr's detector cannot classify an agent build, `agent start` times
// out even though the agent is up. Wait until its screen stops changing.
const waitForSettledScreen = async (pane, timeoutMs = 45000) => {
  const end = Date.now() + timeoutMs
  let last = ''
  let stable = 0
  while (Date.now() < end) {
    const text = herdr('pane', 'read', pane, '--source', 'visible')
    const body = typeof text === 'string' ? text.trim() : ''
    stable = body && body === last ? stable + 1 : 0
    if (stable >= 2) return true
    last = body
    await sleep(1500)
  }
  return false
}

// ---------------------------------------------------------------- commands

const cmdWhoami = () => {
  const me = whoami()
  const dir = stateDir(me.pane)
  const ledger = loadLedger(dir)
  console.log(JSON.stringify({ ...me, stateDir: dir, helpers: ledger.helpers.length, peersInCheckout: peersInCheckout(me, ledger) }, null, 2))
}

const cmdSpawn = async ({ flags }) => {
  const me = whoami()
  if (me.depth >= 1 && !flags['allow-nested']) {
    fail('this agent is itself a helper; helpers do not start helpers. Use your built-in subagents, or pass --allow-nested if the brief says to.', EXIT.usage)
  }
  const dir = stateDir(me.pane)
  const ledger = loadLedger(dir)
  const live = ledger.helpers.filter((h) => h.type === 'agent' && paneInfo(h.pane))
  if (live.length >= MAX_HELPERS) {
    fail(`already running ${live.length} helpers (limit ${MAX_HELPERS}). Wait for or close one first.`, EXIT.usage)
  }

  const kind = flags.kind || me.kind
  if (!kind) fail('could not tell which agent kind you are; pass --kind', EXIT.usage)
  const role = flags.role || 'helper'
  const repo = path.basename(gitRoot(me.cwd) || me.cwd)
  const name = flags.name || helperName({ kind, repo, role })
  if (!isAgentName(name)) fail(`"${name}" is not a valid agent name ([a-z][a-z0-9_-]{0,31})`, EXIT.usage)
  if (herdr('agent', 'list').agents.some((a) => a.name === name)) fail(`an agent named ${name} is already live; pass --name`, EXIT.usage)

  let brief = flags.brief
  if (flags['brief-file']) brief = fs.readFileSync(flags['brief-file'], 'utf8')
  if (!brief || brief === true) fail('pass --brief-file <path> or --brief "<text>"', EXIT.usage)

  const reportPath = path.join(dir, `${name}.md`)
  const donePath = path.join(dir, `${name}.done`)
  const briefPath = path.join(dir, `${name}.brief.md`)
  for (const p of [reportPath, donePath]) fs.rmSync(p, { force: true })
  fs.writeFileSync(briefPath, briefWithProtocol({ brief, name, reportPath, donePath, depth: me.depth + 1 }), { mode: 0o600 })

  const env = [`JMR_HERDR_DEPTH=${me.depth + 1}`, `JMR_HERDR_PARENT=${me.pane}`]
  let placed
  if (flags.worktree) placed = { ...worktreePane(me, flags.worktree), inWorktree: true }
  else placed = newPane(me, ledger, { cwd: flags.cwd || me.cwd, env })
  const { pane } = placed

  try {
    herdr('pane', 'rename', pane, `${role} (${name})`)
  } catch {}

  const extra = inheritedFlags(me.kind, kind, me.argv)
  let detected = true
  try {
    herdr('agent', 'start', name, '--kind', kind, '--pane', pane, '--timeout', '60000', ...(extra.length ? ['--', ...extra] : []))
  } catch (e) {
    if (e.code === 'agent_not_ready') {
      ledger.helpers.push({ name, kind, role, type: 'agent', pane, ...placed, reportPath, donePath, briefPath, detected: true, startedAt: new Date().toISOString() })
      saveLedger(dir, ledger)
      fail(`${name} is blocked on a startup dialog in pane ${pane}. Read it with \`read ${name}\` and ask the user before answering it.`, EXIT.blocked)
    }
    if (e.code !== 'timeout') throw e
    detected = false
    await waitForSettledScreen(pane)
  }

  const kickoff = kickoffPrompt(briefPath)
  if (detected) herdr('agent', 'prompt', name, kickoff)
  else {
    herdr('pane', 'send-text', pane, kickoff)
    herdr('pane', 'send-keys', pane, 'enter')
  }

  ledger.helpers.push({ name, kind, role, type: 'agent', pane, ...placed, reportPath, donePath, briefPath, detected, startedAt: new Date().toISOString() })
  saveLedger(dir, ledger)
  console.log(JSON.stringify({ name, kind, pane, worktree: placed.cwd ?? null, report: reportPath, detected }, null, 2))
}

const cmdRun = ({ flags }) => {
  const command = flags['--']
  if (!command?.length) fail('usage: run --label <text> -- <command...>', EXIT.usage)
  const me = whoami()
  const dir = stateDir(me.pane)
  const ledger = loadLedger(dir)
  const label = flags.label && flags.label !== true ? flags.label : command.join(' ').slice(0, 40)
  const { pane, inTab } = newPane(me, ledger, { cwd: flags.cwd || me.cwd })
  try {
    herdr('pane', 'rename', pane, label)
  } catch {}
  herdr('pane', 'run', pane, command.join(' '))
  const name = flags.name || `proc-${pane.replace(/[^A-Za-z0-9]/g, '')}`.toLowerCase()
  ledger.helpers.push({ name, role: label, type: 'process', pane, inTab, startedAt: new Date().toISOString() })
  saveLedger(dir, ledger)
  console.log(JSON.stringify({ name, pane, label }, null, 2))
}

const findHelper = (ledger, key) => ledger.helpers.find((h) => h.name === key || h.pane === key)

const helperState = (h) => {
  const info = paneInfo(h.pane)
  if (!info) return fs.existsSync(h.donePath ?? '') ? 'done' : 'gone'
  if (h.type === 'agent' && fs.existsSync(h.donePath)) return 'done'
  if (info.agent_status === 'blocked') return 'blocked'
  return h.type === 'process' ? 'running' : info.agent_status === 'unknown' ? 'working' : info.agent_status
}

const cmdWait = async ({ flags, positional }) => {
  const dir = stateDir(parentPane())
  const ledger = loadLedger(dir)
  const targets = (positional.length ? positional : ledger.helpers.filter((h) => h.type === 'agent' && !fs.existsSync(h.donePath)).map((h) => h.name))
    .map((key) => findHelper(ledger, key) ?? fail(`no helper named ${key}`, EXIT.usage))
    .filter((h) => h.type === 'agent')
  const timeout = Number(flags.timeout || 20 * 60 * 1000)
  const end = Date.now() + timeout
  const pending = new Set(targets.map((h) => h.name))
  const results = {}
  while (pending.size && Date.now() < end) {
    for (const h of targets.filter((t) => pending.has(t.name))) {
      const state = helperState(h)
      if (state === 'done' || state === 'blocked' || state === 'gone') {
        results[h.name] = { state, report: state === 'done' ? h.reportPath : null, pane: h.pane }
        pending.delete(h.name)
      }
    }
    if (pending.size) await sleep(2000)
  }
  for (const n of pending) results[n] = { state: 'timeout', pane: findHelper(ledger, n).pane }
  console.log(JSON.stringify(results, null, 2))
  const states = Object.values(results).map((r) => r.state)
  if (states.includes('blocked')) process.exit(EXIT.blocked)
  if (states.includes('gone')) process.exit(EXIT.gone)
  if (states.includes('timeout')) process.exit(EXIT.timeout)
}

const cmdRead = ({ flags, positional }) => {
  const dir = stateDir(parentPane())
  const h = findHelper(loadLedger(dir), positional[0]) ?? fail(`no helper named ${positional[0]}`, EXIT.usage)
  process.stdout.write(herdr('pane', 'read', h.pane, '--source', 'recent-unwrapped', '--lines', String(flags.lines || 80)))
}

const cmdList = () => {
  const dir = stateDir(parentPane())
  const ledger = loadLedger(dir)
  const rows = ledger.helpers.map((h) => ({ name: h.name, role: h.role, type: h.type, pane: h.pane, state: helperState(h), report: h.reportPath ?? null }))
  console.log(JSON.stringify(rows, null, 2))
}

// Only panes this parent created are ever closed. Reports stay on disk so the
// parent can still read them after the pane is gone.
const cmdClose = ({ flags, positional }) => {
  const dir = stateDir(parentPane())
  const ledger = loadLedger(dir)
  const targets = flags.all ? [...ledger.helpers] : positional.map((k) => findHelper(ledger, k) ?? fail(`no helper named ${k}`, EXIT.usage))
  const closed = []
  for (const h of targets) {
    if (h.inWorktree) {
      closed.push({ name: h.name, pane: h.pane, note: `left worktree workspace ${h.workspace} open; ask the user before removing it` })
    } else if (paneInfo(h.pane)) {
      herdr('pane', 'close', h.pane)
      closed.push({ name: h.name, pane: h.pane })
    }
    ledger.helpers = ledger.helpers.filter((x) => x !== h)
  }
  if (ledger.helperTab?.created && !ledger.helpers.some((h) => h.inTab)) {
    try {
      herdr('tab', 'close', ledger.helperTab.tab)
    } catch {}
    ledger.helperTab = null
  }
  saveLedger(dir, ledger)
  console.log(JSON.stringify({ closed }, null, 2))
}

const COMMANDS = { whoami: cmdWhoami, spawn: cmdSpawn, run: cmdRun, wait: cmdWait, read: cmdRead, list: cmdList, close: cmdClose }

const [command, ...rest] = process.argv.slice(2)
const handler = COMMANDS[command]
if (!handler) fail(`usage: helper.mjs <${Object.keys(COMMANDS).join('|')}> [...]`, EXIT.usage)
try {
  await handler(parseArgs(rest))
} catch (e) {
  fail(e.message)
}
