#!/usr/bin/env node
// Slice a model for the configured printer with the OrcaSlicer command line,
// then check the G-code before anyone offers to print it.
//
//   node slice.mjs <model.3mf|model.stl> [--quality 0.16mm-standard] [--set key=value]... [--colours "#000000,#FFFFFF"] [--out <dir>] [--json]
//   node slice.mjs check <file.gcode> [--profile sparkx-i7-0.4] [--json]
//   node slice.mjs profile --from <vendor-dir> --name <profile> --machine <name> --process <name> --filament <name> [--extra-process <name>]...

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import {
  PROFILES_DIR,
  applySettings,
  boxSlots,
  checkSummary,
  flattenProfile,
  formatDuration,
  indexVendorProfiles,
  loadConfig,
  loadProfile,
  markMulticolour,
  parseArgs,
  parseColours,
  parsePrintableArea,
  patchForOrca,
  setFooterColours,
  stripStartToolchange,
  summarizeGcode,
} from './lib.mjs'

const ORCA_FLATPAK = 'com.orcaslicer.OrcaSlicer'

function fail(message) {
  console.error(message)
  process.exit(1)
}

function profileName(flags) {
  if (flags.profile) return flags.profile
  try {
    return loadConfig().profile
  } catch {
    return undefined
  }
}

function hasCommand(name) {
  return spawnSync('sh', ['-c', `command -v ${name}`], { stdio: 'ignore' }).status === 0
}

// Prefer a native orca-slicer; fall back to the Flathub app, which runs on
// older distros because it brings its own libraries.
function orcaCommand(mounts) {
  if (process.env.JMR_ORCA) return { cmd: process.env.JMR_ORCA, pre: [] }
  if (hasCommand('orca-slicer')) return { cmd: 'orca-slicer', pre: [] }
  const installed = spawnSync('flatpak', ['info', ORCA_FLATPAK], { stdio: 'ignore' }).status === 0
  if (!installed) {
    fail(
      `OrcaSlicer is not installed. Ask the user before installing it (about 1 GB): flatpak --user install -y flathub ${ORCA_FLATPAK}`,
    )
  }
  const fsFlags = [...new Set(mounts)].map((dir) => `--filesystem=${dir}`)
  return { cmd: 'flatpak', pre: ['run', ...fsFlags, '--command=orca-slicer', ORCA_FLATPAK] }
}

function printSummary(summary, problems, profile, gcodeFile) {
  const colourOf = (tool) => (summary.colours[tool] ? ` (${summary.colours[tool]})` : '')
  const swapLines = summary.swaps.slice(1).map((swap) => `  filament ${swap.tool + 1}${colourOf(swap.tool)} at Z ${swap.z} mm`)
  const grams = summary.grams.map((g, i) => (g > 0 ? `filament ${i + 1}${colourOf(i)}: ${g} g` : null)).filter(Boolean)
  const lines = [
    `G-code: ${gcodeFile}`,
    `Printer profile: ${profile.name} (${profile.printer})`,
    `Estimated time: ${summary.seconds === null ? 'unknown' : formatDuration(summary.seconds)}`,
    `Plastic: ${summary.totalGrams} g (${grams.join(', ')})`,
    `Layers: ${summary.layers}, height ${summary.maxZ} mm, nozzle ${summary.nozzleTemp} °C, bed ${summary.bedTemp} °C, order ${summary.sequence ?? 'by layer'}`,
    summary.bounds
      ? `Footprint on the bed: X ${summary.bounds.minX.toFixed(1)}-${summary.bounds.maxX.toFixed(1)}, Y ${summary.bounds.minY.toFixed(1)}-${summary.bounds.maxY.toFixed(1)} mm`
      : 'Footprint on the bed: none',
    `First filament: ${summary.swaps[0] ? `${summary.swaps[0].tool + 1}${colourOf(summary.swaps[0].tool)}` : 'unknown'}`,
    `Colour swaps: ${Math.max(summary.swaps.length - 1, 0)}`,
    ...swapLines,
    ...(summary.swaps.length > 10 && summary.sequence !== 'by object'
      ? ['TIP: many swaps. If each object is one colour, slice again with --set "print_sequence=by object" so each object prints whole, one colour at a time.']
      : []),
    ...problems.map((problem) => `PROBLEM: ${problem}`),
  ]
  console.log(lines.join('\n'))
}

function report(gcodeFile, profile, asJson) {
  const summary = summarizeGcode(fs.readFileSync(gcodeFile, 'utf8'))
  const problems = checkSummary(summary, { bed: profile.bed, maxHeight: profile.maxHeight })
  if ((profile.postprocess ?? []).includes('multicolour-header') && !summary.multicolour) {
    problems.push('The header has no "; multicolor_method = 1" line, so this printer would skip every colour swap.')
  }
  if (asJson) console.log(JSON.stringify({ gcode: gcodeFile, profile: profile.name, ...summary, problems }, null, 2))
  else printSummary(summary, problems, profile, gcodeFile)
  return problems.length ? 2 : 0
}

// Colours for the file's filaments: --colours wins, else the slots loaded in
// the printer right now, else none (the touchscreen then shows placeholders).
async function slotColours(flags) {
  if (flags.colours) return parseColours(flags.colours)
  try {
    const config = loadConfig()
    const response = await fetch(`${config.url}/printer/objects/query?box`, { signal: AbortSignal.timeout(4000) })
    const slots = boxSlots((await response.json()).result.status.box)
    return slots.map((slot) => slot.color)
  } catch {
    return []
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function processFile(profile, quality) {
  if (!quality) return profile.files.process
  const file = path.join(profile.dir, 'processes', `${quality}.json`)
  if (fs.existsSync(file)) return file
  const known = fs.existsSync(path.join(profile.dir, 'processes')) ? fs.readdirSync(path.join(profile.dir, 'processes')).map((f) => f.replace(/\.json$/, '')) : []
  return fail(`Unknown quality "${quality}". Known: ${known.join(', ') || 'none'}.`)
}

// Writes the settings this slice uses into the output folder: the chosen
// process with --set overrides applied plus one filament file per slot with
// that slot's colour so the G-code footer names the right colours.
function writeSettings(profile, flags, colours, settingsDir) {
  const base = {
    machine: readJson(profile.files.machine),
    process: readJson(processFile(profile, flags.quality)),
    filament: readJson(profile.files.filament),
  }
  const settings = applySettings(base, [].concat(flags.set ?? []))
  fs.mkdirSync(settingsDir, { recursive: true })
  const write = (name, data) => {
    const file = path.join(settingsDir, name)
    fs.writeFileSync(file, JSON.stringify(data, null, 1))
    return file
  }
  const filaments = Array.from({ length: profile.slots }, (_, i) =>
    write(`filament-${i + 1}.json`, colours[i] ? { ...settings.filament, filament_colour: colours[i] } : settings.filament),
  )
  return { machine: write('machine.json', settings.machine), process: write('process.json', settings.process), filaments }
}

const POSTPROCESS = {
  'strip-start-toolchange': (gcode) => stripStartToolchange(gcode).gcode,
  'multicolour-header': (gcode) => markMulticolour(gcode),
  'slot-colours': (gcode, colours) => setFooterColours(gcode, colours),
}

async function slice(model, flags) {
  const name = profileName(flags)
  if (!name) fail('Pass --profile <name> or set "profile" in the printer config.')
  const profile = loadProfile(name)
  const modelFile = path.resolve(model)
  if (!fs.existsSync(modelFile)) fail(`Model not found: ${modelFile}`)
  const outDir = path.resolve(flags.out ?? path.join(path.dirname(modelFile), 'sliced'))
  fs.mkdirSync(outDir, { recursive: true })
  for (const file of fs.readdirSync(outDir).filter((f) => /^plate_\d+\.gcode$|^result\.json$/.test(f))) {
    fs.rmSync(path.join(outDir, file))
  }

  const colours = await slotColours(flags)
  let settings
  try {
    settings = writeSettings(profile, flags, colours, path.join(outDir, '.settings'))
  } catch (error) {
    fail(error.message)
  }
  const { cmd, pre } = orcaCommand([path.dirname(modelFile), profile.dir, outDir])
  // Orca reads the 3MF placement with its own offset, so let it arrange the
  // plate; that centres a single model and spaces several apart.
  const args = [
    ...pre,
    '--arrange',
    '1',
    '--slice',
    '0',
    '--load-settings',
    `${settings.machine};${settings.process}`,
    '--load-filaments',
    settings.filaments.join(';'),
    '--outputdir',
    outDir,
    modelFile,
  ]
  const run = spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, LC_ALL: 'C.UTF-8' }, timeout: 900000 })
  const plate = path.join(outDir, 'plate_1.gcode')
  if (!fs.existsSync(plate)) {
    const log = `${run.stdout ?? ''}${run.stderr ?? ''}`
      .split('\n')
      .filter((line) => line.trim() && !/Gtk-CRITICAL|\[trace\]|\] \[(info|debug)\]/.test(line))
      .slice(-25)
      .join('\n')
    fail(`OrcaSlicer wrote no G-code (exit ${run.status}).\n${log}`)
  }

  let gcode = fs.readFileSync(plate, 'utf8')
  for (const step of profile.postprocess ?? []) {
    if (!POSTPROCESS[step]) fail(`Unknown post-process step "${step}" in ${profile.name}.`)
    gcode = POSTPROCESS[step](gcode, colours)
  }
  const target = path.join(outDir, `${path.basename(modelFile).replace(/\.(3mf|stl)$/i, '')}.gcode`)
  fs.writeFileSync(target, gcode)
  fs.rmSync(plate)
  if (!colours.length) console.log('NOTE: no slot colours (printer unreachable and no --colours), so the touchscreen shows placeholder colours.')
  return report(target, profile, flags.json)
}

function buildProfile(flags) {
  for (const key of ['from', 'name', 'machine', 'process', 'filament']) {
    if (!flags[key]) fail(`profile needs --${key}.`)
  }
  const index = indexVendorProfiles(path.resolve(flags.from))
  const flat = {
    machine: flattenProfile(index, 'machine', flags.machine),
    process: flattenProfile(index, 'process', flags.process),
    filament: flattenProfile(index, 'filament', flags.filament),
  }
  const patched = patchForOrca(flat)
  const dir = path.join(PROFILES_DIR, flags.name)
  fs.mkdirSync(dir, { recursive: true })
  for (const [kind, data] of Object.entries(patched)) {
    fs.writeFileSync(path.join(dir, `${kind}.json`), `${JSON.stringify(data, null, 1)}\n`)
  }
  // Extra quality presets go to processes/<slug>.json for --quality.
  for (const extra of [].concat(flags['extra-process'] ?? [])) {
    const patchedExtra = patchForOrca({ machine: {}, process: flattenProfile(index, 'process', extra), filament: {} }).process
    const slug = extra.split('@')[0].trim().toLowerCase().replace(/[^a-z0-9.]+/g, '-')
    fs.mkdirSync(path.join(dir, 'processes'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'processes', `${slug}.json`), `${JSON.stringify(patchedExtra, null, 1)}\n`)
  }
  const metaFile = path.join(dir, 'profile.json')
  if (!fs.existsSync(metaFile)) {
    const area = parsePrintableArea(patched.machine.printable_area)
    const meta = {
      printer: patched.machine.printer_model,
      bed: area,
      maxHeight: Number(patched.machine.printable_height) || null,
      slots: 4,
      postprocess: [],
      prepareMacro: null,
      source: { machine: flags.machine, process: flags.process, filament: flags.filament },
    }
    fs.writeFileSync(metaFile, `${JSON.stringify(meta, null, 2)}\n`)
  }
  console.log(`Wrote ${dir}. Review profile.json (slots, postprocess, prepareMacro) before slicing with it.`)
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), ['json'])
  const [first, second] = positional
  if (!first) fail('Usage: slice.mjs <model.3mf|stl> | check <file.gcode> | profile --from ...')
  if (first === 'profile') return buildProfile(flags)
  if (first === 'check') {
    if (!second) fail('Usage: slice.mjs check <file.gcode>')
    const name = profileName(flags)
    if (!name) fail('Pass --profile <name> or set "profile" in the printer config.')
    process.exit(report(path.resolve(second), loadProfile(name), flags.json))
  }
  process.exit(await slice(first, flags))
}

main()
