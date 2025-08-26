const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function searchYouTubeShortsURL() {
  try {
    console.log('🔍 YouTube Shorts URL形式を検索中...');
    
    const posts = await client.fetch(`*[_type == "post"] { _id, title, body }`);
    
    let foundCount = 0;
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      post.body.forEach((block, index) => {
        let text = '';
        
        if (block._type === 'block' && block.children) {
          text = block.children.map(child => child.text).join('');
        } else if (block._type === 'html' && block.html) {
          text = block.html;
        }
        
        if (text.includes('YouTube Shorts:') || text.includes('jNQXAC9IVRw')) {
          console.log('🎯 発見!');
          console.log(`   記事: ${post.title}`);
          console.log(`   ID: ${post._id}`);
          console.log(`   ブロック${index + 1} (${block._type}): ${text}`);
          console.log('   ---');
          foundCount++;
        }
      });
    }
    
    if (foundCount === 0) {
      console.log('✅ 「YouTube Shorts:」形式のURLは見つかりませんでした');
    } else {
      console.log(`📊 検索結果: ${foundCount}件の該当箇所を発見`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

searchYouTubeShortsURL();