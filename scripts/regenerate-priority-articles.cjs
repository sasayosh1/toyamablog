#!/usr/bin/env node

/**
 * 既存記事をタイトルキーワードに合わせて再生成するスクリプト。
 * デフォルトはドライラン。--apply を付けるとSanityを更新します。
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const fetch = globalThis.fetch;
if (typeof fetch !== 'function') {
  throw new Error('Global fetch が利用できません。Node.js 18 以上で実行してください。');
}

const {
  extractLocation,
  extractTitleKeywords,
  generateArticleWithGemini,
  ensureKeywordCoverage,
  markdownToPortableText
} = require('./check-youtube-and-create-articles.cjs');

const ARTICLES_PER_RUN = parseInt(process.env.REGEN_LIMIT || '3', 10);
const DEFAULT_POOL_SIZE = parseInt(process.env.REGEN_POOL_SIZE || '150', 10);
const DEFAULT_VIEW_FILE = process.env.VIEW_RANKING_FILE || null;
const DEFAULT_DELAY_MS = 2000;

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function parseArgs(argv) {
  const options = {
    limit: ARTICLES_PER_RUN,
    apply: false,
    force: false,
    delayMs: DEFAULT_DELAY_MS,
    viewPath: DEFAULT_VIEW_FILE
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--limit' && argv[i + 1]) {
      options.limit = parseInt(argv[i + 1], 10) || options.limit;
      i++;
      continue;
    }
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--delay' && argv[i + 1]) {
      options.delayMs = parseInt(argv[i + 1], 10) || options.delayMs;
      i++;
      continue;
    }
    if (arg === '--views' && argv[i + 1]) {
      options.viewPath = argv[i + 1];
      i++;
      continue;
    }
  }

  return options;
}

function portableTextToPlain(blocks = []) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter(block => block && block._type === 'block')
    .map(block =>
      (block.children || [])
        .map(child => child.text || '')
        .join('')
        .trim()
    )
    .join('\n');
}

async function fetchLatestPosts(limit) {
  const query = `
    *[_type == "post" && defined(youtubeVideo.videoId)] | order(publishedAt desc)[0...$limit]{
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      body,
      "videoId": youtubeVideo.videoId,
      "videoTitle": youtubeVideo.title,
      "videoUrl": youtubeVideo.url
    }
  `;

  return sanityClient.fetch(query, { limit });
}

function resolveViewRankingPath(baseDir, providedPath) {
  if (!providedPath) return null;
  if (path.isAbsolute(providedPath)) return providedPath;
  return path.join(baseDir, providedPath);
}

function parseViewRankingJSON(raw, source) {
  const data = JSON.parse(raw);
  const entries = [];

  if (Array.isArray(data)) {
    for (const [index, item] of data.entries()) {
      if (!item || typeof item !== 'object') continue;
      const views = Number(item.views ?? item.view ?? item.count ?? item.pageViews);
      const slug = item.slug || item.postSlug || item.slugCurrent || null;
      const videoId = item.videoId || item.youtubeId || null;

      if (!slug && !videoId) continue;
      if (!Number.isFinite(views)) continue;

      entries.push({
        slug,
        videoId,
        views,
        rank: index,
        source
      });
    }
  } else if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    keys.forEach((key, index) => {
      const value = data[key];
      const views = Number(
        typeof value === 'object' ? value.views ?? value.pageViews ?? value.count : value
      );
      if (!Number.isFinite(views)) return;
      entries.push({
        slug: key,
        videoId: value?.videoId || null,
        views,
        rank: index,
        source
      });
    });
  }

  return entries;
}

function parseViewRankingCSV(raw, source) {
  const lines = raw.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map(col => col.trim().toLowerCase());
  const slugIndex = headers.findIndex(h => h === 'slug' || h === 'slug.current' || h === 'post');
  const videoIdIndex = headers.findIndex(h => h === 'videoid' || h === 'youtubeid' || h === 'video_id');
  const viewsIndex = headers.findIndex(
    h => h === 'views' || h === 'pageviews' || h === 'count' || h === 'sessions'
  );

  if (viewsIndex === -1) {
    console.warn('⚠️  CSVに視聴数列が見つからなかったため、ビューランキングを読み込めませんでした');
    return [];
  }

  const entries = [];
  rows.forEach((row, index) => {
    const cols = row.split(',').map(col => col.trim());
    const views = Number(cols[viewsIndex]);
    if (!Number.isFinite(views)) return;

    const slug = slugIndex >= 0 ? cols[slugIndex] || null : null;
    const videoId = videoIdIndex >= 0 ? cols[videoIdIndex] || null : null;

    if (!slug && !videoId) return;

    entries.push({
      slug,
      videoId,
      views,
      rank: index,
      source
    });
  });

  return entries;
}

function loadViewRanking(baseDir, providedPath) {
  const viewPath = resolveViewRankingPath(baseDir, providedPath);
  if (!viewPath) return null;

  if (!fs.existsSync(viewPath)) {
    console.warn(`⚠️  ビューランキングファイルが見つかりませんでした: ${viewPath}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(viewPath, 'utf-8');
    let entries = [];
    if (viewPath.endsWith('.json')) {
      entries = parseViewRankingJSON(raw, viewPath);
    } else if (viewPath.endsWith('.csv')) {
      entries = parseViewRankingCSV(raw, viewPath);
    } else {
      console.warn('⚠️  対応していないファイル形式です（.json または .csv を使用してください）');
      return null;
    }

    if (!entries.length) {
      console.warn('⚠️  ビューランキングファイルに有効なデータがありませんでした');
      return null;
    }

    const bySlug = new Map();
    const byVideoId = new Map();
    entries.forEach(entry => {
      if (entry.slug) bySlug.set(entry.slug, entry);
      if (entry.videoId) byVideoId.set(entry.videoId, entry);
    });

    return {
      entries,
      bySlug,
      byVideoId,
      source: viewPath
    };
  } catch (error) {
    console.error('❌ ビューランキングファイルの読み込みに失敗しました:', error.message);
    return null;
  }
}

function scorePostWithViewRanking(post, viewRanking) {
  if (!viewRanking) return null;

  const slug = post.slug?.current;
  const videoId = post.videoId;

  if (slug && viewRanking.bySlug.has(slug)) {
    return viewRanking.bySlug.get(slug);
  }

  if (videoId && viewRanking.byVideoId.has(videoId)) {
    return viewRanking.byVideoId.get(videoId);
  }

  return null;
}

function prioritizePosts(posts, viewRanking, limit) {
  if (!viewRanking) {
    return posts.slice(0, limit);
  }

  const scored = [];
  const remainder = [];

  posts.forEach(post => {
    const score = scorePostWithViewRanking(post, viewRanking);
    if (score) {
      scored.push({
        post,
        score: score.views,
        rank: score.rank
      });
    } else {
      remainder.push(post);
    }
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.rank - b.rank;
  });

  const selected = [];
  const seenIds = new Set();

  for (const item of scored) {
    if (selected.length >= limit) break;
    selected.push(item.post);
    seenIds.add(item.post._id);
  }

  for (const post of remainder) {
    if (selected.length >= limit) break;
    if (seenIds.has(post._id)) continue;
    selected.push(post);
    seenIds.add(post._id);
  }

  return selected.slice(0, limit);
}

async function fetchVideoDetails(videoId) {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️  YOUTUBE_API_KEY が未設定のため、動画説明を取得できません。Sanityの既存データを使用します。');
    return null;
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', YOUTUBE_API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error(`❌ YouTube APIエラー (${videoId}): ${data.error.message}`);
    return null;
  }

  const snippet = data.items?.[0]?.snippet;
  if (!snippet) {
    console.warn(`⚠️  動画情報を取得できませんでした: ${videoId}`);
    return null;
  }

  return {
    title: snippet.title,
    description: snippet.description,
    publishedAt: snippet.publishedAt
  };
}

function deriveExcerptFromBlocks(blocks, location) {
  const firstBodyBlock = blocks.find(
    block => (block.style || 'normal') === 'normal' && !block.listItem
  );

  const paragraph = firstBodyBlock
    ? (firstBodyBlock.children || [])
        .map(child => child.text || '')
        .join('')
        .trim()
    : '';

  if (paragraph) {
    return paragraph.length > 150 ? `${paragraph.slice(0, 150)}...` : paragraph;
  }

  return `${location}の魅力をご紹介します。`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function regeneratePost(post, options) {
  const location = extractLocation(post.title);
  if (!location) {
    console.log(`⏭️  スキップ（地域不明）: ${post.title}`);
    return { status: 'skipped', reason: 'location-missing' };
  }

  const titleKeywords = extractTitleKeywords(post.title, location);
  const bodyText = portableTextToPlain(post.body);
  const missingKeywords = titleKeywords.filter(
    keyword => keyword && !bodyText.includes(keyword)
  );

  const needsUpdate = options.force || missingKeywords.length > 0;

  if (!needsUpdate) {
    console.log(`✅ キーワード充足のためスキップ: ${post.title}`);
    return { status: 'skipped', reason: 'already-good' };
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 ${post.title}`);
  console.log(`📍 地域: ${location}`);
  console.log(`🎯 タイトルキーワード: ${titleKeywords.join(', ') || '（抽出なし）'}`);
  if (options.viewRanking) {
    const score = scorePostWithViewRanking(post, options.viewRanking);
    if (score) {
      console.log(`👀 推定ビュー: ${score.views} (${path.basename(score.source)} #${score.rank + 1})`);
    }
  }
  if (missingKeywords.length) {
    console.log(`⚠️  不足キーワード: ${missingKeywords.join(', ')}`);
  } else if (options.force) {
    console.log('⚠️  --force 指定のため再生成を実行します');
  }

  if (!options.apply) {
    console.log('📝 ドライラン: Sanityは更新されません');
    return { status: 'dry-run', reason: 'preview', missingKeywords };
  }

  const videoId = post.videoId;
  if (!videoId) {
    console.log('⏭️  動画IDがないためスキップ');
    return { status: 'skipped', reason: 'missing-video' };
  }

  const videoDetails = await fetchVideoDetails(videoId);
  const video = {
    videoId,
    title: videoDetails?.title || post.videoTitle || post.title,
    description: videoDetails?.description || '',
    url: post.videoUrl || `https://youtu.be/${videoId}`
  };

  console.log('🤖 Geminiで記事を再生成中...');
  const generatedMarkdown = await generateArticleWithGemini(
    video,
    location,
    titleKeywords
  );

  const { markdown: ensuredMarkdown, missing } = ensureKeywordCoverage(
    generatedMarkdown,
    titleKeywords
  );

  if (missing.length) {
    console.warn(
      `⚠️  挿入後も次のキーワードが見つかりませんでした: ${missing.join(', ')}`
    );
  }

  const bodyBlocks = markdownToPortableText(ensuredMarkdown);
  const excerpt = deriveExcerptFromBlocks(bodyBlocks, location);
  const metaDescription = excerpt.slice(0, 160);

  await sanityClient
    .patch(post._id)
    .set({
      body: bodyBlocks,
      excerpt,
      metaDescription,
      lastRegeneratedAt: new Date().toISOString()
    })
    .commit();

  console.log(`✅ 再生成完了: ${post.slug?.current || '(slugなし)'}`);

  if (options.delayMs > 0) {
    await sleep(options.delayMs);
  }

  return { status: 'updated', missingKeywords };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log('🚀 既存記事の再生成チェックを開始します');
  console.log(`  - 処理件数: ${options.limit}`);
  console.log(`  - モード: ${options.apply ? '更新あり' : 'ドライラン'}`);
  console.log(`  - 強制再生成: ${options.force ? '有効' : '無効'}`);

  const viewRanking = loadViewRanking(process.cwd(), options.viewPath);
  if (viewRanking) {
    console.log(`  - ビュー参照: ${viewRanking.source}`);
  } else if (options.viewPath) {
    console.log(`  - ビュー参照: ${options.viewPath}（読み込み失敗）`);
  } else {
    console.log('  - ビュー参照: 未設定（公開日時順で処理）');
  }

  const fetchPoolSize = viewRanking
    ? Math.max(DEFAULT_POOL_SIZE, viewRanking.entries.length)
    : options.limit;

  const postsPool = await fetchLatestPosts(fetchPoolSize);
  if (!postsPool.length) {
    console.log('⚠️  対象記事が見つかりませんでした');
    return;
  }

  const posts = prioritizePosts(postsPool, viewRanking, options.limit);
  if (!posts.length) {
    console.log('⚠️  対象記事が見つかりませんでした');
    return;
  }

  let updated = 0;
  let dryRunCount = 0;
  let skipped = 0;

  const execOptions = { ...options, viewRanking };

  for (const post of posts) {
    const result = await regeneratePost(post, execOptions);
    if (result.status === 'updated') updated++;
    if (result.status === 'dry-run') dryRunCount++;
    if (result.status === 'skipped') skipped++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 実行結果');
  console.log(`  - 更新: ${updated}`);
  console.log(`  - ドライラン: ${dryRunCount}`);
  console.log(`  - スキップ: ${skipped}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 実行中にエラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = {
  regeneratePost,
  portableTextToPlain,
  fetchLatestPosts
};
