const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkThumbnailData() {
  try {
    console.log('🔍 サムネイル表示問題を調査中...');
    
    // 最新記事数件のサムネイルデータを詳しく確認
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...5] {
      _id,
      title,
      slug,
      thumbnail {
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        alt
      },
      youtubeUrl,
      "hasThumbnail": defined(thumbnail)
    }`);
    
    console.log('📊 最新記事のサムネイル詳細データ:');
    posts.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 60)}...`);
      console.log(`   ID: ${post._id}`);
      console.log(`   スラッグ: ${post.slug?.current}`);
      console.log(`   YouTube URL: ${post.youtubeUrl ? '✅' : '❌'}`);
      console.log(`   サムネイル存在: ${post.hasThumbnail ? '✅' : '❌'}`);
      
      if (post.thumbnail?.asset) {
        console.log(`   画像URL: ${post.thumbnail.asset.url}`);
        console.log(`   画像ID: ${post.thumbnail.asset._id}`);
        console.log(`   サイズ: ${post.thumbnail.asset.metadata?.dimensions ? 
          `${post.thumbnail.asset.metadata.dimensions.width}x${post.thumbnail.asset.metadata.dimensions.height}` : 
          '不明'}`);
        console.log(`   LQIP: ${post.thumbnail.asset.metadata?.lqip ? '✅' : '❌'}`);
      } else {
        console.log(`   ⚠️ サムネイルアセットが見つかりません`);
      }
    });
    
    // 全記事のサムネイル統計
    const allPosts = await client.fetch(`*[_type == "post"] {
      "hasThumbnail": defined(thumbnail),
      "hasValidThumbnail": defined(thumbnail.asset)
    }`);
    
    const totalPosts = allPosts.length;
    const withThumbnail = allPosts.filter(p => p.hasThumbnail).length;
    const withValidThumbnail = allPosts.filter(p => p.hasValidThumbnail).length;
    
    console.log('\n📈 サムネイル統計:');
    console.log(`   総記事数: ${totalPosts}`);
    console.log(`   サムネイル設定済み: ${withThumbnail}件`);
    console.log(`   有効なサムネイルアセット: ${withValidThumbnail}件`);
    console.log(`   問題のある記事: ${withThumbnail - withValidThumbnail}件`);
    
    if (withThumbnail !== withValidThumbnail) {
      console.log('\n⚠️ サムネイル参照に問題がある可能性があります');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkThumbnailData();