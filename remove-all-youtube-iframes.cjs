const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeAllYouTubeIframes() {
  try {
    console.log('🧹 全記事からYouTube iframeを削除中...');
    
    const posts = await client.fetch(`*[_type == "post"] {
      _id, title, slug, body
    }`);
    
    console.log(`📊 検索対象: ${posts.length}件の記事`);
    
    let processedCount = 0;
    let cleanedCount = 0;
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      processedCount++;
      let hasChanges = false;
      
      const originalLength = post.body.length;
      const cleanedBody = post.body.filter((block) => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // YouTube iframe埋め込みコードをチェック
          if (text.includes('<iframe') && text.includes('youtube.com/embed/')) {
            console.log(`🗑️ ${post.title.substring(0, 40)}... - iframeブロック削除`);
            hasChanges = true;
            return false;
          }
        }
        
        return true;
      });
      
      if (hasChanges && cleanedBody.length !== originalLength) {
        await client
          .patch(post._id)
          .set({
            body: cleanedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        cleanedCount++;
        
        if (cleanedCount % 10 === 0) {
          console.log(`⏱️ ${cleanedCount}件処理完了...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    console.log(`\n📊 YouTube iframe削除完了:`);
    console.log(`   処理対象記事: ${processedCount}件`);
    console.log(`   クリーンアップ実行: ${cleanedCount}件`);
    
    if (cleanedCount > 0) {
      console.log('\n🎉 YouTube iframeの削除が完了しました！');
    } else {
      console.log('\n✅ YouTube iframeは見つかりませんでした');
    }
    
    return cleanedCount;
    
  } catch (error) {
    console.error('❌ iframe削除エラー:', error.message);
    return 0;
  }
}

removeAllYouTubeIframes().then(count => {
  console.log(`\n🏁 最終結果: ${count}件の記事からiframeを削除しました`);
});