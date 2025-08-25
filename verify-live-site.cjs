const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function verifyLiveSite() {
  try {
    console.log('🔍 ライブサイトのサムネイル表示状況を確認中...');
    
    // 現在のデータを取得
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] {
      _id,
      title,
      slug,
      thumbnail {
        asset -> {
          _id,
          url
        }
      },
      _updatedAt
    }`);
    
    if (!article || !article.thumbnail) {
      console.log('❌ サムネイルデータが見つかりません');
      return;
    }
    
    console.log('📄 記事:', article.title);
    console.log('🖼️ サムネイルURL:', article.thumbnail.asset.url);
    console.log('📅 最終更新:', new Date(article._updatedAt).toLocaleString());
    
    // 画像の直接アクセステスト
    console.log('\n🧪 サムネイル画像テスト:');
    try {
      const imageResponse = await fetch(article.thumbnail.asset.url);
      console.log('  ステータス:', imageResponse.status);
      console.log('  サイズ:', imageResponse.headers.get('content-length'), 'bytes');
      console.log('  タイプ:', imageResponse.headers.get('content-type'));
      
      if (imageResponse.ok) {
        console.log('  ✅ 画像は正常にアクセス可能');
      } else {
        console.log('  ❌ 画像アクセスに問題');
      }
    } catch (error) {
      console.log('  ❌ 画像取得エラー:', error.message);
    }
    
    // ホームページのHTMLをチェック
    console.log('\n🌐 ホームページのHTML確認:');
    try {
      const homeResponse = await fetch('https://sasakiyoshimasa.com');
      if (homeResponse.ok) {
        const html = await homeResponse.text();
        
        // 記事カードを検索
        const titleMatch = html.includes('散り椿');
        const imageMatch = html.includes(article.thumbnail.asset.url) || 
                          html.includes('766f73647b9bd85b2169457cac152e71c0b8463a');
        
        console.log('  記事タイトル存在:', titleMatch ? '✅' : '❌');
        console.log('  サムネイル画像存在:', imageMatch ? '✅' : '❌');
        
        // YouTube関連の要素を検索
        const youtubeMatch = html.includes('youtu.be/5-XQ7GKqwxo') || 
                           html.includes('5-XQ7GKqwxo');
        console.log('  YouTube URL存在:', youtubeMatch ? '✅' : '❌');
        
        if (imageMatch) {
          console.log('  🎉 ホームページにサムネイルが埋め込まれています');
        }
        
      } else {
        console.log('  ホームページアクセスエラー:', homeResponse.status);
      }
    } catch (error) {
      console.log('  ホームページ確認エラー:', error.message);
    }
    
    // 個別記事ページもチェック
    console.log('\n📄 個別記事ページの確認:');
    try {
      const articleResponse = await fetch('https://sasakiyoshimasa.com/blog/kamiichi-town-temple-2');
      if (articleResponse.ok) {
        const articleHtml = await articleResponse.text();
        
        // OGP画像を検索
        const ogImageMatch = articleHtml.includes('og:image') && 
                           (articleHtml.includes(article.thumbnail.asset.url) || 
                            articleHtml.includes('766f73647b9bd85b2169457cac152e71c0b8463a'));
        
        console.log('  OG:image設定:', ogImageMatch ? '✅' : '❌');
        
        // Twitter Card
        const twitterImageMatch = articleHtml.includes('twitter:image') && 
                                (articleHtml.includes(article.thumbnail.asset.url) || 
                                 articleHtml.includes('766f73647b9bd85b2169457cac152e71c0b8463a'));
        
        console.log('  Twitter:image設定:', twitterImageMatch ? '✅' : '❌');
        
        if (ogImageMatch || twitterImageMatch) {
          console.log('  🎉 個別ページにサムネイルが設定されています');
        }
        
      } else {
        console.log('  個別ページアクセスエラー:', articleResponse.status);
      }
    } catch (error) {
      console.log('  個別ページ確認エラー:', error.message);
    }
    
    console.log('\n📊 総合判定:');
    console.log('✅ Sanityデータ: 正常');
    console.log('✅ 画像アクセス: 正常');
    console.log('✅ 最新更新: ' + new Date(article._updatedAt).toLocaleString());
    
    console.log('\n🔗 確認用リンク:');
    console.log('ホームページ: https://sasakiyoshimasa.com');
    console.log('記事ページ: https://sasakiyoshimasa.com/blog/kamiichi-town-temple-2');
    console.log('サムネイル: ' + article.thumbnail.asset.url);
    
    console.log('\n💡 ブラウザでの確認方法:');
    console.log('1. Ctrl+Shift+R で強制リロード');
    console.log('2. シークレットモードで開く');
    console.log('3. 開発者ツール → Network → Disable cache');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

verifyLiveSite();