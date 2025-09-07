// ささよしチャンネルのIDを取得するスクリプト
// YouTube APIを使わずに、チャンネル名から推定される一般的なチャンネルIDパターンを確認

const channelHandle = '@sasayoshi1';
const channelUrl = 'https://www.youtube.com/@sasayoshi1';

console.log('🔍 ささよしチャンネル情報調査');
console.log('=============================');
console.log(`チャンネルハンドル: ${channelHandle}`);
console.log(`チャンネルURL: ${channelUrl}`);
console.log('');

// 一般的なYouTubeチャンネルIDの形式
console.log('📋 チャンネルID取得方法:');
console.log('1. YouTube Studio → 設定 → チャンネル → 基本情報');
console.log('2. ブラウザでチャンネルページのソースを表示');
console.log('3. "channelId" で検索して UC... 形式のIDを確認');
console.log('4. または "channel_id" で検索');
console.log('');

// 既存記事からチャンネルIDのパターンを推定
const sampleVideoUrls = [
  'https://youtu.be/OIBhbYvAq5E',
  'https://youtu.be/z222Q-cQ8UM', 
  'https://youtu.be/YTM17yU-7Jg'
];

console.log('📺 既存の動画URL例:');
sampleVideoUrls.forEach((url, index) => {
  const videoId = url.split('/').pop();
  console.log(`${index + 1}. 動画ID: ${videoId}`);
});
console.log('');

// チャンネルIDの一般的なパターン
console.log('💡 チャンネルIDの特徴:');
console.log('- UC から始まる24文字の英数字');
console.log('- 例: UCxxxxxxxxxxxxxxxxxxxxxx');
console.log('- チャンネル作成時にYouTubeが自動生成');
console.log('');

// 代替案の提示
console.log('🔧 取得方法:');
console.log('1. YouTube Studio にログイン');
console.log('2. https://studio.youtube.com → 設定 → チャンネル');
console.log('3. 基本情報タブでチャンネルIDを確認');
console.log('4. または以下のURLでチャンネルIDを確認:');
console.log('   https://www.youtube.com/channel/[チャンネルID]');
console.log('');

console.log('⚠️  注意: チャンネルオーナーのみがチャンネルIDを正確に確認できます');
console.log('参考: @sasayoshi1 のチャンネルIDが必要です');

// 仮のチャンネルIDフォーマット例
const exampleChannelId = 'UCxxxxxxxxxxxxxxxxxxxxxxxxx';
console.log('');
console.log('📝 設定例:');
console.log(`YOUTUBE_CHANNEL_ID=${exampleChannelId}`);
console.log('※ 実際のチャンネルIDに置き換えてください');