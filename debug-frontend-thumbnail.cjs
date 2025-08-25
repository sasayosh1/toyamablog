const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugFrontendThumbnail() {
  try {
    console.log('🔍 フロントエンド表示の問題を調査中...');
    
    // サムネイルがある記事を数件確認
    const articlesWithThumbnails = await client.fetch(`*[_type == "post" && defined(thumbnail)] | order(_updatedAt desc)[0...5] {
      _id,
      title,
      slug,
      thumbnail {
        asset -> {
          _id,
          url
        },
        alt
      },
      _updatedAt
    }`);
    
    console.log(`📊 サムネイルありの記事: ${articlesWithThumbnails.length}件`);
    
    console.log('\n🖼️ サムネイルありの記事一覧:');
    articlesWithThumbnails.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title.substring(0, 50)}...`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   サムネイル URL: ${article.thumbnail.asset.url}`);
      console.log(`   更新日: ${new Date(article._updatedAt).toLocaleString()}`);
      console.log(`   記事URL: https://sasakiyoshimasa.com/blog/${article.slug.current}`);
    });
    
    // 特に kamiichi-town-temple-2 の詳細を確認
    const kamiichiArticle = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail {
        _type,
        asset -> {
          _id,
          url,
          originalFilename,
          size,
          metadata {
            dimensions,
            hasAlpha,
            lqip
          }
        },
        alt,
        crop,
        hotspot
      },
      excerpt,
      publishedAt,
      _createdAt,
      _updatedAt
    }`);
    
    console.log('\n🎯 kamiichi-town-temple-2 の詳細データ:');
    console.log('記事ID:', kamiichiArticle._id);
    console.log('タイトル:', kamiichiArticle.title);
    console.log('スラッグ:', kamiichiArticle.slug.current);
    console.log('YouTube URL:', kamiichiArticle.youtubeUrl);
    console.log('公開日:', kamiichiArticle.publishedAt);
    console.log('作成日:', new Date(kamiichiArticle._createdAt).toLocaleString());
    console.log('更新日:', new Date(kamiichiArticle._updatedAt).toLocaleString());
    console.log('概要:', kamiichiArticle.excerpt || 'なし');
    
    if (kamiichiArticle.thumbnail) {
      console.log('\n✅ サムネイル詳細:');
      console.log('  タイプ:', kamiichiArticle.thumbnail._type);
      console.log('  アセットID:', kamiichiArticle.thumbnail.asset._id);
      console.log('  URL:', kamiichiArticle.thumbnail.asset.url);
      console.log('  ファイル名:', kamiichiArticle.thumbnail.asset.originalFilename);
      console.log('  サイズ:', kamiichiArticle.thumbnail.asset.size, 'bytes');
      console.log('  Altテキスト:', kamiichiArticle.thumbnail.alt);
      
      if (kamiichiArticle.thumbnail.asset.metadata?.dimensions) {
        console.log('  寸法:', 
          `${kamiichiArticle.thumbnail.asset.metadata.dimensions.width}x${kamiichiArticle.thumbnail.asset.metadata.dimensions.height}`);
      }
      
      if (kamiichiArticle.thumbnail.asset.metadata?.lqip) {
        console.log('  LQIP:', kamiichiArticle.thumbnail.asset.metadata.lqip.substring(0, 50) + '...');
      }
      
      if (kamiichiArticle.thumbnail.crop) {
        console.log('  クロップ:', kamiichiArticle.thumbnail.crop);
      }
      
      if (kamiichiArticle.thumbnail.hotspot) {
        console.log('  ホットスポット:', kamiichiArticle.thumbnail.hotspot);
      }
    }
    
    console.log('\n💡 トラブルシューティング:');
    console.log('1. フロントエンドがupdatedAtを正しく参照しているか');
    console.log('2. GraphQLクエリにthumbnailフィールドが含まれているか');
    console.log('3. 画像変換やリサイズ処理が正常に動作しているか');
    console.log('4. CDNキャッシュの問題か');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

debugFrontendThumbnail();