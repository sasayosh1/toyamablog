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
  'https://youtu.be/L_jWHffIx5E',
  'https://www.youtube.com/shorts/R1DuSuJiRYc',
  'https://youtu.be/oHg5SJYRHA0',
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  'https://www.youtube.com/shorts/tgbNymZ7vqY',
  'https://youtu.be/9bZkp7q19f0'
];

async function largeBatchYouTubeAdd(maxLimit = 50) {
  try {
    console.log('🎬 大規模バッチ YouTube Shorts追加');
    console.log(`バッチサイズ: 10、総制限: ${maxLimit}`);
    console.log('=' * 50);
    
    // 現在の未追加記事数を確認
    const totalCount = await client.fetch(`count(*[_type == "post" && !("youtubeShorts" in body[]._type)])`);
    console.log(`📊 未追加記事総数: ${totalCount}`);
    
    const postsWithoutYouTube = await client.fetch(`
      *[_type == "post" && !("youtubeShorts" in body[]._type)] | order(publishedAt desc) [0...${maxLimit}] {
        _id,
        title,
        slug,
        body,
        publishedAt
      }
    `);
    
    console.log(`📝 今回処理対象: ${postsWithoutYouTube.length}/${maxLimit}件`);
    
    if (postsWithoutYouTube.length === 0) {
      console.log('✅ 処理対象なし');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    // 10件ずつバッチ処理
    for (let i = 0; i < postsWithoutYouTube.length; i += 10) {
      const batch = postsWithoutYouTube.slice(i, i + 10);
      
      console.log(`\n--- バッチ ${Math.floor(i / 10) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
        try {
          const currentBody = post.body || [];
          const randomUrl = sampleYouTubeUrls[processed % sampleYouTubeUrls.length];
          
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
          processed++;
          
          // 進捗表示（簡潔に）
          if (processed % 5 === 0) {
            console.log(`✅ 進捗: ${processed}/${postsWithoutYouTube.length} (${Math.round(processed/postsWithoutYouTube.length*100)}%)`);
          }
          
          // 1.5秒待機（高速化）
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (error) {
          console.error(`❌ エラー: ${error.message}`);
          errorCount++;
          processed++;
        }
      }
      
      // バッチ間待機
      if (i + 10 < postsWithoutYouTube.length) {
        console.log('⏳ バッチ間待機 (3秒)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n🎉 大規模バッチ処理完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📊 残り未処理: 約${totalCount - successCount}件`);
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

largeBatchYouTubeAdd(50);