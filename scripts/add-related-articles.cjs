const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function addRelatedArticles() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事を取得しました:', post.title);
    
    // 関連記事セクションを追加
    const relatedArticlesBlocks = [
      {
        _type: 'block',
        _key: 'related-heading',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'related-heading-span',
          text: '関連記事',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'related-text',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'related-text-span',
          text: '関連記事：氷見市の他の観光スポット、富山県の廃墟・歴史的建造物',
          marks: []
        }],
        markDefs: []
      }
    ];
    
    // まとめの後に関連記事を挿入
    const newBody = [...post.body, ...relatedArticlesBlocks];
    
    console.log(`更新前ブロック数: ${post.body.length}`);
    console.log(`更新後ブロック数: ${newBody.length}`);
    
    await client
      .patch(post._id)
      .set({ body: newBody })
      .commit();
    
    console.log('関連記事セクションを追加しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    throw error;
  }
}

addRelatedArticles();
