const { createClient } = require('@sanity/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// ===== 設定 =====
const PROGRESS_FILE = path.join(__dirname, '..', '.last-processed-video.json');
const ARTICLES_PER_RUN = parseInt(process.env.ARTICLES_PER_RUN || '3', 10); // 初期3ヶ月: 3件、その後: 2件に変更

// Gemini API設定（コスト最適化）
const GEMINI_MODEL = 'gemini-2.5-flash-lite'; // 最安・高品質（¥0.19/記事、月¥3-4）

// Sanity Client
const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// YouTube設定
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCxX3Eq8_KMl3AeYdhb5MklA';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// ===== 進捗管理 =====

/**
 * 進捗ファイルを読み込み
 */
function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {
      lastProcessedVideoId: null,
      lastProcessedDate: null,
      totalProcessed: 0,
      lastProcessedIndex: -1
    };
  }

  try {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️  進捗ファイル読み込みエラー:', error);
    return {
      lastProcessedVideoId: null,
      lastProcessedDate: null,
      totalProcessed: 0,
      lastProcessedIndex: -1
    };
  }
}

/**
 * 進捗ファイルを保存
 */
function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
    console.log(`✅ 進捗を保存しました: ${progress.lastProcessedVideoId}`);
  } catch (error) {
    console.error('❌ 進捗ファイル保存エラー:', error);
  }
}

// ===== YouTube API =====

/**
 * YouTube Data APIから全動画を取得（日付順）
 */
async function fetchAllYouTubeVideos() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ YouTube API Error:', data.error.message);
      return [];
    }

    const videos = data.items?.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      url: `https://youtu.be/${item.id.videoId}`
    })) || [];

    return videos;
  } catch (error) {
    console.error('❌ YouTube API Fetch Error:', error);
    return [];
  }
}

// ===== Sanity API =====

/**
 * 既存記事の動画IDリストを取得
 */
async function getExistingVideoIds() {
  try {
    const posts = await sanityClient.fetch(`
      *[_type == "post" && defined(youtubeVideo.videoId)] {
        "videoId": youtubeVideo.videoId
      }
    `);

    return new Set(posts.map(p => p.videoId).filter(Boolean));
  } catch (error) {
    console.error('❌ Sanity記事取得エラー:', error);
    return new Set();
  }
}

/**
 * カテゴリ参照を取得または作成
 */
async function getCategoryReference(location) {
  try {
    let category = await sanityClient.fetch(`*[_type == "category" && title == "${location}"][0]`);

    if (!category) {
      console.log(`📝 「${location}」カテゴリを作成中...`);

      const locationSlug = location
        .toLowerCase()
        .replace(/市$/, '-city')
        .replace(/町$/, '-town')
        .replace(/村$/, '-village');

      category = await sanityClient.create({
        _type: 'category',
        title: location,
        slug: {
          _type: 'slug',
          current: locationSlug
        },
        description: `${location}に関する記事`
      });

      console.log(`✅ 「${location}」カテゴリを作成しました`);
    }

    return {
      _type: 'reference',
      _ref: category._id
    };
  } catch (error) {
    console.error(`❌ カテゴリ取得/作成エラー（${location}）:`, error);
    return null;
  }
}

// ===== 地域・カテゴリ抽出 =====

/**
 * 動画タイトルから富山県の地域を抽出
 */
function extractLocation(title) {
  const locations = [
    '富山市', '高岡市', '射水市', '氷見市', '砺波市',
    '小矢部市', '南砺市', '魚津市', '黒部市', '滑川市',
    '上市町', '立山町', '入善町', '朝日町', '舟橋村'
  ];

  const bracketMatch = title.match(/【(.+?)】/);
  if (bracketMatch) {
    const extracted = bracketMatch[1];
    if (locations.includes(extracted)) {
      return extracted;
    }
  }

  for (const location of locations) {
    if (title.includes(location)) {
      return location;
    }
  }

  return null;
}

// ===== Gemini AI記事生成 =====

/**
 * Gemini APIで高品質な記事本文を生成
 */
async function generateArticleWithGemini(video, location) {
  const prompt = `あなたは富山県の魅力を伝えるブログ「富山のくせに」のライターです。以下のYouTube動画から、親しみやすく読みやすいブログ記事を作成してください。

【動画情報】
タイトル: ${video.title}
説明: ${video.description || '（説明なし）'}
地域: ${location}

【記事作成ルール】
1. **文字数**: 1,500〜2,000文字（スマホ読みやすさ最優先）
2. **構成**: 導入文（2-3行） → H2見出し3つ → まとめ
3. **H2見出し**: 3つの主要セクション
4. **H3見出し**: 必須ではなく、文章上どうしても必要な場合のみ使用
5. **箇条書き**: 積極的に活用（読みやすさ向上）
6. **数字**: 具体的な情報を提供する際に積極的に使用
7. **まとめ**: 読者の行動を促す結び

【記事タイトル】
${video.title.includes('【') ? video.title : `【${location}】${video.title}`}

【記事本文】（Markdown形式で出力）`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('❌ Gemini API記事生成エラー:', error);
    throw error;
  }
}

/**
 * Markdown本文をSanity Portable Text形式に変換
 */
function markdownToPortableText(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentBlock = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // H2見出し
    if (line.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: `h2-${blocks.length}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-${blocks.length}`,
          text: line.replace(/^## /, ''),
          marks: []
        }],
        markDefs: []
      });
      currentBlock = null;
      continue;
    }

    // H3見出し
    if (line.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: `h3-${blocks.length}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-${blocks.length}`,
          text: line.replace(/^### /, ''),
          marks: []
        }],
        markDefs: []
      });
      currentBlock = null;
      continue;
    }

    // 通常段落
    blocks.push({
      _type: 'block',
      _key: `p-${blocks.length}`,
      style: 'normal',
      children: [{
        _type: 'span',
        _key: `span-${blocks.length}`,
        text: line,
        marks: []
      }],
      markDefs: []
    });
  }

  return blocks;
}

// ===== 記事作成 =====

/**
 * Sanityに新しい記事を作成
 */
async function createArticle(video, location) {
  console.log(`\n📝 記事作成中: ${video.title}`);

  try {
    // Gemini APIで記事本文を生成
    console.log('🤖 Gemini APIで記事を生成中...');
    const markdownContent = await generateArticleWithGemini(video, location);
    const bodyBlocks = markdownToPortableText(markdownContent);

    // カテゴリ参照を取得
    const categoryRef = await getCategoryReference(location);

    // タイトル整形（#shortsを削除）
    const cleanTitle = video.title
      .replace(/#shorts/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const articleTitle = cleanTitle.includes('【') ? cleanTitle : `【${location}】${cleanTitle}`;

    // Slug生成
    const timestamp = Date.now();
    const locationSlug = location
      .toLowerCase()
      .replace(/市$/, '-city')
      .replace(/町$/, '-town')
      .replace(/村$/, '-village');
    const slug = `${locationSlug}-${timestamp}`;

    // タグ生成
    const tags = [
      '富山',
      '富山県',
      'TOYAMA',
      location,
      'YouTube',
      '動画',
      'おすすめ'
    ].filter(Boolean);

    // Excerpt生成（最初の段落から）
    const firstParagraph = markdownContent.split('\n').find(line => line.trim() && !line.startsWith('#'));
    const excerpt = firstParagraph ? firstParagraph.slice(0, 150) + '...' : `${location}の魅力的なスポットをご紹介します。`;

    // 記事オブジェクト
    const article = {
      _type: 'post',
      title: articleTitle,
      slug: {
        _type: 'slug',
        current: slug
      },
      youtubeVideo: {
        _type: 'youtubeVideo',
        videoId: video.videoId,
        title: video.title,
        url: video.url
      },
      body: bodyBlocks,
      excerpt: excerpt,
      metaDescription: excerpt.slice(0, 160),
      tags: tags,
      categories: categoryRef ? [categoryRef] : [],
      publishedAt: new Date().toISOString(),
      author: {
        _type: 'reference',
        _ref: '95vBmVlXBxlHRIj7vD7uCv' // ささよしAuthor ID
      }
    };

    // Sanityに作成
    const result = await sanityClient.create(article);
    console.log(`✅ 記事作成完了: ${result.title}`);

    return result;
  } catch (error) {
    console.error(`❌ 記事作成エラー:`, error);
    return null;
  }
}

// ===== メイン処理 =====

async function main() {
  console.log('🚀 YouTube記事自動生成を開始します\n');
  console.log(`📊 設定:`);
  console.log(`  - モデル: ${GEMINI_MODEL} (Gemini 2.5 Flash-Lite)`);
  console.log(`  - 処理件数: ${ARTICLES_PER_RUN}件/回\n`);

  // 進捗を読み込み
  const progress = loadProgress();
  console.log(`📁 進捗状況:`);
  console.log(`  - 前回処理動画ID: ${progress.lastProcessedVideoId || '（初回実行）'}`);
  console.log(`  - 総処理済み: ${progress.totalProcessed}件\n`);

  // YouTube動画を全件取得
  console.log('📺 YouTube動画を取得中...');
  const allVideos = await fetchAllYouTubeVideos();
  console.log(`  取得完了: ${allVideos.length}件\n`);

  if (allVideos.length === 0) {
    console.log('⚠️  動画が取得できませんでした');
    return;
  }

  // 既存記事の動画IDを取得
  console.log('📄 既存記事をチェック中...');
  const existingVideoIds = await getExistingVideoIds();
  console.log(`  既存記事: ${existingVideoIds.size}件\n`);

  // 前回の次から処理対象を特定
  let startIndex = 0;
  if (progress.lastProcessedVideoId) {
    const lastIndex = allVideos.findIndex(v => v.videoId === progress.lastProcessedVideoId);
    if (lastIndex !== -1) {
      startIndex = lastIndex + 1;
      console.log(`▶️  前回の続きから処理: ${startIndex + 1}番目の動画から\n`);
    }
  }

  // 未記事化動画を抽出（前回の次からN件）
  const videosToProcess = [];
  for (let i = startIndex; i < allVideos.length && videosToProcess.length < ARTICLES_PER_RUN; i++) {
    const video = allVideos[i];

    // 既に記事化済みかチェック
    if (existingVideoIds.has(video.videoId)) {
      console.log(`⏭️  スキップ（既存）: ${video.title}`);
      continue;
    }

    // 地域を抽出
    const location = extractLocation(video.title);
    if (!location) {
      console.log(`⏭️  スキップ（地域不明）: ${video.title}`);
      continue;
    }

    videosToProcess.push({ video, location, index: i });
  }

  console.log(`\n✨ 処理対象動画: ${videosToProcess.length}件\n`);

  if (videosToProcess.length === 0) {
    console.log('✅ 処理対象動画がありません');
    return;
  }

  // 記事作成
  let successCount = 0;
  let lastProcessedVideoId = progress.lastProcessedVideoId;

  for (const { video, location, index } of videosToProcess) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 ${location} | ${video.title}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const result = await createArticle(video, location);

    if (result) {
      successCount++;
      lastProcessedVideoId = video.videoId;

      // 進捗を保存
      saveProgress({
        lastProcessedVideoId: video.videoId,
        lastProcessedDate: new Date().toISOString(),
        totalProcessed: progress.totalProcessed + successCount,
        lastProcessedIndex: index
      });

      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 処理完了`);
  console.log(`  - 成功: ${successCount}件`);
  console.log(`  - 総処理済み: ${progress.totalProcessed + successCount}件`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = { main };
