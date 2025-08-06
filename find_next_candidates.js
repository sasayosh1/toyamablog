import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findNext5Candidates() {
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
    
    if (totalChars <= 300 && totalChars > 50) {
      candidates.push({
        slug: post.slug.current,
        title: post.title,
        chars: totalChars,
        category: post.category || 'その他'
      });
    }
  }
  
  candidates.sort((a, b) => a.chars - b.chars);
  
  console.log('=== 第79-83記事候補（10回目5記事バッチ - 60%大台突破）===');
  const next5 = candidates.slice(48, 53); // 74-78記事の次の5記事
  
  next5.forEach((candidate, index) => {
    console.log(`第${79 + index}記事候補:`);
    console.log(`  タイトル: ${candidate.title}`);
    console.log(`  スラッグ: ${candidate.slug}`);
    console.log(`  文字数: ${candidate.chars}文字`);
    console.log(`  カテゴリー: ${candidate.category}`);
    console.log('');
  });
}

findNext5Candidates().catch(console.error);