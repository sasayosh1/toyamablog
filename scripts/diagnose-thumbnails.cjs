const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function diagnoseThumbnails() {
  console.log('🔍 トップページ記事のサムネイル診断を開始します...\n');

  // ホームページと同じクエリで最初の20記事を取得
  const posts = await client.fetch(`
    *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...20] {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail {
        asset -> {
          _ref,
          url
        },
        alt
      },
      publishedAt
    }
  `);

  console.log(`📊 取得記事数: ${posts.length}件\n`);
  console.log('=' .repeat(80));

  let noThumbnailCount = 0;
  let noYoutubeCount = 0;
  let hasBothCount = 0;
  let hasEitherCount = 0;

  posts.forEach((post, index) => {
    const hasThumbnail = !!(post.thumbnail?.asset?.url);
    const hasYoutube = !!post.youtubeUrl;

    console.log(`\n📄 記事 ${index + 1}: ${post.title?.substring(0, 50)}...`);
    console.log(`   Slug: ${post.slug?.current || 'なし'}`);
    console.log(`   公開日: ${post.publishedAt || 'なし'}`);
    console.log(`   サムネイル: ${hasThumbnail ? '✅ あり' : '❌ なし'}`);
    if (hasThumbnail) {
      console.log(`   サムネイルURL: ${post.thumbnail.asset.url.substring(0, 60)}...`);
    }
    console.log(`   YouTubeURL: ${hasYoutube ? '✅ あり' : '❌ なし'}`);
    if (hasYoutube) {
      const videoId = post.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      console.log(`   YouTube ID: ${videoId || '取得失敗'}`);
      if (videoId) {
        console.log(`   YouTube サムネイル: https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      }
    }

    // 統計
    if (!hasThumbnail && !hasYoutube) {
      noThumbnailCount++;
      noYoutubeCount++;
    } else if (hasThumbnail && hasYoutube) {
      hasBothCount++;
    } else if (hasThumbnail || hasYoutube) {
      hasEitherCount++;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n📈 統計サマリー:');
  console.log(`   ✅ サムネイル・YouTube両方あり: ${hasBothCount}件`);
  console.log(`   ⚠️  どちらか片方のみ: ${hasEitherCount}件`);
  console.log(`   ❌ サムネイル・YouTube両方なし: ${noThumbnailCount}件`);
  console.log(`\n🎯 問題分析:`);

  if (noThumbnailCount > 0) {
    console.log(`   ⚠️  サムネイルもYouTubeもない記事が${noThumbnailCount}件存在します`);
    console.log(`   → これらの記事はSVGフォールバック画像が表示されるはずです`);
  }

  if (noThumbnailCount === 0 && hasBothCount === posts.length) {
    console.log(`   ✅ 全記事にサムネイルデータがあります`);
    console.log(`   → フロントエンド側の表示問題の可能性があります`);
  }

  const thumbnailOnlyCount = posts.filter(p => p.thumbnail?.asset?.url && !p.youtubeUrl).length;
  const youtubeOnlyCount = posts.filter(p => !p.thumbnail?.asset?.url && p.youtubeUrl).length;

  if (thumbnailOnlyCount > 0) {
    console.log(`   📸 Sanityサムネイルのみ: ${thumbnailOnlyCount}件`);
  }
  if (youtubeOnlyCount > 0) {
    console.log(`   🎥 YouTubeサムネイルのみ: ${youtubeOnlyCount}件`);
  }

  console.log('\n✅ 診断完了\n');
}

diagnoseThumbnails().catch(error => {
  console.error('❌ エラー発生:', error.message);
  process.exit(1);
});
