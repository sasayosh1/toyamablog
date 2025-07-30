import { createClient } from '@sanity/client';

// 公開データセットなので読み取り専用でもドキュメント作成をテスト
const client = createClient({
  projectId: 'ef65ti2e',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function createPostDirect() {
  // まず既存のドキュメントを確認
  try {
    console.log('📡 Sanity接続テスト中...');
    
    const existingPosts = await client.fetch('*[_type == "blogPost"]');
    console.log('✅ Sanity接続成功！');
    console.log(`📊 既存記事数: ${existingPosts.length}`);
    
    if (existingPosts.length > 0) {
      console.log('📝 既存記事:');
      existingPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}" (${post.slug?.current || '無題'})`);
      });
    }
    
    // サンプルデータを準備
    const sampleDoc = {
      _type: 'blogPost',
      _id: 'sample-youtube-shorts-post',
      title: '富山の美しい景色をYouTube Shortsで紹介',
      slug: {
        _type: 'slug',
        current: 'toyama-youtube-shorts-demo'
      },
      description: '富山県の魅力的な風景をYouTube Shortsで短時間で楽しめる動画として紹介します。立山連峰の雄大な景色をご覧ください。',
      pubDate: new Date().toISOString(),
      tags: ['富山', 'YouTube Shorts', '風景', '立山連峰'],
      content: [
        {
          _type: 'block',
          _key: 'intro-heading',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: '富山の絶景をショート動画で'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'intro-text',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: '富山県は日本海側に位置し、美しい自然景観で知られています。特に立山連峰の雄大な山々は一見の価値があります。'
            }
          ]
        },
        {
          _type: 'youtubeShorts',
          _key: 'demo-video',
          url: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
          title: '立山連峰の美しい風景（デモ動画）',
          autoplay: false,
          showControls: true
        },
        {
          _type: 'block',
          _key: 'middle-text',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'YouTube Shortsの縦長フォーマットは、スマートフォンでの視聴に最適化されており、短時間で印象的な映像を楽しむことができます。'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'features-heading',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: '実装された機能'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'features-text',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'このブログシステムでは、YouTube ShortsのURLを貼り付けるだけで、自動的に縦長レスポンシブ表示に対応し、美しく埋め込むことができます。'
            }
          ]
        },
        {
          _type: 'youtubeShorts',
          _key: 'demo-video-2',
          url: 'https://youtu.be/dQw4w9WgXcQ',
          title: 'YouTube短縮URLのテスト',
          autoplay: false,
          showControls: true
        },
        {
          _type: 'block',
          _key: 'outro-text',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'このような短い動画でも、富山の魅力を十分に感じていただけると思います。ぜひ実際に富山を訪れて、この美しい景色を体験してください。'
            }
          ]
        }
      ]
    };
    
    console.log('\n📝 サンプル記事データ準備完了');
    console.log('記事タイトル:', sampleDoc.title);
    console.log('スラッグ:', sampleDoc.slug.current);
    console.log('YouTube Shortsコンテンツ数:', sampleDoc.content.filter(item => item._type === 'youtubeShorts').length);
    
    console.log('\n🔑 記事作成にはAPIトークンが必要です。');
    console.log('手動でSanity Studioから作成するか、APIトークンを設定してください。');
    console.log('Sanity Studio: http://localhost:4321/studio');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

createPostDirect();