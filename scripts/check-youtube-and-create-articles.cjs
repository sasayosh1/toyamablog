const { createClient } = require('@sanity/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
// Load .env.local with override: true to force new keys over old shell variables
require('dotenv').config({
  path: path.join(__dirname, '..', '.env.local'),
  override: true
});

// ===== 設定 =====
const PROGRESS_FILE = path.join(__dirname, '..', '.last-processed-video.json');
const ARTICLES_PER_RUN = parseInt(process.env.ARTICLES_PER_RUN || '3', 10); // 初期3ヶ月: 3件、その後: 2件に変更

// Gemini API設定（コスト最適化）
const GEMINI_MODEL = 'gemini-2.5-flash'; // 最安・高品質（¥0.19/記事、月¥3-4）

// Sanity Client
const sanityToken = (process.env.SANITY_API_TOKEN || '').trim();
const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: sanityToken
});

// Gemini AI Client
const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

// YouTube設定
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCxX3Eq8_KMl3AeYdhb5MklA';
const YOUTUBE_API_KEY = (process.env.YOUTUBE_API_KEY || '').trim();

// ===== 文章整形ユーティリティ =====

const LOCATION_SLUG_PREFIX = {
  '富山市': 'toyama-toyamashi',
  '高岡市': 'toyama-takaokashi',
  '射水市': 'toyama-imizushi',
  '氷見市': 'toyama-himishi',
  '砺波市': 'toyama-tonamishi',
  '小矢部市': 'toyama-oyabeshi',
  '南砺市': 'toyama-nantoshi',
  '魚津市': 'toyama-uozushi',
  '黒部市': 'toyama-kurobeshi',
  '滑川市': 'toyama-namerikawashi',
  '上市町': 'toyama-kamiichimachi',
  '立山町': 'toyama-tateyamamachi',
  '入善町': 'toyama-nyuzenmachi',
  '朝日町': 'toyama-asahimachi',
  '舟橋村': 'toyama-funahashimura',
};

const POLITE_PREFIXES = [
  'はい、承知いたしました',
  '承知いたしました',
  'はい、了解しました',
  '了解しました',
  'かしこまりました',
  'はい、承知しました',
  '富山県の魅力を伝えるブログ',
  '富山、お好きですか？',
  'ライターとして',
  '記事を作成します',
  'ブログ記事を作成します',
  '以下のような',
  '高品質なブログ記事',
  'インスピレーションを受け',
  '読者が富山へ行きたくなるような',
];

const KEYWORD_SPLIT_REGEX = /[\s、。！？!?,．・「」『』\[\]（）()【】\|\/]+/;
const TITLE_STOPWORDS = new Set([
  '',
  '富山',
  '富山県',
  'toyama',
  'Toyama',
  '紹介',
  '観光',
  '旅行',
  'TRAVEL',
  'travel',
  'ショート',
  'ショーツ',
  'shorts',
  'Shorts',
  'ショート動画',
  '動画',
  '紹介動画',
  'digest',
  'ダイジェスト',
  '本編',
  'CM',
  'ＰＲ',
  'PR',
  'PV',
  'pv',
  'Vlog',
  'vlog',
  '富山、お好きですか？'
]);

function shouldRemovePoliteIntro(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '---') return true;
  return POLITE_PREFIXES.some(prefix => trimmed.startsWith(prefix));
}

function sanitizeMarkdownResponse(markdown = '') {
  let text = markdown;

  // Remove polite intros at the beginning
  const lines = text.split('\n').map(line => line.replace(/\s+$/u, ''));
  while (lines.length && shouldRemovePoliteIntro(lines[0])) {
    lines.shift();
  }
  text = lines.join('\n').trim();

  // Global removal of specific phrases
  text = text.replace(/「富山、お好きですか？」/g, '');
  text = text.replace(/富山、お好きですか？/g, '');

  return text;
}

const HTML_ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

function decodeHtmlEntities(value = '') {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/&#(\d+);/g, (_, code) => {
      const num = parseInt(code, 10);
      return Number.isNaN(num) ? '' : String.fromCharCode(num);
    })
    .replace(/&([a-zA-Z]+);/g, (_, name) => HTML_ENTITY_MAP[name] || '');
}

function extractTitleKeywords(title = '', location) {
  const decodedTitle = decodeHtmlEntities(title);

  const cleanedTitle = decodedTitle
    .replace(/#[^\s#]+/g, ' ')
    .replace(/【.*?】/g, ' ')
    .replace(/[「」『』【】\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedTitle) {
    return [];
  }

  const rawKeywords = cleanedTitle
    .split(KEYWORD_SPLIT_REGEX)
    .map(keyword => keyword.trim())
    .filter(Boolean);

  const uniqueKeywords = [];
  const seen = new Set();
  for (const keyword of rawKeywords) {
    const normalizedKeyword = keyword
      .replace(/[’]/g, "'")
      .trim();

    if (!normalizedKeyword) continue;
    if (location && normalizedKeyword === location) continue;

    const lowerKeyword = normalizedKeyword.toLowerCase();
    if (TITLE_STOPWORDS.has(normalizedKeyword) || TITLE_STOPWORDS.has(lowerKeyword)) continue;
    if (/^[0-9０-９]+$/.test(normalizedKeyword)) continue;
    if (normalizedKeyword.length <= 1) continue;
    if (seen.has(lowerKeyword)) continue;

    uniqueKeywords.push(normalizedKeyword);
    seen.add(lowerKeyword);
  }

  return uniqueKeywords.slice(0, 6);
}

function fallbackSlugKeywords(video) {
  const title = (video.title || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ');
  const words = title
    .split(/\s+/)
    .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const unique = [...new Set(words)];
  const selected = unique.filter(word => word.length > 2).slice(0, 4);
  const fallback = ['local', 'travel', 'guide', 'highlights'];
  while (selected.length < 4) {
    selected.push(fallback[selected.length % fallback.length]);
  }
  return selected.slice(0, 4).join('-');
}

async function generateSlugKeywords(video, location) {
  const prompt = `Generate 3 to 4 concise lowercase English keywords for a blog post slug.
Context:
- Location: ${location}
- Video title: ${video.title}
- Description: ${video.description || 'N/A'}

Rules:
- Use only lowercase English letters and hyphens.
- Do not include numbers.
- Do not include the location prefix (already handled).
- Output only the hyphen-delimited keywords, e.g. travel-festival-lanterns.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().toLowerCase().split(/\s+/)[0];
    text = text.replace(/[^a-z-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
    const words = text.split('-').filter(Boolean);
    if (words.length >= 3 && words.length <= 5 && words.every(word => /^[a-z]+$/.test(word))) {
      return words.slice(0, 4).join('-');
    }
  } catch (error) {
    console.error('⚠️  スラッグキーワード生成に失敗しました（フォールバックを使用）:', error.message || error);
  }

  return fallbackSlugKeywords(video);
}

async function slugExists(slug) {
  const count = await sanityClient.fetch('count(*[_type == "post" && slug.current == $slug])', { slug });
  return count > 0;
}

async function generateSlug(video, location) {
  const prefix = LOCATION_SLUG_PREFIX[location] || 'toyama-general';
  const keywords = await generateSlugKeywords(video, location);
  let baseSlug = `${prefix}-${keywords}`;
  baseSlug = baseSlug.replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
  if (!baseSlug) {
    baseSlug = `${prefix}-local-travel-guide`;
  }

  const suffixes = ['journey', 'story', 'insight', 'chronicle', 'legends', 'vibes', 'memoir'];
  let uniqueSlug = baseSlug;
  let index = 0;
  while (await slugExists(uniqueSlug)) {
    const suffix = index < suffixes.length ? suffixes[index] : `variant${index - suffixes.length + 1}`;
    uniqueSlug = `${baseSlug}-${suffix}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
    index++;
  }
  return uniqueSlug;
}

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
  if (!YOUTUBE_API_KEY) {
    console.error('❌ YouTube APIキーが設定されていません');
    return [];
  }

  try {
    // 1. チャンネルの uploads プレイリストIDを取得
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      console.error('❌ YouTube Channels API Error:', channelData.error.message);
      return [];
    }

    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.error('❌ uploads プレイリストIDを取得できませんでした');
      return [];
    }

    // 2. uploads プレイリストから動画一覧をページング取得
    const videos = [];
    let nextPageToken = undefined;
    const maxItems = 1000; // バックログ解消のため十分に多く取得

    do {
      const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      playlistUrl.searchParams.set('part', 'snippet,contentDetails');
      playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
      playlistUrl.searchParams.set('maxResults', '50');
      playlistUrl.searchParams.set('key', YOUTUBE_API_KEY);
      if (nextPageToken) {
        playlistUrl.searchParams.set('pageToken', nextPageToken);
      }

      const playlistRes = await fetch(playlistUrl);
      const playlistData = await playlistRes.json();

      if (playlistData.error) {
        console.error('❌ YouTube PlaylistItems API Error:', playlistData.error.message);
        break;
      }

      const items = playlistData.items || [];
      for (const item of items) {
        const snippet = item.snippet;
        const details = item.contentDetails;
        if (!snippet || !details) continue;

        videos.push({
          videoId: details.videoId,
          title: snippet.title,
          description: snippet.description,
          publishedAt: details.videoPublishedAt || snippet.publishedAt,
          thumbnails: snippet.thumbnails,
          url: `https://youtu.be/${details.videoId}`
        });
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken && videos.length < maxItems);

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
 * 記事本文にアフィリエイト・関連リンクを挿入
 * (記事の最後に「富山観光ナビ」セクションとして追加)
 */
function injectAffiliateLinks(markdown, location) {
  let links = [];

  // 1. 宿泊系
  if (/ホテル|旅館|宿泊|泊まり|宿|温泉/.test(markdown)) {
    const link = `https://search.travel.rakuten.co.jp/ds/hotel/search?f_id=1&f_query=${encodeURIComponent('富山県 ' + location)}`;
    links.push(`- 🏨 **${location}周辺の宿を探す**: [楽天トラベルでプランを見る](${link})`);
  }

  // 2. レンタカー・移動
  if (/レンタカー|ドライブ|車で|アクセス|移動/.test(markdown)) {
    const link = 'https://cars.travel.rakuten.co.jp/';
    links.push(`- 🚗 **富山観光にはレンタカーが便利**: [楽天トラベルでお得なレンタカーを探す](${link})`);
  }

  // 3. 高速バス
  if (/バス|高速バス|ツアー|交通/.test(markdown)) {
    const link = 'https://travel.rakuten.co.jp/bus/';
    links.push(`- 🚌 **高速バスで富山へ**: [楽天トラベルでバスを検索](${link})`);
  }

  // 4. お土産・グルメ
  if (/お土産|名産|特産|グルメ|美味しい|食事|ランチ|ディナー/.test(markdown)) {
    const link = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent('富山県 ' + location + ' グルメ')}/`;
    links.push(`- 🎁 **${location}の美味しいものをお取り寄せ**: [楽天市場で富山グルメを見る](${link})`);
  }

  // 5. 遊び・体験
  if (/体験|遊び|アクティビティ|観光|スポット/.test(markdown)) {
    const link = `https://experiences.travel.rakuten.co.jp/`;
    links.push(`- 🎡 **富山で遊ぶなら**: [楽天トラベル観光体験でアクティビティを探す](${link})`);
  }

  if (links.length === 0) {
    return markdown;
  }

  // 記事の最後にセクションを追加
  const affiliateSection = `

## 📍 富山観光ナビ（${location}周辺）
記事で紹介したスポット周辺の観光情報です。

${links.join('\n')}
`;

  return markdown + affiliateSection;
}

/**
 * Gemini APIで高品質な記事本文を生成
 */
async function generateArticleWithGemini(video, location, titleKeywords = []) {
  const keywordSection = titleKeywords.length
    ? titleKeywords.map(keyword => `- ${keyword}`).join('\n')
    : '- （タイトルから特定の固有キーワードは抽出できませんでした）';

  const prompt = `あなたは富山県の魅力を伝えるブログ「富山、お好きですか？」のライターです。以下のYouTube動画から、読者が実際に現地に行きたくなるような高品質なブログ記事を作成してください。

【動画情報】
タイトル: ${video.title}
説明: ${video.description || '（説明なし）'}
地域: ${location}

【動画の核となるキーワード】
${keywordSection}

【記事作成ルール】
1. **文字数**: 制限なし。内容を深く掘り下げ、可能な限り網羅的に記述してください（スカスカな内容はNG）。
2. **構成**:
   - **導入**: 読者の興味を惹く書き出し。
   - **H2見出し**: 動画の要点を3つ以上展開。
   - **H3見出し**: 「構成上、どうしても必要な場合のみ」使用してください。無理に細分化して内容が薄くならないように注意してください。
   - **まとめ**: 読者に行動（訪問など）を促す結び。
3. **必須要素**:
   - **Googleマップ情報**: 記事の中で紹介したスポットについて、必ず「[[MAP: スポット名/住所]]」という形式で記述してください（後できちんと埋め込みマップに変換します）。例: [[MAP: 富山県美術館]]
   - **関連リンク**: 公式HP、公式SNS（Instagram/X）、食べログ、じゃらん等の参考情報があれば、「🌐 **関連リンク**: [名称](URL)」の形式でセクションの終わりや記事末尾に記載してください。
4. **文体**:
   - 「〜です/〜ます」調で、親しみやすく、かつ信頼感のあるトーン。
   - 箇条書きを積極的に活用し、読みやすさを確保。
   - 具体的な数字や固有名称を大切に。
5. **アフィリエイト・紹介意識**:
   - 記事本文では「体験」や「魅力」の描写に集中してください。
   - 「宿の予約」や「レンタカー」などの実用情報は、記事の最後に自動挿入されるため、本文中で過度に宣伝する必要はありません。
   - ただし、「近くには〇〇という温泉宿もあり〜」といった文脈上自然な言及はOKです。
6. **禁止事項**:
   - 「富山、お好きですか？のライターとして〜」や「以下に記事を作成します」「〜をご紹介します」といった**前置きやメタな発言は一切禁止**です。
   - いきなり記事の本文（導入部）から書き始めてください。
   - **記事の最後は必ず「## まとめ」セクションで締めくくってください。** その後に「アクセス情報」などを自己判断で追加しないでください（自動挿入されるため）。

【記事タイトル】
${video.title.includes('【') ? video.title : `【${location}】${video.title}`}

【記事本文】（Markdown形式で出力）`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = sanitizeMarkdownResponse(text);

    // ASPリンク等の自動挿入
    text = injectAffiliateLinks(text, location);

    return text;
  } catch (error) {
    console.error('❌ Gemini API記事生成エラー:', error);
    throw error;
  }
}

function ensureKeywordCoverage(markdown, titleKeywords = []) {
  if (!Array.isArray(titleKeywords) || titleKeywords.length === 0) {
    return {
      markdown,
      missing: []
    };
  }

  const missing = titleKeywords.filter(
    keyword => keyword && !markdown.includes(keyword)
  );

  if (missing.length === 0) {
    return {
      markdown,
      missing: []
    };
  }

  const emphasisSentence = `動画の主役は${missing
    .map(keyword => `「${keyword}」`)
    .join('、')}で、現地ならではの魅力がぎゅっと詰まっています。`;

  const lines = markdown.split('\n');
  const insertIndex = lines.findIndex(
    line => line.trim() && !line.trim().startsWith('#')
  );

  if (insertIndex === -1) {
    lines.push(emphasisSentence);
  } else {
    lines.splice(insertIndex + 1, 0, emphasisSentence);
  }

  const updatedMarkdown = lines.join('\n');
  const stillMissing = titleKeywords.filter(
    keyword => keyword && !updatedMarkdown.includes(keyword)
  );

  return {
    markdown: updatedMarkdown,
    missing: stillMissing
  };
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

    // Google Maps Embed (NEW)
    const mapMatch = line.match(/^\[\[MAP:\s*(.+?)\]\]$/);
    if (mapMatch) {
      const spotName = mapMatch[1];
      const query = encodeURIComponent(spotName);
      // iframe src for embedded Google Maps
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      // Replace iframe with a simple text link to avoid "Content Blocked" errors
      const html = `<div style="margin: 20px 0;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 15px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold;">📍 ${spotName} をGoogleマップで見る</a></div>`;

      blocks.push({
        _type: 'html',
        _key: `map-${blocks.length}`,
        html: html
      });
      currentBlock = null;
      continue;
    }

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
    const titleKeywords = extractTitleKeywords(video.title, location);
    if (titleKeywords.length) {
      console.log(`🎯 タイトルキーワード: ${titleKeywords.join(', ')}`);
    } else {
      console.log('🎯 タイトルキーワード: （抽出なし）');
    }

    // Gemini APIで記事本文を生成
    console.log('🤖 Gemini APIで記事を生成中...');
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
        `⚠️  次のキーワードが本文に十分含まれていません: ${missing.join(', ')}`
      );
    }

    const bodyBlocks = markdownToPortableText(ensuredMarkdown);

    // カテゴリ参照を取得
    const categoryRef = await getCategoryReference(location);

    // タイトル整形（#shortsを削除）
    const cleanTitle = video.title
      .replace(/#shorts/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const articleTitle = cleanTitle.includes('【') ? cleanTitle : `【${location}】${cleanTitle}`;

    // Slug生成
    const slug = await generateSlug(video, location);

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
    const firstBodyBlock = bodyBlocks.find(
      block => (block.style || 'normal') === 'normal' && !block.listItem
    );
    const firstParagraph = firstBodyBlock
      ? firstBodyBlock.children.map(child => child.text || '').join('').trim()
      : '';
    const excerpt = firstParagraph
      ? `${firstParagraph.slice(0, 150)}...`
      : `${location}の魅力的なスポットをご紹介します。`;
    const metaDescription = excerpt.slice(0, 160);

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
      youtubeUrl: video.url, // PostCardコンポーネント用（サムネイル表示に必要）
      body: bodyBlocks,
      excerpt: excerpt,
      metaDescription,
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

module.exports = {
  main,
  extractLocation,
  extractTitleKeywords,
  generateSlugForVideo: generateSlug,
  generateArticleWithGemini,
  ensureKeywordCoverage,
  markdownToPortableText,
  sanitizeMarkdownResponse,
  LOCATION_SLUG_PREFIX,
};
