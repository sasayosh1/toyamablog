#!/usr/bin/env node
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const sanity = createClient({ projectId, dataset, useCdn: true, apiVersion: '2024-01-01' })

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/check_post_youtube.cjs <slug>')
  process.exit(1)
}

;(async () => {
  try {
    const query = `*[_type == "post" && slug.current == $slug][0]{ youtubeUrl, title, _id }`
    const res = await sanity.fetch(query, { slug })
    console.log(JSON.stringify({ slug, result: res }, null, 2))
  } catch (e) {
    console.error('Error fetching from Sanity:', e)
    process.exit(1)
  }
})()
