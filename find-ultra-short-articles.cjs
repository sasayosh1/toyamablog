const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findUltraShortArticles() {
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
  console.log('=== 超短記事（500文字以下）詳細分析 ===');
  
  const ultraShortArticles = [];
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
      ultraShortArticles.push({
        slug: post.slug.current,
        title: post.title,
        chars: totalChars,
        category: post.category || 'その他'
      });
    }
  }
  
  // 文字数順でソート（短い順）
  ultraShortArticles.sort((a, b) => a.chars - b.chars);
  
  console.log(`総対象記事数: ${ultraShortArticles.length}記事`);
  console.log('');
  
  // 文字数帯別分析
  const veryShort = ultraShortArticles.filter(a => a.chars <= 200);
  const short = ultraShortArticles.filter(a => a.chars > 200 && a.chars <= 350);
  const mediumShort = ultraShortArticles.filter(a => a.chars > 350 && a.chars <= 500);
  
  console.log('=== 文字数帯別内訳 ===');
  console.log(`極短記事（200文字以下）: ${veryShort.length}記事`);
  console.log(`短記事（201-350文字）: ${short.length}記事`);  
  console.log(`中短記事（351-500文字）: ${mediumShort.length}記事`);
  console.log('');
  
  console.log('=== 第1バッチ候補（最短5記事）===');
  const firstBatch = ultraShortArticles.slice(0, 5);
  
  firstBatch.forEach((article, index) => {
    console.log(`第${index + 1}記事:`)
    console.log(`  タイトル: ${article.title}`);
    console.log(`  スラッグ: ${article.slug}`);
    console.log(`  現在文字数: ${article.chars}文字`);
    console.log(`  カテゴリー: ${article.category}`);
    console.log(`  目標文字数: 1500-1800文字 (+${1500 - article.chars}文字以上拡張)`);
    console.log('');
  });
  
  console.log('=== 処理戦略 ===');
  console.log('🎯 目標: 各記事を1500-1800文字に拡張');
  console.log('📝 手法: 詳細情報・歴史背景・体験談・地域情報を追加');
  console.log('🔍 品質: SEO効果とユーザー価値を重視した高品質拡張');
  console.log('⚠️  注意: 慎重な情報収集と適切な文章構成');
}

findUltraShortArticles().catch(console.error);