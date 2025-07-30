import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceReindex() {
  try {
    console.log('🔄 Sanity完全再インデックス実行...');
    
    // 全記事に軽微な更新を加えて強制的にキャッシュを無効化
    const allPosts = await client.fetch(`*[_type == "post"] { _id, title, slug }`);
    console.log(`📊 対象: ${allPosts.length}記事`);
    
    // 10件ずつバッチ処理で再インデックス
    for (let i = 0; i < allPosts.length; i += 10) {
      const batch = allPosts.slice(i, i + 10);
      const promises = batch.map(post => 
        client
          .patch(post._id)
          .set({ 
            _reindexed: new Date().toISOString(),
            _cacheVersion: Math.random().toString(36)
          })
          .commit()
      );
      
      await Promise.all(promises);
      console.log(`✅ ${Math.min(i + 10, allPosts.length)}/${allPosts.length} 完了`);
      
      // API制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎯 キャッシュクリア手順:');
    console.log('1. ブラウザを完全終了');
    console.log('2. ブラウザを再起動');
    console.log('3. プライベート/シークレットモードで確認');
    console.log('4. Sanity Studio (https://aoxze287.sanity.studio) で直接確認');
    console.log('5. 10-15分待ってから再確認（CDN完全更新）');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

forceReindex();