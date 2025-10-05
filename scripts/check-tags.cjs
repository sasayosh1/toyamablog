const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function checkTags() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]{
      title,
      tags
    }`);
    
    if (!post) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事:', post.title);
    console.log('タグ数:', post.tags?.length || 0);
    
    if (post.tags && post.tags.length > 0) {
      console.log('\nタグ一覧:');
      post.tags.forEach((tag, index) => {
        console.log(`  タグ${index + 1}: ${tag}`);
      });
    } else {
      console.log('タグが設定されていません');
    }
    
  } catch (error) {
    console.error('エラー:', error.message);
    throw error;
  }
}

checkTags();
