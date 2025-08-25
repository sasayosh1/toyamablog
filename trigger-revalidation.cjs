const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function triggerRevalidation() {
  try {
    console.log('🚀 サイトの再生成とキャッシュクリアを実行中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] { _id, title, slug }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 対象記事:', article.title);
    console.log('🔑 記事ID:', article._id);
    
    // 複数回の更新でキャッシュを強制クリア
    const updateTimes = 5;
    console.log(`🔄 ${updateTimes}回の強制更新でキャッシュクリア中...`);
    
    for (let i = 0; i < updateTimes; i++) {
      const currentTime = new Date().toISOString();
      
      await client
        .patch(article._id)
        .set({
          _updatedAt: currentTime,
          forceRevalidate: Date.now() + i
        })
        .commit();
      
      console.log(`   ${i + 1}/${updateTimes} 完了 (${new Date().toLocaleTimeString()})`);
      
      // 間隔をあける
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ 強制キャッシュクリア完了');
    
    // Vercelの再生成APIを呼び出し
    console.log('🌐 Vercelの再生成を試行中...');
    
    try {
      // Next.js ISRの再生成を試行
      const revalidateUrls = [
        'https://sasakiyoshimasa.com/api/revalidate?path=/blog/kamiichi-town-temple-2',
        'https://sasakiyoshimasa.com/api/revalidate?path=/',
        'https://toyamablog.vercel.app/api/revalidate?path=/blog/kamiichi-town-temple-2'
      ];
      
      for (const url of revalidateUrls) {
        try {
          console.log(`   リクエスト中: ${url}`);
          const response = await fetch(url, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log(`   レスポンス: ${response.status} ${response.statusText}`);
        } catch (fetchError) {
          console.log(`   スキップ: ${fetchError.message}`);
        }
      }
      
    } catch (revalidateError) {
      console.log('再生成APIは利用できませんが、データ更新は完了しました');
    }
    
    console.log('\n🎉 全ての処理が完了しました！');
    console.log('');
    console.log('📋 実行した処理:');
    console.log(`  ✅ Sanity CMSでの${updateTimes}回の強制データ更新`);
    console.log('  ✅ タイムスタンプの更新によるキャッシュ無効化');
    console.log('  ✅ Next.js ISR再生成の試行');
    console.log('');
    console.log('🔗 確認URL:');
    console.log('  メインサイト: https://sasakiyoshimasa.com');
    console.log('  対象記事: https://sasakiyoshimasa.com/blog/kamiichi-town-temple-2');
    console.log('');
    console.log('⏱️  効果が現れるまでの時間:');
    console.log('  - ISR (Incremental Static Regeneration): 1-2分');
    console.log('  - CDNキャッシュクリア: 5-10分');
    console.log('  - ブラウザキャッシュ: Ctrl+F5で即座にクリア可能');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

triggerRevalidation();