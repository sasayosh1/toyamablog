const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function setThumbnailForKamiichiTemple() {
  try {
    console.log('🎯 kamiichi-town-temple-2記事にサムネイルを設定中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] { _id, title, youtubeUrl }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事:', article.title);
    console.log('🔑 記事ID:', article._id);
    console.log('🎥 現在のYouTube URL:', article.youtubeUrl || 'なし');
    
    // 新しい動画のサムネイル有効性をチェック
    const videoId = '5-XQ7GKqwxo';
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    console.log('🧪 サムネイル有効性チェック中...');
    console.log('📍 チェックURL:', thumbnailUrl);
    
    const checkResponse = await fetch(thumbnailUrl);
    console.log(`📊 チェック結果: ${checkResponse.ok ? '✅ 有効' : '❌ 無効'} (HTTP ${checkResponse.status})`);
    
    if (!checkResponse.ok) {
      console.log('❌ この動画のサムネイルは取得できません');
      return;
    }
    
    console.log(`📏 サムネイルサイズ: ${checkResponse.headers.get('content-length')} bytes`);
    
    // 画像アセットを作成
    console.log('📥 画像アセット作成中...');
    const imageResponse = await fetch(thumbnailUrl);
    const buffer = await imageResponse.arrayBuffer();
    
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-kamiichi-temple-${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log('✅ 画像アセット作成完了:', asset._id);
    
    // 記事を更新（YouTubeURLとサムネイルを同時に設定）
    console.log('🔄 記事を更新中...');
    await client
      .patch(article._id)
      .set({
        youtubeUrl: 'https://youtu.be/5-XQ7GKqwxo',
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          },
          alt: article.title + ' サムネイル'
        },
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('🎉 更新完了！');
    console.log('📄 記事:', article.title);
    console.log('🎥 YouTube URL: https://youtu.be/5-XQ7GKqwxo');
    console.log('🖼️ サムネイル: https://img.youtube.com/vi/5-XQ7GKqwxo/mqdefault.jpg');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

setThumbnailForKamiichiTemple();