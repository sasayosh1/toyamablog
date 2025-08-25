const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkThumbnailStatus() {
  try {
    console.log('🔍 全記事のサムネイル設定状況を確認中...');
    
    // YouTube URLがあるのにサムネイルがない記事を検索
    const articlesWithVideo = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      youtubeUrl,
      publishedAt
    }`);
    
    console.log(`📊 YouTube動画はあるがサムネイルがない記事: ${articlesWithVideo.length}件`);
    
    if (articlesWithVideo.length > 0) {
      console.log('\n🎥 サムネイル設定が必要な記事一覧:');
      articlesWithVideo.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   スラッグ: ${article.slug?.current}`);
        console.log(`   YouTube: ${article.youtubeUrl}`);
        console.log(`   公開日: ${new Date(article.publishedAt).toLocaleDateString()}`);
        console.log('');
      });
      
      // 最初の記事のサムネイルを自動設定
      if (articlesWithVideo.length > 0) {
        console.log('🚀 最初の記事のサムネイルを自動設定します...');
        const firstArticle = articlesWithVideo[0];
        console.log(`対象記事: ${firstArticle.title}`);
        
        // YouTube URLからビデオIDを抽出
        let videoId = '';
        if (firstArticle.youtubeUrl.includes('youtu.be/')) {
          videoId = firstArticle.youtubeUrl.split('youtu.be/')[1].split('?')[0];
        } else if (firstArticle.youtubeUrl.includes('youtube.com/watch')) {
          const urlParams = new URLSearchParams(firstArticle.youtubeUrl.split('?')[1]);
          videoId = urlParams.get('v');
        } else if (firstArticle.youtubeUrl.includes('youtube.com/shorts/')) {
          videoId = firstArticle.youtubeUrl.split('shorts/')[1].split('?')[0];
        }
        
        if (videoId) {
          console.log(`🎬 ビデオID: ${videoId}`);
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          
          try {
            // サムネイル画像の有効性を確認
            const response = await fetch(thumbnailUrl);
            if (response.ok) {
              console.log('📥 サムネイル画像をダウンロード中...');
              const buffer = await response.arrayBuffer();
              
              // 画像アセットを作成
              const asset = await client.assets.upload('image', Buffer.from(buffer), {
                filename: `thumbnail-${firstArticle.slug?.current || 'article'}-${Date.now()}.jpg`,
                contentType: 'image/jpeg'
              });
              
              console.log('✅ 画像アセット作成完了:', asset._id);
              
              // 記事を更新
              await client
                .patch(firstArticle._id)
                .set({
                  thumbnail: {
                    _type: 'image',
                    asset: {
                      _type: 'reference',
                      _ref: asset._id
                    },
                    alt: firstArticle.title + ' サムネイル'
                  },
                  _updatedAt: new Date().toISOString()
                })
                .commit();
              
              console.log('🎉 サムネイル設定完了!');
              console.log(`📄 記事: ${firstArticle.title}`);
              console.log(`🔗 URL: https://sasakiyoshimasa.com/blog/${firstArticle.slug?.current}`);
              
            } else {
              console.log('❌ サムネイル画像が取得できませんでした');
            }
          } catch (error) {
            console.log('❌ サムネイル設定エラー:', error.message);
          }
        } else {
          console.log('❌ ビデオIDを抽出できませんでした');
        }
      }
      
    } else {
      console.log('✅ 全ての動画記事にサムネイルが設定されています');
    }
    
    // サムネイルが設定済みの記事数も確認
    const articlesWithThumbnail = await client.fetch(`*[_type == "post" && defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      publishedAt
    }`);
    
    console.log(`\n✅ サムネイル設定済み記事: ${articlesWithThumbnail.length}件`);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkThumbnailStatus();