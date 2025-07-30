import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function verifyUpdates() {
  try {
    console.log('🔍 更新結果の確認...');
    
    // 全ての最新記事を確認
    const allRecentPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "2025-06-28T00:00:00"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        youtubeUrl,
        publishedAt,
        category,
        tags
      }
    `);
    
    console.log(`📊 6月28日以降の記事: ${allRecentPosts.length}件\n`);
    
    allRecentPosts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   YouTube: ${post.youtubeUrl || '未設定'}`);
      console.log(`   カテゴリ: ${post.category}`);
      console.log(`   タグ数: ${post.tags?.length || 0}個`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log('');
    });
    
    // YouTube URL設定状況
    const withYoutube = allRecentPosts.filter(p => p.youtubeUrl);
    const withoutYoutube = allRecentPosts.filter(p => !p.youtubeUrl);
    
    console.log('📈 YouTube URL設定状況:');
    console.log(`✅ 設定済み: ${withYoutube.length}件`);
    console.log(`❌ 未設定: ${withoutYoutube.length}件`);
    
    if (withYoutube.length > 0) {
      console.log('\n🎬 YouTube URL設定済み記事:');
      withYoutube.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title.substring(0, 50)}...`);
        console.log(`   URL: ${post.youtubeUrl}`);
      });
    }
    
    if (withoutYoutube.length > 0) {
      console.log('\n❓ YouTube URL未設定記事:');
      withoutYoutube.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title.substring(0, 50)}...`);
      });
    }
    
    return {
      total: allRecentPosts.length,
      withYoutube: withYoutube.length,
      withoutYoutube: withoutYoutube.length
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

verifyUpdates();