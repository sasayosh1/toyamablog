const sanityClient = require('@sanity/client');

const client = sanityClient.createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function removeYoutubeText() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "himi-city-1759547577256"][0]`);
    
    if (!post) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('✅ 記事を取得しました:', post.title);
    
    if (!post.body || !Array.isArray(post.body)) {
      console.log('⚠️ 本文データが見つかりません');
      return;
    }
    
    // 削除対象テキストを含むブロックを特定
    const targetText = 'YouTube動画では魚眠洞の現在の様子をご覧いただけます。氷見市の隠れた魅力を感じていただければ幸いです。';
    
    const newBody = post.body.filter(block => {
      if (block._type === 'block' && block.children) {
        const blockText = block.children.map(c => c.text).join('');
        if (blockText.includes(targetText)) {
          console.log('🔍 削除対象ブロック発見:', blockText);
          return false;
        }
      }
      return true;
    });
    
    if (newBody.length === post.body.length) {
      console.log('⚠️ 削除対象のテキストが見つかりませんでした');
      return;
    }
    
    console.log(`📝 削除前ブロック数: ${post.body.length}`);
    console.log(`📝 削除後ブロック数: ${newBody.length}`);
    
    await client
      .patch(post._id)
      .set({ body: newBody })
      .commit();
    
    console.log('✅ 記事を更新しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    throw error;
  }
}

removeYoutubeText();
