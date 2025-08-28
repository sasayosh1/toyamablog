const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findKurobeArticle() {
  try {
    console.log('🔍 黒部市石田浜海水浴場記事を検索中...');
    
    // kurobe-city-2記事を検索
    let article = await client.fetch(`*[_type == "post" && slug.current == "kurobe-city-2"][0] {
      _id, title, slug
    }`);
    
    if (!article) {
      // 石田浜関連記事を検索
      const articles = await client.fetch(`*[_type == "post" && title match "*石田浜*"] {
        _id, title, slug
      }`);
      console.log('石田浜関連記事:');
      articles.forEach(post => {
        console.log('- ID:', post._id, '| タイトル:', post.title, '| スラッグ:', post.slug?.current);
      });
      
      if (articles.length > 0) {
        article = articles[0];
      }
    }
    
    if (article) {
      console.log('✅ 記事が見つかりました:');
      console.log('   ID:', article._id);
      console.log('   タイトル:', article.title);
      console.log('   スラッグ:', article.slug?.current);
    } else {
      console.log('❌ 該当する記事が見つかりませんでした');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

findKurobeArticle();