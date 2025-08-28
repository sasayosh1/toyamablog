const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToKurobeBeach() {
  try {
    const article = await client.fetch(`*[_type == "post" && slug.current == "kurobe-city-2"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事:', article.title);
    console.log('🗺️ Googleマップ追加中...');
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // 石田浜海水浴場のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-ishidahama-beach-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.8871398233227!2d137.4150501759802!3d36.86912017222761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7a8ca9bf7a079%3A0x5669be9e2b392cb7!2z55-z55Sw5rWc5rW35rC05rW05aC0!5e0!3m2!1sja!2sjp!4v1756346591885!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
    };
    
    // 記事の最後にGoogleマップを追加
    updatedBody.push(googleMapBlock);
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: updatedBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ Googleマップを記事の最後に追加しました');
    console.log('📍 場所: 石田浜海水浴場（黒部市）');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToKurobeBeach();