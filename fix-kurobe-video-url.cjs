const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function fixKurobeVideoUrl() {
  try {
    // 黒部市記事（kurobe-city-1）を検索
    const query = `*[_type == "post" && slug.current == "kurobe-city-1"][0]{
      _id,
      title,
      body,
      videoUrl,
      youtubeUrl
    }`;
    
    const post = await client.fetch(query);
    
    if (!post) {
      console.log('❌ kurobe-city-1 記事が見つかりません');
      return;
    }

    console.log('✅ 記事発見:', post.title);
    console.log('現在の videoUrl:', post.videoUrl);
    console.log('現在の youtubeUrl:', post.youtubeUrl);

    // youtu.be形式を正しい埋め込み形式に変換
    const correctVideoUrl = 'https://www.youtube.com/embed/YhPgRnzYddk';
    const correctYoutubeUrl = 'https://www.youtube.com/watch?v=YhPgRnzYddk';

    // 記事を更新
    const updateResult = await client
      .patch(post._id)
      .set({
        videoUrl: correctVideoUrl,
        youtubeUrl: correctYoutubeUrl
      })
      .commit();

    console.log('✅ 動画URL修正完了');
    console.log('新しい videoUrl:', correctVideoUrl);
    console.log('新しい youtubeUrl:', correctYoutubeUrl);

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixKurobeVideoUrl();