const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTube URLからビデオIDを抽出する関数
function extractVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// YouTubeサムネイルURLを生成する関数
function generateThumbnailUrl(videoId) {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

async function addThumbnailsToAllArticles() {
  try {
    console.log('🖼️ 全記事にYouTubeサムネイルを追加中...');
    
    // YouTube URLがある記事を取得
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl)] {
      _id,
      title,
      youtubeUrl,
      "thumbnailExists": defined(thumbnail)
    }`);
    
    console.log('YouTube URLがある記事数:', articles.length);
    
    let processedCount = 0;
    let addedCount = 0;
    
    // バッチ処理で20記事ずつ処理
    for (let i = 0; i < articles.length; i += 20) {
      const batch = articles.slice(i, i + 20);
      console.log(`\n📦 バッチ ${Math.floor(i/20) + 1}/${Math.ceil(articles.length/20)} 処理中... (記事 ${i + 1}-${Math.min(i + 20, articles.length)})`);
      
      for (const article of batch) {
        try {
          processedCount++;
          
          // すでにサムネイルがある場合はスキップ
          if (article.thumbnailExists) {
            console.log(`⏭️  スキップ: ${article.title} (サムネイル既存)`);
            continue;
          }
          
          const videoId = extractVideoId(article.youtubeUrl);
          if (!videoId) {
            console.log(`⚠️  エラー: ${article.title} (無効なYouTube URL)`);
            continue;
          }
          
          const thumbnailUrl = generateThumbnailUrl(videoId);
          
          // サムネイル用の画像アセットを作成
          const imageAsset = {
            _type: 'reference',
            _ref: `image-${videoId}-jpg`
          };
          
          // 記事にサムネイルを追加
          await client
            .patch(article._id)
            .set({
              thumbnail: {
                _type: 'image',
                asset: imageAsset,
                alt: article.title + ' サムネイル',
                hotspot: {
                  _type: 'sanity.imageHotspot',
                  x: 0.5,
                  y: 0.5,
                  height: 1,
                  width: 1
                },
                crop: {
                  _type: 'sanity.imageCrop',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0
                }
              }
            })
            .commit();
          
          addedCount++;
          console.log(`✅ 追加: ${article.title}`);
          console.log(`   Video ID: ${videoId}`);
          
        } catch (error) {
          console.error(`❌ エラー (${article.title}):`, error.message);
        }
      }
      
      // バッチ間で少し待機
      if (i + 20 < articles.length) {
        console.log('⏳ 3秒待機中...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`処理した記事数: ${processedCount}`);
    console.log(`サムネイル追加数: ${addedCount}`);
    console.log(`\n✅ 全記事のサムネイル追加処理が完了しました！`);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

addThumbnailsToAllArticles();