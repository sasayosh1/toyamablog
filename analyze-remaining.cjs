const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findRemainingArticles() {
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
  console.log('=== 全記事文字数分析 ===');
  console.log(`総記事数: ${posts.length}記事`);
  
  const candidates = [];
  for (const post of posts) {
    if (!post.body || !Array.isArray(post.body)) continue;
    
    let totalChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        totalChars += text.length;
      }
    });
    
    candidates.push({
      slug: post.slug.current,
      title: post.title,
      chars: totalChars,
      category: post.category || 'その他'
    });
  }
  
  candidates.sort((a, b) => a.chars - b.chars);
  
  // 文字数別分類
  const shortArticles = candidates.filter(a => a.chars <= 500);
  const mediumArticles = candidates.filter(a => a.chars > 500 && a.chars <= 1200);
  const longArticles = candidates.filter(a => a.chars > 1200 && a.chars <= 1500);
  const veryLongArticles = candidates.filter(a => a.chars > 1500);
  
  console.log('');
  console.log('=== 文字数分布 ===');
  console.log(`超短記事（500文字以下）: ${shortArticles.length}記事`);
  console.log(`短記事（501-1200文字）: ${mediumArticles.length}記事`);
  console.log(`中記事（1201-1500文字）: ${longArticles.length}記事`);
  console.log(`長記事（1501文字以上）: ${veryLongArticles.length}記事`);
  
  // 処理対象の候補を表示
  const needsProcessing = candidates.filter(a => a.chars <= 1500);
  console.log('');
  console.log('=== 拡張対象候補 ===');
  console.log(`拡張対象: ${needsProcessing.length}記事`);
  
  if (needsProcessing.length > 0) {
    console.log('');
    console.log('次の10記事候補:');
    needsProcessing.slice(0, 10).forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.title}`);
      console.log(`   スラッグ: ${candidate.slug}`);
      console.log(`   文字数: ${candidate.chars}文字`);
      console.log(`   カテゴリー: ${candidate.category}`);
      console.log('');
    });
  }
  
  console.log('=== 処理優先度分析 ===');
  if (shortArticles.length > 0) {
    console.log(`🔴 最優先: 超短記事 ${shortArticles.length}記事 (500文字以下)`);
  }
  if (mediumArticles.length > 0) {
    console.log(`🟡 高優先: 短記事 ${mediumArticles.length}記事 (501-1200文字)`);
  }
  if (longArticles.length > 0) {
    console.log(`🟢 中優先: 中記事 ${longArticles.length}記事 (1201-1500文字)`);
  }
  console.log(`✅ 完了済み: 長記事 ${veryLongArticles.length}記事 (1501文字以上)`);
}

findRemainingArticles().catch(console.error);