const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function getArticlesSummary() {
  try {
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      youtubeUrl,
      tags,
      category,
      publishedAt,
      body
    }`);
    
    console.log(`📊 総記事数: ${posts.length}件`);
    
    let hasVideo = 0;
    let hasMap = 0;
    let hasTags = 0;
    let needsWork = [];
    
    posts.forEach((post) => {
      const hasYoutube = !!post.youtubeUrl;
      const hasGoogleMap = post.body && post.body.some(block => 
        block._type === 'html' && 
        block.html && 
        (block.html.includes('maps.google.com') || 
         block.html.includes('google.com/maps') || 
         block.html.includes('maps'))
      );
      const hasTagsSet = post.tags && post.tags.length > 0;
      
      if (hasYoutube) hasVideo++;
      if (hasGoogleMap) hasMap++;
      if (hasTagsSet) hasTags++;
      
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
    });
    
    console.log(`\n📈 統計:`);
    console.log(`📺 YouTube動画あり: ${hasVideo}件 / ${posts.length}件 (${Math.round(hasVideo/posts.length*100)}%)`);
    console.log(`🗺️ Googleマップあり: ${hasMap}件 / ${posts.length}件 (${Math.round(hasMap/posts.length*100)}%)`);
    console.log(`🏷️ タグ設定済み: ${hasTags}件 / ${posts.length}件 (${Math.round(hasTags/posts.length*100)}%)`);
    
    console.log(`\n🔧 作業が必要な記事: ${needsWork.length}件`);
    
    // 必要な作業を種類別に分類
    const needsVideoOnly = needsWork.filter(p => p.needsVideo && !p.needsMap && !p.needsTags);
    const needsMapOnly = needsWork.filter(p => !p.needsVideo && p.needsMap && !p.needsTags);
    const needsTagsOnly = needsWork.filter(p => !p.needsVideo && !p.needsMap && p.needsTags);
    const needsMultiple = needsWork.filter(p => (p.needsVideo ? 1 : 0) + (p.needsMap ? 1 : 0) + (p.needsTags ? 1 : 0) > 1);
    
    console.log(`\n📊 作業内訳:`);
    console.log(`🎥 動画のみ必要: ${needsVideoOnly.length}件`);
    console.log(`🗺️ マップのみ必要: ${needsMapOnly.length}件`);
    console.log(`🏷️ タグのみ必要: ${needsTagsOnly.length}件`);
    console.log(`🔧 複数項目必要: ${needsMultiple.length}件`);
    
    // 最初の5件を表示
    console.log(`\n🚨 最初に対処すべき記事（上位5件）:`);
    needsWork.slice(0, 5).forEach((post, index) => {
      const needs = [];
      if (post.needsVideo) needs.push('動画');
      if (post.needsMap) needs.push('マップ');
      if (post.needsTags) needs.push('タグ');
      
      console.log(`${index + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   ID: ${post.id}`);
      console.log(`   必要項目: ${needs.join('、')}`);
      console.log('   ---');
    });
    
    return needsWork;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return [];
  }
}

getArticlesSummary();