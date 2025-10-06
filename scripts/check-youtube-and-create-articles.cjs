const path = require('path');
const fs = require('fs');

// .env.localのパスを探す
const envPaths = [
  path.join(__dirname, '..', '.env.local'),
  path.join(process.cwd(), '.env.local'),
  '/Users/user/toyamablog/.env.local'
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const result = require('dotenv').config({ path: envPath });
    if (!result.error) {
      console.log(`✅ 環境変数を読み込みました: ${envPath}`);
      console.log(`✅ SANITY_API_TOKEN: ${process.env.SANITY_API_TOKEN ? '設定済み' : '未設定'}`);
      envLoaded = true;
      break;
    }
  }
}

if (!envLoaded) {
  console.error('エラー: .env.local が見つかりません');
  console.error('確認したパス:', envPaths);
}
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTubeチャンネルIDを設定（富山のくせにのチャンネル）
// チャンネルURLから取得: https://www.youtube.com/@sasayoshi1
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCxX3Eq8_KMl3AeYdhb5MklA';

/**
 * YouTube Data APIから最新動画を取得
 */
async function fetchLatestYouTubeVideos() {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.error('エラー: YOUTUBE_API_KEY環境変数が設定されていません');
    console.log('利用可能な環境変数:', Object.keys(process.env).filter(k => k.includes('YOUTUBE')));
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error.message);
      console.error('詳細:', JSON.stringify(data.error, null, 2));
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

  // 実際の記事構成に準拠したマップタイトル（📍 ○○の場所）
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
    <p style="margin-top: 10px; font-size: 14px; color: #666;">アクセス情報は上記の地図をご確認ください</p>
  </div>`;
}

/**
 * vibecoding テンプレート準拠の記事コンテンツを生成
 * 構成: 導入文(200-300字) → H2本文(2〜3セクション、各300〜500字) → まとめ
 * ※マップ・関連記事・タグはpage.tsxで自動生成
 */
function generateArticleContent(video, locationData) {
  const { title, description } = video;
  const { location, category } = locationData;

  // タイトルから#shortsを削除
  const cleanTitle = title.replace(/\s*#shorts\s*/gi, '').trim();

  // 動画タイトルから見出しのヒントを抽出
  const titleWithoutLocation = cleanTitle.replace(/【.+?】/, '').trim();

  // vibecoding テンプレート: 実用的で分かりやすい構成
  const articleBlocks = [
    // 導入文（200-300字）- 実用的で分かりやすい表現
    {
      _type: 'block',
      _key: 'intro',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'intro-span',
        text: `${location}にある「${titleWithoutLocation}」は、地元の方や観光客に人気のスポットです。週末には多くの人が訪れ、写真撮影や散策を楽しんでいます。\n\nこの記事では、実際に訪れた際の様子や見どころ、アクセス方法などを分かりやすくまとめました。観光やお出かけの際の参考になれば幸いです。`,
        marks: []
      }],
      markDefs: []
    },

    // H2見出し1: スポットの特徴と魅力
    {
      _type: 'block',
      _key: 'h2-section1',
      style: 'h2',
      children: [{
        _type: 'span',
        _key: 'h2-section1-span',
        text: `${titleWithoutLocation}の特徴`,
        marks: []
      }],
      markDefs: []
    },

    // 本文1（300〜400字）
    {
      _type: 'block',
      _key: 'content1',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'content1-span',
        text: `${location}にあるこのスポットは、富山県ならではの魅力が詰まった場所です。地域の特色を活かした独特な雰囲気があり、訪れる人々に特別な体験を提供しています。\n\n昼と夜でまったく違う表情を見せるのも特徴のひとつです。昼間はのんびり散策を楽しみ、夜はライトアップされた幻想的な景色を堪能できます。地元の人々にも愛され続けている、${location}を代表するスポットと言えるでしょう。`,
        marks: []
      }],
      markDefs: []
    },

    // H2見出し2: 楽しみ方とおすすめポイント
    {
      _type: 'block',
      _key: 'h2-section2',
      style: 'h2',
      children: [{
        _type: 'span',
        _key: 'h2-section2-span',
        text: '楽しみ方とおすすめポイント',
        marks: []
      }],
      markDefs: []
    },

    // 本文2（300〜400字）
    {
      _type: 'block',
      _key: 'content2',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'content2-span',
        text: `${location}を訪れたらぜひ体験していただきたい魅力をご紹介します。豊かな自然環境と四季折々の美しい景観は、写真撮影にも最適です。\n\n地元の食材を活かしたグルメや、歴史ある建造物、文化施設なども充実しています。家族連れからカップル、友人同士まで、幅広い層が楽しめる魅力的なスポットです。週末や休日には、ぜひ${location}の魅力を体感してみてください。`,
        marks: []
      }],
      markDefs: []
    },

    // H2まとめ
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

    // まとめ本文（200字程度）
    {
      _type: 'block',
      _key: 'summary',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'summary-span',
        text: `${location}には、自然・グルメ・文化などさまざまな魅力があります。観光の合間に立ち寄るのはもちろん、日帰りドライブにもおすすめです。\n\n気になる方は、ぜひ一度足を運んでみてください。YouTube動画で雰囲気を感じていただき、実際に訪れてみてはいかがでしょうか。`,
        marks: []
      }],
      markDefs: []
    }
  ];

  return articleBlocks;
}

/**
 * 記事内容に基づいたタグを生成
 */
function generateTags(video, locationData) {
  const { title } = video;
  const { location, category } = locationData;

  // 基本タグ（必須）
  const tags = ['富山県', location];

  // タイトルから特徴的なキーワードを抽出
  const cleanTitle = title.replace(/\s*#shorts\s*/gi, '').replace(/【.+?】/, '').trim();

  // カテゴリに基づいた追加タグ
  if (category.includes('グルメ') || cleanTitle.includes('グルメ') || cleanTitle.includes('食')) {
    tags.push('富山グルメ', '地元グルメ', '観光スポット');
  } else if (category.includes('自然') || cleanTitle.includes('自然') || cleanTitle.includes('公園')) {
    tags.push('自然', '観光スポット', '富山観光');
  } else if (category.includes('歴史') || cleanTitle.includes('歴史') || cleanTitle.includes('寺')) {
    tags.push('歴史', '観光スポット', '富山観光');
  } else {
    tags.push('観光スポット', '富山観光');
  }

  // タイトルの主要部分を追加
  const mainPart = cleanTitle.substring(0, 15);
  if (mainPart && !tags.includes(mainPart)) {
    tags.push(mainPart);
  }

  // 富山湾や立山連峰などの地理的特徴
  tags.push('富山の魅力');

  // カテゴリ名も追加
  if (category && !tags.includes(category)) {
    tags.push(category);
  }

  // 10個程度に調整
  return tags.slice(0, 10);
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

  // タグ生成（記事内容に基づいた10個程度）
  const tags = generateTags(video, locationData);

  // 動画URLを正しい埋め込み形式に変換
  const videoId = video.url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // カテゴリ参照の作成（クラウドルール厳格準拠）
  let categoryRef = null;
  try {
    // 地域名カテゴリを取得または作成
    let regionCategory = await sanityClient.fetch(`*[_type == "category" && title == "${location}"][0]`);
    
    if (!regionCategory) {
      console.log(`⚠️  「${location}」カテゴリが存在しません。作成中...`);
      
      regionCategory = await sanityClient.create({
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
    
    categoryRef = {
      _type: 'reference',
      _ref: regionCategory._id
    };
    
  } catch (error) {
    console.error(`❌ カテゴリ作成エラー（${location}）:`, error);
  }

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
    categories: categoryRef ? [categoryRef] : [], // CLAUDE.mdルール: 【】内地域名をカテゴリに使用（参照形式）
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
 * AdSense設定ファイルの検証
 */
async function validateAdSenseFiles() {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  const files = [
    'src/components/AdSense.tsx',
    'src/app/layout.tsx',
    '.env.local'
  ];

  const results = [];

  for (const file of files) {
    try {
      const { stdout } = await execPromise(`test -f ${file} && echo "exists" || echo "missing"`);
      results.push({
        file,
        exists: stdout.trim() === 'exists'
      });
    } catch (error) {
      results.push({
        file,
        exists: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * AdSense自動修繕機能
 */
async function autoRepairAdSense(healthCheckResult) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  console.log('\n🔧 AdSense自動修繕を開始...');

  const repairs = [];

  try {
    // 1. キャッシュクリア（Next.jsビルドキャッシュ）
    if (!healthCheckResult.checks.adSenseScriptLoaded) {
      console.log('  🔄 Next.jsキャッシュをクリア中...');
      try {
        await execPromise('rm -rf .next');
        repairs.push({ action: 'cache_clear', status: 'success', message: '.nextキャッシュを削除しました' });
        console.log('  ✅ キャッシュクリア完了');
      } catch (error) {
        repairs.push({ action: 'cache_clear', status: 'failed', error: error.message });
        console.log('  ❌ キャッシュクリアに失敗:', error.message);
      }
    }

    // 2. 環境変数の確認と診断
    if (!healthCheckResult.checks.publisherIdFound) {
      console.log('  🔍 環境変数を確認中...');
      const envCheck = await validateAdSenseFiles();

      const missingFiles = envCheck.filter(f => !f.exists);
      if (missingFiles.length > 0) {
        console.log('  ⚠️ 以下のファイルが見つかりません:');
        missingFiles.forEach(f => console.log(`    - ${f.file}`));
        repairs.push({
          action: 'file_check',
          status: 'warning',
          message: `${missingFiles.length}個のファイルが見つかりません`,
          missingFiles: missingFiles.map(f => f.file)
        });
      } else {
        console.log('  ✅ 必要なファイルは全て存在します');
        console.log('  💡 提案: .env.localのNEXT_PUBLIC_ADSENSE_PUBLISHER_IDを確認してください');
        repairs.push({
          action: 'file_check',
          status: 'success',
          suggestion: '.env.localの環境変数を確認してください'
        });
      }
    }

    // 3. 再ビルドの提案（自動実行はしない - 安全性のため）
    if (repairs.some(r => r.action === 'cache_clear' && r.status === 'success')) {
      console.log('\n  💡 推奨アクション:');
      console.log('    1. npm run build を実行してサイトを再ビルド');
      console.log('    2. デプロイ環境で環境変数を確認');
      console.log('    3. 数分後に再度ヘルスチェックを実行');

      repairs.push({
        action: 'rebuild_suggestion',
        status: 'info',
        message: '手動での再ビルドを推奨します'
      });
    }

    // 4. 修繕結果のサマリー
    console.log('\n📋 自動修繕サマリー:');
    repairs.forEach(repair => {
      const icon = repair.status === 'success' ? '✅' : repair.status === 'failed' ? '❌' : '💡';
      console.log(`  ${icon} ${repair.action}: ${repair.message || repair.suggestion || '完了'}`);
    });

    return {
      status: repairs.some(r => r.status === 'success') ? 'repaired' : 'diagnosed',
      repairs,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('\n❌ 自動修繕エラー:', error.message);
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Google AdSenseヘルスチェック
 */
async function checkAdSenseHealth() {
  const SITE_URL = 'https://sasakiyoshimasa.com';
  const ADSENSE_PUBLISHER_ID = 'ca-pub-9743843249239449';

  try {
    console.log('\n🔍 Google AdSenseヘルスチェック開始...');

    const response = await fetch(SITE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdSenseHealthCheck/1.0)'
      }
    });

    if (!response.ok) {
      console.log(`⚠️ サイトへのアクセスに失敗: ${response.status}`);
      return {
        status: 'error',
        message: `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      };
    }

    const html = await response.text();

    // AdSenseスクリプトの存在確認
    const hasAdSenseScript = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
    const hasPublisherId = html.includes(ADSENSE_PUBLISHER_ID);
    const hasAdSenseAccount = html.includes('google-adsense-account');

    const result = {
      status: hasAdSenseScript && hasPublisherId ? 'success' : 'warning',
      checks: {
        siteAccessible: true,
        adSenseScriptLoaded: hasAdSenseScript,
        publisherIdFound: hasPublisherId,
        metaTagFound: hasAdSenseAccount
      },
      publisherId: ADSENSE_PUBLISHER_ID,
      timestamp: new Date().toISOString()
    };

    // 結果表示
    console.log('\n📊 AdSenseヘルスチェック結果:');
    console.log(`  ✅ サイトアクセス: OK`);
    console.log(`  ${hasAdSenseScript ? '✅' : '❌'} AdSenseスクリプト読み込み: ${hasAdSenseScript ? 'OK' : 'NG'}`);
    console.log(`  ${hasPublisherId ? '✅' : '❌'} Publisher ID (${ADSENSE_PUBLISHER_ID}): ${hasPublisherId ? 'OK' : 'NG'}`);
    console.log(`  ${hasAdSenseAccount ? '✅' : '❌'} google-adsense-accountメタタグ: ${hasAdSenseAccount ? 'OK' : 'NG'}`);

    if (result.status === 'success') {
      console.log('\n✅ Google AdSenseは正常に動作しています');
    } else {
      console.log('\n⚠️ Google AdSenseの設定に問題がある可能性があります');

      // 自動修繕を実行
      const repairResult = await autoRepairAdSense(result);
      result.repair = repairResult;
    }

    return result;

  } catch (error) {
    console.error('\n❌ AdSenseヘルスチェックエラー:', error.message);
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🔍 YouTubeチャンネルの最新動画をチェック中...');

  // 1ヶ月前の日付を取得（過去の動画も記事化するため）
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 30);

  // YouTubeから最新動画を取得
  const latestVideos = await fetchLatestYouTubeVideos();

  if (latestVideos.length === 0) {
    console.log('新しい動画が見つかりませんでした。');
    return;
  }

  console.log(`📺 ${latestVideos.length}件の動画を確認中...`);
  console.log('\n取得した動画一覧:');
  latestVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
  });
  console.log('');

  let newArticlesCount = 0;

  for (const video of latestVideos) {
    const videoDate = new Date(video.publishedAt);

    // 1週間以内の動画のみ処理
    if (videoDate < oneWeekAgo) {
      console.log(`⏭️ 1週間より古い動画をスキップ: ${video.title} (${videoDate.toLocaleDateString()})`);
      continue;
    }

    console.log(`🔍 動画チェック中: ${video.title} (${videoDate.toLocaleDateString()})`);

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

  // Google AdSenseヘルスチェックを実行
  await checkAdSenseHealth();
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
  validateAdSenseFiles,
  autoRepairAdSense,
  checkAdSenseHealth,
  main
};