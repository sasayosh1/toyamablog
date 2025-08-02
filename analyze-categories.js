import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function analyzeCategories() {
  try {
    console.log('📊 カテゴリーと記事タイトルを分析中...\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        category,
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 総記事数: ${posts.length}件\n`);
    
    // カテゴリー別の記事数をカウント
    const categoryCount = {};
    const titlesByCategory = {};
    
    posts.forEach(post => {
      const category = post.category || '未分類';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      if (!titlesByCategory[category]) {
        titlesByCategory[category] = [];
      }
      titlesByCategory[category].push({
        title: post.title,
        slug: post.slug
      });
    });
    
    console.log('📂 現在のカテゴリー別記事数:');
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}件`);
      });
    
    console.log('\n🏷️ 【】内の地域名を含む記事:');
    
    const regionPattern = /【([^】]+)】/;
    const articlesWithRegions = [];
    
    posts.forEach(post => {
      const match = post.title.match(regionPattern);
      if (match) {
        const region = match[1];
        articlesWithRegions.push({
          title: post.title,
          slug: post.slug,
          currentCategory: post.category,
          extractedRegion: region
        });
        console.log(`   「${region}」 - ${post.title} (現在: ${post.category || '未分類'})`);
      }
    });
    
    console.log(`\n📍 【】内地域名を含む記事: ${articlesWithRegions.length}件`);
    
    // 抽出された地域名の一覧
    const regions = [...new Set(articlesWithRegions.map(article => article.extractedRegion))];
    console.log('\n🗺️ 抽出された地域名一覧:');
    regions.sort().forEach(region => {
      const count = articlesWithRegions.filter(article => article.extractedRegion === region).length;
      console.log(`   ${region}: ${count}件`);
    });
    
    console.log('\n📋 県西部・県東部カテゴリーの記事:');
    ['県西部', '県東部'].forEach(oldCategory => {
      if (titlesByCategory[oldCategory]) {
        console.log(`\n${oldCategory} (${titlesByCategory[oldCategory].length}件):`);
        titlesByCategory[oldCategory].forEach(article => {
          console.log(`   - ${article.title}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

analyzeCategories();