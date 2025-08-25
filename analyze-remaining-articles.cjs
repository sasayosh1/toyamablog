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

async function analyzeRemainingArticles() {
  try {
    console.log('🔍 残りの記事を詳細分析中...');
    
    // サムネイルがない記事をすべて取得して詳細分析
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(_createdAt desc) {
      _id,
      title,
      youtubeUrl,
      slug,
      _createdAt
    }`);
    
    console.log(`📊 サムネイル未設定記事総数: ${articles.length}件`);
    
    // 作成日で分類
    const by2025 = articles.filter(a => new Date(a._createdAt).getFullYear() >= 2025);
    const by2024 = articles.filter(a => new Date(a._createdAt).getFullYear() === 2024);
    const byOlder = articles.filter(a => new Date(a._createdAt).getFullYear() < 2024);
    
    console.log(`📅 2025年以降: ${by2025.length}件`);
    console.log(`📅 2024年: ${by2024.length}件`);  
    console.log(`📅 2023年以前: ${byOlder.length}件`);
    
    // URLタイプで分類
    const shorts = articles.filter(a => a.youtubeUrl.includes('/shorts/'));
    const regular = articles.filter(a => !a.youtubeUrl.includes('/shorts/'));
    
    console.log(`📱 YouTube Shorts: ${shorts.length}件`);
    console.log(`🎥 通常動画: ${regular.length}件`);
    
    console.log('\n🎯 最初の5件の詳細:');
    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const article = articles[i];
      const videoId = extractVideoId(article.youtubeUrl);
      const isShorts = article.youtubeUrl.includes('/shorts/');
      
      console.log(`\n${i + 1}. ${article.title.substring(0, 50)}...`);
      console.log(`   作成日: ${new Date(article._createdAt).toLocaleDateString()}`);
      console.log(`   タイプ: ${isShorts ? 'Shorts' : '通常動画'}`);
      console.log(`   ビデオID: ${videoId}`);
      console.log(`   URL: ${article.youtubeUrl}`);
    }
    
    // 実際に5件のサムネイルをテスト
    console.log('\n🧪 最初の5件のサムネイル有効性テスト:');
    let validFound = 0;
    
    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const article = articles[i];
      const videoId = extractVideoId(article.youtubeUrl);
      
      if (!videoId) continue;
      
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        const checkResponse = await fetch(thumbnailUrl);
        console.log(`${i + 1}. ${checkResponse.ok ? '✅' : '❌'} HTTP ${checkResponse.status} - ${article.title.substring(0, 40)}...`);
        
        if (checkResponse.ok) {
          validFound++;
          console.log(`   📏 サイズ: ${checkResponse.headers.get('content-length')} bytes`);
          console.log(`   🎯 この記事は処理可能です！`);
        }
        
      } catch (error) {
        console.log(`${i + 1}. ❌ エラー - ${article.title.substring(0, 40)}...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 テスト結果: ${validFound}/5 件が有効`);
    
    if (validFound > 0) {
      console.log('✅ 有効な記事が見つかりました！これらを処理できます');
    } else {
      console.log('⚠️ テストした記事はすべて無効でした');
    }
    
  } catch (error) {
    console.error('❌ 処理中にエラー:', error.message);
  }
}

analyzeRemainingArticles();