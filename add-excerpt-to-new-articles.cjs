const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addExcerptToNewArticles() {
  try {
    console.log('📝 新しい記事に説明文（excerpt）を追加中...');
    
    // 1. ドリアリーボ記事のexcerpt追加
    const doriaArticleId = 'f5IMbE4BjT3OYPNFYUOuu5';
    const doriaExcerpt = '高岡市にあるドリア専門店「ドリアリーボ」で、行列必至の濃厚で美味しいドリアランチを体験。専門店ならではの本格的な味わいをご紹介します。';
    
    await client.patch(doriaArticleId).set({ excerpt: doriaExcerpt }).commit();
    console.log('✅ ドリアリーボ記事にexcerptを追加しました');
    
    // 2. 於保多神社記事も確認（既存記事だが念のため）
    const ooitaArticle = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-ooita-shrine-summer-visit"][0] { _id, excerpt }`);
    
    if (ooitaArticle && !ooitaArticle.excerpt) {
      const ooitaExcerpt = '富山市にある於保多（おおた）神社は、学問の神様として地元の人々に深く愛され続けている由緒ある神社です。夏詣での参拝体験と学業祈願の魅力をご紹介。';
      
      await client.patch(ooitaArticle._id).set({ excerpt: ooitaExcerpt }).commit();
      console.log('✅ 於保多神社記事にもexcerptを追加しました');
    } else if (ooitaArticle && ooitaArticle.excerpt) {
      console.log('✅ 於保多神社記事は既にexcerptが設定済みです');
    }
    
    // 3. 確認のため記事情報を表示
    const updatedDoria = await client.fetch(`*[_type == "post" && _id == "${doriaArticleId}"][0] { title, excerpt }`);
    const updatedOoita = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-ooita-shrine-summer-visit"][0] { title, excerpt }`);
    
    console.log('\\n📊 更新結果:');
    console.log('\\n1. ドリアリーボ記事:');
    console.log(`   タイトル: ${updatedDoria.title}`);
    console.log(`   説明文: ${updatedDoria.excerpt}`);
    
    if (updatedOoita) {
      console.log('\\n2. 於保多神社記事:');
      console.log(`   タイトル: ${updatedOoita.title}`);
      console.log(`   説明文: ${updatedOoita.excerpt}`);
    }
    
    console.log('\\n✅ 記事カードに説明文が表示されるようになります');
    console.log('🔄 変更はブログサイトに自動反映されます');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ excerpt追加エラー:', error);
    return { success: false, error: error.message };
  }
}

addExcerptToNewArticles();