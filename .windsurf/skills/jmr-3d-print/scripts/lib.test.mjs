import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'

import {
  applySettings,
  boxSlots,
  boxState,
  buildOrca3mf,
  checkSummary,
  configPath,
  crc32,
  flattenProfile,
  indexVendorProfiles,
  jobOutcome,
  layoutObjects,
  loadConfig,
  loadProfile,
  markMulticolour,
  meshBounds,
  meshReport,
  parseArgs,
  parseColours,
  parseDuration,
  parsePrintableArea,
  parseStl,
  patchForOrca,
  printState,
  readHeaderFlags,
  setFooterColours,
  stripStartToolchange,
  summarizeGcode,
  zipStore,
} from './lib.mjs'

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'jmr-3d-print-'))
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data))
}

function binaryStl(triangles) {
  const buf = Buffer.alloc(84 + triangles.length * 50)
  buf.writeUInt32LE(triangles.length, 80)
  triangles.forEach((tri, i) => tri.flat().forEach((n, k) => buf.writeFloatLE(n, 84 + i * 50 + 12 + k * 4)))
  return buf
}

const START = ['START_PRINT EXTRUDER_TEMP=220 BED_TEMP=55', 'M8200 P S0', 'T0', 'M8200 O', 'G21']
const START_SWAP = ['G1 X0 F18000', 'M8200 P S0', 'M8200 R E-28', 'M8200 C S0', 'M8200 L I0', 'T0', 'M8200 O']
const LAYERS = [
  '; estimated printing time (normal mode) = 13m 7s',
  '; filament used [g] = 1.94, 0.87',
  '; total layers count = 18',
  '; max_z_height: 3.60',
  ';LAYER_CHANGE',
  ';Z:0.2',
  'EXCLUDE_OBJECT_START NAME=tag',
  'G1 X100 Y110 E1.2',
  'G1 X150 Y140 E0.5',
  'G1 X10 Y10',
  'EXCLUDE_OBJECT_END NAME=tag',
  'G1 X270 Y130 E5',
  ';Z:1.4',
  'G1 X0 F18000',
  'M8200 C S0',
  'T1',
  'M8200 O',
  'T1',
]

describe('config', () => {
  it('reads the printer from the config file and lets env override it', () => {
    const dir = tempDir()
    const env = { XDG_CONFIG_HOME: dir }
    writeJson(configPath(env), { url: 'http://10.0.0.5:7125/', profile: 'a' })
    assert.deepEqual(loadConfig(env), { url: 'http://10.0.0.5:7125', profile: 'a' })
    assert.equal(loadConfig({ ...env, JMR_PRINTER_URL: 'http://x:1' }).url, 'http://x:1')
  })

  it('says how to configure a printer when none is set', () => {
    assert.throws(() => loadConfig({ XDG_CONFIG_HOME: tempDir() }), /No printer configured/)
  })

  it('loads the shipped SPARKX i7 profile', () => {
    const profile = loadProfile('sparkx-i7-0.4')
    assert.deepEqual(profile.bed, { width: 260, depth: 260 })
    assert.equal(profile.start, 'screen')
    assert.deepEqual(profile.postprocess, ['strip-start-toolchange', 'multicolour-header', 'slot-colours'])
    assert.ok(fs.existsSync(path.join(profile.dir, 'processes', '0.16mm-standard.json')))
    for (const file of Object.values(profile.files)) assert.ok(fs.existsSync(file), file)
  })

  it('names the known profiles when one is missing', () => {
    assert.throws(() => loadProfile('nope'), /Known profiles: .*sparkx-i7-0.4/)
  })
})

describe('profiles', () => {
  it('merges the inherits chain into one complete profile', () => {
    const dir = tempDir()
    writeJson(path.join(dir, 'machine', 'base.json'), { name: 'base', a: '1', b: '1' })
    writeJson(path.join(dir, 'machine', 'sub', 'mid.json'), { name: 'mid', inherits: 'base', b: '2' })
    writeJson(path.join(dir, 'machine', 'leaf.json'), { name: 'leaf', inherits: 'mid', c: '3' })
    const flat = flattenProfile(indexVendorProfiles(dir), 'machine', 'leaf')
    assert.deepEqual(flat, { name: 'leaf', a: '1', b: '2', c: '3', from: 'User', is_custom_defined: '0' })
  })

  it('rejects a missing parent', () => {
    const dir = tempDir()
    writeJson(path.join(dir, 'process', 'p.json'), { name: 'p', inherits: 'gone' })
    assert.throws(() => flattenProfile(indexVendorProfiles(dir), 'process', 'p'), /gone/)
  })

  it('keeps the 28 mm cut retraction and removes flush_length_5 for Orca', () => {
    const change = [
      '{if retraction_distances_when_cut[previous_extruder] < 28}',
      'M8200 R E-{retraction_distances_when_cut[previous_extruder]}',
      '{else}',
      'M8200 R E-28',
      '{endif}',
      '{if flush_length_5 > 1}',
      'G1 E{flush_length_5 * 0.2}',
      '{endif}',
    ].join('\n')
    const out = patchForOrca({
      machine: { change_filament_gcode: change, retraction_distances_when_cut: '28' },
      process: { enable_prime_tower: '1' },
      filament: {},
    })
    assert.match(out.machine.change_filament_gcode, /^M8200 R E-28\n\{if 0 > 1\}\nG1 E\{0 \* 0.2\}/)
    assert.equal(out.machine.retraction_distances_when_cut, '18')
    assert.equal(out.process.enable_prime_tower, '0')
  })

  it('reads the bed size from printable_area', () => {
    assert.deepEqual(parsePrintableArea('0x0,260x0,260x260,0x260'), { width: 260, depth: 260 })
  })
})

describe('G-code', () => {
  it('removes the extra cut and reload of the first filament before layer 1', () => {
    const gcode = [...START, ...START_SWAP, ...LAYERS].join('\n')
    const { gcode: out, removed } = stripStartToolchange(gcode)
    assert.equal(removed, START_SWAP.length)
    assert.equal(out, [...START, ...LAYERS].join('\n'))
  })

  it('leaves G-code without a start swap alone', () => {
    const gcode = [...START, ...LAYERS].join('\n')
    assert.deepEqual(stripStartToolchange(gcode), { gcode, removed: 0 })
  })

  it('summarises time, plastic, swaps and the footprint inside objects', () => {
    const summary = summarizeGcode([...START, ...LAYERS].join('\n'))
    assert.equal(summary.seconds, 787)
    assert.deepEqual(summary.grams, [1.94, 0.87])
    assert.equal(summary.totalGrams, 2.81)
    assert.equal(summary.layers, 18)
    assert.equal(summary.maxZ, 3.6)
    assert.equal(summary.nozzleTemp, 220)
    assert.equal(summary.bedTemp, 55)
    assert.deepEqual(summary.swaps, [
      { tool: 0, z: null },
      { tool: 1, z: 1.4 },
    ])
    assert.deepEqual(summary.bounds, { minX: 100, maxX: 150, minY: 110, maxY: 140 })
  })

  it('parses slicer durations', () => {
    assert.equal(parseDuration('1h 2m 3s'), 3723)
    assert.equal(parseDuration('1d 0h 1m 0s'), 86460)
  })

  it('flags parts off the bed, too tall or missing', () => {
    const base = { seconds: 60, maxZ: 10, bounds: { minX: 1, maxX: 50, minY: 1, maxY: 50 } }
    const limits = { bed: { width: 260, depth: 260 }, maxHeight: 255 }
    assert.deepEqual(checkSummary(base, limits), [])
    assert.match(checkSummary({ ...base, bounds: { ...base.bounds, maxX: 300 } }, limits)[0], /off the 260 x 260/)
    assert.match(checkSummary({ ...base, maxZ: 300 }, limits)[0], /300 mm tall/)
    assert.match(checkSummary({ ...base, bounds: null }, limits)[0], /empty/)
  })
})

describe('Creality G-code fixes', () => {
  const header = '; HEADER_BLOCK_START\n; generated by OrcaSlicer 2.5.1\n; HEADER_BLOCK_END\n\nG28\n'

  it('adds the multicolour flag once, right after the header', () => {
    const once = markMulticolour(header)
    assert.equal(once, '; HEADER_BLOCK_START\n; generated by OrcaSlicer 2.5.1\n; HEADER_BLOCK_END\n\n; multicolor_method = 1 \n\nG28\n')
    assert.equal(markMulticolour(once), once)
    assert.deepEqual(readHeaderFlags(once), { multicolour: true, slicer: 'OrcaSlicer' })
    assert.deepEqual(readHeaderFlags(header), { multicolour: false, slicer: 'OrcaSlicer' })
  })

  it('refuses G-code without an OrcaSlicer header', () => {
    assert.throws(() => markMulticolour('G28\n'), /HEADER_BLOCK_END/)
  })

  it('writes the slot colours into the footer and keeps the entry count', () => {
    const footer = '; extruder_colour = #F2754E;#FFFFFF;#FFFFFF;#FFFFFF\n; filament_colour = #F2754E;#FFFFFF;#FFFFFF;#FFFFFF\n; other = 1\n'
    const out = setFooterColours(footer, ['#000000', '#FFFFFF', '#FF6E1A'])
    assert.equal(out, '; extruder_colour = #000000;#FFFFFF;#FF6E1A;#FF6E1A\n; filament_colour = #000000;#FFFFFF;#FF6E1A;#FF6E1A\n; other = 1\n')
    assert.equal(setFooterColours(footer, []), footer)
  })

  it('reads the multicolour flag, footer colours and print order in the summary', () => {
    const gcode = [...START, '; multicolor_method = 1 ', ...LAYERS, '; filament_colour = #000000;#FFFFFF', '; print_sequence = by object'].join('\n')
    const summary = summarizeGcode(gcode)
    assert.equal(summary.multicolour, true)
    assert.deepEqual(summary.colours, ['#000000', '#FFFFFF'])
    assert.equal(summary.sequence, 'by object')
  })
})

describe('slice settings', () => {
  const profiles = { machine: { nozzle_diameter: ['0.4'] }, process: { layer_height: '0.2', print_sequence: 'by layer' }, filament: { nozzle_temperature: ['220'] } }

  it('puts each override in the file that defines it', () => {
    const out = applySettings(profiles, ['print_sequence=by object', 'layer_height=0.16', 'nozzle_temperature=215'])
    assert.equal(out.process.print_sequence, 'by object')
    assert.equal(out.process.layer_height, '0.16')
    assert.deepEqual(out.filament.nozzle_temperature, ['215'])
    assert.equal(profiles.process.layer_height, '0.2')
  })

  it('rejects unknown keys and malformed pairs', () => {
    assert.throws(() => applySettings(profiles, ['layer_hieght=0.1']), /Unknown setting "layer_hieght"/)
    assert.throws(() => applySettings(profiles, ['layer_height']), /key=value/)
  })

  it('parses colour lists', () => {
    assert.deepEqual(parseColours('#000000, ffffff;FF6E1A'), ['#000000', '#FFFFFF', '#FF6E1A'])
    assert.throws(() => parseColours('red'), /#RRGGBB/)
  })
})

describe('printer state', () => {
  it('treats an active sd card as printing even when print_stats says standby', () => {
    assert.equal(printState({ print_stats: { state: 'standby' }, virtual_sdcard: { is_active: true } }), 'printing')
  })

  it('reports paused, error, finished and idle', () => {
    assert.equal(printState({ print_stats: { state: 'standby' }, pause_resume: { is_paused: true } }), 'paused')
    assert.equal(printState({ print_stats: { state: 'error' } }), 'error')
    assert.equal(printState({ print_stats: { state: 'complete' }, virtual_sdcard: { is_active: false } }), 'complete')
    assert.equal(printState({ print_stats: { state: 'standby' }, virtual_sdcard: { is_active: false } }), 'idle')
  })

  it('maps CFS slots to filament numbers and skips boxes that are not connected', () => {
    const box = {
      state: 'connect',
      T1: { state: 'connect', color_value: ['0000000', '0FF6E1A'], material_type: ['001001', '002002'], vender: ['unknown', 'Acme'] },
      T2: { state: '-1', color_value: ['-1', '-1'] },
    }
    assert.deepEqual(boxSlots(box), [
      { filament: 1, slot: 'T1A', color: '#000000', material: 'PLA', brand: 'unknown' },
      { filament: 2, slot: 'T1B', color: '#FF6E1A', material: '002002', brand: 'Acme' },
    ])
    assert.deepEqual(boxSlots(undefined), [])
  })

  it('names the slot in the toolhead and the mapping the screen saved', () => {
    const box = {
      map: { T1A: 'T1C', T1B: 'T1B', T1C: 'T1C', T1D: 'T1D', T2A: 'T2A' },
      T1: { state: 'connect', filament: 'C', color_value: ['0000000', '0FFFFFF', '0FF6E1A', '0100989'], material_type: [], vender: [] },
      T2: { state: '-1', filament: '-1', color_value: ['-1'] },
    }
    const state = boxState(box)
    assert.equal(state.toolhead, 'T1C')
    assert.deepEqual(state.mapping[0], { filament: 1, slot: 'T1C' })
    assert.deepEqual(boxState(undefined), { slots: [], toolhead: null, mapping: [] })
  })

  it('turns a history record into an outcome', () => {
    const job = { filename: 'clips.gcode', status: 'completed', start_time: 1794945000, print_duration: 3379.4, filament_used: 3958.2 }
    assert.deepEqual(jobOutcome(job), { file: 'clips.gcode', outcome: 'complete', started: new Date(1794945000000), printSeconds: 3379, filamentMm: 3958 })
    assert.equal(jobOutcome({ ...job, status: 'klippy_shutdown' }).outcome, 'error')
    assert.equal(jobOutcome({ ...job, status: 'in_progress' }).outcome, 'printing')
    assert.equal(jobOutcome(null), null)
  })
})

describe('3MF', () => {
  const triangle = [
    [0, 0, 1],
    [10, 0, 1],
    [0, 20, 3],
  ]

  it('reads binary and ASCII STL', () => {
    assert.deepEqual(parseStl(binaryStl([triangle])), [triangle])
    const ascii = `solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 1\nvertex 10 0 1\nvertex 0 20 3\nendloop\nendfacet\nendsolid t\n`
    assert.deepEqual(parseStl(Buffer.from(ascii)), [triangle])
  })

  it('measures bounds without spreading huge arrays', () => {
    const many = Array.from({ length: 200000 }, (_, i) => [[i, 0, 0], [i, 1, 0], [i, 0, 1]])
    assert.deepEqual(meshBounds([many]), { min: [0, 0, 0], max: [199999, 1, 1] })
  })

  it('finds open edges and inside-out meshes', () => {
    const tetra = [
      [[0, 0, 0], [0, 1, 0], [1, 0, 0]],
      [[0, 0, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    ]
    assert.deepEqual(meshReport(tetra), { triangles: 4, badEdges: 0, volume: 0.17 })
    assert.equal(meshReport(tetra.slice(1)).badEdges, 3)
    const inverted = tetra.map(([a, b, c]) => [a, c, b])
    assert.ok(meshReport(inverted).volume < 0)
  })

  it('centres each object on its origin and lines the objects up across the bed', () => {
    const objects = layoutObjects(
      [
        { name: 'a', parts: [{ name: 'a', filament: 1, triangles: [triangle] }] },
        { name: 'b', parts: [{ name: 'b', filament: 2, triangles: [triangle] }] },
      ],
      { width: 260, depth: 260 },
    )
    assert.deepEqual(meshBounds([objects[0].parts[0].triangles]), { min: [-5, -10, 0], max: [5, 10, 2] })
    assert.deepEqual(
      objects.map((o) => o.position),
      [
        [120, 130, 0],
        [140, 130, 0],
      ],
    )
  })

  it('writes each part with its own filament in the Bambu layout Orca reads', () => {
    const entries = buildOrca3mf({
      title: 'Tag & ring',
      objects: [
        {
          name: 'tag',
          position: [1, 2, 0],
          parts: [
            { name: 'base', filament: 1, triangles: [triangle] },
            { name: 'text', filament: 4, triangles: [triangle] },
          ],
        },
        { name: 'clip', position: [50, 2, 0], parts: [{ name: 'clip', filament: 2, triangles: [triangle] }] },
      ],
    })
    const model = entries['3D/3dmodel.model']
    assert.match(model, /<object id="3" type="model"><components><component objectid="1"/)
    assert.match(model, /<item objectid="3" transform="1 0 0 0 1 0 0 0 1 1 2 0"/)
    assert.match(model, /<item objectid="5" transform="1 0 0 0 1 0 0 0 1 50 2 0"/)
    assert.match(model, /Tag &amp; ring/)
    const settings = entries['Metadata/model_settings.config']
    assert.match(settings, /<part id="2" subtype="normal_part"><metadata key="name" value="text"\/>.*<metadata key="extruder" value="4"\/>/)
    assert.match(settings, /<object id="5"><metadata key="name" value="clip"\/><metadata key="extruder" value="2"\/>/)
    assert.equal((settings.match(/<model_instance>/g) ?? []).length, 2)
  })

  it('packs a valid stored zip', () => {
    assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926)
    const zip = zipStore({ 'a.txt': 'hello', 'b/c.txt': 'world' })
    assert.equal(zip.readUInt32LE(0), 0x04034b50)
    const end = zip.subarray(zip.length - 22)
    assert.equal(end.readUInt32LE(0), 0x06054b50)
    assert.equal(end.readUInt16LE(10), 2)
    assert.ok(zip.includes(Buffer.from('hello')) && zip.includes(Buffer.from('b/c.txt')))
  })
})

describe('arguments', () => {
  it('keeps boolean flags from swallowing the next argument', () => {
    assert.deepEqual(parseArgs(['start', '--yes', 'tag.gcode'], ['yes']), { positional: ['start', 'tag.gcode'], flags: { yes: true } })
  })

  it('collects repeated flags', () => {
    assert.deepEqual(parseArgs(['--part', 'a:1', '--part=b:2']).flags, { part: ['a:1', 'b:2'] })
  })
})
