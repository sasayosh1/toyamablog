const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function investigateThumbnailRegression() {
  try {
    console.log('🔍 サムネイル表示退行問題を調査中...');
    
    // 1. 最新記事のサムネイルデータを詳細確認
    console.log('\n📊 最新記事のサムネイル詳細データ:');
    const recentPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...10] {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail {
        asset-> {
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        alt
      },
      "thumbnailExists": defined(thumbnail),
      "thumbnailAssetExists": defined(thumbnail.asset),
      "thumbnailUrlExists": defined(thumbnail.asset.url)
    }`);
    
    recentPosts.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post._id}`);
      console.log(`   スラッグ: ${post.slug?.current}`);
      console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
      console.log(`   サムネイル設定: ${post.thumbnailExists ? '✅' : '❌'}`);
      console.log(`   アセット存在: ${post.thumbnailAssetExists ? '✅' : '❌'}`);
      console.log(`   URL存在: ${post.thumbnailUrlExists ? '✅' : '❌'}`);
      
      if (post.thumbnail?.asset?.url) {
        console.log(`   画像URL: ${post.thumbnail.asset.url}`);
        console.log(`   サイズ: ${post.thumbnail.asset.metadata?.dimensions ? 
          `${post.thumbnail.asset.metadata.dimensions.width}x${post.thumbnail.asset.metadata.dimensions.height}` : 
          '不明'}`);
      }
    });
    
    // 2. サムネイル統計の再確認
    console.log('\n📈 サムネイル統計:');
    const stats = await client.fetch(`{
      "total": count(*[_type == "post"]),
      "withThumbnail": count(*[_type == "post" && defined(thumbnail)]),
      "withValidAsset": count(*[_type == "post" && defined(thumbnail.asset)]),
      "withValidUrl": count(*[_type == "post" && defined(thumbnail.asset.url)])
    }`);
    
    console.log(`   総記事数: ${stats.total}`);
    console.log(`   サムネイル設定: ${stats.withThumbnail}件`);
    console.log(`   有効アセット: ${stats.withValidAsset}件`);
    console.log(`   有効URL: ${stats.withValidUrl}件`);
    
    // 3. PostCardコンポーネントで使用されるクエリをシミュレート
    console.log('\n🔄 PostCardクエリシミュレーション:');
    const postCardData = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...5] {
      _id,
      title,
      slug,
      youtubeUrl,
      categories,
      excerpt,
      displayExcerpt,
      thumbnail {
        asset-> {
          _ref,
          url
        },
        alt
      }
    }`);
    
    postCardData.forEach((post, idx) => {
      console.log(`\n${idx + 1}. PostCard用データ:`);
      console.log(`   タイトル: ${post.title.substring(0, 40)}...`);
      console.log(`   YouTube URL: ${post.youtubeUrl ? '✅' : '❌'}`);
      console.log(`   サムネイルアセット: ${post.thumbnail?.asset ? '✅' : '❌'}`);
      console.log(`   サムネイルURL: ${post.thumbnail?.asset?.url ? '✅' : '❌'}`);
      
      if (post.thumbnail?.asset?.url) {
        console.log(`   実際のURL: ${post.thumbnail.asset.url}`);
      }
      
      // PostCardロジックのシミュレーション
      let thumbnailUrl = null;
      if (post.thumbnail?.asset?.url) {
        thumbnailUrl = post.thumbnail.asset.url;
      } else if (post.youtubeUrl) {
        const videoIdMatch = post.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
      }
      
      console.log(`   PostCard表示URL: ${thumbnailUrl || 'なし'}`);
      console.log(`   表示可能: ${thumbnailUrl ? '✅' : '❌'}`);
    });
    
    // 4. 問題のある記事を特定
    console.log('\n⚠️ 問題のある記事を特定:');
    const problematicPosts = await client.fetch(`*[_type == "post" && (!defined(thumbnail.asset.url) && !defined(youtubeUrl))] {
      _id, title, slug
    }`);
    
    if (problematicPosts.length === 0) {
      console.log('   ✅ サムネイル表示不可能な記事なし');
    } else {
      console.log(`   ⚠️ ${problematicPosts.length}件のサムネイル表示不可能記事:`);
      problematicPosts.slice(0, 5).forEach(post => {
        console.log(`   - ${post.title} (${post.slug?.current})`);
      });
    }
    
    // 5. アセット参照の整合性チェック
    console.log('\n🔗 アセット参照の整合性チェック:');
    const brokenReferences = await client.fetch(`*[_type == "post" && defined(thumbnail) && !defined(thumbnail.asset->)] {
      _id, title, 
      "thumbnailRef": thumbnail.asset._ref
    }`);
    
    if (brokenReferences.length === 0) {
      console.log('   ✅ 壊れたアセット参照なし');
    } else {
      console.log(`   ⚠️ ${brokenReferences.length}件の壊れたアセット参照:`);
      brokenReferences.forEach(post => {
        console.log(`   - ${post.title}: ${post.thumbnailRef}`);
      });
    }
    
    console.log('\n🏁 調査完了');
    
  } catch (error) {
    console.error('❌ 調査エラー:', error.message);
  }
}

investigateThumbnailRegression();