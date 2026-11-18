// Pure helpers for jmr-3d-print: printer config, slicer profiles, G-code
// checks, STL parsing and 3MF packing. No network and no child processes here,
// so every function is testable on its own.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const SKILL_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
export const PROFILES_DIR = path.join(SKILL_DIR, 'profiles')

const PROFILE_KINDS = ['machine', 'process', 'filament']

export function configPath(env = process.env) {
  const base = env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(base, 'jmr-3d-print', 'printer.json')
}

// The printer's address and profile live outside the repo, because every
// install points at a different printer on a different network.
export function loadConfig(env = process.env) {
  const file = configPath(env)
  const fromFile = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  const url = env.JMR_PRINTER_URL || fromFile.url
  if (!url) {
    throw new Error(
      `No printer configured. Write ${file} with {"url": "http://<printer-ip>:7125", "profile": "<profile>"} or set JMR_PRINTER_URL.`,
    )
  }
  return { ...fromFile, url: url.replace(/\/+$/, ''), profile: env.JMR_PRINTER_PROFILE || fromFile.profile }
}

export function loadProfile(name, dir = PROFILES_DIR) {
  const root = path.join(dir, name)
  if (!fs.existsSync(path.join(root, 'profile.json'))) {
    const known = fs.existsSync(dir) ? fs.readdirSync(dir).join(', ') : 'none'
    throw new Error(`Unknown profile "${name}". Known profiles: ${known}.`)
  }
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'profile.json'), 'utf8'))
  const files = Object.fromEntries(PROFILE_KINDS.map((kind) => [kind, path.join(root, `${kind}.json`)]))
  return { ...meta, name, dir: root, files }
}

function profileKind(file) {
  return path.normalize(file).split(path.sep).find((part) => PROFILE_KINDS.includes(part))
}

function walkJson(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkJson(full)
    return entry.name.endsWith('.json') ? [full] : []
  })
}

// Slicer vendor profiles inherit from parents. OrcaSlicer's command line only
// reads complete files, so walk the inherits chain and merge it into one.
export function indexVendorProfiles(vendorDir) {
  const index = new Map()
  for (const file of walkJson(vendorDir)) {
    const kind = profileKind(path.relative(vendorDir, file))
    if (!kind) continue
    const data = readJsonOrNull(file)
    if (data?.name) index.set(`${kind}:${data.name}`, data)
  }
  return index
}

function readJsonOrNull(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

export function flattenProfile(index, kind, name, seen = new Set()) {
  const key = `${kind}:${name}`
  const own = index.get(key)
  if (!own) throw new Error(`Profile ${key} not found in the vendor folder.`)
  if (seen.has(key)) throw new Error(`Profile ${key} inherits from itself.`)
  seen.add(key)
  const parent = own.inherits ? flattenProfile(index, kind, own.inherits, seen) : {}
  const merged = { ...parent, ...own }
  delete merged.inherits
  return { ...merged, from: 'User', is_custom_defined: '0' }
}

// Creality ships values that OrcaSlicer 2.5 rejects or cannot parse. Each fix
// keeps the printer's behaviour the same as a Creality Print slice.
const CUT_RETRACT_IF = /\{if retraction_distances_when_cut\[previous_extruder\] < 28\}\nM8200 R E-\{retraction_distances_when_cut\[previous_extruder\]\}\n\{else\}\nM8200 R E-28\n\{endif\}/g
const CUT_RELOAD_IF = /\{if retraction_distances_when_cut\[previous_extruder\] < 28\}\nG1 E\{retraction_distances_when_cut\[previous_extruder\]\} F\{old_filament_e_feedrate\} \n\{else\}\n(G1 E28 F\{old_filament_e_feedrate\} )\n\{endif\}/g

const FLUSH_LENGTH_5_FIXES = [
  ['flush_length_5 > 1', '0 > 1'],
  ['flush_length_5 < 1', '1 < 2'],
  ['[flush_length_5]', '0'],
  ['{flush_length_5 * ', '{0 * '],
]

export function patchForOrca({ machine, process: proc, filament }) {
  const patchedMachine = { ...machine }
  if (typeof machine.change_filament_gcode === 'string') {
    // Orca caps the cut retraction at 18 mm; the i7 needs 28 mm, so write 28
    // into the swap code itself and give Orca a value it accepts.
    let gcode = machine.change_filament_gcode.replace(CUT_RETRACT_IF, 'M8200 R E-28').replace(CUT_RELOAD_IF, '$1')
    // Orca 2.5 has only four flush_length variables; Creality Print has five.
    for (const [from, to] of FLUSH_LENGTH_5_FIXES) gcode = gcode.split(from).join(to)
    patchedMachine.change_filament_gcode = gcode
    if ('retraction_distances_when_cut' in machine) patchedMachine.retraction_distances_when_cut = '18'
  }
  // The filament box purges into the waste chute, so a prime tower only adds
  // time and plastic.
  const patchedProcess = { ...proc, enable_prime_tower: '0' }
  return { machine: patchedMachine, process: patchedProcess, filament: { ...filament } }
}

const SWAP_MARKERS = { cut: /^M8200 C S/, park: /^G1 X0 F18000\b/, done: /^M8200 O\b/ }

// Orca emits one cut-and-reload of the first filament between the start code
// and layer 1. The start macro has already loaded that filament, so the extra
// swap only wastes a cut and a purge. Removes it and nothing else.
export function stripStartToolchange(gcode) {
  const lines = gcode.split('\n')
  const firstLayer = lines.findIndex((line) => line.startsWith(';LAYER_CHANGE'))
  if (firstLayer < 0) return { gcode, removed: 0 }
  const cut = lines.slice(0, firstLayer).findIndex((line) => SWAP_MARKERS.cut.test(line))
  if (cut < 0) return { gcode, removed: 0 }
  const start = lines.slice(0, cut).findLastIndex((line) => SWAP_MARKERS.park.test(line))
  const endOffset = lines.slice(cut, firstLayer).findIndex((line) => SWAP_MARKERS.done.test(line))
  if (start < 0 || endOffset < 0) return { gcode, removed: 0 }
  const end = cut + endOffset
  const kept = [...lines.slice(0, start), ...lines.slice(end + 1)]
  return { gcode: kept.join('\n'), removed: end - start + 1 }
}

const MULTICOLOUR_LINE = '; multicolor_method = 1 '

// Creality's firmware ignores every M8200 swap block unless the header says
// the file is multicolour. Without the flag the touchscreen does not offer
// its filament-to-slot mapping. Creality Print writes this line for every file,
// so write it whatever the colour count.
export function markMulticolour(gcode) {
  if (/^; multicolor_method = 1\s*$/m.test(gcode)) return gcode
  if (!gcode.includes('; HEADER_BLOCK_END\n')) throw new Error('No HEADER_BLOCK_END in the G-code, so it is not from OrcaSlicer.')
  return gcode.replace('; HEADER_BLOCK_END\n', `; HEADER_BLOCK_END\n\n${MULTICOLOUR_LINE}\n`)
}

// The touchscreen reads filament_colour from the footer to propose the slot
// mapping. Orca writes placeholder colours, so write the colours of the slots
// the model was designed for.
export function setFooterColours(gcode, colours) {
  if (!colours?.length) return gcode
  return gcode.replace(/^; (filament_colour|extruder_colour) = (.*)$/gm, (line, key, value) => {
    const count = value.split(';').length
    const list = Array.from({ length: count }, (_, i) => colours[i] ?? colours.at(-1))
    return `; ${key} = ${list.join(';')}`
  })
}

export function readHeaderFlags(head) {
  return {
    multicolour: /^; multicolor_method = 1\s*$/m.test(head),
    slicer: /^; generated by (\S+)/m.exec(head)?.[1] ?? null,
  }
}

const DURATION_UNITS = { d: 86400, h: 3600, m: 60, s: 1 }

export function parseDuration(text) {
  const parts = [...text.matchAll(/(\d+)\s*([dhms])/g)]
  return parts.reduce((total, [, value, unit]) => total + Number(value) * DURATION_UNITS[unit], 0)
}

export function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

function headerValue(lines, label) {
  const line = lines.find((entry) => entry.startsWith(`; ${label} =`))
  return line ? line.slice(line.indexOf('=') + 1).trim() : null
}

// Reads what an agent must check before offering a print: time, plastic per
// slot, every colour swap with its height and the footprint on the bed.
export function summarizeGcode(gcode) {
  const lines = gcode.split('\n')
  const time = headerValue(lines, 'estimated printing time (normal mode)')
  const grams = (headerValue(lines, 'filament used [g]') ?? '').split(',').map(Number).filter((n) => !Number.isNaN(n))
  const startPrint = lines.find((line) => line.startsWith('START_PRINT')) ?? ''

  const swaps = []
  const box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  let z = null
  let inLayers = false
  let inObject = true
  for (const line of lines) {
    if (line.startsWith(';LAYER_CHANGE')) inLayers = true
    if (line.startsWith(';Z:')) z = Number(line.slice(3))
    if (line.startsWith('EXCLUDE_OBJECT_START')) inObject = true
    if (line.startsWith('EXCLUDE_OBJECT_END')) inObject = false
    const tool = /^T(\d+)\b/.exec(line)
    // Orca repeats the current tool after the start code; only a different
    // tool is a swap.
    if (tool && Number(tool[1]) !== swaps.at(-1)?.tool) swaps.push({ tool: Number(tool[1]), z })
    if (!inLayers || !inObject || !line.startsWith('G1 ')) continue
    const x = /\bX(-?[\d.]+)/.exec(line)
    const y = /\bY(-?[\d.]+)/.exec(line)
    const e = /\bE(-?[\d.]+)/.exec(line)
    if (!x || !y || !e || Number(e[1]) <= 0) continue
    box.minX = Math.min(box.minX, Number(x[1]))
    box.maxX = Math.max(box.maxX, Number(x[1]))
    box.minY = Math.min(box.minY, Number(y[1]))
    box.maxY = Math.max(box.maxY, Number(y[1]))
  }

  return {
    seconds: time ? parseDuration(time) : null,
    grams,
    totalGrams: Math.round(grams.reduce((sum, n) => sum + n, 0) * 100) / 100,
    layers: Number(headerValue(lines, 'total layers count')) || null,
    colours: (headerValue(lines, 'filament_colour') ?? '').split(';').filter(Boolean),
    multicolour: lines.some((line) => /^; multicolor_method = 1\s*$/.test(line)),
    sequence: headerValue(lines, 'print_sequence'),
    maxZ: Number(lines.find((line) => line.startsWith('; max_z_height:'))?.split(':')[1]) || null,
    nozzleTemp: Number(/EXTRUDER_TEMP=(\d+)/.exec(startPrint)?.[1]) || null,
    bedTemp: Number(/BED_TEMP=(\d+)/.exec(startPrint)?.[1]) || null,
    swaps,
    bounds: Number.isFinite(box.minX) ? box : null,
  }
}

export function parsePrintableArea(value) {
  const points = String(value).split(',').map((pair) => pair.split('x').map(Number))
  return { width: Math.max(...points.map(([x]) => x)), depth: Math.max(...points.map(([, y]) => y)) }
}

export function checkSummary(summary, { bed, maxHeight }) {
  const problems = []
  const { bounds } = summary
  if (!bounds) problems.push('No extrusion found inside the objects. The slice is empty.')
  if (bounds && (bounds.minX < 0 || bounds.minY < 0 || bounds.maxX > bed.width || bounds.maxY > bed.depth)) {
    problems.push(`The part runs off the ${bed.width} x ${bed.depth} mm bed.`)
  }
  if (summary.maxZ && maxHeight && summary.maxZ > maxHeight) problems.push(`The part is ${summary.maxZ} mm tall; the printer reaches ${maxHeight} mm.`)
  if (summary.seconds === null) problems.push('The G-code has no time estimate, so it may not come from OrcaSlicer.')
  return problems
}

// Moonraker on Creality's Klipper build reports print_stats.state "standby"
// during a running print, so the sd card's is_active flag decides.
export function printState(status) {
  const stats = status.print_stats ?? {}
  const sd = status.virtual_sdcard ?? {}
  if (status.pause_resume?.is_paused || stats.state === 'paused') return 'paused'
  if (stats.state === 'error') return 'error'
  if (sd.is_active || stats.state === 'printing') return 'printing'
  if (['complete', 'cancelled'].includes(stats.state)) return stats.state
  return 'idle'
}

const CREALITY_MATERIALS = { '001001': 'PLA' }

// The CFS box reports colours as "0RRGGBB". Slot letters A-D on box T1 are the
// slicer's filaments 1-4 (T0-T3), box T2 is 5-8 and so on. Boxes that are not
// connected report "-1" everywhere and are skipped.
// box.T1.filament names the slot feeding the toolhead ("C"). box.map is the
// filament-to-slot mapping the touchscreen saved for the last job.
export function boxState(box) {
  const slots = boxSlots(box)
  if (!slots.length) return { slots, toolhead: null, mapping: [] }
  const loadedBox = Object.keys(box).find((key) => /^T\d+$/.test(key) && /^[A-D]$/.test(box[key]?.filament ?? ''))
  const toolhead = loadedBox ? `${loadedBox}${box[loadedBox].filament}` : null
  const mapping = slots
    .map((slot) => ({ filament: slot.filament, slot: box.map?.[slot.slot] ?? slot.slot }))
    .filter((entry) => slots.some((slot) => slot.slot === entry.slot))
  return { slots, toolhead, mapping }
}

export function boxSlots(box) {
  if (!box || typeof box !== 'object') return []
  return Object.keys(box)
    .filter((key) => /^T\d+$/.test(key) && box[key]?.state === 'connect' && Array.isArray(box[key].color_value))
    .sort()
    .flatMap((key) => {
      const boxIndex = Number(key.slice(1)) - 1
      return box[key].color_value.map((raw, slot) => ({
        filament: boxIndex * 4 + slot + 1,
        slot: `${key}${String.fromCharCode(65 + slot)}`,
        color: `#${String(raw).slice(-6).toUpperCase()}`,
        material: CREALITY_MATERIALS[box[key].material_type?.[slot]] ?? box[key].material_type?.[slot] ?? 'unknown',
        brand: box[key].vender?.[slot] ?? 'unknown',
      }))
    })
}

export function parseStl(buffer) {
  const head = buffer.subarray(0, 512).toString('latin1')
  const binarySize = buffer.length >= 84 ? 84 + buffer.readUInt32LE(80) * 50 : -1
  if (binarySize === buffer.length || !/^\s*solid\b/.test(head)) return parseBinaryStl(buffer)
  return parseAsciiStl(buffer.toString('latin1'))
}

function parseBinaryStl(buffer) {
  const count = buffer.readUInt32LE(80)
  const triangles = []
  for (let i = 0; i < count; i++) {
    const at = 84 + i * 50 + 12
    triangles.push([0, 1, 2].map((k) => [0, 1, 2].map((c) => buffer.readFloatLE(at + k * 12 + c * 4))))
  }
  return triangles
}

function parseAsciiStl(text) {
  const vertices = [...text.matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])])
  const triangles = []
  for (let i = 0; i + 2 < vertices.length; i += 3) triangles.push(vertices.slice(i, i + 3))
  return triangles
}

export function meshBounds(meshes) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const point of meshes.flat(2)) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], point[i])
      max[i] = Math.max(max[i], point[i])
    }
  }
  return { min, max }
}

function indexMesh(triangles) {
  const vertices = []
  const lookup = new Map()
  const faces = triangles.map((triangle) =>
    triangle.map((point) => {
      const rounded = point.map((n) => Math.round(n * 10000) / 10000)
      const key = rounded.join(',')
      if (!lookup.has(key)) {
        lookup.set(key, vertices.length)
        vertices.push(rounded)
      }
      return lookup.get(key)
    }),
  )
  return { vertices, faces }
}

export function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[ch])
}

// Counts edges that are not shared by exactly two triangles (holes or
// non-manifold seams) and the signed volume. A negative volume means the
// normals point inwards. Slicers repair small faults but can drop or fill
// whole regions of a broken mesh.
export function meshReport(triangles) {
  const edges = new Map()
  let volume = 0
  for (const triangle of triangles) {
    const keys = triangle.map((point) => point.map((n) => Math.round(n * 10000) / 10000).join(','))
    for (let i = 0; i < 3; i++) {
      const [a, b] = [keys[i], keys[(i + 1) % 3]].sort()
      const key = `${a}|${b}`
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
    const [[ax, ay, az], [bx, by, bz], [cx, cy, cz]] = triangle
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6
  }
  const badEdges = [...edges.values()].filter((count) => count !== 2).length
  return { triangles: triangles.length, badEdges, volume: Math.round(volume * 100) / 100 }
}

export function translate(triangles, [dx, dy, dz]) {
  return triangles.map((triangle) => triangle.map(([x, y, z]) => [x + dx, y + dy, z + dz]))
}

const OBJECT_GAP = 10

// Each object is centred on its own origin, resting on z = 0. The objects
// sit in a row across the middle of the bed. slice.mjs then lets OrcaSlicer
// arrange the plate, so this layout only matters when a person opens the file.
export function layoutObjects(objects, bed) {
  const placed = objects.map((object) => {
    const bounds = meshBounds(object.parts.map((part) => part.triangles))
    const shift = [-(bounds.min[0] + bounds.max[0]) / 2, -(bounds.min[1] + bounds.max[1]) / 2, -bounds.min[2]]
    const parts = object.parts.map((part) => ({ ...part, triangles: translate(part.triangles, shift) }))
    return { ...object, parts, width: bounds.max[0] - bounds.min[0] }
  })
  const total = placed.reduce((sum, object) => sum + object.width, 0) + OBJECT_GAP * (placed.length - 1)
  let x = bed.width / 2 - total / 2
  return placed.map((object) => {
    const position = [Math.round((x + object.width / 2) * 1000) / 1000, bed.depth / 2, 0]
    x += object.width + OBJECT_GAP
    return { ...object, position }
  })
}

function meshXml(id, triangles) {
  const { vertices, faces } = indexMesh(triangles)
  const vs = vertices.map(([x, y, z]) => `<vertex x="${x}" y="${y}" z="${z}"/>`).join('')
  const ts = faces.map(([a, b, c]) => `<triangle v1="${a}" v2="${b}" v3="${c}"/>`).join('')
  return `<object id="${id}" type="model"><mesh><vertices>${vs}</vertices><triangles>${ts}</triangles></mesh></object>`
}

const IDENTITY_4X4 = '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1'

// OrcaSlicer only keeps a per-part filament when the 3MF uses the Bambu
// layout: a parent object with components, plus Metadata/model_settings.config
// naming each part's extruder. A plain multi-object 3MF slices in one colour.
// objects: [{ name, position: [x, y, z], parts: [{ name, filament, triangles }] }]
export function buildOrca3mf({ title, objects }) {
  let nextId = 1
  const resources = []
  const items = []
  const configs = []
  const instances = []
  for (const [index, object] of objects.entries()) {
    const partIds = object.parts.map((part) => {
      const id = nextId++
      resources.push(meshXml(id, part.triangles))
      return id
    })
    const parentId = nextId++
    const components = partIds.map((id) => `<component objectid="${id}" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>`).join('')
    resources.push(`<object id="${parentId}" type="model"><components>${components}</components></object>`)
    const [x, y, z] = object.position
    items.push(`<item objectid="${parentId}" transform="1 0 0 0 1 0 0 0 1 ${x} ${y} ${z}" printable="1"/>`)
    const partConfig = object.parts
      .map(
        (part, i) =>
          `<part id="${partIds[i]}" subtype="normal_part"><metadata key="name" value="${escapeXml(part.name)}"/><metadata key="matrix" value="${IDENTITY_4X4}"/><metadata key="extruder" value="${part.filament}"/></part>`,
      )
      .join('')
    configs.push(
      `<object id="${parentId}"><metadata key="name" value="${escapeXml(object.name)}"/><metadata key="extruder" value="${object.parts[0].filament}"/>${partConfig}</object>`,
    )
    instances.push(
      `<model_instance><metadata key="object_id" value="${parentId}"/><metadata key="instance_id" value="0"/><metadata key="identify_id" value="${100 + index}"/></model_instance>`,
    )
  }
  const model = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021">
<metadata name="Application">BambuStudio-02.00.00.00</metadata>
<metadata name="BambuStudio:3mfVersion">1</metadata>
<metadata name="Title">${escapeXml(title)}</metadata>
<resources>${resources.join('')}</resources>
<build>${items.join('')}</build></model>`
  const settings = `<?xml version="1.0" encoding="UTF-8"?>
<config>${configs.join('')}
<plate><metadata key="plater_id" value="1"/><metadata key="locked" value="false"/>${instances.join('')}</plate></config>`
  return {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>',
    '3D/3dmodel.model': model,
    'Metadata/model_settings.config': settings,
  }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

export function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// A stored (uncompressed) zip is enough for a 3MF and avoids a dependency.
export function zipStore(entries) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const [name, content] of Object.entries(entries)) {
    const nameBuf = Buffer.from(name, 'utf8')
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    locals.push(local, nameBuf, data)
    centrals.push(central, nameBuf)
    offset += local.length + nameBuf.length + data.length
  }
  const centralSize = centrals.reduce((sum, buf) => sum + buf.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(centrals.length / 2, 8)
  end.writeUInt16LE(centrals.length / 2, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, ...centrals, end])
}

// Moonraker's job history records how each job ended, which is more reliable
// than reading print_stats after the fact.
const HISTORY_OUTCOMES = {
  completed: 'complete',
  cancelled: 'cancelled',
  error: 'error',
  klippy_shutdown: 'error',
  klippy_disconnect: 'error',
  interrupted: 'error',
  server_exit: 'error',
  in_progress: 'printing',
}

export function jobOutcome(job) {
  if (!job) return null
  return {
    file: job.filename,
    outcome: HISTORY_OUTCOMES[job.status] ?? job.status,
    started: job.start_time ? new Date(job.start_time * 1000) : null,
    printSeconds: Math.round(job.print_duration ?? 0),
    filamentMm: Math.round(job.filament_used ?? 0),
  }
}

// --set key=value on the command line. Each key goes to the profile file that
// already defines it, so a typo fails loudly instead of being ignored.
export function applySettings(profiles, pairs) {
  const out = Object.fromEntries(Object.entries(profiles).map(([kind, data]) => [kind, { ...data }]))
  for (const pair of pairs) {
    const at = pair.indexOf('=')
    if (at < 1) throw new Error(`--set needs key=value, got "${pair}".`)
    const key = pair.slice(0, at)
    const value = pair.slice(at + 1)
    const kind = ['process', 'machine', 'filament'].find((k) => key in out[k])
    if (!kind) throw new Error(`Unknown setting "${key}". Check the name in profiles/<printer>/process.json.`)
    out[kind][key] = Array.isArray(out[kind][key]) ? out[kind][key].map(() => value) : value
  }
  return out
}

export function parseColours(text) {
  const colours = String(text)
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map((c) => (c.startsWith('#') ? c : `#${c}`).toUpperCase())
  const bad = colours.find((c) => !/^#[0-9A-F]{6}$/.test(c))
  if (bad) throw new Error(`Colours are #RRGGBB values, got "${bad}".`)
  return colours
}

export function parseArgs(argv, booleans = []) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }
    const [key, inline] = arg.slice(2).split(/=(.*)/s)
    const next = argv[i + 1]
    const takesValue = !booleans.includes(key) && next !== undefined && !next.startsWith('--')
    const value = inline ?? (takesValue ? (i++, next) : true)
    flags[key] = key in flags ? [].concat(flags[key], value) : value
  }
  return { positional, flags }
}
