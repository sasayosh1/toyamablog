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

async function processOneArticleCarefully() {
  try {
    console.log('🎯 一記事ずつ慎重にサムネイル反映処理を開始...');
    
    // サムネイルがない記事を1件だけ取得
    const article = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(_createdAt desc)[0] {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    if (!article) {
      console.log('✅ サムネイル反映が必要な記事はありません');
      return;
    }
    
    console.log(`📝 処理対象記事: ${article.title.substring(0, 60)}...`);
    console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
    console.log(`🔑 記事ID: ${article._id}`);
    console.log(`📂 スラッグ: ${article.slug?.current}`);
    
    // ビデオIDを抽出
    const videoId = extractVideoId(article.youtubeUrl);
    
    if (!videoId) {
      console.log('❌ 無効なYouTube URL形式です');
      return;
    }
    
    console.log(`🆔 ビデオID: ${videoId}`);
    
    // 動画タイプの確認
    const isShorts = article.youtubeUrl.includes('/shorts/');
    console.log(`📱 動画タイプ: ${isShorts ? 'YouTube Shorts' : '通常動画'}`);
    
    // サムネイルURLの有効性を事前チェック
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    console.log(`🧪 サムネイル有効性チェック中...`);
    console.log(`📍 チェックURL: ${thumbnailUrl}`);
    
    const checkResponse = await fetch(thumbnailUrl);
    console.log(`📊 チェック結果: HTTP ${checkResponse.status} (${checkResponse.ok ? '有効' : '無効'})`);
    
    if (!checkResponse.ok) {
      console.log('❌ この動画のサムネイルは取得できません（スキップ）');
      console.log('💡 手動でのサムネイル設定が必要です');
      console.log(`📄 記事タイトル（手動設定用）: ${article.title}`);
      return false;
    }
    
    console.log(`✅ サムネイル取得可能 - 反映処理を開始します`);
    console.log(`📏 サイズ: ${checkResponse.headers.get('content-length')} bytes`);
    console.log(`📝 コンテンツタイプ: ${checkResponse.headers.get('content-type')}`);
    
    // 画像アセットを作成
    const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
    
    // 記事にサムネイルを反映
    console.log('🔄 記事にサムネイル反映中...');
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
    
    console.log('🎉 サムネイル反映完了！');
    console.log(`📄 処理完了記事: ${article.title}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ 処理中にエラーが発生:', error.message);
    return false;
  }
}

// 実行
processOneArticleCarefully().then(success => {
  if (success === true) {
    console.log('\n🎯 1記事の処理が正常に完了しました');
    console.log('次の記事の処理は別途実行してください');
  } else if (success === false) {
    console.log('\n⚠️ この記事はスキップされました（サムネイル取得不可）');
    console.log('次の記事の処理を実行してください');
  } else {
    console.log('\n✅ 処理対象記事がありませんでした');
  }
});