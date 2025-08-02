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
  // タイトルを正規化（記号や空白を除去、小文字化）
  return title
    .replace(/[【】#shorts\s\-｜！？。、]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function findMatchingVideo(postTitle, videos) {
  const normalizedPostTitle = normalizeTitle(postTitle);
  
  // 完全一致を探す
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    if (normalizedPostTitle === normalizedVideoTitle) {
      return { video, matchType: '完全一致' };
    }
  }
  
  // 部分一致を探す（70%以上の類似度）
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    const similarity = calculateSimilarity(normalizedPostTitle, normalizedVideoTitle);
    if (similarity > 0.7) {
      return { video, matchType: `部分一致 (${Math.round(similarity * 100)}%)` };
    }
  }
  
  return null;
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function main() {
  try {
    console.log('🔍 記事と動画のマッチングを開始します\n');
    
    // データ取得
    const videos = await getChannelVideos();
    const posts = await getPostsWithoutYouTubeUrl();
    
    console.log(`YouTube動画: ${videos.length}件`);
    console.log(`YouTube URLが未設定の記事: ${posts.length}件\n`);
    
    const matches = [];
    
    // マッチング実行
    for (const post of posts) {
      const match = findMatchingVideo(post.title, videos);
      
      if (match) {
        matches.push({
          post,
          video: match.video,
          matchType: match.matchType
        });
        
        console.log(`✅ マッチ発見 (${match.matchType})`);
        console.log(`   記事: ${post.title.substring(0, 50)}...`);
        console.log(`   動画: ${match.video.title.substring(0, 50)}...`);
        console.log(`   Video ID: ${match.video.videoId}`);
        console.log('');
      } else {
        console.log(`❌ マッチなし`);
        console.log(`   記事: ${post.title.substring(0, 50)}...`);
        console.log('');
      }
    }
    
    console.log(`\n📊 マッチング結果: ${matches.length}/${posts.length} 件がマッチしました`);
    
    if (matches.length > 0) {
      console.log('\n⚠️  次のステップで個別に更新を実行します');
      console.log('安全のため、今回はマッチング確認のみを行いました');
    }
    
    return matches;
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    return [];
  }
}

main();