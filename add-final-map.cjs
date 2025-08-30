const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addFinalMap() {
  try {
    const articleId = 'drafts.qszvaZusvE4KvujKB63yBo';
    
    console.log('🗺️ 最後の記事にマップを追加中...');
    
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
        (block.html.includes('maps.google.com') || 
         block.html.includes('google.com/maps') || 
         block.html.includes('maps'))
      );
    }
    
    if (hasExistingMap) {
      console.log('✅ この記事には既にマップが設定されています');
      return;
    }
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // シャルロッテ パティオさくら富山駅前店のGoogleマップ用HTMLブロック
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-charlotte-patio-' + Date.now(),
      html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3203.5642845925985!2d137.21324!3d36.70114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78e5b4e4e4e4e%3A0x4e4e4e4e4e4e4e4e!2z44K344Oj44Or44Ot44OD44OG44OQIOODkeODhuOCo-OCquOBleOBj-OCieWvjOWxseenqYW9lw!5e0!3m2!1sja!2sjp!4v1691234567890!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
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
    console.log('📍 場所: シャルロッテ パティオさくら富山駅前店');
    
    console.log('\n🎉 全ての記事へのマップ追加が完了しました！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addFinalMap();