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

async function bulkAddYouTubeShorts() {
  try {
    console.log('🎬 一括YouTube Shorts追加ツール');
    console.log('=' * 50);
    
    // YouTube Shortsがまだ追加されていない記事を取得
    const postsWithoutYouTube = await client.fetch(`
      *[_type == "post" && !("youtubeShorts" in body[]._type)][0...10] {
        _id,
        title,
        slug,
        body,
        publishedAt
      }
    `);
    
    console.log(`📊 YouTube Shortsが未追加の記事数: ${postsWithoutYouTube.length}`);
    
    if (postsWithoutYouTube.length === 0) {
      console.log('✅ すべての記事にYouTube Shortsが追加済みです！');
      return;
    }
    
    console.log('\n📝 編集候補記事（最大10件）:');
    postsWithoutYouTube.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   スラッグ: ${post.slug?.current || '未設定'}`);
      console.log(`   現在のブロック数: ${post.body ? post.body.length : 0}`);
    });
    
    if (!process.env.SANITY_API_TOKEN) {
      console.log('\n🔑 APIトークンが必要です');
      console.log('export SANITY_API_TOKEN=your-token-here && node bulk-add-youtube.js');
      return;
    }
    
    console.log('\n🚀 一括編集を開始します...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < Math.min(postsWithoutYouTube.length, 5); i++) {
      const post = postsWithoutYouTube[i];
      
      try {
        console.log(`\n📝 編集中: "${post.title}"`);
        
        const currentBody = post.body || [];
        const randomUrl = sampleYouTubeUrls[i % sampleYouTubeUrls.length];
        
        const newYouTubeBlock = {
          _type: 'youtubeShorts',
          _key: 'youtube-shorts-' + Date.now() + '-' + i,
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
        
        // APIレート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 一括編集完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    console.log('\n🌐 確認先:');
    console.log('• Sanity Studio: http://localhost:4321/studio');
    console.log('• ブログ一覧: http://localhost:4321/blog');
    console.log('• 本番サイト: https://sasakiyoshimasa.com');
    
    console.log('\n📈 残り記事数: ' + Math.max(0, postsWithoutYouTube.length - 5));
    if (postsWithoutYouTube.length > 5) {
      console.log('続きを編集するには、このスクリプトを再実行してください。');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

bulkAddYouTubeShorts();