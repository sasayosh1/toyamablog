const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanUozuCircleArticle() {
  try {
    console.log('🧹 魚津市東山円筒分水槽記事の不要なブロックを削除中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "vTFXi0ufHZhGd7mVymG4gZ"][0] {
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
        // YouTube動画ブロックを削除（Smash Mouth関連など）
        if (block._type === 'youtube' && block.url) {
          if (block.url.includes('Smash') || block.url.includes('All Star') || 
              block.url.includes('dQw4w9WgXcQ')) {
            console.log('🗑️ 不要な動画ブロックを削除:', block.url);
            removedCount++;
            return false;
          }
        }
        
        // 文字化けやハッシュタグを含むテキストブロックを削除
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          if (text.includes('&#8230;') || text.includes('&#x1f60c;') || 
              text.includes('#富山') || text.includes('#魚津') || 
              text.includes('Smash Mouth') || text.includes('All Star') ||
              text.includes('注目 &#8230;') || text.includes('パワースポット')) {
            console.log('🗑️ 不要なテキストブロックを削除:', text.substring(0, 50) + '...');
            removedCount++;
            return false;
          }
        }
        
        // YouTubeショートブロックも削除
        if (block._type === 'youtubeShorts') {
          console.log('🗑️ YouTubeショートブロックを削除');
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

cleanUozuCircleArticle();