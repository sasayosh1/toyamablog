const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function updateRelatedArticles() {
  try {
    // 現在の記事を取得
    const currentPost = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]{
      _id,
      title,
      category,
      tags,
      body
    }`);
    
    if (!currentPost) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('現在の記事:', currentPost.title);
    console.log('カテゴリ:', currentPost.category);
    
    // 関連記事を検索（氷見市の記事を優先、次に富山県の歴史・建造物関連）
    const relatedPosts = await client.fetch(`
      *[_type == "post" && _id != $currentId && defined(slug.current)] | order(publishedAt desc) [0...50] {
        title,
        "slug": slug.current,
        category,
        tags
      }
    `, { currentId: currentPost._id });
    
    console.log(`\n全記事数: ${relatedPosts.length}`);
    
    // 氷見市の記事を検索
    const himiPosts = relatedPosts.filter(p => 
      p.category === '氷見市' || 
      p.title.includes('氷見市') || 
      p.title.includes('【氷見市】')
    );
    
    console.log(`\n氷見市関連記事: ${himiPosts.length}件`);
    himiPosts.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title}`);
    });
    
    // 廃墟・歴史的建造物の記事を検索
    const historicalPosts = relatedPosts.filter(p => 
      p.title.includes('歴史') || 
      p.title.includes('建造物') || 
      p.title.includes('遺産') ||
      p.tags?.includes('歴史') ||
      p.tags?.includes('歴史的建造物')
    );
    
    console.log(`\n歴史・建造物関連記事: ${historicalPosts.length}件`);
    historicalPosts.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title}`);
    });
    
    // 関連記事を2つ選択（氷見市の記事を優先）
    const selectedPosts = [];
    
    if (himiPosts.length > 0) {
      selectedPosts.push(himiPosts[0]);
    }
    
    if (himiPosts.length > 1) {
      selectedPosts.push(himiPosts[1]);
    } else if (historicalPosts.length > 0) {
      selectedPosts.push(historicalPosts[0]);
    }
    
    if (selectedPosts.length === 0) {
      console.log('\n関連記事が見つかりませんでした');
      return;
    }
    
    console.log(`\n選択した関連記事: ${selectedPosts.length}件`);
    selectedPosts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (/${p.slug})`);
    });
    
    // 関連記事H3セクションのインデックスを見つける
    const relatedIndex = currentPost.body.findIndex(block => 
      block._type === 'block' && 
      block.style === 'h3' && 
      block.children?.some(c => c.text === '関連記事')
    );
    
    if (relatedIndex === -1) {
      console.log('\n関連記事セクションが見つかりません');
      return;
    }
    
    // 関連記事テキストを作成
    const relatedText = selectedPosts.map(p => `・${p.title}`).join('\n');
    
    // 関連記事テキストブロックを更新
    const newBody = [...currentPost.body];
    newBody[relatedIndex + 1] = {
      _type: 'block',
      _key: 'related-text',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'related-text-span',
        text: relatedText,
        marks: []
      }],
      markDefs: []
    };
    
    await client
      .patch(currentPost._id)
      .set({ body: newBody })
      .commit();
    
    console.log('\n関連記事を更新しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    throw error;
  }
}

updateRelatedArticles();
