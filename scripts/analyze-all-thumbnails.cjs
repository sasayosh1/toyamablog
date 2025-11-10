const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function analyzeAllThumbnails() {
  // 全記事を取得
  const posts = await client.fetch(`
    *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      youtubeUrl,
      thumbnail {
        asset -> {
          _id,
          url
        }
      }
    }
  `);

  let hasThumbCount = 0;
  let hasYtCount = 0;
  let hasEitherCount = 0;
  let noImageCount = 0;

  const noImagePosts = [];

  posts.forEach((post) => {
    const hasThumb = !!(post.thumbnail?.asset?.url);
    const hasYt = !!post.youtubeUrl;

    if (hasThumb) hasThumbCount++;
    if (hasYt) hasYtCount++;
    if (hasThumb || hasYt) {
      hasEitherCount++;
    } else {
      noImageCount++;
      noImagePosts.push({
        title: post.title.substring(0, 50),
        slug: post.slug,
        publishedAt: post.publishedAt
      });
    }
  });

  console.log('\n=== 全記事のサムネイル状況分析 ===\n');
  console.log(`総記事数: ${posts.length}件`);
  console.log(`Sanityサムネイルあり: ${hasThumbCount}件 (${((hasThumbCount / posts.length) * 100).toFixed(1)}%)`);
  console.log(`YouTubeURLあり: ${hasYtCount}件 (${((hasYtCount / posts.length) * 100).toFixed(1)}%)`);
  console.log(`画像ソースあり（いずれか）: ${hasEitherCount}件 (${((hasEitherCount / posts.length) * 100).toFixed(1)}%)`);
  console.log(`⚠️  画像ソースなし: ${noImageCount}件 (${((noImageCount / posts.length) * 100).toFixed(1)}%)\n`);

  if (noImagePosts.length > 0) {
    console.log('\n=== 画像ソースがない記事一覧 ===\n');
    noImagePosts.slice(0, 20).forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   公開日: ${post.publishedAt}\n`);
    });

    if (noImagePosts.length > 20) {
      console.log(`... 他 ${noImagePosts.length - 20}件\n`);
    }
  }

  // サンプル: 正常な記事を確認
  const normalPosts = posts.filter(p => p.thumbnail?.asset?.url || p.youtubeUrl).slice(0, 5);
  if (normalPosts.length > 0) {
    console.log('\n=== 正常な記事のサンプル ===\n');
    normalPosts.forEach((post, i) => {
      const hasThumb = !!(post.thumbnail?.asset?.url);
      const hasYt = !!post.youtubeUrl;
      console.log(`${i + 1}. ${post.title.substring(0, 50)}`);
      console.log(`   サムネイル: ${hasThumb ? 'あり' : 'なし'}`);
      console.log(`   YouTube: ${hasYt ? 'あり' : 'なし'}\n`);
    });
  }
}

analyzeAllThumbnails().catch(console.error);
