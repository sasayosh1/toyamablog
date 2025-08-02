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
  try {
    console.log('YouTubeチャンネルから動画一覧を取得中...');
    
    // チャンネルの動画一覧を取得（最新50件）
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&maxResults=50&order=date`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ ${data.items.length}件の動画を取得しました\n`);
    
    // 動画情報を整理
    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      youtubeUrl: `https://youtube.com/shorts/${item.id.videoId}` // Shorts形式のURL
    }));
    
    // 最初の5件だけ表示（安全のため）
    console.log('最新5件の動画:');
    videos.slice(0, 5).forEach((video, i) => {
      console.log(`${i + 1}. ${video.title}`);
      console.log(`   Video ID: ${video.videoId}`);
      console.log(`   公開日: ${video.publishedAt}`);
      console.log(`   URL: ${video.youtubeUrl}`);
      console.log('');
    });
    
    return videos;
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    return [];
  }
}

async function getSanityPosts() {
  try {
    console.log('Sanityから記事一覧を取得中...');
    
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        youtubeUrl,
        publishedAt
      } | order(publishedAt desc)[0...10]
    `);
    
    console.log(`✅ ${posts.length}件の記事を取得しました\n`);
    
    posts.slice(0, 5).forEach((post, i) => {
      console.log(`${i + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   スラッグ: ${post.slug}`);
      console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
      console.log('');
    });
    
    return posts;
    
  } catch (error) {
    console.error('Sanity取得エラー:', error.message);
    return [];
  }
}

async function main() {
  console.log('🔍 YouTube動画とSanity記事の照合を開始します\n');
  
  // YouTube動画を取得
  const videos = await getChannelVideos();
  if (videos.length === 0) {
    console.log('YouTube動画の取得に失敗しました');
    return;
  }
  
  // Sanity記事を取得
  const posts = await getSanityPosts();
  if (posts.length === 0) {
    console.log('Sanity記事の取得に失敗しました');
    return;
  }
  
  console.log('\n📊 取得結果サマリー:');
  console.log(`YouTube動画: ${videos.length}件`);
  console.log(`Sanity記事: ${posts.length}件`);
  console.log(`YouTube URLが未設定の記事: ${posts.filter(p => !p.youtubeUrl).length}件`);
  
  console.log('\n⚠️  安全のため、今回は情報取得のみを実行しました');
  console.log('次のステップで個別に記事を更新していきます');
}

main();