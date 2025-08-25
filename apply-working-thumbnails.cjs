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
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`,
      contentType: 'image/jpeg'
    });
    
    return asset;
  } catch (error) {
    throw error;
  }
}

async function applyWorkingThumbnails() {
  try {
    console.log('🎯 有効なサムネイルを持つ動画にのみサムネイル反映を実行中...');
    
    // サムネイルがない記事を取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(_createdAt desc) {
      _id,
      title,
      youtubeUrl,
      slug,
      _createdAt
    }`);
    
    console.log(`📊 チェック対象記事数: ${articles.length}`);
    
    let checkedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    const maxCheck = 20; // 最初は20記事まで
    
    for (const article of articles) {
      if (checkedCount >= maxCheck) {
        console.log(`\n⏸️ 今回は${maxCheck}記事まで処理します`);
        break;
      }
      
      checkedCount++;
      console.log(`\n📝 チェック中 (${checkedCount}/${Math.min(maxCheck, articles.length)}): ${article.title.substring(0, 50)}...`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (!videoId) {
        console.log(`⚠️ 無効なURL形式`);
        failedCount++;
        continue;
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        // サムネイルの有効性をチェック
        const checkResponse = await fetch(thumbnailUrl);
        if (!checkResponse.ok) {
          console.log(`❌ サムネイル取得不可 (HTTP ${checkResponse.status}) - スキップ`);
          failedCount++;
          continue;
        }
        
        console.log(`✅ サムネイル取得可能 - 反映処理開始`);
        
        // 画像アセットを作成
        const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
        
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
        console.log(`🎉 サムネイル反映完了！`);
        
        // API制限を避けるため待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ エラー:`, error.message);
        failedCount++;
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`チェックした記事数: ${checkedCount}`);
    console.log(`サムネイル反映成功: ${successCount}記事`);
    console.log(`スキップ/失敗: ${failedCount}記事`);
    console.log(`残り記事数: ${Math.max(0, articles.length - checkedCount)}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 ${successCount}記事のサムネイル反映が完了しました！`);
      console.log('ブラウザでCtrl+F5を実行して確認してください');
      
      if (articles.length > maxCheck) {
        console.log(`\n📝 残り${articles.length - maxCheck}記事については別途処理可能です`);
      }
    } else {
      console.log('\n😔 今回チェックした記事では有効なサムネイルが見つかりませんでした');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

applyWorkingThumbnails();