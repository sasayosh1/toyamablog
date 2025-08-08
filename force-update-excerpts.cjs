const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceUpdateExcerpts() {
  try {
    console.log('🔄 記事の説明文を強制更新し、キャッシュクリア...');
    
    // 1. ドリアリーボ記事の現状確認
    const doriaArticle = await client.fetch(`*[_type == "post" && youtubeUrl match "*InojJTFLQ1o*"][0] { _id, title, excerpt, slug }`);
    
    if (doriaArticle) {
      console.log('📋 ドリアリーボ記事の現状:');
      console.log(`   ID: ${doriaArticle._id}`);
      console.log(`   タイトル: ${doriaArticle.title}`);
      console.log(`   現在のexcerpt: "${doriaArticle.excerpt || 'なし'}"`);
      console.log(`   スラッグ: ${doriaArticle.slug?.current || 'なし'}`);
    }
    
    // 2. 於保多神社記事の現状確認
    const ooitaArticle = await client.fetch(`*[_type == "post" && youtubeUrl match "*N2BgquZ0-Xg*"][0] { _id, title, excerpt, slug }`);
    
    if (ooitaArticle) {
      console.log('\\n📋 於保多神社記事の現状:');
      console.log(`   ID: ${ooitaArticle._id}`);
      console.log(`   タイトル: ${ooitaArticle.title}`);
      console.log(`   現在のexcerpt: "${ooitaArticle.excerpt || 'なし'}"`);
      console.log(`   スラッグ: ${ooitaArticle.slug?.current || 'なし'}`);
    }
    
    // 3. 強制的に説明文を更新（timestampを追加してキャッシュバスト）
    if (doriaArticle) {
      const doriaExcerpt = '高岡市にあるドリア専門店「ドリアリーボ」で、行列必至の濃厚で美味しいドリアランチを体験。専門店ならではの本格的な味わいをご紹介します。';
      
      await client
        .patch(doriaArticle._id)
        .set({ 
          excerpt: doriaExcerpt,
          _updatedAt: new Date().toISOString() // キャッシュバスト
        })
        .commit();
      
      console.log('\\n✅ ドリアリーボ記事を強制更新しました');
    }
    
    if (ooitaArticle) {
      const ooitaExcerpt = '富山市の於保多神社は学問の神様として地元で親しまれている神社です。夏詣で心身を清め、学業成就を願う特別な参拝体験をご紹介します。';
      
      await client
        .patch(ooitaArticle._id)
        .set({ 
          excerpt: ooitaExcerpt,
          _updatedAt: new Date().toISOString() // キャッシュバスト
        })
        .commit();
      
      console.log('✅ 於保多神社記事を強制更新しました');
    }
    
    // 4. CDNキャッシュクリアのためのトリガー
    console.log('\\n🔄 CDNキャッシュクリアトリガー実行中...');
    
    // いくつかの記事をわずかに更新してCDNキャッシュを無効化
    const samplePosts = await client.fetch(`*[_type == "post"][0...3] { _id }`);
    for (const post of samplePosts) {
      await client
        .patch(post._id)
        .set({ _updatedAt: new Date().toISOString() })
        .commit();
    }
    
    console.log('\\n🎯 完了！以下の方法で確認してください:');
    console.log('1. ブラウザで https://sasakiyoshimasa.com にアクセス');
    console.log('2. Ctrl+F5 (Windows) / Cmd+Shift+R (Mac) で強制リロード');
    console.log('3. ブラウザのキャッシュをクリア');
    console.log('4. 5-10分後に再確認（CDN更新待ち）');
    
    console.log('\\n📱 もし問題が続く場合:');
    console.log('- シークレット/プライベートブラウジングモードで確認');
    console.log('- 異なるブラウザで確認');
    console.log('- 数時間後に再確認（完全なCDN更新）');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ 強制更新エラー:', error);
    return { success: false, error: error.message };
  }
}

forceUpdateExcerpts();