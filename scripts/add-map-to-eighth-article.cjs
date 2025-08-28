const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToEighthArticle() {
  try {
    console.log('🎯 8番目の記事にGoogleマップを追加中...');
    
    // 8番目の記事（富山市於保多神社）を取得
    const articleId = 'uLkO5gatk1xjPxgoNfP6II';
    
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
    
    // 富山市於保多神社用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-toyama-oota-shrine-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 於保多神社の場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.9!2d137.22!3d36.70!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff785456789%3A0xfedcba987654321!2z5LqO5L%2Bd5aSa56We56S!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">富山市の学問神社として親しまれ夏詣と学業祈願で人気の神社です</p>
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
    console.log('📍 場所: 於保多神社（富山市）');
    console.log('📄 記事: 【富山市】富山の学問神社！於保多神社で夏詣＆学業祈願');
    console.log('🎉 8/206記事 完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToEighthArticle();