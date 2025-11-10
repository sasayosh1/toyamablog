const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function checkThumbnails() {
  const posts = await client.fetch(`
    *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...15] {
      _id,
      title,
      "slug": slug.current,
      youtubeUrl,
      thumbnail {
        asset -> {
          _id,
          url
        }
      }
    }
  `);

  console.log('\n最新15記事のサムネイル状況:\n');
  posts.forEach((post, i) => {
    const hasThumb = !!(post.thumbnail?.asset?.url);
    const hasYt = !!post.youtubeUrl;
    const status = (hasThumb || hasYt) ? '✓' : '✗';
    const title = post.title.substring(0, 40);

    console.log(`${i + 1}. ${status} ${title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   サムネイル: ${hasThumb ? 'あり' : 'なし'}`);
    console.log(`   YouTube: ${hasYt ? 'あり' : 'なし'}`);
    if (!hasThumb && !hasYt) {
      console.log(`   ⚠️  画像ソースなし - フォールバックSVG表示`);
    }
    console.log('');
  });
}

checkThumbnails().catch(console.error);
