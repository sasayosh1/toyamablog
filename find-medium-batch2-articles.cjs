const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findMediumBatch2Articles() {
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
  
  console.log('=== 中記事第2バッチ候補（第6-10記事）===');
  const secondBatch = candidates.slice(5, 10); // 6番目から10番目まで
  
  secondBatch.forEach((article, index) => {
    console.log(`第${index + 6}記事:`);
    console.log(`  タイトル: ${article.title}`);
    console.log(`  スラッグ: ${article.slug}`);
    console.log(`  現在文字数: ${article.chars}文字`);
    console.log(`  カテゴリー: ${article.category}`);
    console.log(`  目標文字数: 1800-2200文字 (+${1800 - article.chars}文字以上拡張)`);
    console.log('');
  });
  
  console.log(`中記事総数: ${candidates.length}記事`);
  console.log(`処理済み: 5記事`);
  console.log(`第2バッチ対象: 5記事`);
  console.log(`残り: ${candidates.length - 10}記事`);
}

findMediumBatch2Articles().catch(console.error);