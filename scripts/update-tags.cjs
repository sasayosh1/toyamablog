const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function updateTags() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事:', post.title);
    console.log('現在のタグ数:', post.tags?.length || 0);
    
    // 記事内容に基づいた適切なタグ（10個程度）
    const newTags = [
      '富山県',
      '氷見市',
      '魚眠洞',
      '廃墟',
      '温泉旅館',
      '阿尾',
      '歴史的建造物',
      '観光スポット',
      '富山湾',
      '氷見の歴史'
    ];
    
    console.log('\n新しいタグ:', newTags.length, '個');
    newTags.forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag}`);
    });
    
    await client
      .patch(post._id)
      .set({ tags: newTags })
      .commit();
    
    console.log('\nタグを更新しました');
    
  } catch (error) {
    console.error('エラー:', error.message);
    throw error;
  }
}

updateTags();
