const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addVideoAndMapToTonami() {
  try {
    const articleId = 'vTFXi0ufHZhGd7mVymG65h';
    const videoUrl = 'https://youtu.be/CcuOzMYAlGs';
    
    console.log('砺波市チューリップ四季彩館記事に動画とマップを追加中...');
    console.log('記事ID:', articleId);
    console.log('動画URL:', videoUrl);
    
    // 現在の記事内容を取得
    const article = await client.fetch('*[_type == "post" && _id == "' + articleId + '"][0] { _id, title, body }');
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事タイトル:', article.title);
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // チューリップ四季彩館のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-tulip-gallery-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3209.5!2d136.96!3d36.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff791abcdef123%3A0x456789abcdef789!2z44OB44Ol44O844Oq44OD44OX5Zub5a2j5b2p6aSo!5e0!3m2!1sja!2sjp!4v' + Date.now() + '!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
    };
    
    // 記事の最後にGoogleマップを追加
    updatedBody.push(googleMapBlock);
    
    // YouTube URLと本文を更新
    await client
      .patch(articleId)
      .set({
        youtubeUrl: videoUrl,
        body: updatedBody
      })
      .commit();
    
    console.log('✅ YouTube URLを追加しました:', videoUrl);
    console.log('✅ Googleマップを記事の最後に追加しました');
    console.log('📍 場所: チューリップ四季彩館（砺波市）');
    
    // 更新後の確認
    const updatedArticle = await client.fetch('*[_type == "post" && _id == "' + articleId + '"][0] { title, youtubeUrl }');
    console.log('\n📊 更新確認:');
    console.log('記事:', updatedArticle.title);
    console.log('YouTube URL:', updatedArticle.youtubeUrl);
    console.log('\n✅ 更新完了！');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

addVideoAndMapToTonami();