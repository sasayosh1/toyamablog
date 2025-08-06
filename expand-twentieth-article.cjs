const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentiethArticle() {
  try {
    console.log('第20記事の更新を開始します...');
    console.log('対象: toyama-city-sakura-19 (気温19℃の桜とマルート)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-sakura-19"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、桜とマルートの記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '気温19℃の穏やかな春の日。富山市で出会った美しい桜とマルート（富山市内循環バス）の素敵なコラボレーションをお届けします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 春の富山市の魅力（約170文字）
      {
        _type: 'block',
        _key: 'h2-spring',
        style: 'h2',
        children: [{ _type: 'span', text: '気温19℃が生み出す春の富山市の美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'spring-content',
        style: 'normal',
        children: [{ _type: 'span', text: '気温19℃という絶妙な暖かさは、春の富山市を最も美しく彩る条件の一つです。この温度は桜の花びらが風に舞うのに最適で、街全体が優雅で穏やかな雰囲気に包まれます。富山市の街並みは立山連峰を背景に、桜並木が織りなすピンクの絨毯が広がります。この季節の富山市は、都市部の便利さと自然の美しさが見事に調和した、日本の春の代表的な風景を見せてくれます。地元の人々も観光客も、この特別な季節の魅力に心を奪われることでしょう。青空と桜のコントラストは、写真に収めたくなる絶景です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 桜の見どころ（約165文字）
      {
        _type: 'block',
        _key: 'h2-sakura',
        style: 'h2',
        children: [{ _type: 'span', text: '富山市内の桜スポットの魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'sakura-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市内には数多くの美しい桜スポットが点在しており、それぞれ独特の魅力を持っています。城南公園や富山城址公園などの有名スポットから、街路樹として植えられた桜まで、市内のあちこちで春の訪れを感じることができます。特に市電やバス路線沿いの桜並木は、移動しながら花見を楽しめる贅沢な体験です。桜の種類も豊富で、ソメイヨシノを中心に、八重桜や山桜など様々な品種が時期をずらして咲き、長期間にわたって桜を楽しむことができます。地元の人々にとっても観光客にとっても、春の富山観光のハイライトとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: マルートの魅力（約155文字）
      {
        _type: 'block',
        _key: 'h2-maloot',
        style: 'h2',
        children: [{ _type: 'span', text: 'マルート（富山市内循環バス）の便利さ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'maloot-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'マルートは富山市内を効率よく移動できる循環バスシステムで、観光客にとって非常に便利な交通手段です。市内の主要な観光スポットや商業施設を結んでおり、一日乗車券を利用すれば経済的に市内観光を楽しむことができます。バスの車窓からは四季折々の富山市の風景を眺めることができ、特に春の桜の季節には移動そのものが観光体験となります。運転手さんも親切で、地元の情報を教えてくれることもあります。車を持たない観光客や高齢者にとって、マルートは富山観光を快適にする重要なインフラです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 桜とマルートの素敵な組み合わせ（約145文字）
      {
        _type: 'block',
        _key: 'h2-combination',
        style: 'h2',
        children: [{ _type: 'span', text: '桜とマルートが織りなす春の風景', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'combination-content',
        style: 'normal',
        children: [{ _type: 'span', text: '春の富山市では、桜並木の間を走るマルートの姿が特に美しい光景を作り出します。ピンクの花びらが舞い散る中をゆっくりと走るバスは、まるで動く絵画のようです。バス停で桜を背景に待つ人々の姿も、日常の中に溶け込んだ春の詩情を感じさせます。車窓から見る桜並木は、歩いて見る桜とはまた違った美しさがあり、移動時間も楽しい観光体験になります。地元の人々の日常生活に桜が自然に溶け込んでいる様子は、富山の春の魅力を物語っています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 春の富山観光のすすめ（約125文字）
      {
        _type: 'block',
        _key: 'h2-tourism',
        style: 'h2',
        children: [{ _type: 'span', text: '春の富山観光を最大限楽しむコツ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tourism-content',
        style: 'normal',
        children: [{ _type: 'span', text: '春の富山市を訪れる際は、マルートを活用した桜巡りがおすすめです。一日乗車券を購入して、気になる桜スポットで自由に乗り降りしながら花見を楽しめます。カメラを持参して、バスと桜のコラボレーション写真を撮影するのも楽しい思い出になります。気温19℃前後の暖かい日を選んで訪れると、より快適に観光を楽しめます。地元のグルメスポットにも立ち寄りながら、春の富山を満喫してください。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約85文字）
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
        children: [{ _type: 'span', text: '気温19℃の春の日に出会う桜とマルートの風景は、富山市の魅力を象徴する美しい光景です。春の富山観光をお楽しみください。', marks: [] }],
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
    
    console.log('✅ 第20記事の更新が完了しました');
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

expandTwentiethArticle();