const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function findLatestUnprocessedVideos() {
  try {
    console.log('🔍 最新の動画状況を詳細調査中...');
    
    // 最新の記事（過去1週間）を詳細取得
    const recentQuery = `*[_type == "post" && publishedAt > "2025-08-28T00:00:00Z"]{
      _id,
      title,
      youtubeUrl,
      videoUrl,
      slug,
      publishedAt,
      _createdAt,
      _updatedAt
    } | order(publishedAt desc)`;
    
    const recentPosts = await client.fetch(recentQuery);
    
    console.log(`📊 最新記事（8/28以降）: ${recentPosts.length}件`);
    console.log('\n=== 最新記事の詳細 ===');
    
    recentPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
      console.log(`   Video URL: ${post.videoUrl || 'なし'}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   公開日: ${new Date(post.publishedAt).toLocaleString('ja-JP')}`);
      console.log(`   作成日: ${new Date(post._createdAt).toLocaleString('ja-JP')}`);
      console.log('');
    });

    // より幅広く最新1ヶ月の記事を確認
    const monthQuery = `*[_type == "post" && publishedAt > "2025-08-01T00:00:00Z"]{
      _id,
      title,
      youtubeUrl,
      slug,
      publishedAt
    } | order(publishedAt desc)[0...20]`;
    
    const monthPosts = await client.fetch(monthQuery);
    
    console.log('\n=== 8月以降の記事（20件） ===');
    monthPosts.forEach((post, index) => {
      const videoId = post.youtubeUrl ? post.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)?.[1] : null;
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   動画ID: ${videoId || '不明'}`);
      console.log(`   投稿日: ${new Date(post.publishedAt).toLocaleDateString('ja-JP')}`);
      console.log('');
    });

    // 動画URLのパターン確認
    console.log('\n=== 動画URLパターン分析 ===');
    const allVideos = await client.fetch(`*[_type == "post" && defined(youtubeUrl)]{youtubeUrl}`);
    const urlPatterns = {};
    
    allVideos.forEach(post => {
      const url = post.youtubeUrl;
      if (url.includes('youtu.be')) urlPatterns['youtu.be'] = (urlPatterns['youtu.be'] || 0) + 1;
      else if (url.includes('youtube.com/shorts')) urlPatterns['shorts'] = (urlPatterns['shorts'] || 0) + 1;
      else if (url.includes('youtube.com/watch')) urlPatterns['watch'] = (urlPatterns['watch'] || 0) + 1;
      else if (url.includes('youtube.com/embed')) urlPatterns['embed'] = (urlPatterns['embed'] || 0) + 1;
      else urlPatterns['other'] = (urlPatterns['other'] || 0) + 1;
    });
    
    Object.entries(urlPatterns).forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count}件`);
    });

    return recentPosts;

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

findLatestUnprocessedVideos();