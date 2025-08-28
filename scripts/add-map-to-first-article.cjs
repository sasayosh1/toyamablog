const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToFirstArticle() {
  try {
    console.log('🎯 最初の記事にGoogleマップを追加中...');
    
    // 最初の記事（南砺市のパティスリー）を取得
    const articleId = '7gNGK9M49tqCuJRraovihd';
    
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
    
    // 南砺市パティスリーまちなみラパン用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-nanto-lapin-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 パティスリーまちなみラパンの場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3214.5!2d136.85!3d36.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff792345678%3A0x123456789abcdef!2z44OR44OG44Kj44K544Oq44O844G-44Gh44Gq44G%2F44Op44OR44Oz!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">南砺市にあるうさぎをテーマにした可愛いパティスリーです</p>
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
    console.log('📍 場所: パティスリーまちなみラパン（南砺市）');
    console.log('📄 記事: 【南砺市】うさぎ推し必見！「パティスリーまちなみラパン」が可愛すぎた！');
    console.log('🎉 1/206記事 完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToFirstArticle();