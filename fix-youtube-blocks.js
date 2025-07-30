import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixYouTubeBlocks() {
  try {
    console.log('🔧 YouTube Shortsブロックの修正を開始...');
    
    // YouTube Shortsブロックがある記事を取得
    const postsWithYouTube = await client.fetch(`
      *[_type == "post" && "youtubeShorts" in body[]._type] {
        _id,
        title,
        body
      }
    `);
    
    console.log(`📊 修正対象記事数: ${postsWithYouTube.length}`);
    
    if (postsWithYouTube.length === 0) {
      console.log('✅ 修正対象の記事はありません');
      return;
    }
    
    let fixedCount = 0;
    
    for (const post of postsWithYouTube) {
      console.log(`\n🔧 修正中: "${post.title}"`);
      
      // YouTube Shortsブロックを削除
      const filteredBody = post.body.filter(block => block._type !== 'youtubeShorts');
      
      await client
        .patch(post._id)
        .set({ body: filteredBody })
        .commit();
      
      console.log(`✅ 修正完了: ${post.body.length} → ${filteredBody.length} ブロック`);
      fixedCount++;
    }
    
    console.log(`\n🎉 修正完了！`);
    console.log(`✅ 修正記事数: ${fixedCount}`);
    console.log(`\n📝 次の手順:`);
    console.log('1. ブラウザでSanity Studioをリロード');
    console.log('2. エラーが解決されたことを確認');
    console.log('3. 手動でYouTube Shortsを再追加');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixYouTubeBlocks();