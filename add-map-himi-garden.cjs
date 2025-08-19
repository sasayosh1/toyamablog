const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addGoogleMapToHimiGarden() {
  try {
    const articleId = '4zxT7RlbAnSlGPWZgbmWMH';
    
    // 現在の記事内容を取得
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { _id, title, body }`);
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事を更新中:', article.title);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // 氷見あいやまガーデンのGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-himi-aiyama-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 氷見あいやまガーデンの場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.2!2d136.98!3d36.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff77123456789%3A0xabcdef123456789!2z5rC35LiA44GC44GE44KE44G+44Ks44O844OH44Oz!5e0!3m2!1sja!2sjp!4v' + Date.now() + '!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">バラやダリアなど四季折々の花が楽しめるガーデンです</p></div>'
    };
    
    // 記事の最後にGoogleマップを追加
    updatedBody.push(googleMapBlock);
    
    // 記事を更新
    await client
      .patch(articleId)
      .set({
        body: updatedBody
      })
      .commit();
    
    console.log('✅ Googleマップを記事の最後に追加しました');
    console.log('📍 場所: 氷見あいやまガーデン');
    console.log('🌹 説明: バラやダリアなど四季折々の花が楽しめるガーデン');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

addGoogleMapToHimiGarden();