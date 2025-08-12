const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addVideoToTateyamaShrine() {
  try {
    console.log('🔍 立山町の神社記事を検索中...');
    
    // slug が tateyama-town-shrine の記事を検索
    const post = await client.fetch(`*[_type == "post" && slug.current == "tateyama-town-shrine"][0] {
      _id,
      title,
      slug,
      youtubeUrl
    }`);
    
    if (!post) {
      console.log('❌ tateyama-town-shrine の記事が見つかりませんでした');
      return;
    }
    
    console.log('✅ 記事を発見:');
    console.log(`   タイトル: ${post.title}`);
    console.log(`   現在のYouTube URL: ${post.youtubeUrl || 'なし'}`);
    
    // YouTube URLを追加
    const youtubeUrl = 'https://youtu.be/HKt17t3MgE0';
    
    await client
      .patch(post._id)
      .set({ youtubeUrl: youtubeUrl })
      .commit();
    
    console.log('🎥 YouTube動画を記事に追加しました:');
    console.log(`   URL: ${youtubeUrl}`);
    console.log('✅ 更新完了!');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

addVideoToTateyamaShrine();