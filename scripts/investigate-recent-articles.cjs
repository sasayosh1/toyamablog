const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function investigateRecentArticles() {
  console.log('🔍 最近の記事の詳細調査を開始します...\n');

  // 2025年11月8日に公開された記事を取得
  const posts = await client.fetch(`
    *[_type == "post" && publishedAt >= "2025-11-08T00:00:00Z" && publishedAt < "2025-11-09T00:00:00Z"] | order(publishedAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      slug,
      youtubeUrl,
      youtubeVideo,
      thumbnail,
      publishedAt,
      author
    }
  `);

  console.log(`📊 2025年11月8日の記事数: ${posts.length}件\n`);
  console.log('='.repeat(80));

  posts.forEach((post, index) => {
    console.log(`\n📄 記事 ${index + 1}:`);
    console.log(`   ID: ${post._id}`);
    console.log(`   タイトル: ${post.title?.substring(0, 60)}...`);
    console.log(`   作成日時: ${post._createdAt}`);
    console.log(`   更新日時: ${post._updatedAt}`);
    console.log(`   公開日時: ${post.publishedAt}`);
    console.log(`   Revision: ${post._rev}`);
    console.log(`   Slug: ${post.slug?.current || 'なし'}`);
    console.log(`   YouTubeURL: ${post.youtubeUrl ? '✅ あり' : '❌ なし'}`);
    console.log(`   YouTubeVideo: ${post.youtubeVideo ? '✅ あり' : '❌ なし'}`);
    console.log(`   Thumbnail: ${post.thumbnail ? '✅ あり' : '❌ なし'}`);
    console.log(`   Author: ${post.author ? JSON.stringify(post.author) : 'なし'}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 分析:');
  console.log('   - これらの記事は同じ日（2025年11月8日）に作成されている');
  console.log('   - YouTubeURL, YouTubeVideo, Thumbnailがすべて欠落している');
  console.log('   - おそらく手動でSanity Studioから作成されたか、別のスクリプトから作成された');
  console.log('\n✅ 調査完了\n');
}

investigateRecentArticles().catch(error => {
  console.error('❌ エラー発生:', error.message);
  process.exit(1);
});
