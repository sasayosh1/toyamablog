const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addYosakoiVideo() {
  try {
    const articleId = '4zxT7RlbAnSlGPWZgbkwGk';
    const videoUrl = 'https://youtu.be/8xqKdkD6sxE'; // YOSAKOI演舞の動画
    
    console.log('🎥 安田城YOSAKOI記事に動画を追加中...');
    console.log('動画URL:', videoUrl);
    
    // 記事を取得して確認
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { _id, title, youtubeUrl }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事:', article.title);
    
    if (article.youtubeUrl) {
      console.log('✅ この記事には既に動画が設定されています:', article.youtubeUrl);
      return;
    }
    
    // YouTube URLを追加
    await client
      .patch(articleId)
      .set({
        youtubeUrl: videoUrl,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ YouTube URLを記事に追加しました');
    
    // 更新後の確認
    const updatedArticle = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { title, youtubeUrl }`);
    console.log('\n📊 更新確認:');
    console.log('記事:', updatedArticle.title);
    console.log('YouTube URL:', updatedArticle.youtubeUrl);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addYosakoiVideo();