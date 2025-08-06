const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function analyzeAllArticles() {
  try {
    console.log('全ブログ記事の分析を開始します...\n');
    
    // 全記事を取得
    const posts = await client.fetch(`*[_type == "post"] {
      _id,
      title,
      slug,
      body,
      category,
      _createdAt
    } | order(_createdAt desc)`);
    
    console.log(`総記事数: ${posts.length}件\n`);
    
    const analysisResults = [];
    
    posts.forEach((post, index) => {
      if (!post.body || !Array.isArray(post.body)) {
        analysisResults.push({
          index: index + 1,
          slug: post.slug?.current || 'no-slug',
          title: post.title || 'タイトルなし',
          category: post.category || 'カテゴリーなし',
          totalChars: 0,
          h2Count: 0,
          h3Count: 0,
          needsUpdate: false,
          reason: 'body要素がありません'
        });
        return;
      }
      
      let totalChars = 0;
      let h2Count = 0;
      let h3Count = 0;
      
      post.body.forEach(block => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          totalChars += text.length;
          
          if (block.style === 'h2') h2Count++;
          if (block.style === 'h3') h3Count++;
        }
      });
      
      // 更新が必要かどうかの判定
      let needsUpdate = false;
      let reason = '';
      
      if (h3Count > 0 && totalChars <= 1000) {
        needsUpdate = true;
        reason = '1000文字以下なのでH3削除が必要';
      } else if (h3Count > 1 && totalChars > 1000) {
        needsUpdate = true;
        reason = '1000文字超でH3が2個以上なので1個まで削減が必要';
      } else if (totalChars > 2000) {
        needsUpdate = true;
        reason = '2000文字を大幅に超過、要短縮';
      } else if (totalChars < 500) {
        needsUpdate = true;
        reason = '文字数が少なすぎる、要拡張';
      }
      
      analysisResults.push({
        index: index + 1,
        slug: post.slug?.current || 'no-slug',
        title: post.title || 'タイトルなし',
        category: post.category || 'カテゴリーなし',
        totalChars,
        h2Count,
        h3Count,
        needsUpdate,
        reason
      });
    });
    
    console.log('=== 記事分析結果 ===\n');
    
    // 更新不要な記事
    const noUpdateNeeded = analysisResults.filter(r => !r.needsUpdate);
    console.log('✅ 更新不要な記事:', noUpdateNeeded.length + '件');
    noUpdateNeeded.forEach(r => {
      console.log(`  ${r.index}. [${r.category}] ${r.title.substring(0, 40)}... (${r.totalChars}文字, H2:${r.h2Count}, H3:${r.h3Count})`);
    });
    
    console.log('\n');
    
    // 更新が必要な記事
    const updateNeeded = analysisResults.filter(r => r.needsUpdate);
    console.log('⚠️ 更新が必要な記事:', updateNeeded.length + '件');
    updateNeeded.forEach(r => {
      console.log(`  ${r.index}. [${r.category}] ${r.title.substring(0, 40)}...`);
      console.log(`     文字数:${r.totalChars} H2:${r.h2Count} H3:${r.h3Count}`);
      console.log(`     理由: ${r.reason}`);
      console.log(`     slug: ${r.slug}`);
      console.log('');
    });
    
    // 優先度別の推奨
    console.log('=== 更新推奨順序 ===');
    
    const highPriority = updateNeeded.filter(r => 
      r.reason.includes('H3削除') || r.reason.includes('H3が2個以上')
    );
    
    const mediumPriority = updateNeeded.filter(r => 
      r.reason.includes('超過') || r.reason.includes('短縮')
    );
    
    const lowPriority = updateNeeded.filter(r => 
      r.reason.includes('少なすぎる') || r.reason.includes('拡張')
    );
    
    console.log('🔴 高優先度 (見出し構造の修正):', highPriority.length + '件');
    highPriority.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.slug} - ${r.reason}`);
    });
    
    console.log('\n🟡 中優先度 (文字数調整):', mediumPriority.length + '件');
    mediumPriority.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.slug} - ${r.reason}`);
    });
    
    console.log('\n🟢 低優先度 (文字数拡張):', lowPriority.length + '件');
    lowPriority.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.slug} - ${r.reason}`);
    });
    
    console.log('\n=== 推奨実行計画 ===');
    console.log('1. 高優先度から1記事ずつ慎重に更新');
    console.log('2. 各記事更新後に結果を確認');
    console.log('3. 問題がないことを確認してから次の記事へ進む');
    console.log('4. 一度に更新する記事数は最大1記事まで');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

analyzeAllArticles();