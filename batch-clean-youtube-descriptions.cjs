const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function batchCleanYouTubeDescriptions() {
  try {
    console.log('🧹 YouTube概要欄引用の一括クリーンアップを開始...');
    
    // YouTube動画付きの記事を取得
    const posts = await client.fetch(`*[_type == "post" && defined(youtubeUrl)] {
      _id, title, slug, body
    } | order(publishedAt desc)`);
    
    console.log(`📊 検索対象: ${posts.length}件の記事`);
    
    let processedCount = 0;
    let cleanedCount = 0;
    
    for (const post of posts) {
      if (!post.body || !Array.isArray(post.body)) continue;
      
      processedCount++;
      let hasChanges = false;
      
      // YouTube概要欄部分を除外
      const originalLength = post.body.length;
      const cleanedBody = post.body.filter((block) => {
        if (block._type !== 'block' || !block.children) {
          return true; // blockタイプ以外はそのまま保持
        }
        
        const text = block.children.map(child => child.text).join('');
        
        // 削除対象の判定（より厳密に）
        const shouldRemove = (
          // 公式サイトリンク
          (text.includes('【公式】') && text.includes('HP')) ||
          (text.includes('▼') && text.includes('HP')) ||
          (text.includes('▼') && /https?:\\/\\//.test(text)) ||
          
          // ハッシュタグブロック（#で始まり複数のハッシュタグがある）
          (text.startsWith('#') && (text.match(/#/g) || []).length >= 3) ||
          
          // YouTube Shorts URL
          text.includes('YouTube Shorts:') ||
          
          // 外部サービスの短縮URL（x.gd など）
          /https?:\\/\\/x\\.gd\\/[A-Za-z0-9]+/.test(text) ||
          
          // 単純なURL行（説明なしでURLのみ）
          /^https?:\\/\\/[^\\s]+$/.test(text.trim())
        );
        
        if (shouldRemove) {
          hasChanges = true;
          return false;
        }
        
        return true;
      });
      
      if (hasChanges && cleanedBody.length !== originalLength) {
        // 記事を更新
        await client
          .patch(post._id)
          .set({
            body: cleanedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        cleanedCount++;
        
        console.log(`✅ ${cleanedCount}. ${post.title.substring(0, 50)}...`);
        console.log(`   削除ブロック数: ${originalLength - cleanedBody.length}`);
        
        // API制限を考慮して少し待機
        if (cleanedCount % 10 === 0) {
          console.log(`⏱️ 10件処理完了、1秒待機中...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.log(`\n📊 一括クリーンアップ完了:`);
    console.log(`   処理対象記事: ${processedCount}件`);
    console.log(`   クリーンアップ実行: ${cleanedCount}件`);
    console.log(`   変更なし: ${processedCount - cleanedCount}件`);
    
    if (cleanedCount > 0) {
      console.log('\n🎉 YouTube概要欄からの引用クリーンアップが完了しました！');
    } else {
      console.log('\n✅ クリーンアップが必要な記事は見つかりませんでした');
    }
    
    return cleanedCount;
    
  } catch (error) {
    console.error('❌ 一括クリーンアップエラー:', error.message);
    return 0;
  }
}

batchCleanYouTubeDescriptions().then(count => {
  console.log(`\n🏁 最終結果: ${count}件の記事をクリーンアップしました`);
  process.exit(0);
});