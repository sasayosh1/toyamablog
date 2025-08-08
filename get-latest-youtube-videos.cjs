const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function getLatestYouTubeVideos() {
  try {
    console.log('📺 YouTube動画情報取得開始...');
    
    // 既存の記事からYouTube URLを取得
    const existingPosts = await client.fetch(`
      *[_type == "post" && defined(youtubeUrl)] {
        title,
        youtubeUrl,
        slug,
        _createdAt
      } | order(_createdAt desc)
    `);
    
    console.log(`📊 既存YouTube記事数: ${existingPosts.length}記事`);
    
    if (existingPosts.length > 0) {
      console.log('\n🎬 最新の10記事:');
      existingPosts.slice(0, 10).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   URL: ${post.youtubeUrl}`);
        console.log(`   作成日: ${new Date(post._createdAt).toLocaleDateString('ja-JP')}`);
        console.log('');
      });
    }
    
    // YouTube URLから動画IDを抽出
    const videoIds = existingPosts.map(post => {
      const url = post.youtubeUrl;
      if (url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
        return match ? match[1] : null;
      }
      return null;
    }).filter(Boolean);
    
    console.log(`🆔 既存動画ID数: ${videoIds.length}個`);
    
    // 手動で新しい動画IDを確認するためのプロンプト
    console.log('\n🔍 新しい動画を確認するには:');
    console.log('1. YouTubeチャンネルで最新動画をチェック');
    console.log('2. 上記リストにない動画IDがあれば、それが未記事化動画です');
    console.log('3. 動画IDの形式例: dQw4w9WgXcQ (YouTube URLの v= 以降の部分)');
    
    return {
      existingVideos: existingPosts,
      videoIds: videoIds
    };
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

getLatestYouTubeVideos();