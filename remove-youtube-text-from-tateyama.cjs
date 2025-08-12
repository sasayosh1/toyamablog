const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeYouTubeTextFromTateyama() {
  try {
    console.log('🔍 立山町神社記事の本文を確認中...');
    
    // slug が tateyama-town-shrine の記事を検索
    const post = await client.fetch(`*[_type == "post" && slug.current == "tateyama-town-shrine"][0] {
      _id,
      title,
      body
    }`);
    
    if (!post) {
      console.log('❌ tateyama-town-shrine の記事が見つかりませんでした');
      return;
    }
    
    console.log('✅ 記事を発見:', post.title);
    console.log('📝 本文ブロック数:', post.body ? post.body.length : 0);
    
    if (!post.body || !Array.isArray(post.body)) {
      console.log('❌ 本文が見つかりませんでした');
      return;
    }
    
    // YouTube関連のブロックや「[YouTube: HKt17t3MgE0]」のテキストを含むブロックを除去
    const filteredBody = post.body.filter((block, index) => {
      // YouTubeショーツブロックを除去
      if (block._type === 'youtubeShorts') {
        console.log(`🗑️ ブロック ${index + 1}: youtubeShortsブロックを削除`);
        return false;
      }
      
      // YouTubeブロックを除去
      if (block._type === 'youtube') {
        console.log(`🗑️ ブロック ${index + 1}: youtubeブロックを削除`);
        return false;
      }
      
      // テキストブロック内の「[YouTube: HKt17t3MgE0]」を含むブロックをチェック
      if (block._type === 'block' && block.children) {
        const hasYouTubeText = block.children.some(child => 
          child.text && (
            child.text.includes('[YouTube: HKt17t3MgE0]') ||
            child.text.includes('YouTube: HKt17t3MgE0') ||
            child.text.includes('HKt17t3MgE0')
          )
        );
        
        if (hasYouTubeText) {
          console.log(`🗑️ ブロック ${index + 1}: YouTube関連テキストを含むブロックを削除`);
          console.log(`   内容: ${block.children.map(c => c.text).join('')}`);
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`📊 削除前: ${post.body.length} ブロック`);
    console.log(`📊 削除後: ${filteredBody.length} ブロック`);
    
    if (filteredBody.length === post.body.length) {
      console.log('✅ 削除対象のブロックは見つかりませんでした');
      return;
    }
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: filteredBody })
      .commit();
    
    console.log('✅ YouTube関連テキストを削除しました');
    console.log(`🔄 ${post.body.length - filteredBody.length} 個のブロックを削除`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

removeYouTubeTextFromTateyama();