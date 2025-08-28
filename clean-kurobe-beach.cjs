const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanKurobeBeachArticle() {
  try {
    console.log('🧹 黒部市石田浜海水浴場記事の不要なブロックを削除中...');
    
    const articleId = 'o031colbTiBAm1wuPGblcb';
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] {
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
        // 不要なYouTube動画ブロック（Smash Mouth - All Star等）
        if (block._type === 'youtube' && block.url) {
          if (block.url.includes('Smash') || block.url.includes('All Star') || 
              block.url.includes('dQw4w9WgXcQ')) {
            console.log('🗑️ 不要な動画ブロックを削除:', block.url);
            removedCount++;
            return false;
          }
        }
        
        // 不要なテキストブロック（URLやハッシュタグ、文字化け）
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // 削除対象のテキストパターン
          if (text.includes('https://sasakiyoshimasa.com/blog/kurobe-city-2') ||
              text.includes('https://www.info-toyama.com/') ||
              text.includes('短めの癒し&#x1f60c;') ||
              text.includes('#富山 #黒部') ||
              text.includes('#海岸 #海水浴場') ||
              text.includes('Smash Mouth') ||
              text.includes('All Star')) {
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
          .patch(articleId)
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

cleanKurobeBeachArticle();