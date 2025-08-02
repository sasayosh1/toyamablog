import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function findDuplicateSlugs() {
  try {
    console.log('🔍 重複slug検索を開始します\n');
    
    // 全記事のslug情報を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📊 総記事数: ${posts.length}件\n`);
    
    // slug重複チェック
    const slugCounts = {};
    const duplicates = [];
    
    posts.forEach(post => {
      if (slugCounts[post.slug]) {
        slugCounts[post.slug].push(post);
      } else {
        slugCounts[post.slug] = [post];
      }
    });
    
    // 重複slugを特定
    Object.keys(slugCounts).forEach(slug => {
      if (slugCounts[slug].length > 1) {
        duplicates.push({
          slug,
          count: slugCounts[slug].length,
          posts: slugCounts[slug]
        });
      }
    });
    
    console.log('📈 重複slug分析結果:');
    console.log(`- ユニークslug: ${Object.keys(slugCounts).length - duplicates.length}件`);
    console.log(`- 重複slug: ${duplicates.length}件`);
    console.log(`- 重複による影響記事: ${duplicates.reduce((sum, dup) => sum + dup.count, 0)}件\n`);
    
    if (duplicates.length > 0) {
      console.log('🚨 重複slug詳細一覧:');
      duplicates.forEach((duplicate, i) => {
        console.log(`${i + 1}. slug: "${duplicate.slug}" (${duplicate.count}件重複)`);
        duplicate.posts.forEach((post, j) => {
          console.log(`   ${j + 1}. ID: ${post._id}`);
          console.log(`      タイトル: ${post.title.substring(0, 60)}...`);
          console.log(`      公開日: ${post.publishedAt}`);
        });
        console.log('');
      });
      
      return duplicates;
    } else {
      console.log('✅ 重複slugはありません！');
      return [];
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    return null;
  }
}

findDuplicateSlugs();