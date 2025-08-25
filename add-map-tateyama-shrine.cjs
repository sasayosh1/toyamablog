const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToTateyamaShrine() {
  try {
    console.log('🗺️ 立山町神社記事にGoogleマップを追加中...');
    
    const articleId = '4zxT7RlbAnSlGPWZgbmZsk';
    
    // 現在の記事内容を取得
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { _id, title, body }`);
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事を更新中:', article.title);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // 雄山神社前立社壇のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-oyamajinja-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.771965160314!2d137.31221197596878!3d36.607800772302625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152f7601967d8e09%3A0x5341a5b67a4c4726!2z6ZuE5bGx56We56S-IOWJjeeri-ekvuWjhw!5e0!3m2!1sja!2sjp!4v1755853381375!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
    };
    
    // 記事の最後にGoogleマップを追加
    updatedBody.push(googleMapBlock);
    
    // 記事を更新
    await client
      .patch(articleId)
      .set({
        body: updatedBody
      })
      .commit();
    
    console.log('✅ Googleマップを記事の最後に追加しました');
    console.log('📍 場所: 雄山神社前立社壇');
    
    // キャッシュクリア
    await client.patch(articleId).set({ _updatedAt: new Date().toISOString() }).commit();
    console.log('🔄 キャッシュクリア完了');
    
    console.log('');
    console.log('✅ 更新完了！');
    console.log('記事URL: https://sasakiyoshimasa.com/blog/tateyama-town-shrine');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

addMapToTateyamaShrine();