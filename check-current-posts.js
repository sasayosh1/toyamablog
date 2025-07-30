import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkCurrentPosts() {
  try {
    console.log('📊 TOYAMA BLOG - 現在の記事データ確認');
    console.log('=' * 50);
    
    // 全記事を取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        tags,
        category,
        "bodyBlocks": count(body[]),
        "hasYouTubeShorts": "youtubeShorts" in body[]._type
      }
    `);
    
    console.log(`📝 総記事数: ${allPosts.length}`);
    
    if (allPosts.length === 0) {
      console.log('⚠️  記事が見つかりません');
      return;
    }
    
    console.log('\n📋 記事一覧:');
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   スラッグ: ${post.slug?.current || '未設定'}`);
      console.log(`   公開日: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ja-JP') : '未設定'}`);
      console.log(`   ブロック数: ${post.bodyBlocks || 0}`);
      console.log(`   YouTube Shorts: ${post.hasYouTubeShorts ? '✅' : '❌'}`);
      console.log(`   カテゴリ: ${post.category || '未分類'}`);
      console.log('');
    });
    
    // カテゴリ別集計
    const categories = {};
    allPosts.forEach(post => {
      const cat = post.category || '未分類';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('📊 カテゴリ別記事数:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}件`);
    });
    
    // YouTube Shorts統計
    const withYouTube = allPosts.filter(post => post.hasYouTubeShorts).length;
    console.log(`\n🎬 YouTube Shorts統計:`);
    console.log(`  追加済み: ${withYouTube}件`);
    console.log(`  未追加: ${allPosts.length - withYouTube}件`);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkCurrentPosts();