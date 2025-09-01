const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01'
});

async function cleanOldGoogleMapsData() {
  try {
    console.log('🚨 古いGoogleマップデータのクリーニングを開始します...');
    
    // 全記事を取得してGoogleマップブロックをチェック
    const posts = await client.fetch(`*[_type == "post"]`);
    console.log(`📄 検査対象記事数: ${posts.length}件`);
    
    let processedCount = 0;
    let cleanedCount = 0;
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      console.log(`\n🔍 記事「${post.title}」を検査中...`);
      
      // Googleマップブロックをフィルタリングしてbodyから除去
      const originalLength = post.body.length;
      const cleanedBody = post.body.filter(block => {
        if (block._type === 'googleMaps') {
          console.log(`  ❌ GoogleマップブロックをClaudルール違反として除去: ${block._key}`);
          return false;
        }
        return true;
      });
      
      // 変更があった場合のみ更新
      if (cleanedBody.length !== originalLength) {
        console.log(`  🧹 ${originalLength - cleanedBody.length}個のGoogleマップブロックを除去`);
        
        await client
          .patch(post._id)
          .set({ body: cleanedBody })
          .commit();
        
        cleanedCount++;
        console.log(`  ✅ 記事「${post.title}」のデータクリーニング完了`);
      } else {
        console.log(`  ✨ 記事「${post.title}」はクリーン（Googleマップブロック無し）`);
      }
      
      processedCount++;
    }
    
    console.log('\n🎉 古いGoogleマップデータクリーニング完了！');
    console.log(`📊 統計:`);
    console.log(`  - 検査記事数: ${processedCount}件`);
    console.log(`  - クリーニング済み: ${cleanedCount}件`);
    console.log(`  - クリーン記事: ${processedCount - cleanedCount}件`);
    console.log('\n✅ 今後はGoogleマップが専用セクションでのみ表示されます');
    
  } catch (error) {
    console.error('💥 エラーが発生しました:', error);
    process.exit(1);
  }
}

cleanOldGoogleMapsData();