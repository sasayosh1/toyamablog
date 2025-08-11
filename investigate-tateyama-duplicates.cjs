const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function investigateTateyamaDuplicates() {
  try {
    console.log('🔍 tateyama-town-3記事の重複調査を開始...\n');
    
    // 1. slug「tateyama-town-3」で記事を検索
    console.log('1. Slug "tateyama-town-3" での記事検索:');
    const articlesBySlug = await client.fetch(`
      *[_type == "post" && slug.current == "tateyama-town-3"] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        category,
        youtubeUrl,
        publishedAt,
        excerpt,
        tags
      }
    `);
    
    console.log(`📊 見つかった記事数: ${articlesBySlug.length}`);
    articlesBySlug.forEach((article, index) => {
      console.log(`\n📝 記事 ${index + 1}:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   カテゴリー: ${article.category}`);
      console.log(`   作成日: ${article._createdAt}`);
      console.log(`   更新日: ${article._updatedAt}`);
      console.log(`   公開日: ${article.publishedAt}`);
      console.log(`   YouTube URL: ${article.youtubeUrl}`);
      console.log(`   Excerpt: ${article.excerpt}`);
      console.log(`   タグ数: ${article.tags?.length || 0}`);
    });

    // 2. タイトルに「ヘルジアン・ウッド」「立山町」が含まれる記事を検索
    console.log('\n\n2. タイトルに"ヘルジアン・ウッド"または"立山町"が含まれる記事:');
    const relatedArticles = await client.fetch(`
      *[_type == "post" && (title match "*ヘルジアン・ウッド*" || title match "*立山町*")] {
        _id,
        _createdAt,
        title,
        slug,
        category,
        youtubeUrl,
        publishedAt
      }
    `);
    
    console.log(`📊 関連記事数: ${relatedArticles.length}`);
    relatedArticles.forEach((article, index) => {
      console.log(`\n📝 関連記事 ${index + 1}:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   カテゴリー: ${article.category}`);
      console.log(`   作成日: ${article._createdAt}`);
      console.log(`   公開日: ${article.publishedAt}`);
      console.log(`   YouTube URL: ${article.youtubeUrl}`);
    });

    // 3. YouTube URL「https://youtu.be/HHwdGY71Vds」での検索
    console.log('\n\n3. YouTube URL "https://youtu.be/HHwdGY71Vds" での記事検索:');
    const articlesByYoutube = await client.fetch(`
      *[_type == "post" && youtubeUrl == "https://youtu.be/HHwdGY71Vds"] {
        _id,
        _createdAt,
        title,
        slug,
        category,
        youtubeUrl,
        publishedAt
      }
    `);
    
    console.log(`📊 同一YouTube URL記事数: ${articlesByYoutube.length}`);
    articlesByYoutube.forEach((article, index) => {
      console.log(`\n📝 YouTube記事 ${index + 1}:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   カテゴリー: ${article.category}`);
      console.log(`   作成日: ${article._createdAt}`);
      console.log(`   公開日: ${article.publishedAt}`);
    });

    // 4. カテゴリー「立山町」の記事一覧
    console.log('\n\n4. カテゴリー "立山町" の全記事:');
    const tateyamaCategoryArticles = await client.fetch(`
      *[_type == "post" && category == "立山町"] | order(_createdAt desc) {
        _id,
        _createdAt,
        title,
        slug,
        youtubeUrl,
        publishedAt
      }
    `);
    
    console.log(`📊 立山町カテゴリー記事数: ${tateyamaCategoryArticles.length}`);
    tateyamaCategoryArticles.forEach((article, index) => {
      console.log(`\n📝 立山町記事 ${index + 1}:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   作成日: ${article._createdAt}`);
      console.log(`   公開日: ${article.publishedAt}`);
      console.log(`   YouTube URL: ${article.youtubeUrl}`);
    });

    // 5. 重複分析
    console.log('\n\n🔍 重複分析結果:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    if (articlesBySlug.length > 1) {
      console.log(`⚠️  SLUG重複: "tateyama-town-3"で${articlesBySlug.length}件の記事が見つかりました`);
    } else if (articlesBySlug.length === 1) {
      console.log(`✅ SLUG正常: "tateyama-town-3"の記事は1件のみです`);
    } else {
      console.log(`❌ SLUG不存在: "tateyama-town-3"の記事が見つかりませんでした`);
    }
    
    if (articlesByYoutube.length > 1) {
      console.log(`⚠️  YouTube URL重複: 同一動画で${articlesByYoutube.length}件の記事が見つかりました`);
    }

    // 6. サムネイル画像の有無確認
    console.log('\n\n6. サムネイル画像設定の確認:');
    const articlesWithImages = await client.fetch(`
      *[_type == "post" && slug.current == "tateyama-town-3"] {
        _id,
        title,
        slug,
        mainImage,
        youtubeUrl
      }
    `);
    
    articlesWithImages.forEach((article, index) => {
      console.log(`\n📝 記事 ${index + 1} 画像情報:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   メイン画像: ${article.mainImage ? '設定済み' : '未設定'}`);
      if (article.mainImage) {
        console.log(`   画像詳細:`, article.mainImage);
      }
    });

    return {
      slugDuplicates: articlesBySlug,
      youtubeDuplicates: articlesByYoutube,
      relatedArticles: relatedArticles,
      categoryArticles: tateyamaCategoryArticles
    };

  } catch (error) {
    console.error('❌ 調査エラー:', error);
    return { success: false, error: error.message };
  }
}

// 実行
investigateTateyamaDuplicates()
  .then(result => {
    console.log('\n🎯 調査完了！');
  })
  .catch(error => {
    console.error('実行エラー:', error);
  });