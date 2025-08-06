const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function selectSafeCandidates() {
  try {
    console.log('文字数拡張に適した安全な記事を選定します...\n');
    
    // 文字数が少なく、構造がシンプルな記事を取得
    const posts = await client.fetch(`*[_type == "post"] {
      _id,
      title,
      slug,
      body,
      category,
      youtubeUrl
    } | order(_createdAt desc)`);
    
    const safeCandidates = [];
    
    posts.forEach(post => {
      if (!post.body || !Array.isArray(post.body)) return;
      
      let totalChars = 0;
      let h2Count = 0;
      let h3Count = 0;
      let hasComplexStructure = false;
      
      post.body.forEach(block => {
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          totalChars += text.length;
          
          if (block.style === 'h2') h2Count++;
          if (block.style === 'h3') h3Count++;
        }
        
        // 複雑な構造をチェック
        if (block._type === 'html' || block._type === 'image') {
          hasComplexStructure = true;
        }
      });
      
      // 安全な候補の条件：
      // 1. 文字数が200-400文字（拡張しやすい範囲）
      // 2. 見出し構造がシンプル（H2:0個、H3:0個）
      // 3. 複雑な要素がない
      // 4. YouTubeURLがある（動画ベースの記事で拡張しやすい）
      if (totalChars >= 200 && totalChars <= 400 && 
          h2Count === 0 && h3Count === 0 && 
          !hasComplexStructure && 
          post.youtubeUrl) {
        
        safeCandidates.push({
          slug: post.slug?.current,
          title: post.title,
          category: post.category,
          totalChars,
          youtubeUrl: post.youtubeUrl,
          h2Count,
          h3Count,
          hasComplexStructure
        });
      }
    });
    
    // 文字数でソート（少ない順）
    safeCandidates.sort((a, b) => a.totalChars - b.totalChars);
    
    console.log(`安全な候補記事: ${safeCandidates.length}件\n`);
    
    console.log('=== おすすめ更新順序（最初の10件） ===');
    safeCandidates.slice(0, 10).forEach((candidate, index) => {
      console.log(`${index + 1}. [${candidate.category}] ${candidate.totalChars}文字`);
      console.log(`   タイトル: ${candidate.title.substring(0, 50)}...`);
      console.log(`   slug: ${candidate.slug}`);
      console.log(`   YouTube: あり`);
      console.log('');
    });
    
    if (safeCandidates.length > 0) {
      const recommended = safeCandidates[0];
      console.log('=== 第1候補（推奨） ===');
      console.log(`記事: ${recommended.slug}`);
      console.log(`タイトル: ${recommended.title}`);
      console.log(`カテゴリー: ${recommended.category}`);
      console.log(`現在の文字数: ${recommended.totalChars}文字`);
      console.log(`目標文字数: 800-1000文字`);
      console.log(`拡張が必要: ${800 - recommended.totalChars}文字以上`);
      console.log('\n安全性評価:');
      console.log('✅ 見出し構造がシンプル（H2:0個、H3:0個）');
      console.log('✅ 複雑な要素なし');
      console.log('✅ YouTube動画ベース（内容拡張しやすい）');
      console.log('✅ 適度な文字数（200-400文字範囲）');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

selectSafeCandidates();