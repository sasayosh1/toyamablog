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
    // 外部URLから画像アセットを作成
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // 画像アセットを作成
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    return asset;
  } catch (error) {
    console.error(`画像アセット作成エラー (${title}):`, error.message);
    return null;
  }
}

async function addThumbnailsProper() {
  try {
    console.log('🖼️ 適切な方法で全記事にYouTubeサムネイルを追加中...');
    
    // YouTube URLがある記事を取得（最初の5記事でテスト）
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...5] {
      _id,
      title,
      youtubeUrl
    }`);
    
    console.log('処理対象記事数:', articles.length);
    
    let processedCount = 0;
    let successCount = 0;
    
    for (const article of articles) {
      try {
        processedCount++;
        console.log(`\n📝 処理中 (${processedCount}/${articles.length}): ${article.title}`);
        
        const videoId = extractVideoId(article.youtubeUrl);
        if (!videoId) {
          console.log(`⚠️  無効なYouTube URL: ${article.youtubeUrl}`);
          continue;
        }
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        console.log(`📥 サムネイル取得中: ${thumbnailUrl}`);
        
        // 画像アセットを作成
        const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
        
        if (!imageAsset) {
          console.log(`❌ 画像アセット作成失敗`);
          continue;
        }
        
        console.log(`✅ 画像アセット作成成功: ${imageAsset._id}`);
        
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
            }
          })
          .commit();
        
        successCount++;
        console.log(`✅ サムネイル追加完了: ${article.title}`);
        
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ エラー (${article.title}):`, error.message);
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`処理した記事数: ${processedCount}`);
    console.log(`成功した記事数: ${successCount}`);
    console.log(`\n✅ テスト処理が完了しました！`);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

addThumbnailsProper();