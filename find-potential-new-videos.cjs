const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findPotentialNewVideos() {
  try {
    console.log('🔍 潜在的な新しいYouTube動画を検索中...');
    
    // 最近の動画パターンを分析
    const recentPosts = await client.fetch(`
      *[_type == "post" && defined(youtubeUrl)] | order(_createdAt desc) [0...20] {
        title,
        youtubeUrl,
        _createdAt,
        category
      }
    `);
    
    console.log(`📊 最近の動画記事: ${recentPosts.length}件`);
    
    // 動画IDを抽出
    const videoIds = recentPosts.map(post => {
      const match = post.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
      return {
        id: match ? match[1] : null,
        title: post.title,
        url: post.youtubeUrl,
        created: post._createdAt,
        category: post.category
      };
    }).filter(video => video.id);
    
    // 投稿パターンの分析
    const postDates = recentPosts.map(post => new Date(post._createdAt));
    const today = new Date();
    
    console.log('\n📅 最近の投稿パターン:');
    videoIds.slice(0, 10).forEach((video, index) => {
      const date = new Date(video.created);
      const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      console.log(`${index + 1}. ${video.title.substring(0, 60)}...`);
      console.log(`   投稿: ${date.toLocaleDateString('ja-JP')} (${daysAgo}日前)`);
      console.log(`   ID: ${video.id}`);
      console.log('');
    });
    
    // 最も古い動画と最新動画の間隔を計算
    if (videoIds.length >= 2) {
      const oldestDate = new Date(videoIds[videoIds.length - 1].created);
      const newestDate = new Date(videoIds[0].created);
      const totalDays = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
      const averageInterval = Math.floor(totalDays / videoIds.length);
      
      console.log('📈 投稿パターン分析:');
      console.log(`・期間: ${totalDays}日間に${videoIds.length}本の動画`);
      console.log(`・平均間隔: ${averageInterval}日に1本`);
      
      const daysSinceLastVideo = Math.floor((today - newestDate) / (1000 * 60 * 60 * 24));
      console.log(`・最新動画からの経過: ${daysSinceLastVideo}日`);
      
      if (daysSinceLastVideo > averageInterval) {
        console.log(`\n🚨 注意: 平均投稿間隔(${averageInterval}日)を超過しています！`);
        console.log('💡 新しい動画が投稿されている可能性があります');
      }
    }
    
    // 手動確認のための情報
    console.log('\n🔍 手動確認の方法:');
    console.log('1. YouTubeで直接チャンネルを確認');
    console.log('2. 最新動画ID一覧と照合:');
    const latestIds = videoIds.slice(0, 5).map(v => v.id);
    latestIds.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });
    
    console.log('\n📝 新しい動画を発見した場合:');
    console.log('動画のURL全体をお知らせください');
    console.log('例: https://youtube.com/shorts/XXXXXXXXXXX');
    
    return videoIds;
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

findPotentialNewVideos();