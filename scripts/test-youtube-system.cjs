const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

/**
 * システムのテスト用モック動画データ
 */
const mockVideos = [
  {
    videoId: 'test_video_1',
    title: '【富山市】春の桜が美しい松川べり',
    description: '富山市の中心部を流れる松川。春になると美しい桜並木が楽しめます。',
    publishedAt: new Date().toISOString(),
    url: 'https://youtu.be/test_video_1'
  },
  {
    videoId: 'test_video_2', 
    title: '【氷見市】海越しの立山連峰が絶景',
    description: '氷見市から見る立山連峰の美しさをお楽しみください。',
    publishedAt: new Date().toISOString(),
    url: 'https://youtu.be/test_video_2'
  }
];

/**
 * 地域とカテゴリ抽出のテスト
 */
function testLocationExtraction() {
  console.log('🧪 地域・カテゴリ抽出テスト開始...');
  
  const { extractLocationAndCategory } = require('./check-youtube-and-create-articles.cjs');
  
  mockVideos.forEach(video => {
    const result = extractLocationAndCategory(video.title, video.description);
    console.log(`\n📹 動画: ${video.title}`);
    console.log(`📍 検出地域: ${result.location} (${result.locationSlug})`);
    console.log(`🏷️ カテゴリ: ${result.category}`);
  });
}

/**
 * モック記事作成テスト
 */
async function testArticleCreation() {
  console.log('\n📝 記事作成テスト開始...');
  
  const { extractLocationAndCategory, createSanityArticle } = require('./check-youtube-and-create-articles.cjs');
  
  for (const video of mockVideos) {
    const locationData = extractLocationAndCategory(video.title, video.description);
    
    if (locationData.location) {
      console.log(`\n🏗️ テスト記事作成中: ${video.title}`);
      
      // タイトル重複チェックのロジック
      const articleTitle = video.title.includes(`【${locationData.location}】`) 
        ? video.title 
        : `【${locationData.location}】${video.title}`;
      
      // テストモードでは実際には作成しない
      console.log(`✅ 記事作成準備完了 - ${locationData.location}の記事`);
      console.log(`   タイトル: ${articleTitle}`);
      console.log(`   カテゴリ: ${locationData.category}`);
      console.log(`   YouTube URL: ${video.url}`);
    }
  }
}

/**
 * メイン実行
 */
async function runTests() {
  console.log('🚀 YouTube自動記事作成システム テスト開始');
  console.log('⏰ テスト実行時刻:', new Date().toLocaleString('ja-JP'));
  
  try {
    // 地域抽出テスト
    testLocationExtraction();
    
    // 記事作成テスト
    await testArticleCreation();
    
    console.log('\n✅ 全テスト完了');
    console.log('\n📋 システム設定状況:');
    console.log(`   Sanity Token: ${process.env.SANITY_API_TOKEN ? '設定済み' : '未設定'}`);
    console.log(`   YouTube API Key: ${process.env.YOUTUBE_API_KEY ? '設定済み' : '未設定'}`);
    console.log(`   Google Maps API Key: ${process.env.GOOGLE_MAPS_API_KEY ? '設定済み' : '未設定'}`);
    console.log(`   YouTube Channel ID: ${process.env.YOUTUBE_CHANNEL_ID ? '設定済み' : '未設定'}`);
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error.message);
  }
}

runTests();