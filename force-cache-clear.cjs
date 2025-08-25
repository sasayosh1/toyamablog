const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheClear() {
  try {
    console.log('🔄 強制キャッシュクリア実行中...');
    
    const article = await client.fetch('*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] { _id, title }');
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 対象記事:', article.title);
    console.log('🔑 記事ID:', article._id);
    
    // 強制的に _updatedAt を現在時刻に更新してキャッシュを無効化
    await client
      .patch(article._id)
      .set({
        _updatedAt: new Date().toISOString(),
        // 一時的にバージョンを更新してキャッシュバスト
        cacheVersion: Date.now()
      })
      .commit();
    
    console.log('✅ キャッシュクリア完了');
    console.log('🕒 更新時刻:', new Date().toLocaleString());
    
    // CDNキャッシュもクリア（複数回更新）
    console.log('🌐 CDNキャッシュもクリア中...');
    
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await client
        .patch(article._id)
        .set({
          _updatedAt: new Date().toISOString()
        })
        .commit();
      
      console.log(`   ${i + 1}/3 回目のキャッシュクリア完了`);
    }
    
    console.log('🎉 全てのキャッシュクリア完了！');
    console.log('');
    console.log('💡 次の手順:');
    console.log('1. ブラウザでCtrl+Shift+R (強制リロード)');
    console.log('2. または開発者ツール → ネットワークタブ → キャッシュを無効化');
    console.log('3. 5-10分待ってからページを再読み込み');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

forceCacheClear();