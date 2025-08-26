const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeYouTubeDescription() {
  try {
    console.log('🗑️ YouTube概要欄引用部分を削除中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbqSb"][0] {
      _id, title, body
    }`);
    
    if (!article || !article.body) {
      console.log('❌ 記事または本文が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 元のブロック数: ${article.body.length}`);
    
    // YouTube概要欄部分を除外
    const filteredBody = article.body.filter((block, index) => {
      if (block._type !== 'block' || !block.children) {
        return true; // blockタイプ以外はそのまま保持
      }
      
      const text = block.children.map(child => child.text).join('');
      
      // 削除対象の判定
      const shouldRemove = (
        text.includes('【公式】クロスランドおやべHP') ||
        text.includes('http://www.cross-oyabe.jp') ||
        (text.includes('#富山') && text.includes('#小矢部') && text.includes('#クロスランドおやべ'))
      );
      
      if (shouldRemove) {
        console.log(`🗑️ ブロック${index + 1}を削除: ${text.substring(0, 50)}...`);
        return false;
      }
      
      return true;
    });
    
    console.log(`📊 フィルター後のブロック数: ${filteredBody.length}`);
    console.log(`📉 削除されたブロック数: ${article.body.length - filteredBody.length}`);
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: filteredBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ YouTube概要欄部分の削除が完了しました');
    
    // 更新後の確認
    const updatedArticle = await client.fetch(`*[_type == "post" && _id == "${article._id}"][0] {
      title,
      "bodyBlockCount": length(body)
    }`);
    
    console.log('\n📊 更新後の確認:');
    console.log(`記事: ${updatedArticle.title}`);
    console.log(`ブロック数: ${updatedArticle.bodyBlockCount}`);
    
    console.log('\n🎉 小矢部市記事のクリーンアップ完了！');
    
  } catch (error) {
    console.error('❌ 削除エラー:', error.message);
  }
}

removeYouTubeDescription();