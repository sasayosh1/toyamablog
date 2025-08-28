const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToUozuCircle() {
  try {
    console.log('🗺️ 魚津市東山円筒分水槽記事にGoogleマップを追加中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "vTFXi0ufHZhGd7mVymG4gZ"][0] {
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
    
    // 東山円筒分水槽のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-higashiyama-circle-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 東山円筒分水槽の場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.3656350856977!2d137.45747147597763!3d36.80975737224442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7bab5c56cceeb%3A0x597125a32be12769!2z5p2x5bGx5YaG562S5YiG5rC05qe9!5e0!3m2!1sja!2sjp!4v1756332428881!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">水循環遺産に認定された農業用水利施設です</p></div>'
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
    console.log('📍 場所: 東山円筒分水槽（魚津市）');
    console.log('💧 水循環遺産認定の貴重な農業用水利施設');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ 追加エラー:', error.message);
  }
}

addMapToUozuCircle();