const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToSixthArticle() {
  try {
    console.log('🎯 6番目の記事にGoogleマップを追加中...');
    
    // 6番目の記事（砺波市イオンモール鬼滅の刃）を取得
    const articleId = 'jKwgQNCsrs019jNuQGXuNc';
    
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
    
    // 砺波市イオンモールとなみ用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-tonami-aeon-kimetsu-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 イオンモールとなみの場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3211.2!2d136.96!3d36.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff791234567%3A0x456789abcdef123!2z44Kk44Kq44Oz44Oi44O844Or44Go44Gq44G%2F!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">砺波市にある大型ショッピングモールで鬼滅の刃展示が開催中</p>
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
    console.log('📍 場所: イオンモールとなみ（砺波市）');
    console.log('📄 記事: 【砺波市】イオンモールとなみで『劇場版「鬼滅の刃」無限城編』ポスター展開催中！');
    console.log('🎉 6/206記事 完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToSixthArticle();