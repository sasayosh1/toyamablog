const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function deepSearchYouTubeRefs() {
  try {
    console.log('🔍 YouTube引用の詳細検索中...');
    
    // 特定の動画IDを含む記事を検索
    const posts = await client.fetch(`*[_type == "post"] {
      _id, title, slug, body, youtubeUrl
    }`);
    
    console.log(`📊 検索対象: ${posts.length}件の記事`);
    
    const problematicPosts = [];
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      const issues = [];
      
      post.body.forEach((block, index) => {
        let text = '';
        
        if (block._type === 'block' && block.children) {
          text = block.children.map(child => child.text).join('');
        } else if (block._type === 'html' && block.html) {
          text = block.html;
        }
        
        // より厳密なパターンチェック
        const patterns = [
          /\[YouTube:\s*[A-Za-z0-9_-]+\]/i,    // [YouTube: videoId]
          /YouTube\s*Shorts?:\s*https?:\/\//i,   // YouTube Shorts: URL
          /mlTLMYgjD_Q/,                            // 特定の動画ID
          /jNQXAC9IVRw/,                            // 特定の動画ID
        ];
        
        patterns.forEach((pattern, patternIndex) => {
          if (pattern.test(text)) {
            issues.push({
              blockIndex: index + 1,
              blockType: block._type,
              patternType: [
                'YouTube ID参照',
                'YouTube Shorts URL',
                '特定動画ID mlTLMYgjD_Q',
                '特定動画ID jNQXAC9IVRw'
              ][patternIndex],
              content: text.substring(0, 150) + (text.length > 150 ? '...' : '')
            });
          }
        });
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
    
    console.log(`\\n🔍 詳細検索結果: ${problematicPosts.length}件の記事で問題を発見`);
    
    if (problematicPosts.length === 0) {
      console.log('✅ YouTube引用は完全にクリーンアップされています');
      return [];
    }
    
    // 詳細表示と修正
    console.log('\\n⚠️ 修正が必要な記事:');
    for (const post of problematicPosts) {
      console.log(`\\n📄 ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post.id}`);
      console.log(`   スラッグ: ${post.slug}`);
      console.log(`   YouTube URL: ${post.youtubeUrl}`);
      console.log(`   問題箇所: ${post.issues.length}件`);
      
      post.issues.forEach((issue, issueIdx) => {
        console.log(`     ${issueIdx + 1}. ブロック${issue.blockIndex} (${issue.blockType}): ${issue.patternType}`);
        console.log(`        内容: ${issue.content}`);
      });
      
      // この記事を修正
      await fixArticle(post.id);
    }
    
    return problematicPosts;
    
  } catch (error) {
    console.error('❌ 検索エラー:', error.message);
    return [];
  }
}

async function fixArticle(articleId) {
  try {
    console.log(`\\n🔧 記事 ${articleId} を修正中...`);
    
    const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] {
      _id, title, body
    }`);
    
    if (!article || !article.body) return;
    
    const cleanedBody = article.body.filter((block) => {
      let text = '';
      
      if (block._type === 'block' && block.children) {
        text = block.children.map(child => child.text).join('');
      } else if (block._type === 'html' && block.html) {
        text = block.html;
      }
      
      const shouldRemove = (
        /\[YouTube:\s*[A-Za-z0-9_-]+\]/i.test(text) ||
        /YouTube\s*Shorts?:\s*https?:\/\//i.test(text) ||
        text.includes('mlTLMYgjD_Q') ||
        text.includes('jNQXAC9IVRw')
      );
      
      if (shouldRemove) {
        console.log(`   🗑️ 削除: ${text.substring(0, 100)}...`);
        return false;
      }
      
      return true;
    });
    
    if (cleanedBody.length !== article.body.length) {
      await client
        .patch(articleId)
        .set({
          body: cleanedBody,
          _updatedAt: new Date().toISOString()
        })
        .commit();
      
      console.log(`   ✅ 修正完了: ${article.body.length - cleanedBody.length}ブロック削除`);
    }
    
  } catch (error) {
    console.error(`❌ 記事修正エラー (${articleId}):`, error.message);
  }
}

deepSearchYouTubeRefs().then(results => {
  console.log(`\\n🏁 詳細検索完了: ${results.length}件の記事で修正実行`);
});