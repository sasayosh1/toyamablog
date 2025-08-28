const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToNinthArticle() {
  try {
    console.log('🎯 9番目の記事にGoogleマップを追加中...');
    
    // 9番目の記事（富山市環水公園サマーファウンテン）を取得
    const articleId = 'rtuM5GmqOByzZCRYAQl3vv';
    
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
    
    // 富山市環水公園用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-toyama-kansui-fountain-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 富岩運河環水公園の場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.1!2d137.21!3d36.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78514e2a8b4c5%3A0x9b1e3a2c4d5e6f78!2z5a%2Bz5bKp6YGL5rKz55Kw5rC05YWs5ZyS!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">富山市の人気観光スポットでサマーファウンテンショーが楽しめます</p>
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
    console.log('📍 場所: 富岩運河環水公園（富山市）');
    console.log('📄 記事: 【富山市】涼感MAX！環水公園サマーファウンテン2025で夏の暑さを吹き飛ばそう');
    console.log('🎉 9/206記事 完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToNinthArticle();