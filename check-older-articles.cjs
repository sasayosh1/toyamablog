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

async function checkOlderArticles() {
  try {
    console.log('🔍 古い記事から有効なサムネイルを探索中...');
    
    // 2024年以前の記事から10件チェック
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail) && _createdAt < "2025-01-01"] | order(_createdAt desc)[0...10] {
      _id,
      title,
      youtubeUrl,
      slug,
      _createdAt
    }`);
    
    console.log(`📊 2024年以前の記事から10件チェック: ${articles.length}件`);
    
    if (articles.length === 0) {
      console.log('✅ 2024年以前の未処理記事はありません');
      return;
    }
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const article of articles) {
      console.log(`\n📝 チェック中: ${article.title.substring(0, 60)}...`);
      console.log(`📅 作成日: ${new Date(article._createdAt).toLocaleDateString()}`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (!videoId) {
        console.log('⚠️ 無効なURL形式 - スキップ');
        invalidCount++;
        continue;
      }
      
      console.log(`🆔 ビデオID: ${videoId}`);
      
      // サムネイル有効性チェック
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        const checkResponse = await fetch(thumbnailUrl);
        
        if (checkResponse.ok) {
          console.log(`✅ サムネイル有効！ (${checkResponse.status})`);
          console.log(`📏 サイズ: ${checkResponse.headers.get('content-length')} bytes`);
          validCount++;
          
          // 有効な記事の情報を表示
          console.log(`🎯 処理可能記事: ${article.title}`);
          console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
          console.log(`📂 スラッグ: ${article.slug?.current}`);
        } else {
          console.log(`❌ サムネイル無効 (HTTP ${checkResponse.status})`);
          invalidCount++;
        }
        
      } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
        invalidCount++;
      }
      
      // API制限回避
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 古い記事チェック結果:');
    console.log(`有効なサムネイル: ${validCount}件`);
    console.log(`無効なサムネイル: ${invalidCount}件`);
    
    if (validCount > 0) {
      console.log(`\n✅ ${validCount}件の有効な記事が見つかりました！`);
      console.log('これらの記事を処理できます');
    } else {
      console.log('\n⚠️ 有効な記事が見つかりませんでした');
      console.log('さらに古い記事をチェックする必要があります');
    }
    
  } catch (error) {
    console.error('❌ 処理中にエラー:', error.message);
  }
}

checkOlderArticles();