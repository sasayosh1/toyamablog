const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function searchAllYouTubePatterns() {
  try {
    console.log('🔍 すべてのYouTube関連テキストを検索中...');
    
    const posts = await client.fetch(`*[_type == "post"] { _id, title, body }`);
    
    let foundCount = 0;
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      post.body.forEach((block, index) => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          if (text.includes('YouTube') || text.includes('youtube') || text.includes('jNQXAC9IVRw')) {
            console.log('🎯 YouTube関連テキスト発見:');
            console.log(`   記事: ${post.title.substring(0, 50)}...`);
            console.log(`   ブロック${index + 1}: ${text}`);
            console.log('   ---');
            foundCount++;
          }
        }
      });
    }
    
    console.log(`\n📊 検索結果: ${foundCount}件のYouTube関連テキストを発見`);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchAllYouTubePatterns();