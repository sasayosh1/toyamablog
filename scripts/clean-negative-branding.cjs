#!/usr/bin/env node

/**
 * 「富山のくせに」というネガティブに受け取られる表現を
 * 「富山、お好きですか？」らしい前向きなトーンへ書き換えるスクリプト。
 * Gemini Flash Lite 001 を使用し、該当ブロックのみ最小限のリクエストで再生成します。
 */

const path = require('path')
require('dotenv').config({path: path.join(__dirname, '..', '.env.local')})

const {createClient} = require('@sanity/client')
const {GoogleGenerativeAI} = require('@google/generative-ai')
const crypto = require('crypto')

const TARGET_PHRASE = '富山のくせに'
// gemini-flash-lite-001 は API v1beta で提供されていないため、
// 既存のワークフローで利用している軽量モデル。
const MODEL_NAME = 'gemini-2.5-flash-lite'
const DRY_RUN = process.argv.includes('--dry-run')

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN が設定されていません。')
  process.exit(1)
}

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY が設定されていません。')
  process.exit(1)
}

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({model: MODEL_NAME})

function blockContainsTarget(block) {
  if (!block || block._type !== 'block' || !Array.isArray(block.children)) {
    return false
  }
  return block.children.some((child) => typeof child.text === 'string' && child.text.includes(TARGET_PHRASE))
}

function textContainsTarget(text) {
  return typeof text === 'string' && text.includes(TARGET_PHRASE)
}

function blockToPlainText(block) {
  if (!block || block._type !== 'block' || !Array.isArray(block.children)) {
    return ''
  }
  return block.children.map((child) => child.text || '').join('')
}

function createSpan(text) {
  return {
    _type: 'span',
    _key: crypto.randomUUID(),
    text,
    marks: [],
  }
}

function sanitizeRewrittenText(text, fallback) {
  if (!text) return fallback
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      if (!line) return false
      if (line === '---') return false
      if (/^(はい|承知|了解|もちろん)/.test(line)) return false
      if (/^【/.test(line)) return false
      if (/^(変更点|ポイント|※)/.test(line)) return false
      if (line.includes(TARGET_PHRASE)) return false
      return true
    })

  if (!lines.length) {
    const replaced = fallback.replaceAll(TARGET_PHRASE, '富山、お好きですか？')
    return replaced === fallback ? '' : replaced
  }

  return lines.join('\n').trim()
}

async function rewriteText(original, title, contextLabel) {
  const prompt = `以下の${contextLabel}を、ブログ「富山、お好きですか？」の読者に向けた柔らかく前向きなトーンに書き換えてください。
- 「${TARGET_PHRASE}」という表現は使わず、必要ならポジティブな文に書き換えてください。
- ブログ名を言及する場合は必ず「富山、お好きですか？」と表記してください。
- 内容の事実関係は変えずに、文章全体を返してください。
- 出力は書き換え後のテキストのみとし、解説・翻訳・罫線・コードブロックなどは付けないでください。

【記事タイトル】${title}
【${contextLabel}】
${original}
`
  const result = await model.generateContent(prompt)
  const response = await result.response
  const raw = response.text().trim()
  return sanitizeRewrittenText(raw, original)
}

async function main() {
  console.log('🔎 「富山のくせに」表現を含む記事を検索中...')
  const posts = await sanityClient.fetch(`*[_type == "post" && (
    pt::text(body) match "${TARGET_PHRASE}" ||
    (defined(title) && title match "*${TARGET_PHRASE}*") ||
    (defined(excerpt) && excerpt match "*${TARGET_PHRASE}*") ||
    (defined(metaDescription) && metaDescription match "*${TARGET_PHRASE}*")
  )]{_id, title, slug, body, excerpt, metaDescription}`)

  const filteredPosts = posts.filter(
    (post) =>
      (Array.isArray(post.body) && post.body.some((block) => blockContainsTarget(block))) ||
      textContainsTarget(post.title) ||
      textContainsTarget(post.excerpt) ||
      textContainsTarget(post.metaDescription)
  )

  if (!filteredPosts.length) {
    console.log('✅ 「富山のくせに」を含む記事はありませんでした。')
    return
  }

  console.log(`📄 対象記事: ${filteredPosts.length}件`)

  let totalRequests = 0
  for (const post of filteredPosts) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📝 ${post.title}`)
    let updated = false
    const newBody = post.body.map((block) => ({...block}))

    for (let i = 0; i < newBody.length; i++) {
      const block = newBody[i]
      if (!blockContainsTarget(block)) continue

      const originalText = blockToPlainText(block)
      console.log(`  ✏️  段落${i + 1} を書き換えます（Geminiリクエスト）`)

      if (DRY_RUN) {
        console.log(`    └─ ドライラン: ${originalText}`)
        continue
      }

      try {
        totalRequests++
        const rewritten = await rewriteText(originalText, post.title, '本文の段落')
        if (!rewritten || rewritten === originalText) {
          console.warn('    ⚠️  変換結果が元と同じか空でした。スキップします。')
          continue
        }

        newBody[i] = {
          ...block,
          children: [createSpan(rewritten)],
        }
        updated = true
        console.log('    ✅ 書き換え完了')
      } catch (error) {
        console.error('    ❌ Gemini書き換えエラー:', error.message || error)
      }
    }

    const metadataUpdates = {}

    const metadataTargets = [
      {field: 'title', label: 'タイトル'},
      {field: 'excerpt', label: '短い抜粋'},
      {field: 'metaDescription', label: 'メタディスクリプション'},
    ]

    for (const {field, label} of metadataTargets) {
      const currentValue = post[field]
      if (!textContainsTarget(currentValue)) continue

      console.log(`  ✏️  ${label}を再生成します`)
      if (DRY_RUN) {
        console.log(`    └─ ドライラン: ${currentValue}`)
        continue
      }

      try {
        totalRequests++
        const rewritten = await rewriteText(currentValue, post.title, label)
        if (!rewritten || rewritten === currentValue) {
          console.warn(`    ⚠️  ${label}の変換結果が元と同じか空でした。スキップします。`)
          continue
        }
        metadataUpdates[field] = rewritten
        console.log(`    ✅ ${label}を書き換えました`)
      } catch (error) {
        console.error(`    ❌ ${label}の書き換えエラー:`, error.message || error)
      }
    }

    const hasMetadataUpdates = Object.keys(metadataUpdates).length > 0

    if ((updated || hasMetadataUpdates) && !DRY_RUN) {
      try {
        const setPayload = {
          lastBrandCleanupAt: new Date().toISOString(),
        }

        if (updated) {
          setPayload.body = newBody
        }

        if (hasMetadataUpdates) {
          Object.assign(setPayload, metadataUpdates)
        }

        await sanityClient.patch(post._id).set(setPayload).commit()
        console.log('  💾 Sanity更新済み')
      } catch (error) {
        console.error('  ❌ Sanity更新エラー:', error.message || error)
      }
    } else if (!updated && !hasMetadataUpdates) {
      console.log('  ℹ️  対象テキストは見つかりましたが更新する内容はありませんでした。')
    }
  }

  if (DRY_RUN) {
    console.log('\n📝 ドライランのため、API更新と書き換えは実行していません。')
  } else {
    console.log(`\n🎯 Gemini API 呼び出し回数: ${totalRequests}件`)
  }
  console.log('✨ ブランド表現のクリーンアップが完了しました。')
}

main().catch((error) => {
  console.error('❌ スクリプト実行中にエラーが発生しました:', error)
  process.exit(1)
})
