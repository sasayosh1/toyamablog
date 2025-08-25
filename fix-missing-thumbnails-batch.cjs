const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTube URLからビデオIDを抽出する関数
function extractVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function createImageAssetFromUrl(thumbnailUrl, title) {
  try {
    console.log(`📥 サムネイル取得中: ${thumbnailUrl}`);
    
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log(`✅ 画像アセット作成成功: ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`画像アセット作成エラー (${title}):`, error.message);
    return null;
  }
}

async function fixMissingThumbnails() {
  try {
    console.log('🔧 サムネイルが欠けている記事を一括修正中...');
    
    // YouTube URLがあってサムネイルがない記事を取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    console.log(`処理対象記事数: ${articles.length}`);
    
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      try {
        processedCount++;
        console.log(`\n📝 処理中 (${processedCount}/${articles.length}): ${article.title.substring(0, 60)}...`);
        console.log(`🔗 スラッグ: ${article.slug.current}`);
        
        const videoId = extractVideoId(article.youtubeUrl);
        if (!videoId) {
          console.log(`⚠️ 無効なYouTube URL: ${article.youtubeUrl}`);
          errorCount++;
          continue;
        }
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        // 画像アセットを作成
        const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
        
        if (!imageAsset) {
          console.log(`❌ 画像アセット作成失敗`);
          errorCount++;
          continue;
        }
        
        // 記事にサムネイルを追加
        await client
          .patch(article._id)
          .set({
            thumbnail: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAsset._id
              },
              alt: article.title + ' サムネイル'
            },
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        successCount++;
        console.log(`✅ 完了`);
        
        // API制限を避けるため待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ エラー:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`処理した記事数: ${processedCount}`);
    console.log(`成功した記事数: ${successCount}`);
    console.log(`エラー記事数: ${errorCount}`);
    console.log('\n✅ 一括サムネイル修正処理が完了しました！');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

fixMissingThumbnails();