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
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
];

async function mediumBatchYouTubeAdd() {
  try {
    console.log('🎬 中規模バッチ YouTube Shorts追加');
    console.log('バッチサイズ: 5、総制限: 20');
    console.log('=' * 50);
    
    // 現在の未追加記事数を確認
    const totalCount = await client.fetch(`count(*[_type == "post" && !("youtubeShorts" in body[]._type)])`);
    console.log(`📊 未追加記事総数: ${totalCount}`);
    
    const postsWithoutYouTube = await client.fetch(`
      *[_type == "post" && !("youtubeShorts" in body[]._type)] | order(publishedAt desc) [0...20] {
        _id,
        title,
        slug,
        body,
        publishedAt
      }
    `);
    
    console.log(`📝 今回処理対象: ${postsWithoutYouTube.length}/20件`);
    
    if (postsWithoutYouTube.length === 0) {
      console.log('✅ 処理対象なし');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 5件ずつバッチ処理
    for (let i = 0; i < postsWithoutYouTube.length; i += 5) {
      const batch = postsWithoutYouTube.slice(i, i + 5);
      
      console.log(`\n--- バッチ ${Math.floor(i / 5) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
        try {
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
          
          console.log(`✅ "${post.title.substring(0, 30)}..." → ${updatedBody.length}ブロック`);
          successCount++;
          
          // 2秒待機
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ エラー: ${error.message}`);
          errorCount++;
        }
      }
      
      // バッチ間待機
      if (i + 5 < postsWithoutYouTube.length) {
        console.log('⏳ バッチ間待機 (5秒)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n🎉 中規模バッチ処理完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📊 残り未処理: 約${totalCount - successCount}件`);
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

mediumBatchYouTubeAdd();