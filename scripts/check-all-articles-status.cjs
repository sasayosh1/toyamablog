const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkAllArticles() {
  try {
    console.log('📊 全記事の状況を確認中...');
    
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      youtubeUrl,
      tags,
      category,
      publishedAt,
      body[_type == "html" && html match "*iframe*"] {
        _key,
        html
      }
    }`);
    
    console.log(`📝 総記事数: ${posts.length}件`);
    console.log('\n📋 記事詳細:');
    
    let hasVideo = 0;
    let hasMap = 0;
    let hasTags = 0;
    let needsWork = [];
    
    posts.forEach((post, index) => {
      const hasYoutube = !!post.youtubeUrl;
      const hasGoogleMap = post.body && post.body.some(block => 
        block.html && block.html.includes('maps.google.com')
      );
      const hasTagsSet = post.tags && post.tags.length > 0;
      
      if (hasYoutube) hasVideo++;
      if (hasGoogleMap) hasMap++;
      if (hasTagsSet) hasTags++;
      
      // 作業が必要な記事をリストアップ
      if (!hasYoutube || !hasGoogleMap || !hasTagsSet) {
        needsWork.push({
          id: post._id,
          title: post.title,
          slug: post.slug?.current,
          needsVideo: !hasYoutube,
          needsMap: !hasGoogleMap,
          needsTags: !hasTagsSet
        });
      }
      
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   スラッグ: ${post.slug?.current || 'なし'}`);
      console.log(`   カテゴリ: ${post.category || 'なし'}`);
      console.log(`   🎥 YouTube: ${hasYoutube ? '✅' : '❌'}`);
      console.log(`   🗺️ マップ: ${hasGoogleMap ? '✅' : '❌'}`);
      console.log(`   🏷️ タグ: ${hasTagsSet ? `✅ (${post.tags.length}件)` : '❌'}`);
      console.log(`   📅 投稿日: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ja-JP') : 'なし'}`);
      console.log('   ---');
    });
    
    console.log('\n📈 統計:');
    console.log(`📺 YouTube動画あり: ${hasVideo}件 / ${posts.length}件 (${Math.round(hasVideo/posts.length*100)}%)`);
    console.log(`🗺️ Googleマップあり: ${hasMap}件 / ${posts.length}件 (${Math.round(hasMap/posts.length*100)}%)`);
    console.log(`🏷️ タグ設定済み: ${hasTags}件 / ${posts.length}件 (${Math.round(hasTags/posts.length*100)}%)`);
    
    console.log(`\n🔧 作業が必要な記事: ${needsWork.length}件`);
    
    return needsWork;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return [];
  }
}

checkAllArticles();