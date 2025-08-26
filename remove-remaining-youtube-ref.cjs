const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeRemainingYouTubeRef() {
  try {
    console.log('🗑️ 残りのYouTube引用部分を削除中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbqSb"][0] {
      _id, title, body
    }`);
    
    if (!article || !article.body) {
      console.log('❌ 記事または本文が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body.length}`);
    
    // YouTube引用部分を詳細チェック
    let foundCount = 0;
    article.body.forEach((block, index) => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        if (text.includes('[YouTube:') || text.includes('YouTube Shorts:')) {
          console.log(`🔍 ブロック${index + 1}で発見: ${text}`);
          foundCount++;
        }
      }
    });
    
    if (foundCount === 0) {
      console.log('✅ 既にクリーンアップ済みです');
      return;
    }
    
    // YouTube引用部分を除外
    const cleanedBody = article.body.filter((block) => {
      if (block._type !== 'block' || !block.children) {
        return true;
      }
      
      const text = block.children.map(child => child.text).join('');
      
      const shouldRemove = (
        text.includes('[YouTube:') ||
        text.includes('YouTube Shorts:')
      );
      
      if (shouldRemove) {
        console.log(`🗑️ 削除: ${text}`);
        return false;
      }
      
      return true;
    });
    
    console.log(`📊 フィルター後のブロック数: ${cleanedBody.length}`);
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: cleanedBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ 残りのYouTube引用部分の削除が完了しました');
    
  } catch (error) {
    console.error('❌ 削除エラー:', error.message);
  }
}

removeRemainingYouTubeRef();