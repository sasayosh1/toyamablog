const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function getHimiArticleId() {
  try {
    const query = `*[_type == "post" && slug.current == "himi-city-1757253039364"][0]{
      _id,
      title
    }`;
    
    const article = await client.fetch(query);
    
    if (article) {
      console.log('📄 氷見市記事情報:');
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
    } else {
      console.log('❌ 記事が見つかりません');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

getHimiArticleId();