const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToNantoArticle() {
  try {
    const articleId = '7gNGK9M49tqCuJRraovihd';
    
    console.log('🗺️ 南砺市パティスリーまちなみラパン記事にマップを追加中...');
    
    // 現在の記事内容を取得
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { _id, title, body }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事:', article.title);
    
    // 既存のマップがあるかチェック
    let hasExistingMap = false;
    if (article.body) {
      hasExistingMap = article.body.some(block => 
        block._type === 'html' && 
        block.html && 
        block.html.includes('maps')
      );
    }
    
    if (hasExistingMap) {
      console.log('✅ この記事には既にマップが設定されています');
      return;
    }
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // パティスリーまちなみラパンのGoogleマップ用HTMLブロック（南砺市）
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-patisserie-lapin-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.8435616884567!2d136.96403337596644!3d36.55788477231723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff8279d022acf1b%3A0x93993e91f5e43fe0!2z44OR44OG44Kj44K544Oq44O8IOOBvuOBoeOBquOBv-ODqeODkeODs!5e0!3m2!1sja!2sjp!4v1756423727354!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
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
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToNantoArticle();