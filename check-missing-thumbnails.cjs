const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function checkMissingThumbnails() {
  console.log('🔍 サムネイル未表示記事を特定しています...');
  
  try {
    // 全記事のサムネイル関連情報を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...50] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        thumbnail {
          asset -> {
            _id,
            url
          },
          alt
        },
        youtubeUrl,
        excerpt,
        description
      }
    `);
    
    console.log(`📊 検索結果: ${posts.length}件の記事を確認\n`);
    
    let missingThumbnailCount = 0;
    let hasYoutubeThumbnailCount = 0;
    let hasSanityThumbnailCount = 0;
    let totallyMissingCount = 0;
    
    const problematicPosts = [];
    
    posts.forEach((post, index) => {
      const hasYoutube = !!post.youtubeUrl;
      const hasSanityThumbnail = !!(post.thumbnail?.asset?.url);
      const hasAnyThumbnail = hasYoutube || hasSanityThumbnail;
      
      if (hasYoutube) hasYoutubeThumbnailCount++;
      if (hasSanityThumbnail) hasSanityThumbnailCount++;
      
      if (!hasAnyThumbnail) {
        totallyMissingCount++;
        problematicPosts.push({
          ...post,
          issue: 'NO_THUMBNAIL'
        });
        console.log(`❌ サムネイル未設定: ${post.title}`);
        console.log(`   スラッグ: ${post.slug}`);
        console.log(`   YouTube URL: 未設定`);
        console.log(`   Sanity画像: 未設定\n`);
      } else if (hasYoutube && !hasSanityThumbnail) {
        // YouTube URLがあるがSanity画像がない場合
        const youtubeId = extractYouTubeId(post.youtubeUrl);
        if (!youtubeId) {
          problematicPosts.push({
            ...post,
            issue: 'INVALID_YOUTUBE_URL'
          });
          console.log(`⚠️ YouTube URL無効: ${post.title}`);
          console.log(`   スラッグ: ${post.slug}`);
          console.log(`   YouTube URL: ${post.youtubeUrl}`);
          console.log(`   Sanity画像: 未設定\n`);
        }
      } else if (!hasYoutube && hasSanityThumbnail) {
        // Sanity画像があるがYouTube URLがない場合
        if (!post.thumbnail.asset.url.startsWith('http')) {
          problematicPosts.push({
            ...post,
            issue: 'INVALID_SANITY_IMAGE'
          });
          console.log(`⚠️ Sanity画像URL無効: ${post.title}`);
          console.log(`   スラッグ: ${post.slug}`);
          console.log(`   画像URL: ${post.thumbnail.asset.url}\n`);
        }
      }
    });
    
    console.log('\n📊 サムネイル状況サマリー:');
    console.log(`✅ YouTube URL設定済み: ${hasYoutubeThumbnailCount}件`);
    console.log(`✅ Sanity画像設定済み: ${hasSanityThumbnailCount}件`);
    console.log(`❌ サムネイル完全未設定: ${totallyMissingCount}件`);
    console.log(`⚠️ 問題のある記事: ${problematicPosts.length}件`);
    
    if (problematicPosts.length > 0) {
      console.log('\n🔧 修正が必要な記事:');
      problematicPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   問題: ${getIssueDescription(post.issue)}`);
        console.log(`   ID: ${post._id}`);
        console.log(`   スラッグ: ${post.slug}\n`);
      });
      
      return problematicPosts;
    } else {
      console.log('\n✅ 全ての記事にサムネイル表示用の画像が設定されています');
      return [];
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    return [];
  }
}

function extractYouTubeId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function getIssueDescription(issue) {
  const descriptions = {
    'NO_THUMBNAIL': 'サムネイル完全未設定',
    'INVALID_YOUTUBE_URL': 'YouTube URL無効',
    'INVALID_SANITY_IMAGE': 'Sanity画像URL無効'
  };
  return descriptions[issue] || '不明な問題';
}

checkMissingThumbnails().then(problematicPosts => {
  if (problematicPosts.length > 0) {
    console.log(`\n💡 ${problematicPosts.length}件の記事でサムネイル修正が必要です`);
  }
});