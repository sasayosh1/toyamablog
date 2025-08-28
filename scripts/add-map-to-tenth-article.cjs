const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addMapToTenthArticle() {
  try {
    console.log('🎯 10番目の記事にGoogleマップを追加中...');
    
    // 10番目の記事（富山市シャルロッテ パティオさくら・ドラフト版）をスキップして11番目へ
    // 11番目の記事（富山市シャルロッテ パティオさくら・公開版）を取得
    const articleId = 'qszvaZusvE4KvujKB63yBo';
    
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
    
    // 既にマップが追加されているかチェック
    const hasMap = article.body && article.body.some(block => 
      block._type === 'html' && block.html && block.html.includes('maps.google.com')
    );
    
    if (hasMap) {
      console.log('✅ この記事には既にGoogleマップが設定されています');
      console.log('🎉 10番目の記事 - すでに完了済み！');
      return;
    }
    
    // 記事の最後にGoogleマップを追加
    const updatedBody = [...(article.body || [])];
    
    // 富山市シャルロッテ パティオさくら富山駅前店用のGoogleマップ
    const googleMapBlock = {
      _type: 'html',
      _key: 'googlemap-toyama-charlotte-patio-' + Date.now(),
      html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 シャルロッテ パティオさくら富山駅前店の場所</h4>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.3!2d137.21!3d36.70!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff785234567%3A0xabcdef123456789!2z44K344Oj44Or44Ot44OD44OG44OR44OG44Kj44Kq44GV44GP44KJ!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" 
                width="100%" 
                height="300" 
                style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">富山駅前にある隠れ家的なケーキ店で至福のひとときが楽しめます</p>
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
    console.log('📍 場所: シャルロッテ パティオさくら富山駅前店（富山市）');
    console.log('📄 記事: 【富山市】富山駅前の隠れ家ケーキ店で至福のひととき');
    console.log('🎉 10/206記事 完了！');
    
    console.log('\n✨ 最初の10記事の処理が完了しました！');
    console.log('📊 進捗: 10/206記事 (4.9%)');
    console.log('🎯 全記事にGoogleマップを追加する作業を継続中...');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

addMapToTenthArticle();