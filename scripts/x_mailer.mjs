import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import nodemailer from 'nodemailer'
import { createClient } from '@sanity/client'

const LOG_PATH = path.resolve('scripts/postlog.json')

function required(name) {
  const value = process.env[name]
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env: ${name}`)
  }
  return String(value).trim()
}

function optional(name, fallback = '') {
  const value = process.env[name]
  return value ? String(value).trim() : fallback
}

function isoHoursAgo(hours) {
  const date = new Date(Date.now() - hours * 60 * 60 * 1000)
  return date.toISOString()
}

async function readPostLog() {
  try {
    const raw = await fs.readFile(LOG_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { sent: {} }
    if (!parsed.sent || typeof parsed.sent !== 'object') return { sent: {} }
    return { sent: parsed.sent }
  } catch {
    return { sent: {} }
  }
}

async function writePostLog(nextLog) {
  const dir = path.dirname(LOG_PATH)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(LOG_PATH, JSON.stringify(nextLog, null, 2) + '\n', 'utf8')
}

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '')
}

function jstStamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return formatter.format(date)
}

function buildTweetIntent({ text, url }) {
  const params = new URLSearchParams()
  if (text) params.set('text', text)
  if (url) params.set('url', url)
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

async function main() {
  const PROJECT_NAME = required('PROJECT_NAME')
  const SITE_URL = normalizeBaseUrl(required('SITE_URL'))

  const SANITY_PROJECT_ID = required('SANITY_PROJECT_ID')
  const SANITY_DATASET = required('SANITY_DATASET')
  const SANITY_API_VERSION = optional('SANITY_API_VERSION', '2024-01-01')
  const SANITY_TOKEN = required('SANITY_TOKEN')

  const GMAIL_USER = required('GMAIL_USER')
  const GMAIL_APP_PASSWORD = required('GMAIL_APP_PASSWORD')
  const MAIL_TO = required('MAIL_TO')

  const SINCE_HOURS = Number(optional('SINCE_HOURS', '60')) // 2回/日でも漏れないように広め
  const MAX_ITEMS = Number(optional('MAX_ITEMS', '10'))
  const DRY_RUN = optional('DRY_RUN', '').toLowerCase() === 'true'

  const postlog = await readPostLog()
  const sentMap = postlog.sent || {}

  const sanity = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_TOKEN,
    useCdn: false,
    perspective: 'published',
  })

  const since = isoHoursAgo(SINCE_HOURS)
  const query = `
    *[_type == "post" && defined(publishedAt) && publishedAt > $since]
      | order(publishedAt desc)[0...200]{
        _id,
        title,
        "slug": slug.current,
        publishedAt
      }
  `
  const candidates = await sanity.fetch(query, { since })

  const unsent = (Array.isArray(candidates) ? candidates : [])
    .filter((item) => item && typeof item === 'object')
    .filter((item) => typeof item._id === 'string' && typeof item.slug === 'string')
    .filter((item) => !sentMap[item._id])
    .slice(0, MAX_ITEMS)

  if (unsent.length === 0) {
    console.log(`[x_mailer] No new posts since ${since}.`)
    return
  }

  const now = new Date()
  const subject = `[${PROJECT_NAME}] X投稿候補 ${jstStamp(now)}`

  const lines = []
  lines.push(`対象: ${PROJECT_NAME}`)
  lines.push(`基準: publishedAt > ${since}`)
  lines.push('')
  lines.push('候補記事:')
  lines.push('')

  for (const post of unsent) {
    const url = `${SITE_URL}/blog/${post.slug}`
    const title = String(post.title || '').trim() || '(no title)'
    const tweetText = `${title}`
    const intent = buildTweetIntent({ text: tweetText, url })
    lines.push(`- ${title}`)
    lines.push(`  ${url}`)
    lines.push(`  tweet: ${intent}`)
    lines.push('')
  }

  const body = lines.join('\n').trim() + '\n'

  if (DRY_RUN) {
    console.log('[x_mailer] DRY_RUN=true; skip sending email.')
    console.log(body)
    return
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `X Mailer <${GMAIL_USER}>`,
    to: MAIL_TO,
    subject,
    text: body,
  })

  const sentAt = new Date().toISOString()
  const nextSent = { ...sentMap }
  for (const post of unsent) {
    nextSent[post._id] = sentAt
  }

  await writePostLog({ sent: nextSent })
  console.log(`[x_mailer] Sent ${unsent.length} item(s). Updated ${LOG_PATH}.`)
}

main().catch((err) => {
  console.error('[x_mailer] Failed:', err)
  process.exitCode = 1
})
