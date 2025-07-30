import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTube URL例（安全な動画URL）
const sampleYouTubeUrls = [
  'https://www.youtube.com/shorts/jNQXAC9IVRw',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'https://www.youtube.com/shorts/8xg_fqQVM_o',
  'https://youtu.be/L_jWHffIx5E'
];

async function safeYouTubeBulkAdd(batchSize = 5, totalLimit = 10) {
  try {
    console.log('🎬 安全なYouTube Shorts一括追加ツール');
    console.log(`バッチサイズ: ${batchSize}、総制限: ${totalLimit}`);
    console.log('=' * 50);
    
    // YouTube Shortsが未追加の記事を制限数で取得
    const postsWithoutYouTube = await client.fetch(`
      *[_type == "post" && !("youtubeShorts" in body[]._type)] | order(publishedAt desc) [0...${totalLimit}] {
        _id,
        title,
        slug,
        body,
        publishedAt
      }
    `);
    
    console.log(`📊 処理対象記事数: ${postsWithoutYouTube.length}/${totalLimit}`);
    
    if (postsWithoutYouTube.length === 0) {
      console.log('✅ 処理対象の記事はありません');
      return { success: 0, error: 0 };
    }
    
    console.log('\n📝 処理予定記事（最初の5件）:');
    postsWithoutYouTube.slice(0, 5).forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   スラッグ: ${post.slug?.current || '未設定'}`);
      console.log(`   現在のブロック数: ${post.body ? post.body.length : 0}`);
    });
    
    console.log('\n🚀 処理を開始します...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // バッチごとに処理
    for (let i = 0; i < postsWithoutYouTube.length; i += batchSize) {
      const batch = postsWithoutYouTube.slice(i, i + batchSize);
      
      console.log(`\n--- バッチ ${Math.floor(i / batchSize) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
        try {
          console.log(`\n📝 処理中: "${post.title}"`);
          
          const currentBody = post.body || [];
          const randomUrl = sampleYouTubeUrls[successCount % sampleYouTubeUrls.length];
          
          const newYouTubeBlock = {
            _type: 'youtubeShorts',
            _key: 'youtube-shorts-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            url: randomUrl,
            title: '記事で紹介した場所の動画',
            autoplay: false,
            showControls: true
          };
          
          const updatedBody = [...currentBody, newYouTubeBlock];
          
          await client
            .patch(post._id)
            .set({ body: updatedBody })
            .commit();
          
          console.log(`✅ 成功: ${currentBody.length} → ${updatedBody.length} ブロック`);
          console.log(`   YouTube URL: ${randomUrl}`);
          successCount++;
          
          // APIレート制限を避けるため待機
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ エラー: ${error.message}`);
          errorCount++;
        }
      }
      
      // バッチ間で長めの待機
      if (i + batchSize < postsWithoutYouTube.length) {
        console.log('⏳ 次のバッチまで5秒待機...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n🎉 処理完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (errorCount === 0) {
      console.log('🟢 全て正常に処理されました');
    } else {
      console.log('🟡 一部エラーがありました');
    }
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

// 安全な設定で実行（最初は5件のみテスト）
safeYouTubeBulkAdd(2, 5); // バッチサイズ2、最大5件