const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheClear() {
  console.log('🔄 Sanityキャッシュクリア実行...');
  
  try {
    // 全記事を強制再取得
    const posts = await client.fetch(`*[_type == "post"] { _id, title, slug }`);
    console.log(`📊 確認: ${posts.length}記事を再取得`);
    
    // CDNキャッシュを無効化するため、軽微な更新を実行
    const samplePost = posts[0];
    if (samplePost) {
      await client
        .patch(samplePost._id)
        .set({ _updatedAt: new Date().toISOString() })
        .commit();
      console.log('✅ CDNキャッシュ無効化トリガー実行');
    }
    
    // tateyama-town-3記事の状況確認
    const tateyamaArticles = posts.filter(post => 
      post.slug && post.slug.current === 'tateyama-town-3'
    );
    console.log(`🏔️ tateyama-town-3記事数: ${tateyamaArticles.length}`);
    
    if (tateyamaArticles.length > 0) {
      tateyamaArticles.forEach((article, index) => {
        console.log(`  記事${index + 1}: ${article.title}`);
        console.log(`  ID: ${article._id}`);
      });
    }
    
    console.log('\n🎯 対処法:');
    console.log('1. ブラウザでCtrl+F5 (強制リロード)');
    console.log('2. ブラウザ設定→履歴→閲覧データを削除');
    console.log('3. 5-10分後に再確認（CDN更新待ち）');
    console.log('4. Next.js ISR無効化の実行');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

forceCacheClear().catch(console.error);