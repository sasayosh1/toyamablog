import { client } from './src/lib/sanity.ts';

async function debugSlugs() {
  try {
    // 夜高祭の記事を検索（詳細情報付き）
    const yotakaPosts = await client.fetch(`
      *[_type == "post" && title match "*夜高祭*"]{ 
        title, 
        "slug": slug.current,
        publishedAt,
        youtubeUrl,
        description
      } | order(publishedAt desc)
    `);
    
    console.log('夜高祭の記事:');
    yotakaPosts.forEach((post, i) => {
      console.log(`${i + 1}. スラッグ: ${post.slug}`);
      console.log(`   タイトル: ${post.title}`);
      console.log(`   公開日: ${post.publishedAt}`);
      console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
      console.log(`   説明: ${post.description || 'なし'}`);
      console.log('');
    });
    
    // 全記事のスラッグを確認
    const allSlugs = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        "slug": slug.current,
        title
      } | order(publishedAt desc)[0...10]
    `);
    
    console.log('\n最新10記事のスラッグ:');
    allSlugs.forEach((post, i) => {
      console.log(`${i + 1}. ${post.slug} - ${post.title.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugSlugs();