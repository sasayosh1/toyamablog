#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanity = createClient({ projectId, dataset, useCdn: true, apiVersion: '2024-01-01' })

const CSV = path.resolve(__dirname, '../reports/problematic_combined.csv')
const OUT_JSON = path.resolve(__dirname, '../reports/problematic_youtube_report.json')
const OUT_CSV = path.resolve(__dirname, '../reports/problematic_youtube_report.csv')

if (!fs.existsSync(CSV)) {
  console.error('Missing input CSV:', CSV)
  process.exit(1)
}

const lines = fs.readFileSync(CSV, 'utf8').split(/\r?\n/).filter(Boolean)

(async () => {
  const results = []
  for (const line of lines) {
    const parts = line.split(',')
    const file = parts[0]
    const slug = path.basename(file, '.html')
    try {
      const res = await sanity.fetch(`*[_type == "post" && slug.current == $slug][0]{ youtubeUrl, title }`, { slug })
      results.push({ file, slug, title: res?.title || '', youtubeUrl: res?.youtubeUrl || null })
      console.log('Checked', slug, res?.youtubeUrl || 'null')
    } catch (e) {
      console.error('Error fetching', slug, e)
      results.push({ file, slug, title: '', youtubeUrl: 'ERROR' })
    }
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2))
  fs.writeFileSync(OUT_CSV, 'file,slug,title,youtubeUrl\n' + results.map(r => `${r.file},${r.slug},"${(r.title||'').replace(/"/g,'""')}",${r.youtubeUrl||''}`).join('\n'))
  console.log('Wrote reports:', OUT_JSON, OUT_CSV)
})()
