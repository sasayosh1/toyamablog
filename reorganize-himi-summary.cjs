const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function reorganizeHimiSummary() {
  try {
    console.log('📝 氷見市光久寺記事のまとめを最後に移動中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "4zxT7RlbAnSlGPWZgbmUTQ"][0] {
      _id, title, body
    }`);
    
    if (!article || !article.body) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 記事: ${article.title}`);
    console.log(`📊 現在のブロック数: ${article.body.length}`);
    
    // 元の構造を保持
    let newBody = [];
    let summaryBlocks = [];
    let mapBlock = null;
    
    // ブロックを分類
    article.body.forEach((block, index) => {
      // ブロック13（まとめ見出し）とブロック14（まとめ内容）を抽出
      if (index === 12 || index === 13) { // 0ベースなので12と13
        summaryBlocks.push(block);
        console.log(`📋 まとめブロック ${index + 1} を抽出`);
      }
      // マップブロック（最後）を抽出  
      else if (block._type === 'html' && block.html && block.html.includes('maps')) {
        mapBlock = block;
        console.log(`🗺️ マップブロック ${index + 1} を抽出`);
      }
      // その他のブロックは順序を保持
      else {
        newBody.push(block);
      }
    });
    
    // 新しい順序で再構成: 通常ブロック → まとめブロック → マップブロック
    const finalBody = [
      ...newBody,        // 通常の記事内容（まとめとマップ以外）
      ...summaryBlocks,  // まとめブロック（見出し + 内容）
      mapBlock           // マップブロック
    ];
    
    console.log(`📊 再構成後のブロック数: ${finalBody.length}`);
    console.log('📋 新しい構造: 記事内容 → まとめ → マップ');
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        body: finalBody,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ まとめを記事の最後（マップ直前）に移動しました');
    console.log('🔄 記事構造の最適化完了！');
    
  } catch (error) {
    console.error('❌ 移動エラー:', error.message);
  }
}

reorganizeHimiSummary();