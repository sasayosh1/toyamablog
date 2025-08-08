const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheBustExcerpts() {
  try {
    console.log('🚀 強制キャッシュバスティングを実行中...');
    
    // 1. 問題の記事を特定して詳細確認
    const doriaArticle = await client.fetch(`*[_type == "post" && youtubeUrl match "*InojJTFLQ1o*"][0] {
      _id, 
      title, 
      excerpt, 
      slug,
      _updatedAt,
      publishedAt
    }`);
    
    const ooitaArticle = await client.fetch(`*[_type == "post" && youtubeUrl match "*N2BgquZ0-Xg*"][0] {
      _id, 
      title, 
      excerpt, 
      slug,
      _updatedAt,
      publishedAt
    }`);
    
    console.log('\n📋 現在の記事状況:');
    
    if (doriaArticle) {
      console.log('🍽️ ドリアリーボ記事:');
      console.log(`   ID: ${doriaArticle._id}`);
      console.log(`   タイトル: ${doriaArticle.title}`);
      console.log(`   Excerpt: "${doriaArticle.excerpt || '❌ なし'}"`);
      console.log(`   スラッグ: ${doriaArticle.slug?.current || '❌ なし'}`);
      console.log(`   更新日時: ${doriaArticle._updatedAt}`);
    }
    
    if (ooitaArticle) {
      console.log('\\n⛩️ 於保多神社記事:');
      console.log(`   ID: ${ooitaArticle._id}`);
      console.log(`   タイトル: ${ooitaArticle.title}`);
      console.log(`   Excerpt: "${ooitaArticle.excerpt || '❌ なし'}"`);
      console.log(`   スラッグ: ${ooitaArticle.slug?.current || '❌ なし'}`);
      console.log(`   更新日時: ${ooitaArticle._updatedAt}`);
    }
    
    // 2. 強制的にexcerptを再設定（タイムスタンプ付き）
    const timestamp = new Date().toISOString();
    
    if (doriaArticle) {
      const newExcerpt = `高岡市にあるドリア専門店「ドリアリーボ」で、行列必至の濃厚で美味しいドリアランチを体験。専門店ならではの本格的な味わいをご紹介します。`;
      
      await client
        .patch(doriaArticle._id)
        .set({
          excerpt: newExcerpt,
          _updatedAt: timestamp,
          // publishedAtも更新してキャッシュを強制無効化
          publishedAt: timestamp
        })
        .commit();
      
      console.log('\\n✅ ドリアリーボ記事を強制更新');
    }
    
    if (ooitaArticle) {
      const newExcerpt = `富山市の於保多神社は学問の神様として地元で親しまれている神社です。夏詣で心身を清め、学業成就を願う特別な参拝体験をご紹介します。`;
      
      await client
        .patch(ooitaArticle._id)
        .set({
          excerpt: newExcerpt,
          _updatedAt: timestamp,
          // publishedAtも更新してキャッシュを強制無効化
          publishedAt: timestamp
        })
        .commit();
      
      console.log('✅ 於保多神社記事を強制更新');
    }
    
    // 3. 他の記事も少し更新してCDN全体をリフレッシュ
    console.log('\\n🔄 CDN全体リフレッシュのため複数記事を更新中...');
    
    const randomPosts = await client.fetch(`*[_type == "post"][0...5] { _id }`);
    for (const post of randomPosts) {
      await client
        .patch(post._id)
        .set({ _updatedAt: timestamp })
        .commit();
    }
    
    // 4. Next.js ISRを強制トリガー（revalidateエンドポイントを呼び出し）
    console.log('\\n🎯 Next.js ISR強制リビルドを実行...');
    
    try {
      const revalidateUrl = 'https://sasakiyoshimasa.com/api/revalidate';
      const revalidateResponse = await fetch(revalidateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: 'blog_revalidate_secret_2025_secure_token_xyz', // .env.localのREVALIDATE_SECRET
          path: '/' // ホームページを再生成
        })
      });
      
      if (revalidateResponse.ok) {
        console.log('✅ ISR revalidate成功');
      } else {
        console.log('⚠️ ISR revalidateの応答:', revalidateResponse.status);
      }
    } catch (revalidateError) {
      console.log('⚠️ ISR revalidateエラー（続行）:', revalidateError.message);
    }
    
    console.log('\\n🏁 キャッシュバスティング完了！');
    console.log('\\n📱 確認手順:');
    console.log('1. プライベート/シークレットモードでブラウザを開く');
    console.log('2. https://sasakiyoshimasa.com にアクセス');
    console.log('3. ドリアリーボと於保多神社の記事カードを確認');
    console.log('4. 説明文が表示されているかチェック');
    
    console.log('\\n⏰ 完全反映まで数分かかる場合があります');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ キャッシュバスティングエラー:', error);
    return { success: false, error: error.message };
  }
}

forceCacheBustExcerpts();