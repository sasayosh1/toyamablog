#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanity = createClient({ projectId, dataset, useCdn: true, apiVersion: '2024-01-01' })

function getYouTubeVideoId(url) {
  if (!url) return null
  if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] || null
  if (url.includes('youtube.com/watch?v=')) return url.split('v=')[1]?.split('&')[0] || null
  if (url.includes('youtube.com/shorts/')) return url.split('shorts/')[1]?.split('?')[0] || null
  if (url.includes('youtube.com/embed/')) return url.split('embed/')[1]?.split('?')[0] || null
  return null
}

;(async () => {
  try {
    const posts = await sanity.fetch(`*[_type == "post" && defined(publishedAt)]{ _id, title, slug, publishedAt, youtubeUrl, body }`)
    const report = []
    for (const p of posts) {
      const slug = p.slug?.current || 'unknown'
      const youtubeUrl = p.youtubeUrl || null
      let foundInBody = false
      let bodyVideoId = null
      try {
        const text = JSON.stringify(p.body || '')
        const m = text.match(/https?:\/\/[^'"\s>]*(?:youtube\.com|youtu\.be)[^'"\s>]*/i)
        if (m && m[0]) {
          foundInBody = true
          bodyVideoId = getYouTubeVideoId(m[0])
        }
      } catch (e) {
        // ignore
      }

      const videoIdFromField = getYouTubeVideoId(youtubeUrl)
      report.push({ slug, title: p.title || '', youtubeUrl, videoIdFromField, foundInBody, bodyVideoId })
    }

    const outDir = path.resolve(__dirname, '../reports')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'posts_youtube_status.json'), JSON.stringify(report, null, 2))
    fs.writeFileSync(path.join(outDir, 'posts_youtube_status.csv'), 'slug,title,youtubeUrl,videoIdFromField,foundInBody,bodyVideoId\n' + report.map(r => `${r.slug},"${(r.title||'').replace(/"/g,'""')}",${r.youtubeUrl||''},${r.videoIdFromField||''},${r.foundInBody},${r.bodyVideoId||''}`).join('\n'))

    console.log('Wrote reports/posts_youtube_status.{json,csv} (count=' + report.length + ')')
  } catch (e) {
    console.error('Error querying Sanity:', e)
    process.exit(1)
  }
})()
