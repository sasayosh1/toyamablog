// 正しいささよしチャンネルIDで更新
const CORRECT_CHANNEL_ID = 'UCxX3Eq8_KMl3AeYdhb5MklA';
const OLD_CHANNEL_ID = 'UCG-zQECsQt1EvhULimgVO5A';

console.log('🔄 YouTube Channel ID更新');
console.log('=========================');
console.log(`旧チャンネルID: ${OLD_CHANNEL_ID}`);
console.log(`新チャンネルID: ${CORRECT_CHANNEL_ID}`);
console.log('');

// 新しいチャンネルURLの確認
const channelUrl = `https://www.youtube.com/channel/${CORRECT_CHANNEL_ID}`;
console.log('📺 正しいチャンネルURL:');
console.log(channelUrl);
console.log('');

// API URL構築テスト
const testApiKey = 'TEST_API_KEY';
const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${testApiKey}&channelId=${CORRECT_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;

console.log('🔗 更新されたAPI URL:');
console.log(apiUrl);
console.log('');

// .env.local設定例
console.log('📝 .env.local 設定内容:');
console.log(`YOUTUBE_CHANNEL_ID=${CORRECT_CHANNEL_ID}`);
console.log('YOUTUBE_API_KEY=your_youtube_api_key_here');
console.log('GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here');
console.log('');

console.log('✅ チャンネルID更新完了');
console.log('📋 次のステップ:');
console.log('1. 正しいチャンネルIDでシステムテスト実行');
console.log('2. YouTube API Key取得');
console.log('3. システム本格稼働');