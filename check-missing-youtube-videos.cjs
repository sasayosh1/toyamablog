const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkMissingYouTubeVideos() {
  try {
    console.log('🔍 YouTube動画とSanity記事の照合開始...');
    
    // すべての記事を取得
    const allPosts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        youtubeUrl,
        _createdAt
      } | order(_createdAt desc)
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}記事`);
    
    // YouTube URLを持つ記事を分析
    const youtubeVideos = allPosts.filter(post => post.youtubeUrl);
    const nonYoutubeVideos = allPosts.filter(post => !post.youtubeUrl);
    
    console.log(`🎬 YouTube動画記事: ${youtubeVideos.length}記事`);
    console.log(`📝 非YouTube記事: ${nonYoutubeVideos.length}記事`);
    
    // YouTube動画IDを抽出
    const existingVideoIds = youtubeVideos.map(post => {
      const url = post.youtubeUrl;
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
      return {
        id: match ? match[1] : null,
        title: post.title,
        url: url,
        slug: post.slug?.current || 'no-slug',
        created: post._createdAt
      };
    }).filter(video => video.id);
    
    console.log(`🆔 抽出された動画ID数: ${existingVideoIds.length}個`);
    
    // 最新の動画情報を表示
    console.log('\n🎥 最新のYouTube動画（上位10件）:');
    existingVideoIds.slice(0, 10).forEach((video, index) => {
      const date = new Date(video.created).toLocaleDateString('ja-JP');
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   ID: ${video.id}`);
      console.log(`   作成日: ${date}`);
      console.log('');
    });
    
    // 手動での新動画確認プロンプト
    console.log('📺 新しい動画の確認方法:');
    console.log('1. YouTubeチャンネル（@sasayosh1）で最新動画をチェック');
    console.log('2. 上記リストにない動画IDがあれば未登録動画');
    console.log('3. 未登録動画が見つかった場合、動画URLをお知らせください');
    
    // 最近の動画パターンを分析
    const recentVideos = existingVideoIds.slice(0, 5);
    console.log('\n📈 最新動画の傾向:');
    recentVideos.forEach(video => {
      const isShorts = video.url.includes('/shorts/');
      const type = isShorts ? 'Shorts' : '通常動画';
      console.log(`・${type}: ${video.title.substring(0, 50)}...`);
    });
    
    return {
      totalPosts: allPosts.length,
      youtubeVideos: youtubeVideos.length,
      existingVideoIds: existingVideoIds.map(v => v.id)
    };
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkMissingYouTubeVideos();