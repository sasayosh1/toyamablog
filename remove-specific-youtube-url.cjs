const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findAndRemoveYoutubeShortsURL() {
  try {
    console.log('🔍 YouTube Shorts URL「jNQXAC9IVRw」を検索中...');
    
    const posts = await client.fetch(`*[_type == "post"] {
      _id, title, slug, body
    }`);
    
    console.log(`📊 検索対象: ${posts.length}件の記事`);
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      let foundBlock = false;
      post.body.forEach((block, index) => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          if (text.includes('jNQXAC9IVRw') || text.includes('YouTube Shorts: https://www.youtube.com/shorts/jNQXAC9IVRw')) {
            console.log(`🎯 発見! 記事: ${post.title}`);
            console.log(`   ID: ${post._id}`);
            console.log(`   ブロック${index + 1}: ${text}`);
            foundBlock = true;
          }
        }
      });
      
      if (foundBlock) {
        // この記事を修正
        const cleanedBody = post.body.filter((block) => {
          if (block._type !== 'block' || !block.children) {
            return true;
          }
          
          const text = block.children.map(child => child.text).join('');
          const shouldRemove = (
            text.includes('jNQXAC9IVRw') ||
            text.includes('YouTube Shorts: https://www.youtube.com/shorts/jNQXAC9IVRw')
          );
          
          if (shouldRemove) {
            console.log(`🗑️ 削除: ${text}`);
            return false;
          }
          
          return true;
        });
        
        if (cleanedBody.length !== post.body.length) {
          await client
            .patch(post._id)
            .set({
              body: cleanedBody,
              _updatedAt: new Date().toISOString()
            })
            .commit();
          
          console.log(`✅ 修正完了: ${post.title}`);
        }
      }
    }
    
    console.log('\n🎉 YouTube Shorts URL「jNQXAC9IVRw」の削除が完了しました！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

findAndRemoveYoutubeShortsURL();