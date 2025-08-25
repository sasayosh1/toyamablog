const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testThumbnailFix() {
  try {
    console.log('🧪 修正後のSanityクエリをテスト中...');
    
    // 修正されたクエリをテスト
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc)[0...5] {
        _id,
        title,
        slug,
        youtubeUrl,
        thumbnail{
          asset{
            _ref,
            url
          },
          alt
        }
      }
    `);
    
    console.log(`\n📊 テスト結果: ${posts.length}件のポストを取得`);
    
    posts.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post._id}`);
      console.log(`   スラッグ: ${post.slug?.current}`);
      console.log(`   YouTube URL: ${post.youtubeUrl ? '✅' : '❌'}`);
      console.log(`   サムネイルアセット: ${post.thumbnail?.asset ? '✅' : '❌'}`);
      console.log(`   サムネイルURL: ${post.thumbnail?.asset?.url ? '✅' : '❌'}`);
      
      if (post.thumbnail?.asset?.url) {
        console.log(`   🖼️ URL: ${post.thumbnail.asset.url}`);
      }
      
      // PostCardロジックのシミュレーション
      let thumbnailUrl = null;
      if (post.thumbnail?.asset?.url) {
        thumbnailUrl = post.thumbnail.asset.url;
        console.log(`   🎯 PostCard表示: Sanityサムネイル`);
      } else if (post.youtubeUrl) {
        const videoIdMatch = post.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
          console.log(`   🎯 PostCard表示: YouTube動的取得`);
        }
      }
      
      console.log(`   📱 表示結果: ${thumbnailUrl ? '✅ 表示可能' : '❌ 表示不可'}`);
    });
    
    // サムネイル成功率の計算
    const withSanityThumbnail = posts.filter(post => post.thumbnail?.asset?.url).length;
    const withYouTube = posts.filter(post => post.youtubeUrl && !post.thumbnail?.asset?.url).length;
    const displayable = withSanityThumbnail + withYouTube;
    
    console.log(`\n📈 表示成功率分析:`);
    console.log(`   Sanityサムネイル: ${withSanityThumbnail}件`);
    console.log(`   YouTube代替: ${withYouTube}件`);
    console.log(`   合計表示可能: ${displayable}/${posts.length}件 (${(displayable/posts.length*100).toFixed(1)}%)`);
    
    if (displayable === posts.length) {
      console.log('   🎉 全記事のサムネイル表示が可能！');
      return true;
    } else {
      console.log('   ⚠️ 一部記事のサムネイル表示に問題があります');
      return false;
    }
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    return false;
  }
}

testThumbnailFix().then(success => {
  console.log(`\n🏁 テスト完了: ${success ? '成功' : '失敗'}`);
  process.exit(success ? 0 : 1);
});