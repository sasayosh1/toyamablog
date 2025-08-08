const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkRemainingArticles() {
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
    
    // 500文字以下のみを対象
    if (totalChars <= 500) {
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
  
  console.log(`=== 残り超短記事分析 ===`);
  console.log(`総超短記事数: ${candidates.length}記事`);
  console.log(`処理済み: 50記事`);
  console.log(`残り: ${candidates.length - 50}記事`);
  
  if (candidates.length > 50) {
    console.log('\n=== 第51記事以降 ===');
    const remaining = candidates.slice(50);
    remaining.forEach((article, index) => {
      console.log(`第${index + 51}記事:`);
      console.log(`  タイトル: ${article.title}`);
      console.log(`  スラッグ: ${article.slug}`);
      console.log(`  現在文字数: ${article.chars}文字`);
      console.log(`  カテゴリー: ${article.category}`);
      console.log('');
    });
  } else {
    console.log('\n🎉 超短記事の処理が完了しました！');
    
    // 次に処理する短記事（501-1200文字）を確認
    const shortCandidates = [];
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      let totalChars = 0;
      post.body.forEach(block => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text || '').join('');
          totalChars += text.length;
        }
      });
      
      // 501-1200文字の記事を対象
      if (totalChars > 500 && totalChars <= 1200) {
        shortCandidates.push({
          slug: post.slug.current,
          title: post.title,
          chars: totalChars,
          category: post.category || 'その他'
        });
      }
    }
    
    shortCandidates.sort((a, b) => a.chars - b.chars);
    console.log(`\n=== 短記事（501-1200文字）分析 ===`);
    console.log(`短記事総数: ${shortCandidates.length}記事`);
    
    if (shortCandidates.length > 0) {
      console.log('\n=== 最初の10記事 ===');
      shortCandidates.slice(0, 10).forEach((article, index) => {
        console.log(`第${index + 1}記事:`);
        console.log(`  タイトル: ${article.title}`);
        console.log(`  スラッグ: ${article.slug}`);
        console.log(`  現在文字数: ${article.chars}文字`);
        console.log(`  カテゴリー: ${article.category}`);
        console.log(`  目標文字数: 1500-2000文字 (+${1500 - article.chars}文字以上拡張)`);
        console.log('');
      });
    }
  }
}

checkRemainingArticles().catch(console.error);