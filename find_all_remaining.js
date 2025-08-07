import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findAllRemaining() {
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
    
    // 全記事を対象に（文字数制限なし）
    allCandidates.push({
      slug: post.slug.current,
      title: post.title,
      chars: totalChars,
      category: post.category || 'その他'
    });
  }
  
  allCandidates.sort((a, b) => a.chars - b.chars);
  
  console.log('=== 全記事検索結果 ===');
  console.log(`総記事数: ${allCandidates.length}記事`);
  
  // 文字数別分布を確認
  const shortArticles = allCandidates.filter(a => a.chars <= 300);
  const mediumArticles = allCandidates.filter(a => a.chars > 300 && a.chars <= 1000);
  const longArticles = allCandidates.filter(a => a.chars > 1000);
  
  console.log(`短記事（300文字以下）: ${shortArticles.length}記事`);
  console.log(`中記事（301-1000文字）: ${mediumArticles.length}記事`);
  console.log(`長記事（1001文字以上）: ${longArticles.length}記事`);
  
  // 98記事処理済みと仮定して、残り33記事の候補を探す
  const processed = 98;
  const remaining = allCandidates.length - processed;
  console.log(`\n処理済み: ${processed}記事`);
  console.log(`残り: ${remaining}記事`);
  
  if (remaining > 0) {
    console.log('\n=== 残り記事の文字数分布 ===');
    const remainingArticles = allCandidates.slice(processed);
    const remainingShort = remainingArticles.filter(a => a.chars <= 300);
    const remainingMedium = remainingArticles.filter(a => a.chars > 300 && a.chars <= 1000);
    const remainingLong = remainingArticles.filter(a => a.chars > 1000);
    
    console.log(`短記事: ${remainingShort.length}記事`);
    console.log(`中記事: ${remainingMedium.length}記事`);
    console.log(`長記事: ${remainingLong.length}記事`);
    
    // 次の5記事候補を表示（中記事を優先）
    console.log('\n=== 第99-103記事候補（中記事優先）===');
    const nextCandidates = remainingMedium.length >= 5 ? 
                          remainingMedium.slice(0, 5) : 
                          remainingArticles.slice(0, 5);
                          
    nextCandidates.forEach((candidate, index) => {
      console.log(`第${99 + index}記事候補:`);
      console.log(`  タイトル: ${candidate.title}`);
      console.log(`  スラッグ: ${candidate.slug}`);
      console.log(`  文字数: ${candidate.chars}文字`);
      console.log(`  カテゴリー: ${candidate.category}`);
      console.log('');
    });
  }
}

findAllRemaining().catch(console.error);