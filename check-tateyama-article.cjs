const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkTateyamaArticle() {
  try {
    console.log('🔍 立山町神社記事の最新状態を確認中...');
    
    const post = await client.fetch(`*[_type == "post" && slug.current == "tateyama-town-shrine"][0] {
      _id,
      title,
      youtubeUrl,
      body,
      _updatedAt
    }`);
    
    if (!post) {
      console.log('❌ 記事が見つかりませんでした');
      return;
    }
    
    console.log('✅ 記事情報:');
    console.log(`   タイトル: ${post.title}`);
    console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
    console.log(`   最終更新: ${post._updatedAt}`);
    console.log(`   本文ブロック数: ${post.body ? post.body.length : 0}`);
    
    if (post.body && Array.isArray(post.body)) {
      console.log('\n📝 本文ブロック内容:');
      let foundYouTubeContent = false;
      
      post.body.forEach((block, index) => {
        if (block._type === 'youtubeShorts') {
          console.log(`   ブロック ${index + 1}: YouTube Shorts - ${block.url || 'URL不明'}`);
          foundYouTubeContent = true;
        } else if (block._type === 'youtube') {
          console.log(`   ブロック ${index + 1}: YouTube - ${block.url || 'URL不明'}`);
          foundYouTubeContent = true;
        } else if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          if (text.includes('YouTube') || text.includes('HKt17t3MgE0')) {
            console.log(`   ブロック ${index + 1}: テキスト - ${text.substring(0, 200)}...`);
            foundYouTubeContent = true;
          }
        }
      });
      
      if (!foundYouTubeContent) {
        console.log('   ✅ YouTube関連の不要なブロックは見つかりませんでした');
      }
    }
    
    console.log('\n🔄 CDNキャッシュを強制更新中...');
    
    // 軽微な更新でCDNキャッシュを無効化
    await client
      .patch(post._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();
    
    console.log('✅ CDNキャッシュ無効化完了');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkTateyamaArticle();