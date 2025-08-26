const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanAsahiSakuraArticle() {
  try {
    console.log('🧹 朝日町桜記事の不要なブロックを削除中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbnkr"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body ? article.body.length : 0}`);
    
    if (article.body) {
      let removedCount = 0;
      
      // 不要なブロックを除外
      const cleanedBody = article.body.filter(block => {
        // YouTube Shorts URLを含むテキストブロックを削除
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          if (text.includes('YouTube Shorts:') || text.includes('jNQXAC9IVRw') || 
              text.includes('youtube.com/shorts/') || text.includes('https://www.youtube.com/')) {
            console.log('🗑️ YouTube Shortsテキストブロックを削除:', text.substring(0, 50) + '...');
            removedCount++;
            return false;
          }
        }
        
        // YouTubeショートブロックを削除（Rick Astley関連）
        if (block._type === 'youtubeShorts' && block.url && block.url.includes('jNQXAC9IVRw')) {
          console.log('🗑️ YouTubeショートブロックを削除:', block.url);
          removedCount++;
          return false;
        }
        
        return true;
      });
      
      console.log(`📊 削除したブロック数: ${removedCount}`);
      console.log(`📊 残りのブロック数: ${cleanedBody.length}`);
      
      if (removedCount > 0) {
        // 記事を更新
        await client
          .patch(article._id)
          .set({
            body: cleanedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('✅ 不要なブロックを削除しました');
      } else {
        console.log('ℹ️ 削除対象のブロックが見つかりませんでした');
      }
    }
    
    console.log('🔄 クリーンアップ完了！');
    
  } catch (error) {
    console.error('❌ クリーンアップエラー:', error.message);
  }
}

cleanAsahiSakuraArticle();