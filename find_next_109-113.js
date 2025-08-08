import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findNext109to113() {
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
  
  console.log('=== 第109-113記事候補（最終段階への突入 - 85%目標）===');
  console.log(`総記事数: ${allCandidates.length}記事`);
  
  // 108記事処理済みなので、109記事目以降の候補を表示
  const remaining = allCandidates.slice(108);
  console.log(`残り未処理候補: ${remaining.length}記事`);
  
  if (remaining.length >= 5) {
    const next5 = remaining.slice(0, 5);
    
    next5.forEach((candidate, index) => {
      console.log(`第${109 + index}記事候補:`);
      console.log(`  タイトル: ${candidate.title}`);
      console.log(`  スラッグ: ${candidate.slug}`);
      console.log(`  文字数: ${candidate.chars}文字`);
      console.log(`  カテゴリー: ${candidate.category}`);
      console.log('');
    });
    
    // 文字数分布も表示
    const remainingShort = remaining.filter(a => a.chars <= 500);
    const remainingMedium = remaining.filter(a => a.chars > 500 && a.chars <= 1200);
    const remainingLong = remaining.filter(a => a.chars > 1200);
    
    console.log('=== 残り記事の文字数分布 ===');
    console.log(`短記事（500文字以下）: ${remainingShort.length}記事`);
    console.log(`中記事（501-1200文字）: ${remainingMedium.length}記事`);
    console.log(`長記事（1201文字以上）: ${remainingLong.length}記事`);
    
  } else {
    console.log('\n⚠️ 5記事に満たない候補しか残っていません');
    remaining.forEach((candidate, index) => {
      console.log(`候補${index + 1}: ${candidate.title} (${candidate.chars}文字)`);
    });
  }
}

findNext109to113().catch(console.error);