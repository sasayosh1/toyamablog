const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findHimiOnsenArticle() {
  try {
    console.log('🔍 氷見市温泉記事を検索中...');
    
    // スラッグで検索
    let article = await client.fetch(`*[_type == "post" && slug.current == "himi-city-onsen"][0] {
      _id, title, slug, youtubeUrl, category
    }`);
    
    if (!article) {
      // 氷見市の記事を検索
      const himiPosts = await client.fetch(`*[_type == "post" && (title match "*氷見*" || category match "*氷見*")] {
        _id, title, slug, youtubeUrl, category
      }`);
      
      console.log(`氷見市関連記事: ${himiPosts.length}件`);
      himiPosts.forEach(post => {
        console.log(`- ${post.title} | ${post.slug.current} | ${post.category}`);
      });
      
      // 温泉関連を探す
      article = himiPosts.find(post => 
        post.title.includes('温泉') || post.slug.current.includes('onsen')
      );
    }
    
    if (article) {
      console.log('✅ 記事が見つかりました:');
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   スラッグ: ${article.slug.current}`);
      console.log(`   現在のYouTube URL: ${article.youtubeUrl || 'なし'}`);
      console.log(`   カテゴリー: ${article.category}`);
      
      // YouTube URLを更新
      console.log('🎥 YouTube URLを更新中...');
      await client
        .patch(article._id)
        .set({
          youtubeUrl: 'https://youtu.be/j0u3BnJTMTk',
          _updatedAt: new Date().toISOString()
        })
        .commit();
      
      console.log('✅ YouTube URLを更新しました: https://youtu.be/j0u3BnJTMTk');
      
    } else {
      console.log('❌ 氷見市温泉記事が見つかりませんでした');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

findHimiOnsenArticle();