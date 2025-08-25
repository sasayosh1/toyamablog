const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function checkVideosWithoutThumbnails() {
  try {
    console.log('🔍 動画があってサムネイルがない記事を確認中...');
    
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...10] {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    console.log(`📊 対象記事数: ${articles.length} / 最初の10件を表示`);
    
    if (articles.length > 0) {
      console.log('\n📋 記事一覧:');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`   YouTube URL: ${article.youtubeUrl}`);
        console.log(`   スラッグ: ${article.slug.current}`);
        console.log('');
      });
    } else {
      console.log('✅ 動画があってサムネイルがない記事はありません');
    }
    
    // 動画URLの有効性を確認（最初の3件）
    console.log('🔗 動画URL有効性確認（最初の3件）:');
    const testArticles = articles.slice(0, 3);
    
    for (const article of testArticles) {
      const videoId = extractVideoId(article.youtubeUrl);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        try {
          const response = await fetch(thumbnailUrl);
          console.log(`${article.title.substring(0, 40)}...: ${response.ok ? '✅ 有効' : '❌ 無効'}`);
        } catch (error) {
          console.log(`${article.title.substring(0, 40)}...: ❌ エラー`);
        }
      }
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkVideosWithoutThumbnails();