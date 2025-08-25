const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function finalThumbnailVerification() {
  try {
    console.log('🎯 最終確認: kamiichi-town-temple-2のサムネイル状況');
    
    // 記事データを詳細取得
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail {
        asset -> {
          _id,
          url,
          originalFilename,
          size
        },
        alt
      },
      publishedAt,
      _updatedAt
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事情報:');
    console.log('  タイトル:', article.title);
    console.log('  スラッグ:', article.slug.current);
    console.log('  YouTube URL:', article.youtubeUrl);
    console.log('  公開日:', article.publishedAt);
    console.log('  最終更新:', new Date(article._updatedAt).toLocaleString());
    
    if (article.thumbnail && article.thumbnail.asset) {
      console.log('\n✅ サムネイル情報:');
      console.log('  アセットID:', article.thumbnail.asset._id);
      console.log('  画像URL:', article.thumbnail.asset.url);
      console.log('  ファイル名:', article.thumbnail.asset.originalFilename);
      console.log('  サイズ:', article.thumbnail.asset.size, 'bytes');
      console.log('  Alt テキスト:', article.thumbnail.alt);
      
      // 画像URLの直接テスト
      console.log('\n🧪 画像URL直接アクセステスト:');
      try {
        const imageResponse = await fetch(article.thumbnail.asset.url);
        console.log('  ステータス:', imageResponse.status);
        console.log('  Content-Type:', imageResponse.headers.get('content-type'));
        console.log('  Content-Length:', imageResponse.headers.get('content-length'), 'bytes');
        
        if (imageResponse.ok) {
          console.log('  ✅ 画像は正常にアクセス可能です');
        } else {
          console.log('  ❌ 画像アクセスに問題があります');
        }
      } catch (fetchError) {
        console.log('  ❌ 画像アクセスエラー:', fetchError.message);
      }
      
      console.log('\n🔗 確認用URL:');
      console.log('  記事ページ: https://sasakiyoshimasa.com/blog/' + article.slug.current);
      console.log('  サムネイル画像: ' + article.thumbnail.asset.url);
      console.log('  YouTube動画: ' + article.youtubeUrl);
      
    } else {
      console.log('\n❌ サムネイルが設定されていません');
      return;
    }
    
    // 他の成功例と比較
    console.log('\n🔍 比較用: 他のサムネイル付き記事');
    const otherArticles = await client.fetch(`*[_type == "post" && defined(thumbnail) && slug.current != "kamiichi-town-temple-2"] | order(_updatedAt desc)[0...3] {
      title,
      slug,
      thumbnail { asset -> { url } },
      _updatedAt
    }`);
    
    otherArticles.forEach((other, index) => {
      console.log(`  ${index + 1}. ${other.title.substring(0, 40)}...`);
      console.log(`     スラッグ: ${other.slug.current}`);
      console.log(`     画像URL: ${other.thumbnail.asset.url}`);
      console.log(`     更新: ${new Date(other._updatedAt).toLocaleString()}`);
      console.log('');
    });
    
    console.log('🎉 データレベルでの確認完了');
    console.log('');
    console.log('💡 もしブラウザでサムネイルが表示されない場合:');
    console.log('1. ブラウザでCtrl+Shift+R (強制リロード)');
    console.log('2. ブラウザキャッシュをクリア');
    console.log('3. シークレット/プライベートモードで確認');
    console.log('4. 別のブラウザで確認');
    console.log('5. 5-10分待ってから再確認');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

finalThumbnailVerification();