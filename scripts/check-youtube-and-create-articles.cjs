const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTubeチャンネルIDを設定（ささよしのチャンネル）
// チャンネルURLから取得: https://www.youtube.com/@sasayoshi1
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCxX3Eq8_KMl3AeYdhb5MklA';

/**
 * YouTube Data APIから最新動画を取得
 */
async function fetchLatestYouTubeVideos() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API Error:', data.error.message);
      return [];
    }

    return data.items?.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      channelTitle: item.snippet.channelTitle,
      url: `https://youtu.be/${item.id.videoId}`
    })) || [];
  } catch (error) {
    console.error('YouTube APIでのエラー:', error);
    return [];
  }
}

/**
 * 既存の記事をチェックして、動画が既に使用されているかを確認
 */
async function checkExistingArticles(videoId) {
  try {
    const existingArticles = await sanityClient.fetch(`
      *[_type == "post" && youtubeUrl match "*${videoId}*"] {
        _id, title, youtubeUrl
      }
    `);
    
    return existingArticles.length > 0;
  } catch (error) {
    console.error('既存記事チェックエラー:', error);
    return false;
  }
}

/**
 * 動画タイトルから記事のカテゴリと地域を推定
 */
function extractLocationAndCategory(title, description) {
  const fullText = `${title} ${description}`.toLowerCase();
  
  // 富山県の市町村マッピング
  const locationMap = {
    '富山市': 'toyama-city',
    '高岡市': 'takaoka-city',
    '射水市': 'imizu-city',
    '氷見市': 'himi-city',
    '砺波市': 'tonami-city',
    '小矢部市': 'oyabe-city',
    '南砺市': 'nanto-city',
    '魚津市': 'uozu-city',
    '黒部市': 'kurobe-city',
    '滑川市': 'namerikawa-city',
    '上市町': 'kamiichi-town',
    '立山町': 'tateyama-town',
    '入善町': 'nyuzen-town',
    '朝日町': 'asahi-town',
    '舟橋村': 'funahashi-village'
  };

  // カテゴリマッピング
  const categoryMap = {
    '寺院|神社|お寺': '神社・寺院',
    'グルメ|食べ物|レストラン|カフェ|ラーメン|寿司|ランチ|中華|パティスリー|ドリア': 'グルメ',
    '公園|桜|花|自然|山|海|川|ペンギン|ヤギ|アザラシ|動物|牧場': '自然・公園',
    '温泉|ホテル|宿泊': '温泉・宿泊',
    'イベント|祭り|花火|イルミネーション|噴水|ファウンテン|鬼滅': 'イベント・祭り',
    '観光|名所|スポット': '観光スポット'
  };

  // 地域を特定
  let detectedLocation = '';
  let locationSlug = '';
  
  for (const [location, slug] of Object.entries(locationMap)) {
    if (fullText.includes(location.toLowerCase())) {
      detectedLocation = location;
      locationSlug = slug;
      break;
    }
  }

  // カテゴリを特定
  let detectedCategory = 'その他';
  
  for (const [keywords, category] of Object.entries(categoryMap)) {
    const keywordList = keywords.split('|');
    if (keywordList.some(keyword => fullText.includes(keyword))) {
      detectedCategory = category;
      break;
    }
  }

  return {
    location: detectedLocation,
    locationSlug: locationSlug,
    category: detectedCategory
  };
}

/**
 * Google Maps用のiframeを生成（場所に基づく）
 */
function generateGoogleMapIframe(location, title) {
  // 実際のプロジェクトではGoogle Places APIを使用して正確な座標を取得
  const searchQuery = encodeURIComponent(`${location} ${title}`);
  
  return `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
    <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 ${location}の場所</h4>
    <iframe src="https://www.google.com/maps/embed/v1/search?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${searchQuery}&zoom=15" 
            width="100%" 
            height="300" 
            style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
    </iframe>
    <p style="margin-top: 10px; font-size: 14px; color: #666;">${location}の魅力的なスポットです</p>
  </div>`;
}

/**
 * CLAUDE.md クラウドルール厳格準拠の記事コンテンツを生成
 * 構成: H1タイトル → 動画 → H2本文記事 → まとめ → マップ → タグ
 */
function generateArticleContent(video, locationData) {
  const { title, description } = video;
  const { location, category } = locationData;

  // CLAUDE.mdクラウドルール厳格準拠の記事構造
  const articleBlocks = [
    // 導入文（2-3行で記事の魅力を簡潔に）
    {
      _type: 'block',
      _key: 'intro',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'intro-span',
        text: `${location}の魅力的なスポットをご紹介します。YouTube動画でその魅力をお楽しみください。`,
        marks: []
      }],
      markDefs: []
    },
    
    // H2見出し1: 地域の魅力
    {
      _type: 'block',
      _key: 'h2-1',
      style: 'h2',
      children: [{
        _type: 'span',
        _key: 'h2-1-span',
        text: `${location}の魅力`,
        marks: []
      }],
      markDefs: []
    },
    
    // 本文1 - 箇条書き積極活用
    {
      _type: 'block',
      _key: 'content-1',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'content-1-span',
        text: `${location}にある特色豊かなスポットです。地域の魅力を存分に感じられる場所として人気を集めています。\n\n**おすすめポイント：**\n✅ 地域の特色を活かした魅力\n✅ アクセス良好\n✅ 訪れやすい環境\n✅ SNS映えスポット`,
        marks: []
      }],
      markDefs: []
    },
    
    // H2見出し2: アクセス情報
    {
      _type: 'block',
      _key: 'h2-2',
      style: 'h2',
      children: [{
        _type: 'span',
        _key: 'h2-2-span',
        text: 'アクセス情報',
        marks: []
      }],
      markDefs: []
    },
    
    // アクセス情報 - 箇条書き形式
    {
      _type: 'block',
      _key: 'access-info',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'access-span',
        text: `📍 **所在地**: ${location}\n🚗 **駐車場**: 確認要\n🕐 **営業時間**: 店舗により異なる\n💰 **料金**: 施設により異なる`,
        marks: []
      }],
      markDefs: []
    },
    
    // H2まとめセクション（CLAUDE.md厳格ルール）
    {
      _type: 'block',
      _key: 'h2-summary',
      style: 'h2',
      children: [{
        _type: 'span',
        _key: 'h2-summary-span',
        text: 'まとめ',
        marks: []
      }],
      markDefs: []
    },
    
    // まとめ内容 - 読者への行動促進
    {
      _type: 'block',
      _key: 'summary',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'summary-span',
        text: `${location}の魅力的なスポットをご紹介しました。動画でその魅力を感じていただき、ぜひ実際に足を運んでみてください。富山県の素晴らしい地域の魅力を体験していただけることでしょう。`,
        marks: []
      }],
      markDefs: []
    }
  ];

  return articleBlocks;
}

/**
 * Sanityに新しい記事を作成
 */
async function createSanityArticle(video, locationData) {
  const { location, locationSlug, category } = locationData;
  const timestamp = new Date().toISOString().slice(0, 10);
  
  const slug = `${locationSlug}-${Date.now()}`;
  // タイトルに既に地域名が含まれている場合は重複を避ける
  const articleTitle = video.title.includes(`【${location}】`) 
    ? video.title 
    : `【${location}】${video.title}`;
  
  const articleContent = generateArticleContent(video, locationData);
  
  // タグ生成
  const tags = [
    '富山',
    '富山県',
    'TOYAMA',
    '#shorts',
    'YouTube Shorts',
    location,
    category,
    '動画',
    'おすすめ'
  ].filter(Boolean);

  // 動画URLを正しい埋め込み形式に変換
  const videoId = video.url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // 記事オブジェクト
  const article = {
    _type: 'post',
    title: articleTitle,
    slug: {
      _type: 'slug',
      current: slug
    },
    youtubeUrl: video.url,
    videoUrl: embedUrl, // 正しい埋め込み形式
    body: articleContent,
    excerpt: `${location}の魅力的なスポットをYouTube動画でご紹介。地域の特色を活かした魅力をお楽しみください。`,
    tags: tags,
    category: location, // CLAUDE.mdルール: 地域名をカテゴリに使用
    publishedAt: new Date().toISOString(),
    author: {
      _type: 'reference',
      _ref: '95vBmVlXBxlHRIj7vD7uCv' // 既存のささよしAuthor ID
    }
  };

  try {
    const result = await sanityClient.create(article);
    console.log('✅ 新しい記事を作成しました:', result.title);
    return result;
  } catch (error) {
    console.error('記事作成エラー:', error);
    return null;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🔍 YouTubeチャンネルの最新動画をチェック中...');
  
  // 1週間前の日付を取得
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // YouTubeから最新動画を取得
  const latestVideos = await fetchLatestYouTubeVideos();
  
  if (latestVideos.length === 0) {
    console.log('新しい動画が見つかりませんでした。');
    return;
  }

  console.log(`📺 ${latestVideos.length}件の動画を確認中...`);
  
  let newArticlesCount = 0;
  
  for (const video of latestVideos) {
    const videoDate = new Date(video.publishedAt);
    
    // 1週間以内の動画のみ処理
    if (videoDate < oneWeekAgo) {
      continue;
    }
    
    console.log(`🔍 動画チェック中: ${video.title}`);
    
    // 既存記事があるかチェック
    const exists = await checkExistingArticles(video.videoId);
    if (exists) {
      console.log(`⏭️ 既に記事が存在します: ${video.title}`);
      continue;
    }
    
    // 地域とカテゴリを抽出
    const locationData = extractLocationAndCategory(video.title, video.description);
    
    if (!locationData.location) {
      console.log(`⏭️ 富山県の地域が特定できませんでした: ${video.title}`);
      continue;
    }
    
    console.log(`📍 検出した地域: ${locationData.location} (カテゴリ: ${locationData.category})`);
    
    // 記事を作成
    const newArticle = await createSanityArticle(video, locationData);
    
    if (newArticle) {
      newArticlesCount++;
      console.log(`✅ 記事作成完了: ${newArticle.title}`);
      
      // APIレート制限を考慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n🎉 処理完了: ${newArticlesCount}件の新しい記事を作成しました`);
  
  if (newArticlesCount > 0) {
    console.log('📝 作成された記事はhttps://sasakiyoshimasa.comで確認できます');
  }
}

// スクリプトが直接実行された場合にmain関数を実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchLatestYouTubeVideos,
  checkExistingArticles,
  extractLocationAndCategory,
  createSanityArticle,
  main
};