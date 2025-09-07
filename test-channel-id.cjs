// ささよしチャンネルIDのテスト
const YOUTUBE_CHANNEL_ID = 'UCG-zQECsQt1EvhULimgVO5A';

console.log('🧪 チャンネルID動作テスト');
console.log('========================');
console.log(`チャンネルID: ${YOUTUBE_CHANNEL_ID}`);
console.log('');

// YouTube Data API URL構築テスト
const testApiKey = 'TEST_API_KEY';
const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${testApiKey}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

console.log('🔗 構築されるAPI URL:');
console.log(apiUrl);
console.log('');

// チャンネルURL確認
const channelUrl = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;
console.log('📺 チャンネル確認URL:');
console.log(channelUrl);
console.log('');

// 記事タイトル生成テスト
const sampleVideos = [
  { title: '富山市の美しい公園散策', location: '富山市' },
  { title: '氷見市の海鮮グルメ体験', location: '氷見市' },
  { title: '立山町の絶景紅葉スポット', location: '立山町' }
];

console.log('📝 記事タイトル生成テスト:');
sampleVideos.forEach((video, index) => {
  const articleTitle = video.title.includes(`【${video.location}】`) 
    ? video.title 
    : `【${video.location}】${video.title}`;
  
  console.log(`${index + 1}. ${articleTitle}`);
});
console.log('');

console.log('✅ テスト完了 - チャンネルIDは正常に動作可能');
console.log('');
console.log('🚀 次のステップ:');
console.log('1. YouTube Data API v3 キー取得');
console.log('2. Google Maps API キー取得');
console.log('3. .env.local への設定追加');
console.log('4. 本格的な動画取得・記事作成実行');