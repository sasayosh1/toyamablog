const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkRemainingShortArticles() {
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
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
  
  console.log(`=== 短記事（501-1200文字）全体状況 ===`);
  console.log(`短記事総数: ${shortCandidates.length}記事`);
  console.log(`処理済み: 10記事`);
  console.log(`残り: ${shortCandidates.length - 10}記事`);
  
  if (shortCandidates.length > 10) {
    console.log('\n=== 第11記事以降の残り短記事 ===');
    const remaining = shortCandidates.slice(10);
    remaining.forEach((article, index) => {
      console.log(`第${index + 11}記事:`);
      console.log(`  タイトル: ${article.title}`);
      console.log(`  スラッグ: ${article.slug}`);
      console.log(`  現在文字数: ${article.chars}文字`);
      console.log(`  カテゴリー: ${article.category}`);
      console.log('');
    });
  } else {
    console.log('\n🎉 短記事の処理が完了しました！');
    
    // 次に処理する中記事（1201-1500文字）を確認
    const mediumCandidates = [];
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
        mediumCandidates.push({
          slug: post.slug.current,
          title: post.title,
          chars: totalChars,
          category: post.category || 'その他'
        });
      }
    }
    
    mediumCandidates.sort((a, b) => a.chars - b.chars);
    console.log(`\n=== 中記事（1201-1500文字）分析 ===`);
    console.log(`中記事総数: ${mediumCandidates.length}記事`);
    
    if (mediumCandidates.length > 0) {
      console.log('\n=== 最初の10記事 ===');
      mediumCandidates.slice(0, 10).forEach((article, index) => {
        console.log(`第${index + 1}記事:`);
        console.log(`  タイトル: ${article.title}`);
        console.log(`  スラッグ: ${article.slug}`);
        console.log(`  現在文字数: ${article.chars}文字`);
        console.log(`  カテゴリー: ${article.category}`);
        console.log(`  目標文字数: 1800-2200文字 (+${1800 - article.chars}文字以上拡張)`);
        console.log('');
      });
    }
  }
}

checkRemainingShortArticles().catch(console.error);