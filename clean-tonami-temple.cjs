const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanTonamiTempleArticle() {
  try {
    console.log('🧹 砺波市千光寺記事から不要なコンテンツを削除中...\n');
    
    const article = await client.fetch('*[_type == "post" && _id == "o031colbTiBAm1wuPGbr25"][0] { _id, title, body }');
    
    if (!article) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事:', article.title);
    console.log('現在のブロック数:', article.body ? article.body.length : 0);
    
    if (article.body) {
      console.log('\n=== 削除対象ブロックを確認中 ===');
      
      // 削除対象のブロックを特定
      const filteredBody = article.body.filter((block, index) => {
        const blockNum = index + 1;
        
        // YouTube関連情報ブロックを削除
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // YouTube IDやURL情報
          if (text.includes('[YouTube: gWhLhwWmaBs]') || text.includes('YouTube:')) {
            console.log(`❌ ブロック${blockNum}: YouTube情報 - "${text.substring(0, 50)}..."`);
            return false;
          }
          
          // 千光寺の概要欄情報
          if (text.includes('▼千光寺') || text.includes('千光寺は、富山県砺波市庄谷にある真言宗の寺院。')) {
            console.log(`❌ ブロック${blockNum}: 概要欄情報 - "${text.substring(0, 50)}..."`);
            return false;
          }
          
          // URL情報
          if (text.includes('https://www.jalan.net/kankou/spt_16208ag2130009903')) {
            console.log(`❌ ブロック${blockNum}: URL情報 - "${text.substring(0, 50)}..."`);
            return false;
          }
          
          // ハッシュタグ情報
          if (text.includes('#富山') && text.includes('#砺波') && text.includes('#千光寺')) {
            console.log(`❌ ブロック${blockNum}: ハッシュタグ - "${text.substring(0, 50)}..."`);
            return false;
          }
        }
        
        // Rick Astley動画ブロック
        if (block._type === 'html' && block.html && block.html.includes('Rick Astley')) {
          console.log(`❌ ブロック${blockNum}: Rick Astley動画iframe`);
          return false;
        }
        
        if (block._type === 'youtube' && block.url && block.url.includes('dQw4w9WgXcQ')) {
          console.log(`❌ ブロック${blockNum}: Rick Astley動画`);
          return false;
        }
        
        // 保持するブロック
        console.log(`✅ ブロック${blockNum}: 保持 - ${block._type}`);
        return true;
      });
      
      console.log(`\n📊 結果: ${article.body.length} → ${filteredBody.length} ブロック`);
      
      if (filteredBody.length !== article.body.length) {
        // 記事を更新
        await client
          .patch(article._id)
          .set({ body: filteredBody })
          .commit();
        
        console.log('\n✅ 不要なコンテンツを削除しました');
        console.log(`削除されたブロック数: ${article.body.length - filteredBody.length}`);
        
        // 強制キャッシュクリア
        await client.patch(article._id).set({ _updatedAt: new Date().toISOString() }).commit();
        console.log('🔄 キャッシュクリア完了');
        
      } else {
        console.log('\n✅ 削除対象のコンテンツは見つかりませんでした');
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

cleanTonamiTempleArticle();