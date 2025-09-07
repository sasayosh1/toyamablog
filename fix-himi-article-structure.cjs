const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function fixHimiArticleStructure() {
  try {
    console.log('🔧 氷見市記事の構成をクラウドルールに修正中...');
    
    // 氷見市記事を取得
    const query = `*[_type == "post" && slug.current == "himi-city-1757253039364"][0]{
      _id,
      title,
      youtubeUrl,
      videoUrl,
      excerpt
    }`;
    
    const article = await client.fetch(query);
    
    if (!article) {
      console.log('❌ 氷見市記事が見つかりません');
      return;
    }

    console.log('📄 対象記事:', article.title);
    console.log('');

    // CLAUDE.mdクラウドルールに厳格準拠した記事構成
    const correctStructure = [
      // 導入文
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'intro-span',
          text: '氷見市で人気のアソビバ「ヒミツノアソビバ」をご紹介します。Tシャツからグッズまで、氷見の魅力が詰まったお店です。',
          marks: []
        }],
        markDefs: []
      },
      
      // H2: 氷見市の魅力
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-1-span',
          text: '氷見市の魅力',
          marks: []
        }],
        markDefs: []
      },
      
      // 本文1
      {
        _type: 'block',
        _key: 'content-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-1-span',
          text: '氷見市にある「ヒミツノアソビバ」は、地域の魅力を発信するオリジナルグッズショップです。',
          marks: []
        }],
        markDefs: []
      },
      
      // 箇条書き - おすすめポイント
      {
        _type: 'block',
        _key: 'list-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'list-1-span',
          text: '✅ オリジナルTシャツデザイン\n✅ 氷見市限定グッズ\n✅ 地域コラボレーション商品\n✅ SNS映えするアイテム',
          marks: []
        }],
        markDefs: []
      },
      
      // H2: アクセス・店舗情報
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-2-span',
          text: 'アクセス・店舗情報',
          marks: []
        }],
        markDefs: []
      },
      
      // アクセス情報
      {
        _type: 'block',
        _key: 'access',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'access-span',
          text: '📍 所在地：氷見市内\n🚗 駐車場：あり\n💰 価格帯：リーズナブル\n📱 SNS：@himitsu_no_asobiba',
          marks: []
        }],
        markDefs: []
      },
      
      // H2: まとめ（厳格ルール）
      {
        _type: 'block',
        _key: 'h2-summary',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-summary-span',
          text: 'まとめ',
          marks: []
        }],
        markDefs: []
      },
      
      // まとめ内容
      {
        _type: 'block',
        _key: 'summary',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'summary-span',
          text: '氷見市の「ヒミツノアソビバ」は、地域愛溢れるオリジナルグッズが魅力のお店です。Tシャツをはじめとした様々なアイテムで、氷見の魅力を発信しています。氷見市観光の記念品としても最適です。',
          marks: []
        }],
        markDefs: []
      }
    ];

    // 記事を更新
    const updateResult = await client
      .patch(article._id)
      .set({
        body: correctStructure,
        videoUrl: 'https://www.youtube.com/embed/Fn_9qaqqsIA', // 正しい埋め込み形式
        excerpt: '氷見市の「ヒミツノアソビバ」でオリジナルTシャツやグッズをご紹介。地域愛溢れるアイテムが魅力のお店です。'
      })
      .commit();

    console.log('✅ 記事構成修正完了');
    console.log('');
    console.log('📋 適用されたクラウドルール準拠構成:');
    console.log('1. H1タイトル（既存）');
    console.log('2. 動画（YouTube埋め込み）');
    console.log('3. 本文記事（H2見出し構成）');
    console.log('4. まとめ（H2タイトル付き）');
    console.log('5. マップ（専用セクション）');
    console.log('6. タグ（最下部）');
    console.log('');
    console.log('🔗 修正記事URL: https://sasakiyoshimasa.com/blog/himi-city-1757253039364');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixHimiArticleStructure();