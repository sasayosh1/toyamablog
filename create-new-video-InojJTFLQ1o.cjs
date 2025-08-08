const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createNewVideoArticle() {
  try {
    console.log('📹 新しいYouTube動画記事を作成中...');
    console.log('🎬 動画ID: InojJTFLQ1o');
    
    // 動画URLから動画IDを抽出
    const videoId = 'InojJTFLQ1o';
    const youtubeUrl = `https://youtube.com/shorts/${videoId}`;
    
    // 既存記事をチェック
    const existingPost = await client.fetch(`*[_type == "post" && youtubeUrl match "*${videoId}*"]`);
    if (existingPost.length > 0) {
      console.log('❌ この動画は既に記事として存在しています:', existingPost[0].title);
      return { success: false, message: '既存の記事です' };
    }
    
    // 新しい記事を作成（後でコンテンツを具体的に調整）
    const newPost = {
      _type: 'post',
      title: '【富山県】新発見！魅力的なスポット体験記 #shorts',
      slug: {
        _type: 'slug',
        current: `toyama-new-spot-${videoId.toLowerCase()}`
      },
      youtubeUrl: youtubeUrl,
      publishedAt: new Date().toISOString(),
      category: '富山県',
      tags: [
        '富山県',
        'TOYAMA',
        '観光スポット',
        'おすすめ',
        '体験',
        '発見',
        'YouTube Shorts',
        '#shorts'
      ],
      excerpt: '富山県の魅力的なスポットでの特別な体験をご紹介。地元ならではの発見と感動をお届けします。',
      body: [
        // 導入文
        {
          _type: 'block',
          _key: `intro-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-intro-${Date.now()}`,
            text: '富山県には、まだまだ知られていない魅力的なスポットがたくさんあります。今回は、そんな特別な場所での体験をお届けします。地元の方々に愛され続けている場所から、新たな発見まで、富山県の奥深い魅力をご紹介していきます。',
            marks: []
          }],
          markDefs: []
        },
        // H2セクション1
        {
          _type: 'block',
          _key: `h2-1-${Date.now()}`,
          style: 'h2',
          children: [{
            _type: 'span',
            _key: `span-h2-1-${Date.now()}`,
            text: '富山県の隠れた魅力スポット',
            marks: []
          }],
          markDefs: []
        },
        {
          _type: 'block',
          _key: `content-1-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-content-1-${Date.now()}`,
            text: '富山県には、観光ガイドブックにはあまり載っていない、地元の人々に愛される特別な場所が数多く存在します。そうした場所では、富山県ならではの自然の美しさや、伝統文化、そして地域の人々の温かさを感じることができます。今回訪れた場所も、まさにそんな魅力に満ちた特別なスポットでした。',
            marks: []
          }],
          markDefs: []
        },
        // H2セクション2
        {
          _type: 'block',
          _key: `h2-2-${Date.now()}`,
          style: 'h2',
          children: [{
            _type: 'span',
            _key: `span-h2-2-${Date.now()}`,
            text: '実際の体験レポート',
            marks: []
          }],
          markDefs: []
        },
        {
          _type: 'block',
          _key: `content-2-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-content-2-${Date.now()}`,
            text: 'このスポットでの体験は、本当に印象深いものでした。富山県特有の景色や雰囲気を楽しみながら、地域の文化や歴史についても学ぶことができました。特に印象的だったのは、地元の方々との交流や、その場所でしか味わえない特別な瞬間でした。富山県の新たな魅力を発見できる、素晴らしい体験となりました。',
            marks: []
          }],
          markDefs: []
        },
        // H2セクション3
        {
          _type: 'block',
          _key: `h2-3-${Date.now()}`,
          style: 'h2',
          children: [{
            _type: 'span',
            _key: `span-h2-3-${Date.now()}`,
            text: 'アクセス方法と訪問のポイント',
            marks: []
          }],
          markDefs: []
        },
        {
          _type: 'block',
          _key: `content-3-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-content-3-${Date.now()}`,
            text: 'このスポットへのアクセスや、訪問時のポイントについてもご紹介します。富山県内からのアクセスは比較的便利で、公共交通機関や車でのアクセスも可能です。訪問される際は、地元の文化や環境に配慮しながら、ゆっくりとその場の雰囲気を楽しんでください。きっと富山県の新たな魅力を発見していただけることでしょう。',
            marks: []
          }],
          markDefs: []
        },
        // まとめ
        {
          _type: 'block',
          _key: `conclusion-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-conclusion-${Date.now()}`,
            text: '富山県には、まだまだ多くの魅力的なスポットが眠っています。今回ご紹介した体験が、皆さんの富山県探索のきっかけとなれば幸いです。ぜひ実際に足を運んで、富山県ならではの素晴らしい体験をしてみてください。',
            marks: []
          }],
          markDefs: []
        }
      ]
    };
    
    // Sanityに記事を作成
    const result = await client.create(newPost);
    
    console.log('\\n✅ 新しい動画記事の作成が完了しました！');
    console.log('📊 作成された記事の詳細:');
    console.log(`   記事ID: ${result._id}`);
    console.log(`   タイトル: ${result.title}`);
    console.log(`   スラッグ: ${result.slug.current}`);
    console.log(`   YouTube URL: ${result.youtubeUrl}`);
    console.log(`   カテゴリー: ${result.category}`);
    console.log(`   タグ数: ${result.tags.length}`);
    console.log(`   本文ブロック数: ${result.body.length}`);
    
    console.log('\\n🎯 次のステップ:');
    console.log('1. 動画の実際の内容を確認');
    console.log('2. タイトル・本文・タグを具体的な内容に調整');
    console.log('3. 適切なカテゴリー設定');
    console.log('4. SEO最適化');
    
    return { 
      success: true, 
      articleId: result._id,
      slug: result.slug.current,
      title: result.title
    };
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error);
    return { success: false, error: error.message };
  }
}

createNewVideoArticle();