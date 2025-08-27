const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToImoya() {
  try {
    console.log('🗺️ 富山市いも屋記事にGoogleマップを追加中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "vTFXi0ufHZhGd7mVymG1MW"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body ? article.body.length : 0}`);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // いも屋のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-imoya-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 いも屋の場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.0821439411593!2d137.22915247597368!3d36.72058837226998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff799f9b89b3517%3A0xf718ac29a61641ac!2z44GE44KC5bGL!5e0!3m2!1sja!2sjp!4v1756267208524!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">トッピング50円から楽しめる安くて美味しいかき氷のお店です</p></div>'
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
    console.log('📍 場所: いも屋（富山市）');
    console.log('🧊 トッピング50円からのリーズナブルなかき氷店');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ 追加エラー:', error.message);
  }
}

addMapToImoya();