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

async function findValidVideos() {
  try {
    console.log('🔍 有効な動画URLを持つ記事を探索中...');
    
    // 動画URLがあってサムネイルがない記事を取得（最新50件）
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...50] {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    console.log(`📊 チェック対象: ${articles.length}記事`);
    
    const validArticles = [];
    let checkedCount = 0;
    
    for (const article of articles) {
      checkedCount++;
      console.log(`\n📝 チェック中 (${checkedCount}/${articles.length}): ${article.title.substring(0, 50)}...`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (!videoId) {
        console.log(`⚠️ 無効なURL形式`);
        continue;
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        const response = await fetch(thumbnailUrl);
        if (response.ok) {
          console.log(`✅ 有効な動画発見！`);
          validArticles.push({
            ...article,
            videoId,
            thumbnailUrl
          });
          
          // 10個見つかったら一旦停止
          if (validArticles.length >= 10) {
            console.log(`\n🎯 有効な動画を${validArticles.length}個発見したので処理を開始します`);
            break;
          }
        } else {
          console.log(`❌ 無効 (HTTP ${response.status})`);
        }
      } catch (error) {
        console.log(`❌ エラー: ${error.message}`);
      }
      
      // API制限を避けるため少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 結果:`);
    console.log(`チェックした記事数: ${checkedCount}`);
    console.log(`有効な動画を持つ記事数: ${validArticles.length}`);
    
    if (validArticles.length > 0) {
      console.log(`\n🎬 有効な動画リスト:`);
      validArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 50)}...`);
        console.log(`   動画ID: ${article.videoId}`);
        console.log('');
      });
      
      // 有効な動画が見つかった場合、サムネイル反映処理を実行
      await applyThumbnails(validArticles);
    } else {
      console.log(`\n❌ 残念ながら有効な動画URLを持つ記事が見つかりませんでした`);
      console.log(`すべての動画が削除またはプライベート設定になっている可能性があります`);
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
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

async function applyThumbnails(validArticles) {
  console.log(`\n🖼️ ${validArticles.length}記事にサムネイルを反映中...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const article of validArticles) {
    try {
      console.log(`\n📝 処理中: ${article.title.substring(0, 50)}...`);
      
      // 画像アセットを作成
      const imageAsset = await createImageAssetFromUrl(article.thumbnailUrl, article.title);
      
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
      console.error(`❌ エラー (${article.title.substring(0, 30)}...):`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 サムネイル反映結果:`);
  console.log(`成功: ${successCount}記事`);
  console.log(`エラー: ${errorCount}記事`);
  
  if (successCount > 0) {
    console.log(`\n🎉 ${successCount}記事のサムネイル反映が完了しました！`);
    console.log('ブラウザでCtrl+F5を実行して確認してください');
  }
}

findValidVideos();