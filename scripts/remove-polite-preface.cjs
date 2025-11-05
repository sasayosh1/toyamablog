#!/usr/bin/env node

/**
 * Gemini 置換時に混入した「はい、承知いたしました」などのAI応答文を除去するスクリプト。
 * Sanity の Portable Text ブロックを直接クレンジングします（Gemini再呼び出しなし）。
 */

const path = require('path')
require('dotenv').config({path: path.join(__dirname, '..', '.env.local')})

const {createClient} = require('@sanity/client')
const crypto = require('crypto')

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN が設定されていません。')
  process.exit(1)
}

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const POLITE_PHRASES = [
  'はい、承知いたしました。',
  'はい、承知いたしました',
  '承知いたしました。',
  '承知いたしました',
  'はい、了解しました。',
  'はい、了解しました',
  '了解しました。',
  '了解しました',
  'もちろんです。',
  'もちろんです',
  'かしこまりました。',
  'かしこまりました',
]

function plainText(block) {
  if (!block || block._type !== 'block' || !Array.isArray(block.children)) return ''
  return block.children.map((child) => child.text || '').join('').trim()
}

function createSpan(text) {
  return {
    _type: 'span',
    _key: crypto.randomUUID(),
    text,
    marks: [],
  }
}

const leadingPattern = new RegExp(
  `^(${POLITE_PHRASES.map((phrase) => phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')})[\\s、。!！「」『』【】（）()…~～ー]*`,
  'u'
)

const linePattern = new RegExp(
  `^\\s*(${POLITE_PHRASES.map((phrase) => phrase.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')}).*$`,
  'u'
)

function sanitizeText(text) {
  if (!text) return ''
  let updated = text.replace(leadingPattern, '')
  updated = updated
    .split(/\r?\n/)
    .filter((line) => line && !linePattern.test(line.trim()) && line.trim() !== '---')
    .join('\n')
  return updated.trim()
}

async function main() {
  console.log('🔍 礼儀表現の残骸を検索中...')
  const posts = await sanityClient.fetch(
    `*[_type == "post" && (
        pt::text(body) match "はい、承知いたしました" ||
        coalesce(excerpt, "") match "はい、承知いたしました" ||
        coalesce(metaDescription, "") match "はい、承知いたしました"
      )]{_id, title, slug, body, excerpt, metaDescription}`
  )

  if (!posts.length) {
    console.log('✅ 対象記事はありませんでした。')
    return
  }

  console.log(`📄 対象記事: ${posts.length}件`)

  let patched = 0
  postsLoop: for (const post of posts) {
    const newBody = []
    let removed = false

    for (const block of post.body || []) {
      if (!block || block._type !== 'block') {
        newBody.push(block)
        continue
      }
      const originalText = plainText(block)
      const cleaned = sanitizeText(originalText)
      if (cleaned !== originalText) {
        removed = true
        if (cleaned) {
          newBody.push({
            ...block,
            children: [createSpan(cleaned)],
          })
        }
      } else {
        newBody.push(block)
      }
    }

    if (!removed) {
      console.log(`  ⚠️  ${post.title} は対象ブロックが見つかりませんでした（スキップ）`)
      continue postsLoop
    }

    try {
      const cleanedExcerpt = sanitizeText(post.excerpt || '')
      const cleanedMeta = sanitizeText(post.metaDescription || '')

      await sanityClient
        .patch(post._id)
        .set({
          body: newBody,
          ...(post.excerpt !== undefined ? {excerpt: cleanedExcerpt || undefined} : {}),
          ...(post.metaDescription !== undefined
            ? {metaDescription: cleanedMeta || undefined}
            : {}),
          lastBrandCleanupAt: new Date().toISOString(),
        })
        .commit()
      patched++
      console.log(`  ✅ 更新: ${post.title}`)
    } catch (error) {
      console.error(`  ❌ 更新失敗 (${post.title}):`, error.message || error)
    }
  }

  console.log(`\n🎉 クリーンアップ完了: ${patched}件更新`)
}

main().catch((error) => {
  console.error('❌ スクリプト実行エラー:', error)
  process.exit(1)
})
