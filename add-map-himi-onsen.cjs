const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToHimiOnsen() {
  try {
    console.log('🗺️ 氷見市温泉記事にGoogleマップを追加中...');
    
    // 氷見市温泉記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "4zxT7RlbAnSlGPWZgbmUif"][0] {
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
    
    // 九殿浜温泉ひみのはなのGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-himi-onsen-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 九殿浜温泉ひみのはなの場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3189.4269195708907!2d137.02527277598276!3d36.92796427221093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff713bca6214143%3A0xa741bb6c8419966e!2z5rC36KaL44O75Lmd5q6_5rWc5rip5rOJIOOBsuOBv-OBruOBr-OBqg!5e0!3m2!1sja!2sjp!4v1756192773682!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">氷見市にある九殿浜温泉ひみのはなです</p></div>'
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
    console.log('📍 場所: 九殿浜温泉ひみのはな（氷見市）');
    console.log('更新完了！');
    
  } catch (error) {
    console.error('❌ 追加エラー:', error.message);
  }
}

addMapToHimiOnsen();