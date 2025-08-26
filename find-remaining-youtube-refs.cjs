const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findRemainingYouTubeRefs() {
  try {
    console.log('🔍 残りのYouTube引用を全記事から検索中...');
    
    // 全記事を取得
    const posts = await client.fetch(`*[_type == "post"] {
      _id, title, slug, body
    }`);
    
    console.log(`📊 検索対象: ${posts.length}件の記事`);
    
    const problematicPosts = [];
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      const issues = [];
      
      post.body.forEach((block, index) => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // YouTube引用パターンをチェック
          if (text.includes('[YouTube:') || 
              text.includes('YouTube Shorts:') ||
              text.match(/\\[YouTube:\\s*[A-Za-z0-9_-]+\\]/)) {
            issues.push({
              blockIndex: index + 1,
              content: text.substring(0, 100) + (text.length > 100 ? '...' : '')
            });
          }
        }
      });
      
      if (issues.length > 0) {
        problematicPosts.push({
          id: post._id,
          title: post.title,
          slug: post.slug?.current,
          issues: issues
        });
      }
    }
    
    console.log(`\\n🔍 検出結果: ${problematicPosts.length}件の記事で問題を発見`);
    
    if (problematicPosts.length === 0) {
      console.log('✅ YouTube引用の残りは見つかりませんでした');
      return [];
    }
    
    // 詳細表示
    console.log('\\n⚠️ 修正が必要な記事:');
    problematicPosts.forEach((post, idx) => {
      console.log(`\\n${idx + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post.id}`);
      console.log(`   スラッグ: ${post.slug}`);
      console.log(`   問題箇所: ${post.issues.length}件`);
      
      post.issues.forEach((issue, issueIdx) => {
        console.log(`     ${issueIdx + 1}. ブロック${issue.blockIndex}: ${issue.content}`);
      });
    });
    
    return problematicPosts;
    
  } catch (error) {
    console.error('❌ 検索エラー:', error.message);
    return [];
  }
}

findRemainingYouTubeRefs().then(results => {
  console.log(`\\n🏁 検索完了: ${results.length}件の記事で修正が必要`);
});