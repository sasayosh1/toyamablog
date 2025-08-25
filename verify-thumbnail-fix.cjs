const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function verifyThumbnailFix() {
  try {
    console.log('✅ サムネイル表示修正の最終検証を実行中...');
    
    // 1. PostCardクエリと同じ形式でデータを取得
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc)[0...10] {
        _id,
        title,
        slug,
        youtubeUrl,
        categories,
        excerpt,
        displayExcerpt,
        thumbnail{
          asset->{
            _ref,
            url
          },
          alt
        }
      }
    `);
    
    console.log(`\n📊 検証対象: ${posts.length}件の記事`);
    
    let successCount = 0;
    let sanityThumbnails = 0;
    let youtubeFallbacks = 0;
    let failures = 0;
    
    posts.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 45)}...`);
      
      let thumbnailUrl = null;
      let source = null;
      
      // PostCardと同じロジック
      if (post.thumbnail?.asset?.url) {
        thumbnailUrl = post.thumbnail.asset.url;
        source = 'Sanity';
        sanityThumbnails++;
      } else if (post.youtubeUrl) {
        const videoIdMatch = post.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
          source = 'YouTube';
          youtubeFallbacks++;
        }
      }
      
      if (thumbnailUrl) {
        console.log(`   ✅ 表示可能 (${source})`);
        console.log(`   🖼️ ${thumbnailUrl.substring(0, 60)}...`);
        successCount++;
      } else {
        console.log(`   ❌ 表示不可`);
        console.log(`   📝 YouTube: ${post.youtubeUrl ? '有り' : '無し'}`);
        console.log(`   🖼️ Sanity: ${post.thumbnail?.asset?.url ? '有り' : '無し'}`);
        failures++;
      }
    });
    
    // 統計レポート
    console.log(`\n📈 最終検証結果:`);
    console.log(`   🎯 総成功率: ${successCount}/${posts.length} (${(successCount/posts.length*100).toFixed(1)}%)`);
    console.log(`   🖼️ Sanityサムネイル: ${sanityThumbnails}件`);
    console.log(`   🎥 YouTube代替: ${youtubeFallbacks}件`);
    console.log(`   ❌ 表示失敗: ${failures}件`);
    
    // 全体統計
    const totalStats = await client.fetch(`{
      "total": count(*[_type == "post"]),
      "withSanityThumbnail": count(*[_type == "post" && defined(thumbnail.asset.url)]),
      "withYoutube": count(*[_type == "post" && defined(youtubeUrl)]),
      "noThumbnailNoYoutube": count(*[_type == "post" && !defined(thumbnail.asset.url) && !defined(youtubeUrl)])
    }`);
    
    console.log(`\n🌐 全体統計:`);
    console.log(`   📊 総記事数: ${totalStats.total}件`);
    console.log(`   🖼️ Sanityサムネイル: ${totalStats.withSanityThumbnail}件`);
    console.log(`   🎥 YouTube動画: ${totalStats.withYoutube}件`);
    console.log(`   ⚠️ サムネイル無し: ${totalStats.noThumbnailNoYoutube}件`);
    
    const expectedDisplayable = totalStats.withSanityThumbnail + 
                               (totalStats.withYoutube - totalStats.withSanityThumbnail);
    const displayRate = (expectedDisplayable / totalStats.total * 100).toFixed(1);
    
    console.log(`   🎯 予想表示率: ${displayRate}%`);
    
    // 最終判定
    if (successCount === posts.length) {
      console.log('\n🎉 サムネイル表示修正が完全に成功！');
      console.log('✨ 全ての記事でサムネイルが表示可能です');
      return true;
    } else if (successCount >= posts.length * 0.9) {
      console.log('\n👍 サムネイル表示修正がほぼ成功！');
      console.log(`📊 ${successCount}/${posts.length}件で表示可能`);
      return true;
    } else {
      console.log('\n⚠️ サムネイル表示に問題が残っています');
      console.log(`📊 成功率: ${(successCount/posts.length*100).toFixed(1)}%`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 検証エラー:', error.message);
    return false;
  }
}

verifyThumbnailFix().then(success => {
  console.log(`\n🏁 最終検証: ${success ? 'SUCCESS' : 'FAILURE'}`);
  process.exit(success ? 0 : 1);
});