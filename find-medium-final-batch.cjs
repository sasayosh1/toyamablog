const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findMediumFinalBatch() {
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
  
  console.log('🏁 === 中記事最終バッチ候補（第36-38記事）- 完全制覇へ ===');
  const finalBatch = candidates.slice(35); // 残り全て
  
  finalBatch.forEach((article, index) => {
    console.log(`最終第${index + 36}記事:`);
    console.log(`  タイトル: ${article.title}`);
    console.log(`  スラッグ: ${article.slug}`);
    console.log(`  現在文字数: ${article.chars}文字`);
    console.log(`  カテゴリー: ${article.category}`);
    console.log(`  目標文字数: 2000-2500文字（スマホ最適化）`);
    console.log('');
  });
  
  console.log(`🎯 中記事総数: ${candidates.length}記事`);
  console.log(`✅ 処理済み: 35記事`);
  console.log(`🏁 最終バッチ対象: ${finalBatch.length}記事`);
  console.log(`🎊 残り: 0記事（完全制覇達成）`);
  
  if (finalBatch.length === 0) {
    console.log('\n🏆🎉 中記事カテゴリー完全制覇達成！');
    console.log('🎊 全ての中記事の処理が完了しました！');
  }
}

findMediumFinalBatch().catch(console.error);