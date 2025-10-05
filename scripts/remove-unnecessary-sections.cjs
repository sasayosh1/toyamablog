const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function removeUnnecessarySections() {
  try {
    // 1. 記事を取得
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('✅ 記事を取得しました:', post.title);
    console.log('現在の本文ブロック数:', post.body?.length || 0);
    
    // 2. 不要なセクションを特定して削除
    if (!post.body || !Array.isArray(post.body)) {
      console.log('⚠️ 本文データが見つかりません');
      return;
    }
    
    // 削除対象の見出しを定義
    const sectionsToRemove = [
      '氷見市阿尾地区の魅力',
      '氷見市の観光スポット'
    ];
    
    // 各セクションの開始位置を特定
    const indicesToRemove = [];
    post.body.forEach((block, index) => {
      if (block._type === 'block' && block.style === 'h2') {
        const headingText = block.children?.map(c => c.text).join('') || '';
        if (sectionsToRemove.includes(headingText)) {
          console.log(`🔍 削除対象セクション発見 [${index}]:`, headingText);
          // このH2とその後の本文ブロックを削除対象に追加
          indicesToRemove.push(index);
          // 次のH2またはまとめが来るまでのブロックも削除
          for (let i = index + 1; i < post.body.length; i++) {
            const nextBlock = post.body[i];
            if (nextBlock._type === 'block' && nextBlock.style === 'h2') {
              break; // 次のH2が来たら終了
            }
            indicesToRemove.push(i);
          }
        }
      }
    });
    
    if (indicesToRemove.length === 0) {
      console.log('⚠️ 削除対象のセクションが見つかりませんでした');
      console.log('現在のH2見出し一覧:');
      post.body.forEach((block, index) => {
        if (block._type === 'block' && block.style === 'h2') {
          const headingText = block.children?.map(c => c.text).join('') || '';
          console.log(`  [${index}] ${headingText}`);
        }
      });
      return;
    }
    
    // 3. 削除対象以外のブロックのみを残す
    const newBody = post.body.filter((_, index) => !indicesToRemove.includes(index));
    
    console.log(`📝 削除ブロック数: ${indicesToRemove.length}`);
    console.log(`📝 新しい本文ブロック数: ${newBody.length}`);
    
    // 4. Sanityデータベースを更新
    const result = await client
      .patch(post._id)
      .set({ body: newBody })
      .commit();
    
    console.log('✅ 記事を更新しました');
    console.log('更新後のH2見出し一覧:');
    newBody.forEach((block, index) => {
      if (block._type === 'block' && block.style === 'h2') {
        const headingText = block.children?.map(c => c.text).join('') || '';
        console.log(`  [${index}] ${headingText}`);
      }
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    throw error;
  }
}

removeUnnecessarySections();
