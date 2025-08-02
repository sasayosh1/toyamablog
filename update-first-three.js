import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

const YOUTUBE_API_KEY = 'AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY';
const CHANNEL_ID = 'UCxX3Eq8_KMl3AeYdhb5MklA';

async function getChannelVideos() {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&maxResults=50&order=date`
  );
  const data = await response.json();
  
  return data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    youtubeUrl: `https://youtube.com/shorts/${item.id.videoId}`
  }));
}

async function getPostsWithoutYouTubeUrl() {
  return await client.fetch(`
    *[_type == "post" && !defined(youtubeUrl)]{ 
      _id,
      title, 
      "slug": slug.current
    } | order(publishedAt desc)
  `);
}

function normalizeTitle(title) {
  return title
    .replace(/[【】#shorts\s\-｜！？。、]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function findMatchingVideo(postTitle, videos) {
  const normalizedPostTitle = normalizeTitle(postTitle);
  
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    if (normalizedPostTitle === normalizedVideoTitle) {
      return { video, matchType: '完全一致' };
    }
  }
  
  return null;
}

async function updatePostSafely(postId, youtubeUrl, postTitle) {
  try {
    console.log(`\n🔧 更新開始: ${postTitle.substring(0, 50)}...`);
    console.log(`   Post ID: ${postId}`);
    console.log(`   YouTube URL: ${youtubeUrl}`);
    
    // 更新実行
    const result = await client
      .patch(postId)
      .set({ youtubeUrl: youtubeUrl })
      .commit();
    
    console.log('✅ 更新成功！');
    
    // 5秒待機（APIレート制限回避）
    console.log('⏳ 5秒待機中...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ 更新エラー:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 最初の3件の記事を安全に更新します\n');
    
    // データ取得
    const videos = await getChannelVideos();
    const posts = await getPostsWithoutYouTubeUrl();
    
    console.log(`YouTube動画: ${videos.length}件`);
    console.log(`YouTube URLが未設定の記事: ${posts.length}件\n`);
    
    const matches = [];
    let updateCount = 0;
    const MAX_UPDATES = 3; // 安全のため最初の3件のみ
    
    // マッチングと更新
    for (const post of posts) {
      if (updateCount >= MAX_UPDATES) {
        console.log(`\n🛑 安全のため${MAX_UPDATES}件で停止します`);
        break;
      }
      
      const match = findMatchingVideo(post.title, videos);
      
      if (match) {
        matches.push({
          post,
          video: match.video,
          matchType: match.matchType
        });
        
        console.log(`\n✅ マッチ発見 (${match.matchType})`);
        console.log(`   記事: ${post.title.substring(0, 50)}...`);
        console.log(`   動画: ${match.video.title.substring(0, 50)}...`);
        
        // 更新実行
        const updateResult = await updatePostSafely(
          post._id, 
          match.video.youtubeUrl, 
          post.title
        );
        
        if (updateResult.success) {
          updateCount++;
          console.log(`📊 進捗: ${updateCount}/${MAX_UPDATES} 件完了`);
        } else {
          console.log('⚠️ この記事の更新をスキップします');
        }
      }
    }
    
    console.log(`\n🎉 更新完了！`);
    console.log(`総マッチ数: ${matches.length}件`);
    console.log(`実際に更新: ${updateCount}件`);
    console.log('\n次回は残りの記事を更新できます');
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
  }
}

main();