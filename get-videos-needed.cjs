const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function getVideosNeeded() {
  try {
    console.log('🎥 動画が必要な記事を詳しく調査中...');
    
    const posts = await client.fetch(`*[_type == "post" && !defined(youtubeUrl)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      category,
      publishedAt
    }`);
    
    console.log(`\n📊 動画が不足している記事: ${posts.length}件`);
    
    // カテゴリ別に分類
    const byCategory = {};
    posts.forEach(post => {
      const cat = post.category || 'その他';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(post);
    });
    
    console.log('\n📈 カテゴリ別内訳:');
    Object.entries(byCategory).forEach(([category, articles]) => {
      console.log(`• ${category}: ${articles.length}件`);
    });
    
    console.log('\n🎯 優先対応記事（上位10件）:');
    posts.slice(0, 10).forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   カテゴリ: ${post.category || '未設定'}`);
      console.log(`   スラッグ: ${post.slug?.current || '未設定'}`);
      if (post.publishedAt) {
        const date = new Date(post.publishedAt).toLocaleDateString('ja-JP');
        console.log(`   公開日: ${date}`);
      }
      console.log('   ---');
    });
    
    return posts;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return [];
  }
}

getVideosNeeded();