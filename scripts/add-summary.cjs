const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function addSummary() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('✅ 記事を取得しました:', post.title);
    
    // まとめセクションを追加
    const summaryBlocks = [
      {
        _type: 'block',
        _key: 'summary-heading',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'summary-heading-span',
          text: 'まとめ',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'summary-text',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'summary-text-span',
          text: '魚眠洞は、かつての温泉旅館の姿を残す「知られざる廃墟遺産」として、氷見市の歴史の一部を伝えています。訪問の際は安全に十分注意し、周辺の美しい海岸線や観光スポットも合わせて楽しんでみてください。',
          marks: []
        }],
        markDefs: []
      }
    ];
    
    const newBody = [...post.body, ...summaryBlocks];
    
    console.log(`📝 更新前ブロック数: ${post.body.length}`);
    console.log(`📝 更新後ブロック数: ${newBody.length}`);
    
    await client
      .patch(post._id)
      .set({ body: newBody })
      .commit();
    
    console.log('✅ まとめセクションを追加しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    throw error;
  }
}

addSummary();
