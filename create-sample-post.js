import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ef65ti2e',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN // 管理者権限のトークンが必要
});

async function createSamplePost() {
  try {
    const doc = {
      _type: 'blogPost',
      title: '富山の美しい景色をYouTube Shortsで紹介',
      slug: {
        _type: 'slug',
        current: 'toyama-beautiful-scenery-youtube-shorts'
      },
      description: '富山県の魅力的な風景をYouTube Shortsで短時間で楽しめる動画として紹介します。立山連峰の雄大な景色をご覧ください。',
      pubDate: new Date().toISOString(),
      tags: ['富山', 'YouTube Shorts', '風景', '立山連峰'],
      content: [
        {
          _type: 'block',
          _key: 'intro',
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
          _key: 'description',
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
          _key: 'sample-video',
          url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', // サンプルURL
          title: '立山連峰の美しい風景',
          autoplay: false,
          showControls: true
        },
        {
          _type: 'block',
          _key: 'outro',
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

    const result = await client.create(doc);
    console.log('✅ サンプル記事が作成されました！');
    console.log('記事ID:', result._id);
    console.log('スラッグ:', result.slug.current);
    console.log('Sanity Studio: http://localhost:4321/studio');
    console.log('記事ページ: http://localhost:4321/blog/' + result.slug.current);
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error.message);
    
    if (error.message.includes('Insufficient permissions')) {
      console.log('\n🔑 API トークンの設定が必要です：');
      console.log('1. https://www.sanity.io/manage/project/ef65ti2e にアクセス');
      console.log('2. API → Tokens → "Add API token"');
      console.log('3. 名前: "Blog Editor", 権限: "Editor"');
      console.log('4. .env.local の SANITY_API_TOKEN に設定');
    }
  }
}

createSamplePost();