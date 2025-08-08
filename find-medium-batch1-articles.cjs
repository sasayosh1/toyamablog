const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findMediumBatch1Articles() {
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
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
    
    // 1201-1500文字の記事を対象
    if (totalChars > 1200 && totalChars <= 1500) {
      candidates.push({
        slug: post.slug.current,
        title: post.title,
        chars: totalChars,
        category: post.category || 'その他'
      });
    }
  }
  
  // 文字数順でソート（短い順）
  candidates.sort((a, b) => a.chars - b.chars);
  
  console.log('=== 中記事第1バッチ候補（第1-5記事）===');
  const firstBatch = candidates.slice(0, 5); // 1番目から5番目まで
  
  firstBatch.forEach((article, index) => {
    console.log(`第${index + 1}記事:`);
    console.log(`  タイトル: ${article.title}`);
    console.log(`  スラッグ: ${article.slug}`);
    console.log(`  現在文字数: ${article.chars}文字`);
    console.log(`  カテゴリー: ${article.category}`);
    console.log(`  目標文字数: 1800-2200文字 (+${1800 - article.chars}文字以上拡張)`);
    console.log('');
  });
  
  console.log(`中記事総数: ${candidates.length}記事`);
}

findMediumBatch1Articles().catch(console.error);