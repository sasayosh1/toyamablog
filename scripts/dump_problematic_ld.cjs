#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const CSV_PATH = path.resolve(__dirname, '../reports/problematic_combined.csv')
const OUT_DIR = path.resolve(__dirname, '../reports/problematic_samples')

const N = process.argv[2] ? parseInt(process.argv[2], 10) : 10

if (!fs.existsSync(CSV_PATH)) {
  console.error('Missing CSV:', CSV_PATH)
  process.exit(1)
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const csv = fs.readFileSync(CSV_PATH, 'utf8')
const lines = csv.split(/\r?\n/).filter(Boolean)

const entries = lines.map((line) => {
  const parts = line.split(',')
  return { file: parts[0], rest: parts.slice(1) }
}).slice(0, N)

const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

const results = []

entries.forEach((entry) => {
  const htmlPath = path.resolve(__dirname, '..', entry.file)
  if (!fs.existsSync(htmlPath)) {
    console.warn('HTML not found:', htmlPath)
    return
  }

  const html = fs.readFileSync(htmlPath, 'utf8')
  const matches = []
  let m
  while ((m = re.exec(html)) !== null) {
    matches.push(m[1])
  }

  const base = path.basename(entry.file, '.html')
  const outPath = path.join(OUT_DIR, `${base}.jsonld`)

  fs.writeFileSync(outPath, JSON.stringify({ file: entry.file, scripts: matches }, null, 2))
  console.log('Wrote', outPath)
  results.push({ file: entry.file, scripts: matches })
})

console.log(`Dumped ${results.length} files to ${OUT_DIR}`)

// Also write an index
fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(results, null, 2))

process.exit(0)
