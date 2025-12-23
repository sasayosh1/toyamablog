import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const {
  PROJECT_NAME,
  SITE_URL,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION,
  SANITY_TOKEN,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  GMAIL_OAUTH_CLIENT_ID,
  GMAIL_OAUTH_CLIENT_SECRET,
  GMAIL_OAUTH_REFRESH_TOKEN,
  GMAIL_OAUTH_REDIRECT_URI,
  MAIL_TO,
} = process.env

const [,, command] = process.argv
const isAuthCommand = command === 'auth'

if (!isAuthCommand) {
  if (!PROJECT_NAME || !SITE_URL) throw new Error('PROJECT_NAME / SITE_URL required')
  if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_VERSION) throw new Error('Sanity env missing')
  if (!GMAIL_USER) throw new Error('Gmail env missing: GMAIL_USER')
}

const LOG_PATH = path.resolve('scripts/postlog.json')
const CHAR_LIMIT = 140

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '')
const now = () => new Date()

function maskEmail(email) {
  const value = String(email || '')
  const at = value.indexOf('@')
  if (at <= 0) return value ? `${value.slice(0, 2)}***` : ''
  const name = value.slice(0, at)
  const domain = value.slice(at + 1)
  const maskedName = name.length <= 2 ? `${name[0] || ''}*` : `${name[0]}***${name[name.length - 1]}`
  return `${maskedName}@${domain}`
}

async function getGmailOAuthRefreshToken() {
  if (process.env.GITHUB_ACTIONS) {
    throw new Error('Refusing to run auth flow in GitHub Actions. Run locally: node scripts/x_mailer.mjs auth')
  }

  const clientId = String(GMAIL_OAUTH_CLIENT_ID || '').trim()
  const clientSecret = String(GMAIL_OAUTH_CLIENT_SECRET || '').trim()
  if (!clientId || !clientSecret) {
    throw new Error('Missing OAuth2 secrets: GMAIL_OAUTH_CLIENT_ID / GMAIL_OAUTH_CLIENT_SECRET')
  }

  // Use loopback redirect. Desktop OAuth clients allow localhost loopback.
  const server = http.createServer()
  const port = await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      if (!addr || typeof addr === 'string') return reject(new Error('Failed to bind loopback server'))
      resolve(addr.port)
    })
  })

  const redirectUri =
    String(GMAIL_OAUTH_REDIRECT_URI || '').trim() || `http://127.0.0.1:${port}`

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  const scopes = ['https://www.googleapis.com/auth/gmail.send']
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  })

  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Auth flow timed out (no redirect received).'))
    }, 5 * 60 * 1000)

    server.on('request', (req, res) => {
      try {
        const url = new URL(req.url || '/', redirectUri)
        const got = url.searchParams.get('code')
        if (!got) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end('Missing code.')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('OK. You can close this tab and return to the terminal.')
        clearTimeout(timeout)
        resolve(got)
      } catch (err) {
        clearTimeout(timeout)
        reject(err)
      } finally {
        server.close(() => {})
      }
    })

    console.log('Open this URL in your browser to authorize Gmail sending:')
    console.log(authUrl)
    console.log('')
    console.log(`Waiting for redirect on ${redirectUri} ...`)
  })

  const tokenResponse = await oauth2Client.getToken(code)
  const refreshToken = tokenResponse?.tokens?.refresh_token
  if (!refreshToken) {
    throw new Error('No refresh_token received. Re-run auth with prompt=consent and ensure you are not reusing an already-consented client.')
  }

  return refreshToken
}

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
  const smtpHost = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim()
  const smtpPortRaw = String(process.env.SMTP_PORT || '465').trim()
  const smtpPort = Number(smtpPortRaw)
  const smtpSecureRaw = String(process.env.SMTP_SECURE || 'true').trim().toLowerCase()
  const smtpSecure = smtpSecureRaw === '1' || smtpSecureRaw === 'true' || smtpSecureRaw === 'yes' || smtpSecureRaw === 'on'

  const hasOAuth2 =
    String(GMAIL_OAUTH_CLIENT_ID || '').trim() &&
    String(GMAIL_OAUTH_CLIENT_SECRET || '').trim() &&
    String(GMAIL_OAUTH_REFRESH_TOKEN || '').trim()

  if (!hasOAuth2 && !String(GMAIL_APP_PASSWORD || '').trim()) {
    throw new Error('Gmail env missing: set either GMAIL_APP_PASSWORD or OAuth2 secrets (GMAIL_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN)')
  }

  const appPass = String(GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
  const auth = hasOAuth2
    ? {
        type: 'OAuth2',
        user: GMAIL_USER,
        clientId: String(GMAIL_OAUTH_CLIENT_ID || '').trim(),
        clientSecret: String(GMAIL_OAUTH_CLIENT_SECRET || '').trim(),
        refreshToken: String(GMAIL_OAUTH_REFRESH_TOKEN || '').trim(),
        ...(String(GMAIL_OAUTH_REDIRECT_URI || '').trim()
          ? { redirectUri: String(GMAIL_OAUTH_REDIRECT_URI || '').trim() }
          : {}),
      }
    : { user: GMAIL_USER, pass: appPass }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isFinite(smtpPort) ? smtpPort : 465,
    secure: smtpSecure,
    auth,
  })

  try {
    await transporter.verify()
    await transporter.sendMail({
      from: `"X Mailer" <${GMAIL_USER}>`,
      to: MAIL_TO || GMAIL_USER,
      subject,
      text: body,
    })
  } catch (error) {
    const code = error?.code
    const responseCode = error?.responseCode
    const command = error?.command
    const response = error?.response

    if (code === 'EAUTH' || responseCode === 535) {
      const passLen = Array.from(appPass).length
      throw new Error(
        [
          'Gmail authentication failed (EAUTH/535).',
          `SMTP: host=${smtpHost} port=${Number.isFinite(smtpPort) ? smtpPort : 465} secure=${smtpSecure}`,
          `Account: ${maskEmail(GMAIL_USER)} (auth=${hasOAuth2 ? 'oauth2' : 'app_password'}${hasOAuth2 ? '' : `, appPassLen=${passLen}`})`,
          'Fix:',
          hasOAuth2
            ? '- OAuth2 secrets are present, but Gmail rejected the token. Re-issue Refresh Token (and ensure Gmail API scope includes mail sending) and update secrets.'
            : '- Make sure the GitHub Secret `GMAIL_APP_PASSWORD` is an App Password for the *same* `GMAIL_USER` you just updated.',
          hasOAuth2
            ? '- Confirm `GMAIL_OAUTH_CLIENT_ID` / `GMAIL_OAUTH_CLIENT_SECRET` are from the same Google Cloud project that issued the refresh token.'
            : '- The Gmail account must have 2-Step Verification enabled, then generate an App Password (Google Account > Security > App passwords).',
          !hasOAuth2
            ? '- If you copied an App Password shown like "abcd efgh ijkl mnop", remove spaces (this script strips whitespace automatically).'
            : '',
          !hasOAuth2 && passLen !== 16 ? `- Your app password length after stripping spaces is ${passLen} (expected 16).` : '',
          !hasOAuth2 ? '- If you recently changed accounts, update both `GMAIL_USER` and `GMAIL_APP_PASSWORD` in this repo.' : '',
          '',
          `Details: code=${code} responseCode=${responseCode} command=${command}`,
          response ? `response=${String(response).slice(0, 200)}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      )
    }

    throw error
  }
}

const daysAgo = (base, iso) => (base - new Date(iso)) / 86400000

const main = async () => {
  if (isAuthCommand) {
    const refreshToken = await getGmailOAuthRefreshToken()
    console.log('')
    console.log('Refresh token (store this as GitHub Secret `GMAIL_OAUTH_REFRESH_TOKEN`):')
    console.log(refreshToken)
    return
  }

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
