import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function updateCategories() {
  try {
    console.log('🔄 カテゴリーを具体的な地域名に更新中...\n');
    
    // 県西部・県東部のカテゴリーを持つ記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && (category == "県西部" || category == "県東部")]{ 
        _id,
        title, 
        category,
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 更新対象記事数: ${posts.length}件\n`);
    
    let updatedCount = 0;
    const updateLog = [];
    
    for (const post of posts) {
      // タイトルから【】内の地域名を抽出
      const regionMatch = post.title.match(/【([^】]+)】/);
      
      if (regionMatch) {
        const extractedRegion = regionMatch[1];
        const oldCategory = post.category;
        
        console.log(`🔧 更新中: ${post.slug}`);
        console.log(`   タイトル: "${post.title}"`);
        console.log(`   変更前カテゴリー: "${oldCategory}"`);
        console.log(`   変更後カテゴリー: "${extractedRegion}"`);
        
        try {
          // カテゴリーを更新
          await client
            .patch(post._id)
            .set({ category: extractedRegion })
            .commit();
          
          console.log(`   ✅ 更新成功\n`);
          updatedCount++;
          
          updateLog.push({
            slug: post.slug,
            title: post.title,
            oldCategory: oldCategory,
            newCategory: extractedRegion
          });
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`   ❌ 更新失敗: ${error.message}\n`);
        }
      } else {
        console.log(`⚠️  地域名抽出失敗: ${post.slug} - "${post.title}"`);
      }
    }
    
    console.log('🎉 カテゴリー更新完了！');
    console.log(`📊 更新結果:`);
    console.log(`- 対象記事数: ${posts.length}件`);
    console.log(`- 更新成功: ${updatedCount}件`);
    console.log(`- 更新失敗: ${posts.length - updatedCount}件`);
    
    if (updateLog.length > 0) {
      console.log('\n📝 更新ログ:');
      updateLog.forEach(log => {
        console.log(`   ${log.newCategory}: ${log.title.substring(0, 50)}...`);
      });
      
      // カテゴリー別の更新数を集計
      const categoryCount = {};
      updateLog.forEach(log => {
        categoryCount[log.newCategory] = (categoryCount[log.newCategory] || 0) + 1;
      });
      
      console.log('\n📂 新しいカテゴリー別記事数:');
      Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`   ${category}: ${count}件`);
        });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

updateCategories();