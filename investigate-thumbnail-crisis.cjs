const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function investigateThumbnailIssue() {
  try {
    console.log('🔍 緊急調査: サムネイル消失問題...');
    
    // 1. 全記事のサムネイル状況を確認
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) [0...10] { 
      _id, 
      title, 
      "hasThumbnail": defined(thumbnail),
      thumbnail,
      youtubeUrl,
      "thumbnailAssetId": thumbnail.asset._ref
    }`);
    
    console.log('📊 最新10記事のサムネイル状況:');
    posts.forEach((post, i) => {
      console.log(`${i+1}. ${post.title.substring(0, 40)}...`);
      console.log(`   サムネイル定義: ${post.hasThumbnail ? '✅' : '❌'}`);
      console.log(`   アセットID: ${post.thumbnailAssetId || 'なし'}`);
      console.log(`   YouTube URL: ${post.youtubeUrl ? '✅' : '❌'}`);
      console.log('');
    });
    
    // 2. サムネイル有無の統計
    const totalPosts = await client.fetch('count(*[_type == "post"])');
    const postsWithThumbnail = await client.fetch('count(*[_type == "post" && defined(thumbnail)])');
    const postsWithoutThumbnail = totalPosts - postsWithThumbnail;
    
    console.log('📈 サムネイル統計:');
    console.log(`総記事数: ${totalPosts}件`);
    console.log(`サムネイルあり: ${postsWithThumbnail}件`);
    console.log(`サムネイルなし: ${postsWithoutThumbnail}件`);
    console.log(`消失率: ${Math.round((postsWithoutThumbnail / totalPosts) * 100)}%`);
    
    // 3. 画像アセットの状況確認
    const imageAssets = await client.fetch('*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...5] { _id, originalFilename, _createdAt }');
    
    console.log('\n🖼️ 最新画像アセット:');
    imageAssets.forEach((asset, i) => {
      const createTime = new Date(asset._createdAt).toLocaleString('ja-JP');
      console.log(`${i+1}. ${asset.originalFilename} (${createTime})`);
    });
    
    // 4. 問題の特定
    if (postsWithoutThumbnail > totalPosts * 0.5) {
      console.log('\n🚨 重大問題: 50%以上のサムネイルが消失');
      console.log('💡 対策: 一括再生成が必要');
    } else if (postsWithoutThumbnail > 0) {
      console.log(`\n⚠️ 部分的問題: ${postsWithoutThumbnail}件のサムネイル消失`);
      console.log('💡 対策: 個別修復で対応可能');
    } else {
      console.log('\n✅ サムネイル問題なし: すべて正常');
    }
    
    // 5. YouTube動画とサムネイル関連性チェック
    const postsWithVideoButNoThumbnail = await client.fetch('count(*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)])');
    console.log(`\n📹 YouTube動画ありでサムネイルなし: ${postsWithVideoButNoThumbnail}件`);
    
    if (postsWithVideoButNoThumbnail > 0) {
      console.log('💡 YouTube動画からサムネイル再生成可能');
    }
    
  } catch (error) {
    console.error('❌ 調査エラー:', error.message);
  }
}

investigateThumbnailIssue();