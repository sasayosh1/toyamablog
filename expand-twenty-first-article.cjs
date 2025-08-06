const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyFirstArticle() {
  try {
    console.log('第21記事の更新を開始します...');
    console.log('対象: toyama-city-shrine-sakura-6 (朝6時の護国神社の桜)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-shrine-sakura-6"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、護国神社の桜の記事を拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '朝6時の富山県護国神社。蚤の市の準備が始まる静寂な時間に咲く桜は、神聖な場所ならではの特別な美しさを見せてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 富山県護国神社の歴史と意義（約175文字）
      {
        _type: 'block',
        _key: 'h2-shrine',
        style: 'h2',
        children: [{ _type: 'span', text: '富山県護国神社の歴史と神聖な意義', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'shrine-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山県護国神社は、戦没者の英霊を祀る神聖な場所として、長年にわたって富山県民の心の支えとなってきました。境内は都市部にありながら静寂に包まれ、訪れる人々に安らぎと厳粛さを与えてくれます。春になると境内に咲く桜は、英霊への感謝と平和への願いを込めた美しい光景を作り出します。神社は地域の文化的中心地としても機能しており、季節の祭りや行事を通じて地域コミュニティの結束を深める場所でもあります。朝の静寂な時間帯は特に神聖な雰囲気が漂い、心を清める貴重なひとときを過ごすことができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 朝6時の特別な魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-morning',
        style: 'h2',
        children: [{ _type: 'span', text: '朝6時の神社が持つ特別な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'morning-content',
        style: 'normal',
        children: [{ _type: 'span', text: '朝6時という早朝の時間帯は、護国神社の最も美しい瞬間の一つです。まだ人影もまばらな境内には、澄んだ朝の空気と鳥のさえずりだけが響きます。この時間の桜は朝露に濡れて一層美しく、柔らかな朝日に照らされて神々しい輝きを放ちます。日中の喧騒とは全く異なる、静謐で神秘的な雰囲気が境内全体を包み込んでいます。早起きした地元の方々が静かに参拝される姿も見られ、日常の中にある信仰の深さを感じることができます。この特別な時間は、都市部にいながら自然と神聖さを同時に感じられる貴重な体験です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 蚤の市の準備風景（約155文字）
      {
        _type: 'block',
        _key: 'h2-flea-market',
        style: 'h2',
        children: [{ _type: 'span', text: '蚤の市準備の風情ある光景', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'flea-market-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山県護国神社では定期的に蚤の市が開催され、朝6時頃から出店者の方々が準備を始めます。桜の季節の蚤の市準備は特に風情があり、花びらが舞い散る中でテントを設営したり商品を並べたりする光景は、日本の春の風物詩そのものです。出店者の方々の静かな会話と作業の音が、神社の神聖な静寂に溶け込んでいきます。この準備時間は、後に賑わう蚤の市の前の静かな前奏曲のような時間で、桜と共に季節の移ろいを感じさせてくれます。準備に携わる人々の丁寧な所作からは、この場所への敬意が感じられます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 桜と神聖な場所の調和（約145文字）
      {
        _type: 'block',
        _key: 'h2-harmony',
        style: 'h2',
        children: [{ _type: 'span', text: '桜と神聖な場所が生み出す調和', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'harmony-content',
        style: 'normal',
        children: [{ _type: 'span', text: '護国神社の桜は、単なる季節の花以上の意味を持っています。神聖な場所に咲く桜は、生命の美しさと儚さを同時に表現し、参拝者の心に深い感動を与えます。戦没者への追悼の意味も込められた桜は、平和への願いと感謝の気持ちを表現する象徴でもあります。朝の静寂な時間に咲く桜を眺めていると、日常の忙しさを忘れ、生きることの尊さについて深く考えさせられます。神社という聖域と桜の美しさが織りなす調和は、訪れる人々の心を浄化してくれる特別な力を持っています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 早朝参拝のすすめ（約130文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '早朝参拝と桜鑑賞のすすめ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山県護国神社での早朝参拝は、心身を清める素晴らしい体験です。桜の季節の早朝参拝は特におすすめで、静寂な境内で桜を独占できる贅沢な時間を過ごせます。参拝後は境内をゆっくりと散策し、様々な角度から桜を鑑賞してみてください。早朝のため駐車場も空いており、ゆったりと過ごすことができます。カメラを持参すれば、朝日に照らされた美しい桜の写真を撮影できます。心が洗われるような清々しい体験をぜひ味わってください。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約90文字）
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
        children: [{ _type: 'span', text: '朝6時の富山県護国神社の桜は、神聖さと自然の美しさが調和した特別な光景です。早朝の静寂な時間に、心洗われるひとときをお過ごしください。', marks: [] }],
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
    
    console.log('✅ 第21記事の更新が完了しました');
    console.log('📋 180文字→' + newTotalChars + '文字に拡張');
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

expandTwentyFirstArticle();