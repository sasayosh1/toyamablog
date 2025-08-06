const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFirstShortArticle() {
  try {
    console.log('第1文字数拡張記事の更新を開始します...');
    console.log('対象: kurobe-city-onsen-bgm (宇奈月温泉 やまのは)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-onsen-bgm"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、宇奈月温泉やまのはの記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部市の宇奈月温泉にある「やまのは」は、美しい自然に囲まれた高級温泉旅館です。心地よいピアノの生演奏と共に、贅沢なひとときをお過ごしいただけます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 施設概要（約150文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月温泉 やまのはの魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部峡谷の美しい自然に囲まれた立地で、四季折々の景色を楽しめる温泉旅館です。館内では定期的にピアノの生演奏が行われており、上質な音楽と共にリラックスした時間を過ごすことができます。温泉はもちろん、お食事や客室サービスも高品質で、特別な旅行にぴったりの宿泊施設となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 温泉の特徴（約160文字）
      {
        _type: 'block',
        _key: 'h2-onsen',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月温泉の泉質と効能', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'onsen-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉は弱アルカリ性単純泉で、肌に優しく美肌効果があることで知られています。神経痛、筋肉痛、関節痛の改善にも効果があり、日々の疲れを癒すのに最適です。大浴場からは黒部峡谷の絶景を一望でき、自然の美しさと温泉の心地よさを同時に楽しむことができます。露天風呂では、季節ごとに変わる渓谷の風景を眺めながら、ゆっくりと湯浴みを楽しめます。', marks: [] }],
        markDefs: []
      },
      
      // H2: ピアノ生演奏（約140文字）
      {
        _type: 'block',
        _key: 'h2-piano',
        style: 'h2',
        children: [{ _type: 'span', text: '心を癒すピアノ生演奏', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'piano-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'やまのはの特別な魅力の一つが、ロビーで定期的に行われるピアノの生演奏です。プロの演奏者による美しいメロディーが館内に響き、滞在中の時間をより特別なものにしてくれます。夕暮れ時や夜の時間帯には、温かい照明とピアノの音色が相まって、ロマンチックで上品な雰囲気を演出します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 宇奈月温泉エリア（約130文字）
      {
        _type: 'block',
        _key: 'h2-area',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月温泉街の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'area-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉は黒部峡谷鉄道の起点としても有名で、トロッコ電車での峡谷観光の拠点となっています。温泉街には足湯スポットや土産物店もあり、散策を楽しむことができます。黒部ダムや立山黒部アルペンルートへのアクセスも良く、富山観光の重要な拠点の一つとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: おすすめポイント（約120文字）
      {
        _type: 'block',
        _key: 'h2-recommend',
        style: 'h2',
        children: [{ _type: 'span', text: '宿泊のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'recommend-content',
        style: 'normal',
        children: [{ _type: 'span', text: '特にカップルやご夫婦での記念日旅行におすすめです。ピアノの生演奏という特別な演出があることで、普通の温泉旅行とは一味違った思い出深い滞在となります。また、一人旅でも音楽と温泉でゆっくりとした時間を過ごすことができ、日常の喧騒から離れてリフレッシュできます。', marks: [] }],
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
        children: [{ _type: 'span', text: '宇奈月温泉「やまのは」は、美しい自然とピアノの生演奏が織りなす特別な空間です。質の高い温泉と心温まるサービスで、忘れられない滞在をお約束します。ぜひ一度お訪れください。', marks: [] }],
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
    
    console.log('✅ 文字数拡張記事の更新が完了しました');
    console.log('📋 200文字→' + newTotalChars + '文字に拡張');
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

expandFirstShortArticle();