const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToToyamaIllumination() {
  try {
    console.log('🗺️ 富山市イルミネーション記事にGoogleマップを追加中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "vTFXi0ufHZhGd7mVymG5jK"][0] {
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
    
    // 富岩運河環水公園のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-fugan-canal-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 富岩運河環水公園の場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.539936806164!2d137.2102871099588!3d36.70959182723077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff79a0c9f0ead31%3A0xa22b4d88da54f6f3!2z5a-M5bKp6YGL5rKz55Kw5rC05YWs5ZyS!5e0!3m2!1sja!2sjp!4v1756281605001!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">スイートクリスマスイルミネーション2020の美しい光景をお楽しみいただけます</p></div>'
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
    console.log('📍 場所: 富岩運河環水公園（富山市）');
    console.log('✨ スイートクリスマスイルミネーション2020の会場');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ 追加エラー:', error.message);
  }
}

addMapToToyamaIllumination();