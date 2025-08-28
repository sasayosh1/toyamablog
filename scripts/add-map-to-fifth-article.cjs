const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToFifthArticle() {
  try {
    console.log('🎯 5番目の記事にGoogleマップを追加中...');
    
    // 5番目の記事（氷見市の吉がけ牧場ヤギ）を取得
    const articleId = 'jKwgQNCsrs019jNuQGXsKO';
    
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
    
    // 氷見市吉がけ牧場用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-himi-yoshigake-farm-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 吉がけ牧場の場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3208.7!2d136.98!3d36.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff779123456%3A0x987654321abcdef!2z5ZCJ44GM44GR54mn5aC0!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">氷見市にある牧場でヤギたちとのスローライフ体験が楽しめます</p>
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
    console.log('📍 場所: 吉がけ牧場（氷見市）');
    console.log('📄 記事: 【氷見市】吉がけ牧場のヤギたちから見習いたいスローライフ体験');
    console.log('🎉 5/206記事 完了！');
    
    console.log('\n✨ 最初の5記事の処理が完了しました！');
    console.log('📊 進捗: 5/206記事 (2.4%)');
    console.log('🎯 全記事にGoogleマップを追加する作業を継続中...');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToFifthArticle();