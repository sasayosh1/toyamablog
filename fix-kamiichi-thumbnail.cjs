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
    
    // 外部URLから画像アセットを作成
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // 画像アセットを作成
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `kamiichi-temple-thumbnail-${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log(`✅ 新しい画像アセット作成成功: ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`画像アセット作成エラー (${title}):`, error.message);
    return null;
  }
}

async function fixKamiichiThumbnail() {
  try {
    console.log('🔧 kamiichi-town-temple-2記事のサムネイルを完全に再作成中...');
    
    // 記事情報を取得
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] {
      _id,
      title,
      youtubeUrl
    }`);
    
    if (!article) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('📝 記事:', article.title.substring(0, 60) + '...');
    console.log('🎬 YouTube URL:', article.youtubeUrl);
    
    // YouTube URLからビデオIDを抽出
    const videoId = extractVideoId(article.youtubeUrl);
    if (!videoId) {
      console.log('⚠️ 無効なYouTube URL');
      return;
    }
    
    console.log('🆔 ビデオID:', videoId);
    
    // YouTubeサムネイルURL
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // 新しい画像アセットを作成
    const imageAsset = await createImageAssetFromUrl(thumbnailUrl, article.title);
    
    if (!imageAsset) {
      console.log('❌ 画像アセット作成失敗');
      return;
    }
    
    // 既存のサムネイルを削除して新しいものを設定
    console.log('🔄 記事のサムネイルを更新中...');
    
    await client
      .patch(article._id)
      .unset(['thumbnail']) // 既存のサムネイルを削除
      .commit();
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 新しいサムネイルを設定
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
    
    console.log('✅ 新しいサムネイル設定完了');
    
    // 確認
    const updatedArticle = await client.fetch(`*[_type == "post" && _id == "${article._id}"][0] {
      "thumbnailUrl": thumbnail.asset->url,
      "thumbnailId": thumbnail.asset->_id
    }`);
    
    console.log('\n📊 更新後の確認:');
    console.log('新しいサムネイルURL:', updatedArticle.thumbnailUrl);
    console.log('新しいアセットID:', updatedArticle.thumbnailId);
    
    console.log('\n🎯 完了: 新しいサムネイルが設定されました！');
    console.log('ブラウザでCtrl+F5を実行してください。');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

fixKamiichiThumbnail();