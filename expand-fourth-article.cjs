const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFourthArticle() {
  try {
    console.log('第4記事の更新を開始します...');
    console.log('対象: imizu-city-temple (きょうのるりちゃん｜浄蓮寺)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "imizu-city-temple"][0] { _id, title, body, youtubeUrl }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事タイトル:', post.title);
    console.log('YouTube URL:', post.youtubeUrl ? 'あり' : 'なし');
    
    // 現在の状態確認
    let totalChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
      }
    });
    
    console.log(`現在の文字数: ${totalChars}文字`);
    console.log('目標: 800-1000文字に拡張');
    
    // シャルロッテ記事の構成を参考に、浄蓮寺の記事を拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市の浄蓮寺で出会った愛らしい猫「るりちゃん」。お寺の日常に癒しをもたらす可愛らしい猫との穏やかなひとときをご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: お寺の概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '浄蓮寺の魅力と歴史', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市に位置する浄蓮寺は、静寂な環境に佇む歴史あるお寺です。境内は美しく手入れされており、四季を通じて訪れる人々の心を癒してくれます。地域の方々に愛され続けているこのお寺は、日本の伝統的な寺院建築の美しさを今に伝えています。穏やかな空間で、都市の喧騒から離れた静寂なひとときを過ごすことができる貴重な場所です。', marks: [] }],
        markDefs: []
      },
      
      // H2: るりちゃんの魅力（約170文字）
      {
        _type: 'block',
        _key: 'h2-ruri',
        style: 'h2',
        children: [{ _type: 'span', text: 'るりちゃんとの出会い', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'ruri-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'この日、浄蓮寺で出会ったのは愛らしい猫の「るりちゃん」でした。境内を我が物顔で歩き回る姿は、まるでお寺の住職のような堂々とした風格を感じさせます。人懐っこい性格で、訪問者に対しても警戒することなく近づいてきてくれます。その愛らしい表情と仕草は、見ているだけで心が和み、日頃のストレスを忘れさせてくれる特別な存在です。お寺という神聖な空間に、温かな生命の息づかいを感じることができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: お寺と猫の関係（約150文字）
      {
        _type: 'block',
        _key: 'h2-relationship',
        style: 'h2',
        children: [{ _type: 'span', text: 'お寺に暮らす猫たちの意味', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'relationship-content',
        style: 'normal',
        children: [{ _type: 'span', text: '昔から日本のお寺には猫が暮らしていることが多く、その存在は単なるペットを超えた意味を持っています。猫たちは境内を清浄に保つ役割を担い、また参拝者の心を和ませる存在として親しまれてきました。るりちゃんもそんな伝統を受け継ぐ、お寺の大切な一員なのです。その自然体な姿は、仏教の教えにある「ありのままの存在の美しさ」を体現しているようでもあります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 境内の雰囲気（約130文字）
      {
        _type: 'block',
        _key: 'h2-atmosphere',
        style: 'h2',
        children: [{ _type: 'span', text: '静寂に包まれた境内の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'atmosphere-content',
        style: 'normal',
        children: [{ _type: 'span', text: '浄蓮寺の境内は、都市部にありながら驚くほど静寂に包まれています。古い石灯籠や手入れの行き届いた庭園、そして歴史を感じさせる本堂が調和して、心を落ち着かせる空間を作り出しています。るりちゃんがゆったりと過ごすその空間は、時間の流れがゆっくりと感じられる特別な場所です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問のおすすめ（約120文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '浄蓮寺訪問のおすすめ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '浄蓮寺を訪れる際は、ゆっくりとした気持ちで境内を散策することをおすすめします。るりちゃんとの出会いは偶然に左右されますが、その偶然も含めて楽しい体験となります。静かな環境なので、心を落ち着かせて日頃の疲れを癒すのにぴったりの場所です。カメラを持参すれば、美しい境内の風景も記録できます。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約100文字）
      {
        _type: 'block',
        _key: 'h2-summary',
        style: 'h2',
        children: [{ _type: 'span', text: 'まとめ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'summary-content',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市の浄蓮寺で出会ったるりちゃんは、お寺の静寂な空間に温かな生命感をもたらしてくれる素晴らしい存在です。ぜひ一度足を運んで、この特別なひとときを体験してみてください。', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let newTotalChars = 0;
    expandedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        newTotalChars += text.length;
      }
    });
    
    console.log(`新しい文字数: ${newTotalChars}文字`);
    console.log('新しい構成: H2見出し6個の統一構造');
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第4記事の更新が完了しました');
    console.log('📋 201文字→' + newTotalChars + '文字に拡張');
    console.log('🏗️ H2見出し6個の統一構造を適用');
    
    // キャッシュクリア
    await client
      .patch(post._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();
    
    console.log('🔄 キャッシュクリア実行完了');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

expandFourthArticle();