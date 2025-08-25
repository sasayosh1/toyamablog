const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findMissingThumbnailArticles() {
  try {
    console.log('🔍 サムネイルが表示されていない記事を特定中...');
    
    // 全記事のサムネイル状況を確認
    const articles = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail,
      "thumbnailExists": defined(thumbnail)
    }`);
    
    console.log('総記事数:', articles.length);
    
    // サムネイルがない記事を特定
    const noThumbnailArticles = articles.filter(article => !article.thumbnailExists);
    console.log('サムネイルなしの記事数:', noThumbnailArticles.length);
    
    // YouTube URLがあるのにサムネイルがない記事
    const youtubeButNoThumbnail = noThumbnailArticles.filter(article => article.youtubeUrl);
    console.log('YouTube URLありサムネイルなしの記事数:', youtubeButNoThumbnail.length);
    
    console.log('\n📋 サムネイルが必要な記事一覧:');
    youtubeButNoThumbnail.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.youtubeUrl}`);
      console.log(`   Slug: ${article.slug?.current || 'なし'}`);
      console.log('');
    });
    
    return youtubeButNoThumbnail;
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

findMissingThumbnailArticles();