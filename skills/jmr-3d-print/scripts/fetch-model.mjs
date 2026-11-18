#!/usr/bin/env node
// List and download a model's files from Printables.
//
//   node fetch-model.mjs https://www.printables.com/model/1203582-mini-bag-clip
//   node fetch-model.mjs <url> --file BagClipNormal.stl [--out <dir>]
//
// Uses the GraphQL API behind printables.com. It is not a documented public
// API, so if a query fails, download the file in a browser instead.

import fs from 'node:fs'
import path from 'node:path'

import { parseArgs } from './lib.mjs'

const API = 'https://api.printables.com/graphql/'

function fail(message) {
  console.error(message)
  process.exit(1)
}

async function graphql(query) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30000),
  })
  const data = await response.json()
  if (data.errors?.length) fail(`Printables API error: ${data.errors.map((e) => e.message).join('; ')}`)
  return data.data
}

function modelId(url) {
  const match = /printables\.com\/(?:[a-z]{2}\/)?model\/(\d+)/.exec(url) ?? /^(\d+)$/.exec(url)
  if (!match) fail(`Not a Printables model link: ${url}`)
  return match[1]
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  if (!positional[0]) fail('Usage: fetch-model.mjs <printables-url> [--file <name|id>] [--out <dir>]')
  const id = modelId(positional[0])
  const { print } = await graphql(
    `query{print(id:${id}){id name user{publicUsername} license{name abbreviation} stls{id name fileSize} otherFiles{id name fileSize}}}`,
  )
  if (!print) fail(`Printables has no model ${id}.`)
  const files = [...print.stls.map((f) => ({ ...f, type: 'stl' })), ...print.otherFiles.map((f) => ({ ...f, type: 'other' }))]

  if (!flags.file) {
    console.log(`${print.name} by ${print.user?.publicUsername ?? 'unknown'}`)
    console.log(`Licence: ${print.license?.name ?? 'none given'}`)
    for (const file of files) console.log(`  ${file.id}  ${file.name}  ${(file.fileSize / 1e6).toFixed(1)} MB`)
    return
  }

  const wanted = files.find((file) => file.id === String(flags.file) || file.name.toLowerCase() === String(flags.file).toLowerCase())
  if (!wanted) fail(`No file "${flags.file}" on model ${id}. Run without --file to list them.`)
  const { getDownloadLink } = await graphql(
    `mutation{getDownloadLink(id:${wanted.id}, printId:${id}, fileType:${wanted.type}, source:model_detail){ok output{link} errors{messages}}}`,
  )
  if (!getDownloadLink?.ok) fail(`Printables refused the download: ${JSON.stringify(getDownloadLink?.errors ?? null)}`)
  const response = await fetch(getDownloadLink.output.link, { signal: AbortSignal.timeout(300000) })
  if (!response.ok) fail(`Download failed with HTTP ${response.status}.`)
  const outDir = path.resolve(flags.out ?? '.')
  fs.mkdirSync(outDir, { recursive: true })
  const target = path.join(outDir, path.basename(wanted.name))
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()))
  console.log(`Saved ${target} (${(fs.statSync(target).size / 1e6).toFixed(1)} MB). Licence: ${print.license?.name ?? 'none given'}`)
}

main()
