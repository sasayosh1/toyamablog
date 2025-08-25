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
    console.error(`画像アセット作成エラー:`, error.message);
    return null;
  }
}

async function applyValidThumbnails() {
  try {
    console.log('🔍 有効な動画URLを持つ記事を探してサムネイルを反映中...');
    
    // 動画URLがあってサムネイルがない記事を取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    console.log(`📊 対象記事総数: ${articles.length}`);
    
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let maxProcessCount = 5; // 最初は5件まで処理
    
    for (const article of articles) {
      if (processedCount >= maxProcessCount) {
        console.log(`\n⏸️ 今回の処理は${maxProcessCount}件で一旦停止します`);
        break;
      }
      
      try {
        processedCount++;
        console.log(`\n📝 処理中 (${processedCount}/${Math.min(maxProcessCount, articles.length)}): ${article.title.substring(0, 50)}...`);
        console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
        
        const videoId = extractVideoId(article.youtubeUrl);
        if (!videoId) {
          console.log(`⚠️ 無効なYouTube URL`);
          errorCount++;
          continue;
        }
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        // サムネイルが存在するかチェック
        const checkResponse = await fetch(thumbnailUrl);
        if (!checkResponse.ok) {
          console.log(`❌ サムネイル取得不可 (HTTP ${checkResponse.status})`);
          errorCount++;
          continue;
        }
        
        // 画像アセットを作成
        const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
        
        if (!imageAsset) {
          console.log(`❌ 画像アセット作成失敗`);
          errorCount++;
          continue;
        }
        
        // 記事にサムネイルを反映
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
        console.log(`✅ サムネイル反映完了`);
        
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
    console.log(`残り記事数: ${Math.max(0, articles.length - processedCount)}`);
    console.log('\n✅ サムネイル反映処理が完了しました！');
    
    if (successCount > 0) {
      console.log('\n🎯 反映されたサムネイルを確認するには:');
      console.log('1. ブラウザでCtrl+F5（強制リロード）');
      console.log('2. 5-10分後にサイトを再確認');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

applyValidThumbnails();