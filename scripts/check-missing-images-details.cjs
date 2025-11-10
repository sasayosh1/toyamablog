const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function checkMissingImagesDetails() {
  const posts = await client.fetch(`
    *[_type == "post" && !defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      category,
      categories,
      publishedAt
    }
  `);

  console.log('\n📊 画像ソースがない記事の詳細:\n');
  console.log(`総件数: ${posts.length}件\n`);

  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   カテゴリ(category): ${post.category || '未設定'}`);
    console.log(`   カテゴリ配列(categories): ${post.categories?.length > 0 ? post.categories.join(', ') : '未設定'}`);
    console.log(`   公開日: ${post.publishedAt}`);
    console.log('');
  });

  // カテゴリ統計
  const withCategory = posts.filter(p => p.category || (p.categories && p.categories.length > 0));
  const withoutCategory = posts.filter(p => !p.category && (!p.categories || p.categories.length === 0));

  console.log('\n📈 カテゴリ統計:');
  console.log(`  - カテゴリあり: ${withCategory.length}件`);
  console.log(`  - カテゴリなし: ${withoutCategory.length}件`);

  if (withoutCategory.length > 0) {
    console.log('\n⚠️  カテゴリ未設定の記事:');
    withoutCategory.forEach(p => {
      const location = p.title.match(/【(.+?)】/)?.[1] || '不明';
      console.log(`  - ${p.title.substring(0, 50)} → 推定地域: ${location}`);
    });
  }
}

checkMissingImagesDetails()
  .then(() => {
    console.log('\n✅ 完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });
