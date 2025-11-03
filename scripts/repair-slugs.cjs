#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local'), override: false });

const { createClient } = require('@sanity/client');
const { extractLocation, generateSlugForVideo, LOCATION_SLUG_PREFIX } = require('./check-youtube-and-create-articles.cjs');

const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;
if (!SANITY_TOKEN) {
  console.error('❌ Sanity APIトークンが設定されていません。SANITY_API_TOKEN または SANITY_WRITE_TOKEN を設定してください。');
  process.exit(1);
}

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: SANITY_TOKEN,
});

function isCompliantSlug(slug, location) {
  if (!slug || typeof slug !== 'string') return false;
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  const prefix = LOCATION_SLUG_PREFIX[location] || 'toyama-general';
  if (!slug.startsWith(`${prefix}-`)) return false;
  const prefixParts = prefix.split('-').length;
  const parts = slug.split('-');
  const keywordParts = parts.slice(prefixParts);
  return keywordParts.length >= 3 && keywordParts.every(part => /^[a-z]+$/.test(part));
}

function extractVideoInfo(post) {
  const video = post.youtubeVideo || {};
  let videoId = video.videoId || null;
  if (!videoId && post.youtubeUrl) {
    const match = post.youtubeUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (match) {
      videoId = match[1];
    }
  }
  return {
    videoId,
    title: video.title || post.title || '',
    description: video.description || '',
    url: video.url || post.youtubeUrl || '',
  };
}

async function main() {
  console.log('🔧 Slug 修正スクリプトを開始します...');
  const posts = await sanityClient.fetch(`*[_type == "post"]{_id, title, slug, youtubeVideo, youtubeUrl}`);
  let updated = 0;

  for (const post of posts) {
    const location = extractLocation(post.title || '');
    if (!location) {
      continue;
    }

    const currentSlug = post.slug?.current || '';
    if (isCompliantSlug(currentSlug, location)) {
      continue;
    }

    const video = extractVideoInfo(post);
    if (!video.videoId) {
      console.log(`⚠️  スキップ（動画ID不明）: ${post.title}`);
      continue;
    }

    const newSlug = await generateSlugForVideo(video, location);
    if (!newSlug || newSlug === currentSlug) {
      continue;
    }

    await sanityClient
      .patch(post._id)
      .set({
        slug: {
          _type: 'slug',
          current: newSlug,
        },
      })
      .commit();

    updated++;
    console.log(`✓ スラッグ更新: ${post.title} => ${newSlug}`);
  }

  console.log(`\n✅ 処理完了: ${updated}件のスラッグを更新しました。`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ スラッグ修正中にエラー発生:', error);
    process.exit(1);
  });
}

module.exports = { main };
