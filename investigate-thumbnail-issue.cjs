const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function testThumbnailFormats(videoId) {
  console.log(`🔍 ビデオID ${videoId} の各種サムネイル形式をテスト中...`);
  
  const thumbnailFormats = [
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  ];
  
  const results = [];
  
  for (const url of thumbnailFormats) {
    try {
      const response = await fetch(url);
      const status = response.ok ? '✅ 利用可能' : `❌ HTTP ${response.status}`;
      console.log(`${url}: ${status}`);
      results.push({ url, status: response.status, ok: response.ok });
      
      if (response.ok) {
        console.log(`  📏 Content-Length: ${response.headers.get('content-length')} bytes`);
        console.log(`  📝 Content-Type: ${response.headers.get('content-type')}`);
      }
    } catch (error) {
      console.log(`${url}: ❌ エラー - ${error.message}`);
      results.push({ url, error: error.message, ok: false });
    }
  }
  
  return results;
}

async function investigateThumbnailIssue() {
  try {
    console.log('🕵️ YouTubeサムネイル404エラーの原因調査中...');
    
    // サムネイルがない記事を3件取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...3] {
      _id,
      title,
      youtubeUrl
    }`);
    
    console.log(`📊 調査対象記事: ${articles.length}件`);
    
    for (const article of articles) {
      console.log(`\n📝 記事: ${article.title.substring(0, 60)}...`);
      console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (!videoId) {
        console.log(`⚠️ 無効なURL形式`);
        continue;
      }
      
      console.log(`🆔 ビデオID: ${videoId}`);
      
      // 実際のYouTube動画ページにアクセスして確認
      try {
        const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        console.log(`🌐 YouTube動画ページ: ${videoPageResponse.ok ? '✅ アクセス可能' : '❌ アクセス不可'} (HTTP ${videoPageResponse.status})`);
      } catch (error) {
        console.log(`🌐 YouTube動画ページ: ❌ エラー - ${error.message}`);
      }
      
      // 各種サムネイル形式をテスト
      await testThumbnailFormats(videoId);
      
      console.log(`\n${'='.repeat(80)}\n`);
    }
    
    console.log('📋 調査完了');
    console.log('\n💡 推奨対処法:');
    console.log('1. 利用可能なサムネイル形式があれば、それを使用する');
    console.log('2. YouTube Shorts の場合、通常の動画と異なるサムネイル取得方法が必要かもしれません');
    console.log('3. YouTube APIキーを使用した正式な方法への切り替えを検討');
    
  } catch (error) {
    console.error('調査エラー:', error);
  }
}

investigateThumbnailIssue();