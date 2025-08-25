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
    console.log('📥 画像アセット作成中...');
    
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log(`✅ 画像アセット作成完了: ${asset._id}`);
    return asset;
  } catch (error) {
    throw error;
  }
}

async function processNewerArticles() {
  try {
    console.log('🔍 新しい記事から有効なサムネイルを探索中...');
    
    // 新しい順（_updatedAt）でサムネイルがない記事を取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(_updatedAt desc)[0...15] {
      _id,
      title,
      youtubeUrl,
      slug,
      _createdAt,
      _updatedAt
    }`);
    
    console.log(`📊 新しい順でチェック対象記事数: ${articles.length}`);
    
    if (articles.length === 0) {
      console.log('✅ 処理対象記事がありません');
      return;
    }
    
    let processedCount = 0;
    let successCount = 0;
    let skipCount = 0;
    
    for (const article of articles) {
      processedCount++;
      console.log(`\n📝 チェック中 (${processedCount}/${articles.length}): ${article.title.substring(0, 50)}...`);
      console.log(`📅 作成日: ${new Date(article._createdAt).toLocaleDateString()}`);
      console.log(`📅 更新日: ${new Date(article._updatedAt).toLocaleDateString()}`);
      
      const videoId = extractVideoId(article.youtubeUrl);
      if (!videoId) {
        console.log('⚠️ 無効なURL形式 - スキップ');
        skipCount++;
        continue;
      }
      
      console.log(`🆔 ビデオID: ${videoId}`);
      
      // 動画タイプも表示
      const isShorts = article.youtubeUrl.includes('/shorts/');
      console.log(`📱 動画タイプ: ${isShorts ? 'YouTube Shorts' : '通常動画'}`);
      
      // サムネイル有効性チェック
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      
      try {
        const checkResponse = await fetch(thumbnailUrl);
        
        if (!checkResponse.ok) {
          console.log(`❌ サムネイル無効 (HTTP ${checkResponse.status}) - スキップ`);
          skipCount++;
          continue;
        }
        
        console.log(`✅ サムネイル有効発見！ - 処理開始`);
        console.log(`📏 サイズ: ${checkResponse.headers.get('content-length')} bytes`);
        
        // 画像アセットを作成
        const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
        
        // 記事にサムネイルを反映
        console.log('🔄 サムネイル反映中...');
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
        
        console.log('🎉 反映完了！');
        successCount++;
        
        // 成功したので詳細を表示
        console.log(`📄 処理完了記事: ${article.title}`);
        console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
        
        // API制限回避のため少し待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
        skipCount++;
      }
    }
    
    console.log('\n📊 新しい記事からの処理結果:');
    console.log(`チェックした記事数: ${processedCount}`);
    console.log(`サムネイル反映成功: ${successCount}`);
    console.log(`スキップした記事数: ${skipCount}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 ${successCount}記事のサムネイル反映が完了しました！`);
      console.log('ブラウザでCtrl+F5を実行して確認してください');
      console.log('\n🔄 続けて次のバッチを処理することで、さらに有効な記事を見つけられます');
    } else {
      console.log('\n⚠️ この15件では有効なサムネイルが見つかりませんでした');
      console.log('さらに多くの記事をチェックする必要があります');
    }
    
  } catch (error) {
    console.error('❌ 処理中にエラー:', error.message);
  }
}

processNewerArticles();