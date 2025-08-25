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

async function analyzeSuccessfulThumbnails() {
  try {
    console.log('🔍 既存のサムネイル付き記事を分析中...');
    
    // サムネイルとYouTube URLの両方がある記事を取得
    const articlesWithThumbnails = await client.fetch(`*[_type == "post" && defined(thumbnail) && defined(youtubeUrl)] | order(_createdAt desc)[0...10] {
      _id,
      title,
      youtubeUrl,
      "thumbnailUrl": thumbnail.asset->url,
      "thumbnailId": thumbnail.asset->_id,
      _createdAt,
      _updatedAt
    }`);
    
    console.log(`📊 成功事例: ${articlesWithThumbnails.length}記事`);
    
    if (articlesWithThumbnails.length > 0) {
      console.log('\n✅ 成功している記事の分析:');
      
      for (const article of articlesWithThumbnails.slice(0, 5)) {
        console.log(`\n📝 ${article.title.substring(0, 50)}...`);
        console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
        console.log(`🖼️ サムネイルURL: ${article.thumbnailUrl}`);
        console.log(`📅 作成日: ${new Date(article._createdAt).toLocaleDateString()}`);
        console.log(`📅 更新日: ${new Date(article._updatedAt).toLocaleDateString()}`);
        
        // 動画IDを抽出してサムネイル形式を確認
        const videoId = extractVideoId(article.youtubeUrl);
        if (videoId) {
          console.log(`🆔 ビデオID: ${videoId}`);
          
          // 動画の種類を判定
          const isShorts = article.youtubeUrl.includes('/shorts/');
          console.log(`📱 動画タイプ: ${isShorts ? 'YouTube Shorts' : '通常動画'}`);
          
          // 使用されているサムネイルURLから逆算
          if (article.thumbnailUrl) {
            const isYoutubeThumbnail = article.thumbnailUrl.includes('youtube') || article.thumbnailUrl.includes('ytimg');
            console.log(`📸 サムネイル形式: ${isYoutubeThumbnail ? 'YouTube由来' : 'Sanity CDN'}`);
          }
          
          // 現在でもアクセス可能かテスト
          try {
            const testUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            const response = await fetch(testUrl);
            console.log(`🧪 現在のアクセス可能性: ${response.ok ? '✅ 可能' : '❌ 不可'} (HTTP ${response.status})`);
            
            if (response.ok) {
              console.log(`  📏 サイズ: ${response.headers.get('content-length')} bytes`);
            }
          } catch (error) {
            console.log(`🧪 現在のアクセス可能性: ❌ エラー`);
          }
        }
        
        console.log('─'.repeat(60));
      }
      
      // 統計分析
      console.log('\n📈 統計分析:');
      const shortsCount = articlesWithThumbnails.filter(a => a.youtubeUrl.includes('/shorts/')).length;
      const regularCount = articlesWithThumbnails.length - shortsCount;
      console.log(`YouTube Shorts: ${shortsCount}記事`);
      console.log(`通常動画: ${regularCount}記事`);
      
    } else {
      console.log('❌ サムネイル付きのYouTube動画記事が見つかりませんでした');
    }
    
    // サムネイルなし記事との比較
    console.log('\n❌ サムネイルなし記事との比較（最新3件）:');
    const articlesWithoutThumbnails = await client.fetch(`*[_type == "post" && !defined(thumbnail) && defined(youtubeUrl)] | order(_createdAt desc)[0...3] {
      _id,
      title,
      youtubeUrl,
      _createdAt
    }`);
    
    for (const article of articlesWithoutThumbnails) {
      console.log(`\n📝 ${article.title.substring(0, 50)}...`);
      console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
      console.log(`📅 作成日: ${new Date(article._createdAt).toLocaleDateString()}`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (videoId) {
        console.log(`🆔 ビデオID: ${videoId}`);
        const isShorts = article.youtubeUrl.includes('/shorts/');
        console.log(`📱 動画タイプ: ${isShorts ? 'YouTube Shorts' : '通常動画'}`);
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

analyzeSuccessfulThumbnails();