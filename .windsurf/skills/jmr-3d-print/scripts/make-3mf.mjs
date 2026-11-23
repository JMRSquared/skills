#!/usr/bin/env node
// Pack STL files into a 3MF that OrcaSlicer slices with each part on its own
// filament slot.
//
//   node make-3mf.mjs --out tag.3mf --part base.stl:1 --part text.stl:4
//   node make-3mf.mjs --out clips.3mf --part clip.stl:1:black --part clip.stl:2:white
//
// --part <file.stl>:<filament>[:<object>]. The filament is the slot number
// (1-4 on one CFS box, slots A-D). Parts with the same object name are one
// object and keep their positions relative to each other, like a base and its
// raised text. Parts without a name all belong to one object. Separate objects
// can print one after another with `slice.mjs --set "print_sequence=by object"`.

import fs from 'node:fs'
import path from 'node:path'

import { buildOrca3mf, layoutObjects, loadConfig, loadProfile, meshBounds, meshReport, parseArgs, parseStl, zipStore } from './lib.mjs'

function fail(message) {
  console.error(message)
  process.exit(1)
}

function bedFor(flags) {
  let name = flags.profile
  if (!name) {
    try {
      name = loadConfig().profile
    } catch {
      name = undefined
    }
  }
  return name ? loadProfile(name).bed : { width: 256, depth: 256 }
}

function readPart(spec) {
  const match = /^(.+?):(\d+)(?::([^:]+))?$/.exec(spec)
  if (!match) fail(`--part needs <file.stl>:<filament>[:<object>], got "${spec}".`)
  const [, rawFile, rawFilament, object] = match
  const file = path.resolve(rawFile)
  const filament = Number(rawFilament)
  if (filament < 1) fail(`Filament numbers start at 1, got "${spec}".`)
  if (!fs.existsSync(file)) fail(`STL not found: ${file}`)
  const triangles = parseStl(fs.readFileSync(file))
  if (!triangles.length) fail(`${file} has no triangles.`)
  const name = path.basename(file, path.extname(file))
  return { name: object ? `${object}_${name}` : name, object: object ?? 'model', filament, triangles, file }
}

function groupObjects(parts) {
  const groups = new Map()
  for (const part of parts) {
    if (!groups.has(part.object)) groups.set(part.object, [])
    groups.get(part.object).push(part)
  }
  return [...groups].map(([name, members]) => ({ name, parts: members }))
}

function main() {
  const { flags } = parseArgs(process.argv.slice(2))
  if (!flags.out || !flags.part) fail('Usage: make-3mf.mjs --out <file.3mf> --part <file.stl>:<filament>[:<object>] [--part ...]')
  const parts = [].concat(flags.part).map(readPart)
  const bed = bedFor(flags)

  const warnings = []
  const listing = parts.map((part) => {
    const report = meshReport(part.triangles)
    if (report.badEdges) warnings.push(`${part.name} has ${report.badEdges} open or non-manifold edges. Repair it or check the slice preview.`)
    if (report.volume <= 0) warnings.push(`${part.name} has inside-out normals (volume ${report.volume} mm³).`)
    return `  ${part.name}: filament ${part.filament}, object ${part.object}, ${report.triangles} triangles, ${Math.round(report.volume) / 1000} cm³`
  })

  const objects = groupObjects(parts)
  for (const object of objects) {
    const bounds = meshBounds(object.parts.map((part) => part.triangles))
    const size = bounds.max.map((max, i) => Math.round((max - bounds.min[i]) * 10) / 10)
    if (size[0] > bed.width || size[1] > bed.depth) fail(`${object.name} is ${size[0]} x ${size[1]} mm; the bed is ${bed.width} x ${bed.depth} mm.`)
    listing.push(`  object ${object.name}: ${size.join(' x ')} mm`)
  }

  const title = flags.title ?? path.basename(flags.out, '.3mf')
  const entries = buildOrca3mf({ title, objects: layoutObjects(objects, bed) })
  fs.writeFileSync(path.resolve(flags.out), zipStore(entries))
  console.log([`Wrote ${path.resolve(flags.out)}`, ...listing, ...warnings.map((w) => `WARNING: ${w}`)].join('\n'))
}

main()
