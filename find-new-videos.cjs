const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findNewVideos() {
  try {
    console.log('🔍 新しい動画の確認を開始します...');
    
    // 最新の記事をチェック
    const latestPosts = await client.fetch(`
      *[_type == "post"] | order(_createdAt desc) [0...5] {
        title,
        youtubeUrl,
        slug,
        _createdAt,
        _updatedAt
      }
    `);
    
    console.log('\n📅 最新の5記事:');
    latestPosts.forEach((post, index) => {
      const createdDate = new Date(post._createdAt).toLocaleDateString('ja-JP');
      const updatedDate = new Date(post._updatedAt).toLocaleDateString('ja-JP');
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   作成: ${createdDate} | 更新: ${updatedDate}`);
      console.log(`   YouTube: ${post.youtubeUrl || 'なし'}`);
      console.log('');
    });
    
    // 今日の日付を確認
    const today = new Date();
    console.log(`📆 今日の日付: ${today.toLocaleDateString('ja-JP')}`);
    
    // 最新記事の日付と比較
    if (latestPosts.length > 0) {
      const latestDate = new Date(latestPosts[0]._createdAt);
      const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
      console.log(`📊 最新記事からの経過日数: ${daysDiff}日`);
      
      if (daysDiff > 0) {
        console.log('\n🆕 新しい動画がある可能性があります！');
        console.log('次のステップ:');
        console.log('1. YouTubeチャンネルを直接確認');
        console.log('2. 新しい動画IDを手動で提供');
        console.log('3. 新しい記事を作成');
      } else {
        console.log('\n✅ 最新記事は今日作成されています');
      }
    }
    
    // 手動で新動画情報を入力するためのプロンプト表示
    console.log('\n📝 新しい動画を追加する場合:');
    console.log('YouTube動画のURLまたはIDをお知らせください');
    console.log('例: https://youtube.com/shorts/XXXXXXXXXXX');
    console.log('例: https://www.youtube.com/watch?v=XXXXXXXXXXX');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

findNewVideos();