import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function analyzeCategories() {
  try {
    console.log('📊 TOYAMA BLOG - カテゴリ分析');
    console.log('=' * 50);
    
    // 全記事のタイトルを取得して地域を抽出
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        category,
        publishedAt
      }
    `);
    
    console.log(`📝 総記事数: ${allPosts.length}`);
    
    // 地域別集計
    const regions = {};
    const otherCategories = {};
    
    allPosts.forEach(post => {
      const title = post.title || '';
      
      // 地域名を抽出（【地域名】パターン）
      const regionMatch = title.match(/【([^】]+[市町村])】/);
      if (regionMatch) {
        const region = regionMatch[1];
        regions[region] = (regions[region] || 0) + 1;
      } else {
        // その他のパターンを分析
        otherCategories['その他'] = (otherCategories['その他'] || 0) + 1;
      }
    });
    
    console.log('\n🗾 地域別記事数:');
    const sortedRegions = Object.entries(regions).sort((a, b) => b[1] - a[1]);
    sortedRegions.forEach(([region, count]) => {
      console.log(`  ${region}: ${count}件`);
    });
    
    console.log('\n📋 提案するカテゴリ分類:');
    console.log('主要都市:');
    console.log('  - 富山市 (最多)');
    console.log('  - 高岡市');
    console.log('  - 射水市');
    console.log('  - 砺波市');
    
    console.log('\nその他地域:');
    console.log('  - 県東部 (魚津市、黒部市、滑川市、上市町、立山町、朝日町など)');
    console.log('  - 県西部 (氷見市、小矢部市、南砺市、福岡町、八尾町など)');
    console.log('  - その他');
    
    // カテゴリマッピングを作成
    const categoryMapping = {
      '富山市': '富山市',
      '高岡市': '高岡市', 
      '射水市': '射水市',
      '砺波市': '砺波市',
      '魚津市': '県東部',
      '黒部市': '県東部',
      '滑川市': '県東部',
      '上市町': '県東部',
      '立山町': '県東部',
      '朝日町': '県東部',
      '氷見市': '県西部',
      '小矢部市': '県西部',
      '南砺市': '県西部',
      '福岡町': '県西部',
      '八尾町': '県西部',
      '婦中町': '富山市',
      '舟橋村': 'その他'
    };
    
    console.log('\n🏷️ カテゴリマッピング準備完了');
    console.log('次のステップ: カテゴリ自動分類の実行');
    
    return { regions, categoryMapping, totalPosts: allPosts.length };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

analyzeCategories();