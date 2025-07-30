import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheClear() {
  try {
    console.log('🔄 Sanityキャッシュクリア実行...');
    
    // 全記事を強制再取得（CDNキャッシュを無効化）
    const posts = await client.fetch(`*[_type == "post"] { 
      _id, 
      title, 
      slug,
      _updatedAt 
    }`);
    
    console.log(`📊 確認: ${posts.length}記事を再取得`);
    
    // サンプル記事のslugを確認
    const samplePosts = posts.slice(0, 3);
    console.log('\n📄 最新slug確認:');
    samplePosts.forEach((post, i) => {
      console.log(`${i+1}. "${post.slug?.current}" ← ${post.title?.substring(0, 40)}...`);
    });
    
    // CDNキャッシュを強制無効化するため、軽微なメタデータ更新
    console.log('\n🔧 CDNキャッシュ無効化中...');
    
    const updatePromises = posts.slice(0, 5).map(post => 
      client
        .patch(post._id)
        .set({ 
          _forceUpdate: new Date().toISOString(),
          cacheBuster: Math.random().toString(36).substring(7)
        })
        .commit()
    );
    
    await Promise.all(updatePromises);
    
    console.log('✅ CDNキャッシュ無効化完了');
    console.log('\n🎯 ブラウザでの確認方法:');
    console.log('1. Ctrl+Shift+R (スーパーリロード)');
    console.log('2. 開発者ツール→Network→"Disable cache"にチェック');
    console.log('3. 5-10分後に再確認（CDN伝播待ち）');
    console.log('4. https://www.sanity.io/manage でStudioから直接確認');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

forceCacheClear();