const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeLinkFromTateyamaShrineArticle() {
  try {
    console.log('🔍 立山町神社記事を検索中...');
    
    // スラッグで記事を検索
    const article = await client.fetch(`*[_type == "post" && slug.current == "tateyama-town-shrine"][0] { _id, title, slug, body }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりませんでした');
      return;
    }
    
    console.log('✅ 記事が見つかりました:');
    console.log('ID:', article._id);
    console.log('タイトル:', article.title);
    console.log('');
    
    console.log('🗑️ 不要なURLリンクを削除中...');
    
    // 本文から不要なリンクを含むブロックを除外
    const updatedBody = article.body.filter(block => {
      // テキストブロックの場合
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        // oyamajinjya-maetetateshadon.org を含むブロックを除外
        if (text.includes('oyamajinjya-maetateshadon.org') || 
            text.includes('http://www.oyamajinjya-maetateshadon.org/')) {
          console.log('削除対象ブロック:', text);
          return false;
        }
      }
      
      // HTMLブロックの場合
      if (block._type === 'html' && block.html) {
        if (block.html.includes('oyamajinjya-maetateshadon.org')) {
          console.log('削除対象HTMLブロック:', block.html.substring(0, 100) + '...');
          return false;
        }
      }
      
      return true;
    });
    
    console.log('元のブロック数:', article.body.length);
    console.log('更新後ブロック数:', updatedBody.length);
    
    if (updatedBody.length !== article.body.length) {
      // 記事を更新
      await client
        .patch(article._id)
        .set({
          body: updatedBody
        })
        .commit();
      
      console.log('✅ 不要なURLリンクを削除しました');
      
      // キャッシュクリア
      await client.patch(article._id).set({ _updatedAt: new Date().toISOString() }).commit();
      console.log('🔄 キャッシュクリア完了');
    } else {
      console.log('削除対象のリンクが見つかりませんでした');
    }
    
    console.log('');
    console.log('✅ 処理完了！');
    console.log('記事URL: https://sasakiyoshimasa.com/blog/tateyama-town-shrine');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

removeLinkFromTateyamaShrineArticle();