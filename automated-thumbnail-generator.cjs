const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function automatedThumbnailGenerator() {
  try {
    console.log('🖼️ サムネイル自動生成システム開始...');
    console.log('=====================================');
    
    // サムネイル未設定の記事を取得
    const postsWithoutThumbnail = await client.fetch('*[_type == "post" && !defined(thumbnail) && defined(youtubeUrl)] { _id, title, youtubeUrl }');
    
    console.log(`📊 サムネイル未設定記事: ${postsWithoutThumbnail.length}件`);
    
    if (postsWithoutThumbnail.length === 0) {
      console.log('✅ 全ての動画付き記事にサムネイルが設定済みです！');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 最初の10件を処理
    for (let i = 0; i < Math.min(10, postsWithoutThumbnail.length); i++) {
      const post = postsWithoutThumbnail[i];
      
      try {
        console.log(`\\n🔄 [${i+1}/10] 処理中: ${post.title.substring(0, 50)}...`);
        
        // YouTube URLからVideo IDを抽出
        let videoId = '';
        const youtubeUrl = post.youtubeUrl;
        
        if (youtubeUrl.includes('youtube.com/shorts/')) {
          videoId = youtubeUrl.split('youtube.com/shorts/')[1].split('?')[0];
        } else if (youtubeUrl.includes('youtu.be/')) {
          videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
        } else if (youtubeUrl.includes('youtube.com/watch?v=')) {
          videoId = youtubeUrl.split('v=')[1].split('&')[0];
        }
        
        if (!videoId) {
          console.log('   ⚠️ Video ID抽出失敗');
          errorCount++;
          continue;
        }
        
        console.log(`   📺 Video ID: ${videoId}`);
        
        // YouTubeサムネイルURL生成
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        
        console.log('   🖼️ サムネイル取得中...');
        
        // サムネイルの存在確認
        const checkResponse = await fetch(thumbnailUrl);
        if (!checkResponse.ok) {
          console.log('   ❌ サムネイル取得失敗');
          errorCount++;
          continue;
        }
        
        // 画像データを取得
        const imageBuffer = await checkResponse.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);
        
        console.log('   📤 Sanityに画像アップロード中...');
        
        // Sanityに画像をアップロード
        const asset = await client.assets.upload('image', buffer, {
          filename: `thumbnail-${videoId}-${Date.now()}.jpg`,
          contentType: 'image/jpeg'
        });
        
        console.log(`   ✅ 画像アセット作成: ${asset._id}`);
        
        // 記事にサムネイルを設定
        await client
          .patch(post._id)
          .set({
            thumbnail: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id
              },
              alt: `${post.title} サムネイル`
            },
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log(`   🎉 完了: ${post.title.substring(0, 40)}...`);
        successCount++;
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${post.title.substring(0, 40)}... - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\\n📊 サムネイル生成結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🎯 残り: ${postsWithoutThumbnail.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\\n🌟 サムネイル自動生成完了！');
      console.log('記事カードが更に魅力的になりました！');
    }
    
  } catch (error) {
    console.error('❌ サムネイル生成エラー:', error.message);
  }
}

automatedThumbnailGenerator();