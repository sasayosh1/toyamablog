const fs = require('fs')
const path = require('path')

const csvPath = path.resolve('reports/problematic_combined.csv')
const outPath = path.resolve('reports/problematic_analysis.json')
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath)
  process.exit(1)
}

function readCsvLines(p) {
  return fs.readFileSync(p, 'utf8').split(/\r?\n/).slice(1).filter(Boolean)
}

function findScriptBlocks(content) {
  const re = /<script[^>]*type=(?:"|')application\/ld\+json(?:"|')[^>]*>([\s\S]*?)<\/script>/gi
  const blocks = []
  let m
  while ((m = re.exec(content)) !== null) blocks.push(m[1].trim())
  return blocks
}

function tryParseJson(text) {
  try { return JSON.parse(text) } catch (e) {}
  const cleaned = text.replace(/^\)*/,'').replace(/\;*\)\)\s*$/,'').trim()
  try { return JSON.parse(cleaned) } catch (e) { return null }
}

function findVideoInfo(obj) {
  const results = { found: false, videoObjs: [], hasContentUrlWatch: false, hasEmbedUrl: false, hasThumbnailUrl: false, hasUploadDate: false }
  const seen = new Set()
  function walk(o) {
    if (!o || typeof o !== 'object') return
    if (seen.has(o)) return; seen.add(o)
    if (o['@type'] === 'VideoObject') {
      results.found = true; results.videoObjs.push(o)
      if (o.contentUrl && /watch\?v=/.test(o.contentUrl)) results.hasContentUrlWatch = true
      if (o.embedUrl) results.hasEmbedUrl = true
      if (o.thumbnailUrl) results.hasThumbnailUrl = true
      if (o.uploadDate) results.hasUploadDate = true
    }
    if (o['@type'] === 'Article' && o.video) {
      const v = o.video
      results.found = true
      results.videoObjs.push(v)
      if (v.contentUrl && /watch\?v=/.test(v.contentUrl)) results.hasContentUrlWatch = true
      if (v.embedUrl) results.hasEmbedUrl = true
      if (v.thumbnailUrl) results.hasThumbnailUrl = true
      if (v.uploadDate) results.hasUploadDate = true
    }
    for (const k of Object.keys(o)) {
      try { walk(o[k]) } catch (e) {}
    }
  }
  walk(obj)
  return results
}

const lines = readCsvLines(csvPath)
const results = []
for (const line of lines) {
  const cols = line.split(',')
  const file = cols[0]
  const abs = path.resolve(file)
  const item = { file, exists: false, jsonld_count: 0, parsed_count: 0, video_found: false, video_details: [] }
  if (!fs.existsSync(abs)) {
    results.push(item)
    continue
  }
  item.exists = true
  const content = fs.readFileSync(abs, 'utf8')
  const blocks = findScriptBlocks(content)
  item.jsonld_count = blocks.length
  for (const b of blocks) {
    const parsed = tryParseJson(b)
    if (!parsed) continue
    item.parsed_count++
    const info = findVideoInfo(parsed)
    if (info.found) {
      item.video_found = true
      item.video_details.push({ hasContentUrlWatch: info.hasContentUrlWatch, hasEmbedUrl: info.hasEmbedUrl, hasThumbnailUrl: info.hasThumbnailUrl, hasUploadDate: info.hasUploadDate, sample: info.videoObjs[0] || null })
    }
  }
  results.push(item)
}

fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
console.log('Wrote', outPath)
