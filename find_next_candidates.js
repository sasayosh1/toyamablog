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
  
  console.log('=== 第89-93記事候補（12回目5記事バッチ - 慎重な品質継続）===');
  const next5 = candidates.slice(58, 63); // 84-88記事の次の5記事
  
  next5.forEach((candidate, index) => {
    console.log(`第${89 + index}記事候補:`);
    console.log(`  タイトル: ${candidate.title}`);
    console.log(`  スラッグ: ${candidate.slug}`);
    console.log(`  文字数: ${candidate.chars}文字`);
    console.log(`  カテゴリー: ${candidate.category}`);
    console.log('');
  });
}

findNext5Candidates().catch(console.error);