const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addGoogleMapToOyabe() {
  try {
    console.log('🗺️ Oyabe記事にGoogleマップを追加中...');
    
    // Oyabe記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbqSb"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body.length}`);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // クロスランドおやべのGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-crossland-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 クロスランドおやべの場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3200.7146881343488!2d136.87572017597105!3d36.657313872288285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff82a66597f8fbd%3A0x93519192e96e05d1!2z44Kv44Ot44K544Op44Oz44OJ44GK44KE44G5!5e0!3m2!1sja!2sjp!4v1756172345443!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">小矢部市にある複合文化施設クロスランドおやべです</p></div>'
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
    console.log('📍 場所: クロスランドおやべ（小矢部市鍬打158）');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ 追加エラー:', error.message);
  }
}

addGoogleMapToOyabe();