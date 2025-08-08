const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addYouTubeToTemple1() {
  try {
    console.log('📹 上市町のお寺記事1にYouTube動画を追加中...');
    
    // 記事をスラッグで検索
    const post = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-1"][0] {
      _id,
      title,
      youtubeUrl,
      slug
    }`);
    
    if (!post) {
      console.log('❌ kamiichi-town-temple-1 記事が見つかりませんでした');
      return { success: false, message: '記事が見つかりません' };
    }
    
    console.log('📋 現在の記事情報:');
    console.log(`   ID: ${post._id}`);
    console.log(`   タイトル: ${post.title}`);
    console.log(`   現在のYouTube URL: ${post.youtubeUrl || 'なし'}`);
    console.log(`   スラッグ: ${post.slug.current}`);
    
    // YouTube URLを追加/更新
    const newYouTubeUrl = 'https://youtu.be/nFv2JRkadks';
    
    await client
      .patch(post._id)
      .set({
        youtubeUrl: newYouTubeUrl,
        _updatedAt: new Date().toISOString() // キャッシュ無効化
      })
      .commit();
    
    console.log('\n✅ YouTube動画の追加が完了しました！');
    console.log('📊 更新内容:');
    console.log(`   追加したYouTube URL: ${newYouTubeUrl}`);
    console.log(`   記事URL: https://sasakiyoshimasa.com/blog/${post.slug.current}`);
    
    // 更新後の確認
    const updatedPost = await client.fetch(`*[_type == "post" && _id == "${post._id}"][0] {
      _id,
      title,
      youtubeUrl,
      _updatedAt
    }`);
    
    console.log('\n🔍 更新後の確認:');
    console.log(`   YouTube URL: ${updatedPost.youtubeUrl}`);
    console.log(`   更新日時: ${updatedPost._updatedAt}`);
    
    return { 
      success: true, 
      postId: post._id,
      youtubeUrl: newYouTubeUrl,
      slug: post.slug.current 
    };
    
  } catch (error) {
    console.error('❌ YouTube動画追加エラー:', error);
    return { success: false, error: error.message };
  }
}

addYouTubeToTemple1();