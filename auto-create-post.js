// Sanity Studio経由で記事を自動作成するためのヘルパースクリプト
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ef65ti2e',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  // token は環境変数から取得（設定されていない場合は読み取り専用）
  token: process.env.SANITY_API_TOKEN
});

// YouTube Shorts記事のテンプレートデータ
const createYouTubeShortsPost = async () => {
  const postData = {
    _type: 'blogPost',
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

  try {
    if (!process.env.SANITY_API_TOKEN) {
      console.log('📝 YouTube Shorts記事のサンプルデータ:');
      console.log(JSON.stringify(postData, null, 2));
      
      console.log('\n🎯 手動で記事を作成してください：');
      console.log('1. ブラウザで http://localhost:4321/studio を開く');
      console.log('2. "Create" → "ブログ記事" を選択');
      console.log('3. 上記のデータを参考に記事を作成');
      console.log('4. YouTube ShortsのURL例:');
      console.log('   - https://www.youtube.com/shorts/jNQXAC9IVRw');
      console.log('   - https://youtu.be/dQw4w9WgXcQ');
      
      return;
    }

    console.log('🚀 YouTube Shorts記事を作成中...');
    const result = await client.create(postData);
    
    console.log('✅ 記事作成成功！');
    console.log('記事ID:', result._id);
    console.log('記事URL: http://localhost:4321/blog/' + result.slug.current);
    console.log('Sanity Studio: http://localhost:4321/studio');
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n🔑 APIトークンの権限が不足しています：');
      console.log('1. https://www.sanity.io/manage/project/ef65ti2e にアクセス');
      console.log('2. API → Tokens → "Add API token"');
      console.log('3. 名前: "Blog Editor", 権限: "Editor"');
      console.log('4. .env.local の SANITY_API_TOKEN に設定');
    }
  }
};

// 実行
createYouTubeShortsPost();