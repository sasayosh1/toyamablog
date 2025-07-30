import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function getLatestVideos() {
  try {
    console.log('🔍 最新動画データ調査中...');
    
    // 「PAIN D'OR」記事を基準点として特定
    const painDorPost = await client.fetch(`
      *[_type == "post" && title match "*PAIN D'OR*"] | order(publishedAt desc) [0] {
        _id,
        title,
        publishedAt
      }
    `);
    
    if (painDorPost) {
      console.log(`📍 基準記事: ${painDorPost.title}`);
      console.log(`📅 基準日時: ${painDorPost.publishedAt}`);
    }
    
    // PAIN D'OR以降の全記事を取得
    const allRecentPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "${painDorPost ? painDorPost.publishedAt : '2024-01-01'}" && title match "【*"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        youtubeUrl,
        description,
        tags,
        category
      }
    `);
    
    console.log(`\n📊 【】で始まるタイトルの動画: ${allRecentPosts.length}件`);
    
    // YouTubeURLが設定されていない記事を特定
    const postsWithoutYoutube = allRecentPosts.filter(post => !post.youtubeUrl);
    const postsWithYoutube = allRecentPosts.filter(post => post.youtubeUrl);
    
    console.log(`\n📹 YouTube URL設定済み: ${postsWithYoutube.length}件`);
    console.log(`❌ YouTube URL未設定: ${postsWithoutYoutube.length}件`);
    
    // 詳細情報を表示
    console.log('\n🎬 YouTube URL設定済み記事:');
    postsWithYoutube.slice(0, 10).forEach((post, i) => {
      console.log(`${i+1}. ${post.title.substring(0, 60)}...`);
      console.log(`   URL: ${post.youtubeUrl}`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log('');
    });
    
    console.log('\n❓ YouTube URL未設定記事:');
    postsWithoutYoutube.slice(0, 10).forEach((post, i) => {
      console.log(`${i+1}. ${post.title.substring(0, 60)}...`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log('');
    });
    
    // 分析結果を返す
    return {
      totalPosts: allRecentPosts.length,
      postsWithYoutube: postsWithYoutube.length,
      postsWithoutYoutube: postsWithoutYoutube.length,
      recentPosts: allRecentPosts,
      missingYoutube: postsWithoutYoutube
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

getLatestVideos().then(result => {
  if (result) {
    console.log('\n📈 調査完了サマリー:');
    console.log(`- 総記事数: ${result.totalParts}件`);
    console.log(`- YouTube設定済み: ${result.postsWithYoutube}件`);
    console.log(`- YouTube未設定: ${result.postsWithoutYoutube}件`);
    
    if (result.postsWithoutYoutube > 0) {
      console.log('\n🔧 次のステップ: YouTube URL未設定記事への対応が必要です');
    }
  }
});