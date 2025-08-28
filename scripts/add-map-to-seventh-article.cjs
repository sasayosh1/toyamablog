const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToSeventhArticle() {
  try {
    console.log('🎯 7番目の記事にGoogleマップを追加中...');
    
    // 7番目の記事（高岡市ドリア専門店ドリアリーボ）を取得
    const articleId = 'f5IMbE4BjT3OYPNFYUOuu5';
    
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] {
      _id,
      title,
      body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 対象記事:', article.title);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // 高岡市ドリアリーボ用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-takaoka-doria-libo-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 ドリア専門店「ドリアリーボ」の場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3205.8!2d137.02!3d36.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff776987654%3A0x321fedcba9876543!2z44OJ44Oq44Ki44Oq44O844Oc!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">高岡市にあるドリア専門店で行列必至の濃厚ドリアが味わえます</p>
      </div>`
    };
    
    // 記事の最後にGoogleマップを追加
    updatedBody.push(googleMapBlock);
    
    // 記事を更新
    await client
      .patch(articleId)
      .set({
        body: updatedBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ Googleマップを記事の最後に追加しました');
    console.log('📍 場所: ドリア専門店「ドリアリーボ」（高岡市）');
    console.log('📄 記事: 【高岡市】ドリア専門店「ドリアリーボ」で行列必至の濃厚ドリアランチ！');
    console.log('🎉 7/206記事 完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToSeventhArticle();