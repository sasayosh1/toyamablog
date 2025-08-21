const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeYouTubeDescriptionFromTonami() {
  try {
    const articleId = 'vTFXi0ufHZhGd7mVymG65h';
    
    console.log('🗑️ 砺波市チューリップ四季彩館記事からYouTube説明文を削除中...');
    
    const article = await client.fetch('*[_type == "post" && _id == "' + articleId + '"][0] { _id, title, body }');
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事:', article.title);
    console.log('現在のブロック数:', article.body ? article.body.length : 0);
    
    if (article.body) {
      console.log('\n=== 削除対象ブロックを確認中 ===');
      
      const filteredBody = article.body.filter((block, index) => {
        const blockNum = index + 1;
        
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // YouTube関連の説明文をチェック
          if (text.includes('[YouTube: CcuOzMYAlGs]') ||
              text.includes('▼チューリップ四季彩館') ||
              text.includes('http://www.tulipfair.or.jp/') ||
              text.includes('2020年10月18日(日)撮影') ||
              text.includes('#富山 #砺波 #チューリップ #四季彩館')) {
            console.log(`❌ ブロック${blockNum}: YouTube説明文 - "${text.substring(0, 50)}..."`);
            return false;
          }
        }
        
        console.log(`✅ ブロック${blockNum}: 保持 - ${block._type}`);
        return true;
      });
      
      console.log(`\n📊 結果: ${article.body.length} → ${filteredBody.length} ブロック`);
      
      if (filteredBody.length !== article.body.length) {
        await client
          .patch(article._id)
          .set({ 
            body: filteredBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('\n✅ YouTube説明文を削除しました');
        console.log(`削除されたブロック数: ${article.body.length - filteredBody.length}`);
        console.log('🔄 キャッシュクリア完了');
        
      } else {
        console.log('\n✅ 削除対象のコンテンツは見つかりませんでした');
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

removeYouTubeDescriptionFromTonami();