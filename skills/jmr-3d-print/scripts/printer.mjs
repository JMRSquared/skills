#!/usr/bin/env node
// Talk to a Klipper printer through its Moonraker API.
//
//   node printer.mjs info | status [--json] | slots | files | history [--limit 5] | console [--lines 20]
//   node printer.mjs upload <file.gcode>
//   node printer.mjs start <file-on-printer.gcode> --yes
//   node printer.mjs pause | resume | cancel
//   node printer.mjs watch [--interval 15] [--wait 10]
//
// start needs --yes, which an agent passes only after the user has asked for
// this print in their current message. Profiles with "start": "screen" never
// start over the API; the user starts the file on the touchscreen.

import fs from 'node:fs'
import path from 'node:path'

import { boxState, formatDuration, jobOutcome, loadConfig, loadProfile, parseArgs, printState, readHeaderFlags } from './lib.mjs'

const STATUS_OBJECTS = 'print_stats&virtual_sdcard&pause_resume&extruder&heater_bed&gcode_move=gcode_position'
const SENSOR = 'filament_switch_sensor filament_sensor'
const WATCH_EXIT = { complete: 0, paused: 2, error: 3, cancelled: 3, loop: 4 }
// Creality's START_PRINT reports the file's colour mode once per run, so two
// reports for one job mean the firmware restarted the file by itself.
const START_MARKER = /^\/\/ (non )?multicolor_method/

function fail(message) {
  console.error(message)
  process.exit(1)
}

async function api(config, route, { method = 'GET', body, timeout = 15000, raw = false, headers } = {}) {
  let response
  try {
    response = await fetch(`${config.url}${route}`, { method, body, headers, signal: AbortSignal.timeout(timeout) })
  } catch (error) {
    fail(`Cannot reach the printer at ${config.url} (${error.cause?.code ?? error.name}). Check it is on and on the same network.`)
  }
  const text = await response.text()
  if (raw && response.ok) return text
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { error: { message: text.slice(0, 300) } }
  }
  if (!response.ok) fail(`Printer refused ${route}: ${data.error?.message ?? text.slice(0, 300)}`)
  return data.result
}

async function query(config, objects) {
  return (await api(config, `/printer/objects/query?${objects}`)).status
}

function profileOf(config) {
  return config.profile ? loadProfile(config.profile) : null
}

async function readStatus(config) {
  const status = await query(config, STATUS_OBJECTS)
  const stats = status.print_stats ?? {}
  const sd = status.virtual_sdcard ?? {}
  return {
    state: printState(status),
    file: stats.filename || null,
    progress: Math.min(100, Math.round((sd.progress ?? 0) * 1000) / 10),
    layer: sd.layer ?? null,
    layers: sd.layer_count ?? null,
    elapsed: Math.round(stats.print_duration ?? 0),
    nozzle: { now: Math.round(status.extruder?.temperature ?? 0), target: status.extruder?.target ?? 0 },
    bed: { now: Math.round(status.heater_bed?.temperature ?? 0), target: status.heater_bed?.target ?? 0 },
    z: Math.round((status.gcode_move?.gcode_position?.[2] ?? 0) * 100) / 100,
  }
}

function statusLine(s) {
  const layer = s.layer !== null && s.layers ? `, layer ${s.layer}/${s.layers}` : ''
  const job = s.file ? ` ${s.file} ${s.progress}%${layer}, Z ${s.z} mm` : ''
  return `${s.state}${job}, nozzle ${s.nozzle.now}/${s.nozzle.target} °C, bed ${s.bed.now}/${s.bed.target} °C`
}

async function gcode(config, script, timeout = 30000) {
  return api(config, `/printer/gcode/script?script=${encodeURIComponent(script)}`, { method: 'POST', timeout })
}

async function latestJob(config) {
  const history = await api(config, '/server/history/list?limit=1&order=desc')
  return history.jobs?.[0] ?? null
}

async function consoleEntries(config, lines, since = 0) {
  const store = await api(config, `/server/gcode_store?count=${lines}`)
  return store.gcode_store.filter((entry) => entry.time >= since)
}

function screenSteps(name) {
  return [
    `Start ${name} on the printer's touchscreen:`,
    '  1. Check the bed is empty and clean.',
    `  2. Open the file list and pick ${name}.`,
    '  3. On the colour screen, match each file colour to the slot holding that colour, then start.',
    'Then run "watch --wait 10" to follow it.',
  ].join('\n')
}

const COMMANDS = {
  async info(config) {
    const info = await api(config, '/printer/info')
    console.log(`${info.hostname}: ${info.state_message} (Klipper ${info.software_version}, ${info.cpu_info})`)
    const profile = profileOf(config)
    const startFrom = profile?.start === 'screen' ? 'the touchscreen' : 'the API'
    console.log(`Moonraker: ${config.url}${profile ? `, slicer profile ${profile.name}, prints start from ${startFrom}` : ''}`)
  },

  async status(config, { flags }) {
    const s = await readStatus(config)
    console.log(flags.json ? JSON.stringify(s, null, 2) : statusLine(s))
  },

  async slots(config) {
    const status = await query(config, `box&${encodeURIComponent(SENSOR)}`)
    const { slots, toolhead, mapping } = boxState(status.box)
    if (!slots.length) return console.log('No filament box reported. The printer has one filament.')
    for (const slot of slots) {
      const here = slot.slot === toolhead ? '  <- in the toolhead' : ''
      console.log(`slot ${slot.slot} (filament ${slot.filament}): ${slot.color} ${slot.material} (${slot.brand})${here}`)
    }
    const sensor = status[SENSOR]
    if (sensor) console.log(`Toolhead filament sensor: ${sensor.filament_detected ? 'loaded' : 'empty'}`)
    const remapped = mapping.some((entry) => entry.slot !== slots[entry.filament - 1]?.slot)
    if (remapped) {
      console.log(`Mapping saved by the last screen start: ${mapping.map((entry) => `filament ${entry.filament} -> ${entry.slot}`).join(', ')}`)
    }
  },

  async files(config) {
    const files = await api(config, '/server/files/list?root=gcodes')
    const visible = files.filter((file) => !file.path.startsWith('.')).sort((a, b) => b.modified - a.modified)
    for (const file of visible) console.log(`${new Date(file.modified * 1000).toLocaleString('sv-SE').slice(0, 16)}  ${file.path}`)
  },

  async history(config, { flags }) {
    const limit = Number(flags.limit ?? 5)
    const { jobs = [] } = await api(config, `/server/history/list?limit=${limit}&order=desc`)
    for (const job of jobs.map(jobOutcome)) {
      const when = job.started ? job.started.toLocaleString('sv-SE').slice(0, 16) : '?'
      console.log(`${when}  ${job.outcome.padEnd(9)} ${formatDuration(job.printSeconds).padStart(9)}  ${(job.filamentMm / 1000).toFixed(1)} m  ${job.file}`)
    }
  },

  async console(config, { flags }) {
    for (const entry of await consoleEntries(config, Number(flags.lines ?? 20))) console.log(entry.message.slice(0, 200))
  },

  async upload(config, { positional }) {
    const file = positional[0]
    if (!file || !fs.existsSync(file)) fail('Usage: printer.mjs upload <file.gcode>')
    const profile = profileOf(config)
    const content = fs.readFileSync(file)
    if (profile?.postprocess?.includes('multicolour-header') && !readHeaderFlags(content.subarray(0, 4096).toString('utf8')).multicolour) {
      fail(`${file} has no "; multicolor_method = 1" line, so this printer would skip its colour swaps. Slice it with slice.mjs.`)
    }
    const form = new FormData()
    form.append('root', 'gcodes')
    form.append('file', new Blob([content]), path.basename(file))
    const result = await api(config, '/server/files/upload', { method: 'POST', body: form, timeout: 300000 })
    console.log(`Uploaded ${result.item.path}. Nothing is printing yet.`)
    if (profile?.start === 'screen') console.log(screenSteps(result.item.path))
  },

  async start(config, { positional, flags }) {
    const name = positional[0]
    if (!name) fail('Usage: printer.mjs start <file.gcode> --yes')
    const profile = profileOf(config)
    if (profile?.start === 'screen') {
      // On the SPARKX i7 an API start of a multicolour file reruns its start
      // routine every few minutes. A file without the multicolour flag
      // skips colour swaps and the slot mapping. The touchscreen start works
      // and asks the user to map file colours to slots.
      fail(`${profile.name} prints are started on the touchscreen, not over the network.\n${screenSteps(name)}`)
    }
    if (flags.yes !== true) {
      fail('Refusing to start without --yes. Pass it only after the user has asked for this print and confirmed the bed is clear.')
    }
    const s = await readStatus(config)
    if (s.state === 'printing' || s.state === 'paused') fail(`The printer is busy: ${statusLine(s)}`)
    const files = await api(config, '/server/files/list?root=gcodes')
    if (!files.some((file) => file.path === name)) fail(`${name} is not on the printer. Upload it first.`)
    if (profile?.prepareMacro) {
      console.log(`Loading the first filament (${profile.prepareMacro})...`)
      await gcode(config, `${profile.prepareMacro} FILENAME=${name}`, 600000)
    }
    await api(config, `/printer/print/start?filename=${encodeURIComponent(name)}`, { method: 'POST' })
    console.log(`Started ${name}. Run "watch" to follow it.`)
  },

  async pause(config) {
    await api(config, '/printer/print/pause', { method: 'POST', timeout: 60000 })
    console.log('Paused.')
  },

  async resume(config) {
    await api(config, '/printer/print/resume', { method: 'POST', timeout: 60000 })
    console.log('Resumed.')
  },

  async cancel(config) {
    await api(config, '/printer/print/cancel', { method: 'POST', timeout: 60000 })
    console.log('Cancelled.')
  },

  // Prints a line when the state or progress decade changes and exits
  // when the job ends: 0 finished, 2 paused, 3 error or cancelled, 4 the start
  // routine restarted by itself. --wait <minutes> waits for a job the user is
  // about to start on the screen (default 1).
  async watch(config, { flags }) {
    const interval = Number(flags.interval ?? 15) * 1000
    const waitUntil = Date.now() + Number(flags.wait ?? 1) * 60000
    let last = ''
    let watching = false
    for (;;) {
      const s = await readStatus(config)
      const job = await latestJob(config)
      const running = job?.status === 'in_progress'
      watching ||= running
      const key = `${s.state}|${Math.floor(s.progress / 10)}`
      if (key !== last) console.log(`${new Date().toTimeString().slice(0, 8)} ${statusLine(s)}`)
      last = key

      if (!watching) {
        if (Date.now() > waitUntil) return console.log('Nothing is printing.')
      } else if (s.state === 'paused') {
        console.log('Job paused. Find out why before anyone resumes it:')
        await COMMANDS.console(config, { flags: { lines: 10 } })
        process.exit(WATCH_EXIT.paused)
      } else if (!running) {
        const outcome = jobOutcome(job)
        console.log(`Job ${outcome.outcome}: ${outcome.file}, ${formatDuration(outcome.printSeconds)} printing.`)
        if (outcome.outcome !== 'complete') await COMMANDS.console(config, { flags: { lines: 10 } })
        process.exit(WATCH_EXIT[outcome.outcome] ?? 3)
      } else if ((s.layer ?? 0) <= 1) {
        const entries = await consoleEntries(config, 200, job.start_time - 5)
        if (entries.filter((entry) => START_MARKER.test(entry.message)).length >= 2) {
          console.log('The start routine ran twice for one job, so the firmware is restarting the file by itself. Cancel it, then start it from the touchscreen.')
          process.exit(WATCH_EXIT.loop)
        }
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  },
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), ['json', 'yes'])
  const [command, ...rest] = positional
  const handler = COMMANDS[command]
  if (!handler) fail(`Usage: printer.mjs ${Object.keys(COMMANDS).join(' | ')}`)
  let config
  try {
    config = loadConfig()
  } catch (error) {
    fail(error.message)
  }
  await handler(config, { positional: rest, flags })
}

main()
