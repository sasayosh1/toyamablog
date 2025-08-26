const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeYoutubeShortsBlock() {
  try {
    console.log('🗑️ Oyabe記事からyoutubeShortsブロックを削除中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbqSb"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body.length}`);
    
    // youtubeShortsタイプのブロックを除外
    const cleanedBody = article.body.filter((block, index) => {
      if (block._type === 'youtubeShorts') {
        console.log(`🗑️ ブロック${index + 1}: youtubeShortsブロック削除`);
        console.log(`   URL: ${block.url || 'なし'}`);
        return false;
      }
      return true;
    });
    
    console.log(`📊 フィルター後のブロック数: ${cleanedBody.length}`);
    
    if (cleanedBody.length === article.body.length) {
      console.log('⚠️ youtubeShortsブロックが見つからなかったため、変更はありません');
      return;
    }
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: cleanedBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ youtubeShortsブロックの削除が完了しました');
    console.log('🎉 YouTube Shortsテキストとグレー背景が削除されました！');
    
  } catch (error) {
    console.error('❌ 削除エラー:', error.message);
  }
}

removeYoutubeShortsBlock();