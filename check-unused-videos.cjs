const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function checkUnusedVideos() {
  try {
    console.log('🔍 YouTube動画付きの記事を調査中...');
    
    // YouTube動画URLを持つ記事を取得
    const query = `*[_type == "post" && defined(youtubeUrl)]{
      _id,
      title,
      youtubeUrl,
      slug,
      publishedAt,
      body[]{
        ...,
        _type == "html" => {
          "hasVideo": html match "*youtube*" || html match "*youtu.be*"
        }
      }
    } | order(publishedAt desc)`;
    
    const posts = await client.fetch(query);
    
    console.log(`📺 YouTube動画付き記事: ${posts.length}件`);
    console.log('\n=== 最新の動画付き記事（上位10件）===');
    
    posts.slice(0, 10).forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   URL: ${post.youtubeUrl}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   投稿日: ${new Date(post.publishedAt).toLocaleDateString('ja-JP')}`);
      console.log('');
    });

    // 最新の動画URLを分析
    const videoIds = posts.map(post => {
      if (post.youtubeUrl) {
        const match = post.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      }
      return null;
    }).filter(Boolean);

    console.log('\n=== 使用されている動画ID（最新5件）===');
    videoIds.slice(0, 5).forEach((videoId, index) => {
      console.log(`${index + 1}. ${videoId} (https://youtu.be/${videoId})`);
    });

    // 動画なし記事もチェック
    const noVideoQuery = `*[_type == "post" && !defined(youtubeUrl) && !defined(videoUrl)]{
      _id,
      title,
      slug,
      publishedAt
    } | order(publishedAt desc)[0...5]`;
    
    const noVideoPosts = await client.fetch(noVideoQuery);
    
    console.log('\n=== 動画なし記事（最新5件）===');
    noVideoPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log('');
    });

    return { videoPosts: posts, noVideoPosts };

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkUnusedVideos();