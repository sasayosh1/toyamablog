import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// カテゴリマッピング
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
  '入善町': '県東部',
  '氷見市': '県西部',
  '小矢部市': '県西部',
  '南砺市': '県西部',
  '福岡町': '県西部',
  '八尾町': '県西部',
  '婦中町': '富山市',
  '舟橋村': 'その他',
  '船橋村': 'その他',
  '七尾市': 'その他' // 石川県
};

async function autoCategorize(batchSize = 20) {
  try {
    console.log('🏷️ TOYAMA BLOG - カテゴリ自動分類');
    console.log(`バッチサイズ: ${batchSize}`);
    console.log('=' * 50);
    
    // 未分類記事を取得
    const uncategorizedPosts = await client.fetch(`
      *[_type == "post" && (category == "未分類" || category == null || category == "")] {
        _id,
        title,
        category
      }
    `);
    
    console.log(`📊 未分類記事数: ${uncategorizedPosts.length}`);
    
    if (uncategorizedPosts.length === 0) {
      console.log('✅ 全記事が既に分類済みです');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    console.log('🚀 カテゴリ分類開始...');
    
    // バッチ処理
    for (let i = 0; i < uncategorizedPosts.length; i += batchSize) {
      const batch = uncategorizedPosts.slice(i, i + batchSize);
      
      console.log(`\n--- バッチ ${Math.floor(i / batchSize) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
        try {
          const title = post.title || '';
          
          // 地域名を抽出
          const regionMatch = title.match(/【([^】]+[市町村])】/);
          let newCategory = 'その他'; // デフォルト
          
          if (regionMatch) {
            const region = regionMatch[1];
            newCategory = categoryMapping[region] || 'その他';
          }
          
          // カテゴリを更新
          await client
            .patch(post._id)
            .set({ category: newCategory })
            .commit();
          
          successCount++;
          processed++;
          
          // 進捗表示（簡潔に）
          if (processed % 10 === 0) {
            console.log(`✅ 進捗: ${processed}/${uncategorizedPosts.length} (${Math.round(processed/uncategorizedPosts.length*100)}%)`);
          }
          
          // APIレート制限対策
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
          errorCount++;
          processed++;
        }
      }
      
      // バッチ間待機
      if (i + batchSize < uncategorizedPosts.length) {
        console.log('⏳ バッチ間待機 (2秒)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 カテゴリ分類完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 結果集計
    const categoryStats = await client.fetch(`
      *[_type == "post"] {
        category
      } | {
        "category": category,
        "count": count(*)
      } | order(count desc)
    `);
    
    console.log('\n📊 カテゴリ別記事数:');
    const categoryCount = {};
    categoryStats.forEach(post => {
      const cat = post.category || '未分類';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}件`);
    });
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

autoCategorize(20);