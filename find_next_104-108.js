import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findNext104to108() {
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
  const allCandidates = [];
  for (const post of posts) {
    if (!post.body || !Array.isArray(post.body)) continue;
    
    let totalChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        totalChars += text.length;
      }
    });
    
    // 全記事を対象に
    allCandidates.push({
      slug: post.slug.current,
      title: post.title,
      chars: totalChars,
      category: post.category || 'その他'
    });
  }
  
  allCandidates.sort((a, b) => a.chars - b.chars);
  
  console.log('=== 第104-108記事候補（80%到達への加速継続）===');
  console.log(`総記事数: ${allCandidates.length}記事`);
  
  // 103記事処理済みなので、104記事目以降の候補を表示
  const remaining = allCandidates.slice(103);
  console.log(`残り未処理候補: ${remaining.length}記事`);
  
  if (remaining.length >= 5) {
    const next5 = remaining.slice(0, 5);
    
    next5.forEach((candidate, index) => {
      console.log(`第${104 + index}記事候補:`);
      console.log(`  タイトル: ${candidate.title}`);
      console.log(`  スラッグ: ${candidate.slug}`);
      console.log(`  文字数: ${candidate.chars}文字`);
      console.log(`  カテゴリー: ${candidate.category}`);
      console.log('');
    });
  } else {
    console.log('\n⚠️ 5記事に満たない候補しか残っていません');
    remaining.forEach((candidate, index) => {
      console.log(`候補${index + 1}: ${candidate.title} (${candidate.chars}文字)`);
    });
  }
}

findNext104to108().catch(console.error);