const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceClearAllCache() {
  try {
    console.log('🔄 全記事のキャッシュクリアを実行中...');
    
    // 全記事を取得
    const posts = await client.fetch(`*[_type == "post"] { _id, title }`);
    
    console.log(`📊 対象記事: ${posts.length}件`);
    
    let processedCount = 0;
    
    // 各記事の _updatedAt を現在時刻に更新してキャッシュをクリア
    for (const post of posts) {
      await client
        .patch(post._id)
        .set({ _updatedAt: new Date().toISOString() })
        .commit();
      
      processedCount++;
      
      if (processedCount % 20 === 0) {
        console.log(`⏱️ ${processedCount}件処理完了...`);
        // API制限を考慮して少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n✅ 全${processedCount}件の記事でキャッシュクリア完了`);
    console.log('🎯 対処法:');
    console.log('1. ブラウザでCtrl+F5 (強制リロード)');
    console.log('2. ブラウザ設定→履歴→閲覧データを削除');
    console.log('3. 5-10分後に再確認（CDN更新待ち）');
    
  } catch (error) {
    console.error('❌ キャッシュクリアエラー:', error.message);
  }
}

forceClearAllCache();