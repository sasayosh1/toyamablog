/**
 * YouTubeチャンネルIDを取得するスクリプト
 * チャンネル名（@sasayoshi1）からチャンネルIDを検索
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function findChannelId(channelName) {
  console.log(`🔍 チャンネル「${channelName}」のIDを検索中...`);
  
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(channelName)}&type=channel&part=snippet&maxResults=10`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ YouTube API Error:', data.error.message);
      return null;
    }
    
    if (!data.items || data.items.length === 0) {
      console.log('❌ チャンネルが見つかりませんでした');
      return null;
    }
    
    console.log('📺 見つかったチャンネル:');
    data.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.snippet.title}`);
      console.log(`   チャンネルID: ${item.snippet.channelId}`);
      console.log(`   説明: ${item.snippet.description.substring(0, 100)}...`);
      console.log('   ---');
    });
    
    return data.items[0].snippet.channelId;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

async function testChannelVideos(channelId) {
  console.log(`\n🎥 チャンネル「${channelId}」の最新動画を確認...`);
  
  const videosUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5&type=video`;
  
  try {
    const response = await fetch(videosUrl);
    const data = await response.json();
    
    if (data.error) {
      console.error('❌ YouTube API Error:', data.error.message);
      return;
    }
    
    console.log(`📺 最新動画数: ${data.items?.length || 0}`);
    
    if (data.items && data.items.length > 0) {
      console.log('\n🎬 最新動画リスト:');
      data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.snippet.title}`);
        console.log(`   動画ID: ${item.id.videoId}`);
        console.log(`   URL: https://youtu.be/${item.id.videoId}`);
        console.log(`   投稿日: ${new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP')}`);
        console.log('   ---');
      });
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function main() {
  console.log('🚀 YouTubeチャンネルID取得ツール');
  
  if (!YOUTUBE_API_KEY) {
    console.error('❌ YOUTUBE_API_KEYが設定されていません');
    return;
  }
  
  // 複数の検索パターンを試行
  const searchPatterns = [
    'sasayoshi1',
    '@sasayoshi1', 
    'ささよし',
    'sasayoshi',
    '富山 sasayoshi'
  ];
  
  for (const pattern of searchPatterns) {
    console.log(`\n🔍 「${pattern}」で検索中...`);
    const channelId = await findChannelId(pattern);
    
    if (channelId) {
      await testChannelVideos(channelId);
      
      console.log('\n✅ 見つかったチャンネルIDをコピーして、環境変数に設定してください:');
      console.log(`YOUTUBE_CHANNEL_ID=${channelId}`);
      break;
    }
    
    // API制限を避けるため1秒待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);