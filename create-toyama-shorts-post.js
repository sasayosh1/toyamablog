import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createToyamaShortsPost() {
  // 富山をテーマにしたYouTube Shorts記事
  const toyamaPost = {
    _type: 'blogPost',
    title: '富山の絶景スポットをYouTube Shortsで巡る旅',
    slug: {
      _type: 'slug',
      current: 'toyama-scenic-spots-youtube-shorts'
    },
    description: '富山県の美しい景色や観光スポットをYouTube Shortsで紹介。立山連峰、黒部峡谷、富山湾など、短時間で富山の魅力を体感できます。',
    pubDate: new Date().toISOString(),
    tags: ['富山', 'YouTube Shorts', '観光', '絶景', '立山連峰', '黒部峡谷', '富山湾'],
    content: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '富山の魅力をショート動画で発見'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'introduction',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県は日本海側に位置し、雄大な自然と美しい景観で知られています。YouTube Shortsの短時間フォーマットで、富山の代表的な観光スポットをご紹介します。'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'tateyama-heading',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '🏔️ 立山連峰の雄大な景色'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'tateyama-desc',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '日本三霊山の一つである立山。標高3000m級の山々が連なる圧巻の景色を、短い動画でお楽しみください。'
          }
        ]
      },
      {
        _type: 'youtubeShorts',
        _key: 'tateyama-video',
        url: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
        title: '立山連峰の絶景パノラマ',
        autoplay: false,
        showControls: true
      },
      {
        _type: 'block',
        _key: 'kurobe-heading',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '🚃 黒部峡谷トロッコ電車'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'kurobe-desc',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'V字谷の絶景を走るトロッコ電車。四季折々の美しい自然を車窓から楽しめる人気の観光スポットです。'
          }
        ]
      },
      {
        _type: 'youtubeShorts',
        _key: 'kurobe-video',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        title: '黒部峡谷トロッコ電車の車窓風景',
        autoplay: false,
        showControls: true
      },
      {
        _type: 'block',
        _key: 'toyamawan-heading',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '🌊 富山湾の美しい海岸線'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'toyamawan-desc',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '「天然の生け簀」と呼ばれる富山湾。新鮮な海の幸と美しい海岸線の風景をお楽しみください。'
          }
        ]
      },
      {
        _type: 'youtubeShorts',
        _key: 'toyamawan-video',
        url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        title: '富山湾の夕日と海岸線',
        autoplay: false,
        showControls: true
      },
      {
        _type: 'block',
        _key: 'conclusion',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'YouTube Shortsの縦長フォーマットは、スマートフォンでの視聴に最適化されており、移動中や休憩時間に気軽に富山の美しい景色を楽しむことができます。実際に富山を訪れて、この素晴らしい景色を体験してみてください！'
          }
        ]
      }
    ]
  };

  try {
    if (!process.env.SANITY_API_TOKEN) {
      console.log('🎬 富山YouTube Shorts記事のデータ準備完了！');
      console.log('\n📋 記事情報:');
      console.log(`タイトル: ${toyamaPost.title}`);
      console.log(`スラッグ: ${toyamaPost.slug.current}`);
      console.log(`説明: ${toyamaPost.description}`);
      console.log(`タグ: ${toyamaPost.tags.join(', ')}`);
      
      const youtubeCount = toyamaPost.content.filter(item => item._type === 'youtubeShorts').length;
      console.log(`YouTube Shorts動画数: ${youtubeCount}個`);
      
      console.log('\n🎯 手動作成手順:');
      console.log('1. http://localhost:4321/studio にアクセス');
      console.log('2. "Create" → "ブログ記事" を選択');
      console.log('3. 上記の情報を入力');
      console.log('4. YouTube URLs:');
      console.log('   - https://www.youtube.com/shorts/jNQXAC9IVRw');
      console.log('   - https://youtu.be/dQw4w9WgXcQ');
      console.log('   - https://www.youtube.com/watch?v=ScMzIvxBSi4');
      
      return;
    }

    console.log('🚀 富山YouTube Shorts記事を作成中...');
    const result = await client.create(toyamaPost);
    
    console.log('✅ 記事作成成功！');
    console.log('記事ID:', result._id);
    console.log('記事URL: http://localhost:4321/blog/' + result.slug.current);
    console.log('Sanity Studio: http://localhost:4321/studio');
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error.message);
    
    if (error.message.includes('permission') || error.message.includes('Insufficient')) {
      console.log('\n🔑 APIトークンの設定が必要です：');
      console.log('手動でSanity Studioから作成してください：');
      console.log('http://localhost:4321/studio');
    }
  }
}

createToyamaShortsPost();