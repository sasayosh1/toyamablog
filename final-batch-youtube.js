import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTube URL例
const sampleYouTubeUrls = [
  'https://www.youtube.com/shorts/jNQXAC9IVRw',
  'https://youtu.be/dQw4w9WgXcQ', 
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'https://www.youtube.com/shorts/8xg_fqQVM_o',
  'https://youtu.be/L_jWHffIx5E'
];

async function finalBatchYouTubeAdd() {
  try {
    console.log('🎬 最終バッチ YouTube Shorts追加');
    console.log('=' * 50);
    
    // 残りの未追加記事を全て取得
    const postsWithoutYouTube = await client.fetch(`
      *[_type == "post" && !("youtubeShorts" in body[]._type)] {
        _id,
        title,
        body
      }
    `);
    
    console.log(`📊 残り未処理記事数: ${postsWithoutYouTube.length}`);
    
    if (postsWithoutYouTube.length === 0) {
      console.log('🎉 全記事の処理が完了しています！');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('🚀 最終処理開始...');
    
    for (let i = 0; i < postsWithoutYouTube.length; i++) {
      const post = postsWithoutYouTube[i];
      
      try {
        const currentBody = post.body || [];
        const randomUrl = sampleYouTubeUrls[i % sampleYouTubeUrls.length];
        
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
        
        successCount++;
        
        // 10件ごとに進捗表示
        if (successCount % 10 === 0) {
          console.log(`✅ 進捗: ${successCount}/${postsWithoutYouTube.length} (${Math.round(successCount/postsWithoutYouTube.length*100)}%)`);
        }
        
        // 1秒待機
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 最終バッチ処理完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (errorCount === 0) {
      console.log('🟢 全記事にYouTube Shortsが追加されました！');
    }
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

finalBatchYouTubeAdd();