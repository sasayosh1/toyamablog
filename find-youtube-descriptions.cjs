const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findYouTubeDescriptions() {
  try {
    console.log('🔍 全記事でYouTube概要欄からの引用をチェック中...');
    
    // YouTube動画付きの記事を取得
    const posts = await client.fetch(`*[_type == "post" && defined(youtubeUrl)] {
      _id, title, slug, youtubeUrl, body
    } | order(publishedAt desc)`);
    
    console.log(`📊 検索対象: ${posts.length}件のYouTube動画付き記事`);
    
    const problematicPosts = [];
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      const issues = [];
      
      post.body.forEach((block, index) => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // YouTube概要欄っぽい内容をチェック
          const patterns = [
            /\[YouTube:\s*[A-Za-z0-9_-]+\]/,          // [YouTube: videoId]
            /【公式】.*HP/,                             // 【公式】...HP
            /https?:\/\/[^\s]+/,                       // URL
            /#[^\s#]+/,                                // ハッシュタグ
            /YouTube Shorts:\s*https?:\/\/[^\s]+/,     // YouTube Shorts: URL
            /▼.*HP/,                                   // ▼...HP
          ];
          
          patterns.forEach((pattern, patternIndex) => {
            if (pattern.test(text)) {
              issues.push({
                blockIndex: index + 1,
                patternType: [
                  'YouTube ID参照',
                  '公式HP',
                  'URL',
                  'ハッシュタグ',
                  'YouTube Shorts URL',
                  '公式サイト矢印'
                ][patternIndex],
                content: text.substring(0, 100) + (text.length > 100 ? '...' : '')
              });
            }
          });
        }
      });
      
      if (issues.length > 0) {
        problematicPosts.push({
          id: post._id,
          title: post.title,
          slug: post.slug?.current,
          youtubeUrl: post.youtubeUrl,
          issues: issues
        });
      }
    }
    
    console.log(`\n🔍 検出結果: ${problematicPosts.length}件の記事で問題を発見`);
    
    if (problematicPosts.length === 0) {
      console.log('✅ YouTube概要欄からの引用は見つかりませんでした');
      return [];
    }
    
    // 上位10件を詳細表示
    console.log('\n⚠️ クリーンアップが必要な記事:');
    problematicPosts.slice(0, 10).forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post.id}`);
      console.log(`   スラッグ: ${post.slug}`);
      console.log(`   YouTube: ${post.youtubeUrl.substring(0, 50)}...`);
      console.log(`   問題箇所: ${post.issues.length}件`);
      
      post.issues.forEach((issue, issueIdx) => {
        console.log(`     ${issueIdx + 1}. ブロック${issue.blockIndex}: ${issue.patternType}`);
        console.log(`        内容: ${issue.content}`);
      });
    });
    
    if (problematicPosts.length > 10) {
      console.log(`\n... 他 ${problematicPosts.length - 10} 件`);
    }
    
    return problematicPosts;
    
  } catch (error) {
    console.error('❌ 検索エラー:', error.message);
    return [];
  }
}

findYouTubeDescriptions().then(results => {
  console.log(`\n🏁 検索完了: ${results.length}件の記事で修正が必要`);
});