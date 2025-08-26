const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function replaceGreenMarketMap() {
  try {
    console.log('🔄 グリーンマーケット富山南店記事のGoogleマップを差し替え中...');
    
    // 記事を取得
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbpjR"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 処理対象: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body ? article.body.length : 0}`);
    
    // 既存のGoogleマップのHTMLブロックを見つけて差し替え
    const updatedBody = article.body.map(block => {
      if (block._type === 'html' && block.html && block.html.includes('maps/embed')) {
        console.log('🗺️ 既存のGoogleマップブロックを発見 - 差し替えます');
        return {
          ...block,
          html: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d40391.4199538078!2d137.14970304932115!3d36.632279620258814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78e760bae8cf1%3A0xe47472a6553d5b7f!2z44Kw44Oq44O844Oz44Oe44O844Kx44OD44OIIOWvjOWxseWNl-W6lw!5e0!3m2!1sja!2sjp!4v1756244730266!5m2!1sja!2sjp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
        };
      }
      return block;
    });
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: updatedBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ Googleマップを新しいものに差し替えました');
    console.log('📍 場所: グリーンマーケット 富山南店（更新版）');
    console.log('🔄 差し替え完了！');
    
  } catch (error) {
    console.error('❌ 差し替えエラー:', error.message);
  }
}

replaceGreenMarketMap();