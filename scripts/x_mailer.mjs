import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

const {
  PROJECT_NAME,
  SITE_URL,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION,
  SANITY_TOKEN,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  MAIL_TO,
} = process.env

if (!PROJECT_NAME || !SITE_URL) throw new Error('PROJECT_NAME / SITE_URL required')
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_VERSION) throw new Error('Sanity env missing')
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error('Gmail env missing')

const LOG_PATH = path.resolve('scripts/postlog.json')
const CHAR_LIMIT = 140

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '')
const now = () => new Date()

function getJstHour(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    hour12: false,
  })
  return Number(formatter.format(date))
}

const loadLog = () =>
  fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')) : { posted: [] }

const saveLog = (log) => fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n')

const sanityFetch = async (query) => {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: SANITY_TOKEN ? { Authorization: `Bearer ${SANITY_TOKEN}` } : {},
  })
  const json = await res.json()
  return json.result
}

const buildText = (title, desc, url) => {
  let text = `${title}\n${desc}\n${url}`
  if (text.length <= CHAR_LIMIT) return text

  // 説明文を削る
  const remain = CHAR_LIMIT - (title.length + url.length + 2)
  const shortDesc = desc.slice(0, Math.max(0, remain - 1)) + '…'
  return `${title}\n${shortDesc}\n${url}`.slice(0, CHAR_LIMIT)
}

const sendMail = async (subject, body) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from: `"X Mailer" <${GMAIL_USER}>`,
    to: MAIL_TO || GMAIL_USER,
    subject,
    text: body,
  })
}

const daysAgo = (base, iso) => (base - new Date(iso)) / 86400000

const main = async () => {
  const siteUrl = normalizeBaseUrl(SITE_URL)

  const log = loadLog()
  const posted = Array.isArray(log.posted) ? log.posted : []
  const postedIds = new Set(
    posted
      .map((entry) => {
        if (!entry) return ''
        if (typeof entry === 'string') return entry
        if (typeof entry === 'object' && typeof entry.id === 'string') return entry.id
        return ''
      })
      .filter(Boolean)
  )

  const groq = `
*[_type=="post" && defined(slug.current)]
| order(coalesce(publishedAt,_createdAt) desc)[0...100]{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  _createdAt
}`

  const posts = await sanityFetch(groq)

  const nowDate = now()
  const isMorning = getJstHour(nowDate) < 12

  let pick

  if (isMorning) {
    pick = posts.find((p) => daysAgo(nowDate, p.publishedAt || p._createdAt) <= 7 && !postedIds.has(p._id))
  }

  if (!pick) {
    pick = posts.find((p) => daysAgo(nowDate, p.publishedAt || p._createdAt) >= 30 && !postedIds.has(p._id))
  }

  if (!pick) {
    console.log('No post available')
    return
  }

  const titlePrefix = PROJECT_NAME === 'toyama' ? '【富山】' : '【看護助手】'
  const title = `${titlePrefix}${pick.title}`

  const desc =
    PROJECT_NAME === 'toyama' ? '今の季節にちょうどいい内容です。' : '現場でよくある悩みを整理しました。'

  const url = `${siteUrl}/blog/${pick.slug}`
  const tweetText = buildText(title, desc, url)

  const body = [
    '以下をそのままXに投稿してください。',
    '（投稿後、このメールは削除OK）',
    '',
    '------------------------------',
    tweetText,
    '------------------------------',
  ].join('\n')

  const subject = `【X投稿用｜${PROJECT_NAME}】${pick.slug}`

  await sendMail(subject, body)

  posted.push({ id: pick._id, slug: pick.slug, at: new Date().toISOString() })
  log.posted = posted.slice(-200)
  saveLog(log)

  console.log('Mail sent:', subject)
}

main().catch((error) => {
  console.error('[x_mailer] Failed:', error)
  process.exitCode = 1
})
