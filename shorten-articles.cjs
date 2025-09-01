const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01'
});

// テキスト内容を2000文字に短縮する関数
function truncateTextContent(blocks, maxLength = 2000) {
  let currentLength = 0;
  const truncatedBlocks = [];
  
  for (const block of blocks) {
    if (currentLength >= maxLength) break;
    
    if (block._type === 'block' && block.children) {
      // テキストブロックの処理
      const truncatedChildren = [];
      
      for (const child of block.children) {
        if (currentLength >= maxLength) break;
        
        if (child.text) {
          const remainingLength = maxLength - currentLength;
          if (child.text.length <= remainingLength) {
            truncatedChildren.push(child);
            currentLength += child.text.length;
          } else {
            // 文の途中で切れないよう、最後の句点で切る
            const truncatedText = child.text.substring(0, remainingLength);
            const lastPeriod = truncatedText.lastIndexOf('。');
            const finalText = lastPeriod > 0 ? truncatedText.substring(0, lastPeriod + 1) : truncatedText;
            
            truncatedChildren.push({
              ...child,
              text: finalText
            });
            currentLength += finalText.length;
            break;
          }
        } else {
          truncatedChildren.push(child);
        }
      }
      
      if (truncatedChildren.length > 0) {
        truncatedBlocks.push({
          ...block,
          children: truncatedChildren
        });
      }
    } else {
      // 非テキストブロック（画像、YouTube等）はそのまま保持
      truncatedBlocks.push(block);
    }
  }
  
  return truncatedBlocks;
}

// テキストの文字数を計算
function calculateTextLength(blocks) {
  return blocks
    .filter(block => block._type === 'block')
    .reduce((total, block) => {
      const text = block.children?.map(child => child.text || '').join('') || '';
      return total + text.length;
    }, 0);
}

async function shortenLongArticles() {
  try {
    console.log('🚀 記事短縮処理を開始します...');
    console.log('📏 目標: 最長2000文字（スマホ読みやすさ最優先）\n');
    
    // 長い記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
        _id, title, body, slug
      }
    `);
    
    console.log(`📊 検査対象記事数: ${posts.length}件\n`);
    
    let processedCount = 0;
    let shortenedCount = 0;
    const batchSize = 12; // 安全なバッチサイズ
    
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      console.log(`\n📦 バッチ ${Math.floor(i / batchSize) + 1} 処理中... (${i + 1}-${Math.min(i + batchSize, posts.length)}件)`);
      
      for (const post of batch) {
        if (!post.body || !Array.isArray(post.body)) {
          processedCount++;
          continue;
        }
        
        const currentLength = calculateTextLength(post.body);
        console.log(`🔍 「${post.title}」: ${currentLength}文字`);
        
        if (currentLength > 2000) {
          console.log(`  ✂️ 短縮処理実行中...`);
          
          const shortenedBody = truncateTextContent(post.body, 2000);
          const newLength = calculateTextLength(shortenedBody);
          
          await client
            .patch(post._id)
            .set({ body: shortenedBody })
            .commit();
          
          shortenedCount++;
          console.log(`  ✅ 完了: ${currentLength} → ${newLength}文字 (${currentLength - newLength}文字削減)`);
        } else {
          console.log(`  ✨ 適正範囲内`);
        }
        
        processedCount++;
        
        // API制限対策: 少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // バッチ間の待機（API制限対策）
      if (i + batchSize < posts.length) {
        console.log(`⏱️ バッチ間待機中...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 記事短縮処理完了！');
    console.log(`📊 処理統計:`);
    console.log(`  - 検査記事数: ${processedCount}件`);
    console.log(`  - 短縮実施: ${shortenedCount}件`);
    console.log(`  - 適正記事: ${processedCount - shortenedCount}件`);
    console.log('\n✅ スマホでの読みやすさが大幅に向上しました');
    
  } catch (error) {
    console.error('💥 エラーが発生しました:', error);
    process.exit(1);
  }
}

shortenLongArticles();