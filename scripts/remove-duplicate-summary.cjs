const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function removeDuplicateSummary() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('✅ 記事を取得しました:', post.title);
    console.log('現在のブロック数:', post.body?.length || 0);
    
    // まとめH2の位置を特定
    const summaryIndices = [];
    post.body.forEach((block, index) => {
      if (block._type === 'block' && block.style === 'h2') {
        const headingText = block.children?.map(c => c.text).join('') || '';
        if (headingText === 'まとめ') {
          summaryIndices.push(index);
          console.log(`🔍 「まとめ」発見 [${index}]`);
        }
      }
    });
    
    if (summaryIndices.length <= 1) {
      console.log('⚠️ 重複した「まとめ」が見つかりませんでした');
      return;
    }
    
    console.log(`📝 「まとめ」が${summaryIndices.length}個見つかりました`);
    
    // 最初の「まとめ」を削除（最後のものを残す）
    const indexToRemove = summaryIndices[0];
    const newBody = post.body.filter((_, index) => index !== indexToRemove);
    
    console.log(`📝 削除するインデックス: ${indexToRemove}`);
    console.log(`📝 更新後ブロック数: ${newBody.length}`);
    
    await client
      .patch(post._id)
      .set({ body: newBody })
      .commit();
    
    console.log('✅ 重複した「まとめ」を削除しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    throw error;
  }
}

removeDuplicateSummary();
