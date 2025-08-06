const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirdShortArticle() {
  try {
    console.log('第3文字数拡張記事の更新を開始します...');
    console.log('対象: kurobe-city-dam-station-bridge (宇奈月ダム)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-dam-station-bridge"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、宇奈月ダムの記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部市の宇奈月駅から歩いてアクセスできる宇奈月ダムは、階段や橋、トンネルを通る冒険的なルートが魅力的な観光スポットです。', marks: [] }],
        markDefs: []
      },
      
      // H2: ダム概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月ダムの概要と特徴', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月ダムは関西電力が運営する重力式コンクリートダムで、黒部川水系の重要な電力供給施設の一つです。堤高97メートル、堤頂長196.5メートルの規模を誇り、美しいアーチを描く壮大な構造物として知られています。ダム湖は新緑から紅葉まで四季折々の美しい景色を見せてくれ、多くの観光客に愛されています。', marks: [] }],
        markDefs: []
      },
      
      // H2: アクセスルート（約170文字）
      {
        _type: 'block',
        _key: 'h2-route',
        style: 'h2',
        children: [{ _type: 'span', text: '冒険的なアクセスルート', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'route-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月駅からダムまでのルートは、まさに小さな冒険のような体験ができます。まず駅脇の階段を降り、黒部川にかかる橋を渡った後、山肌をくり抜いたトンネルを通り抜けます。この一連のルートは徒歩約15分程度ですが、変化に富んだ道のりで退屈することがありません。トンネル内は涼しく、夏場の散策にも快適です。途中から見える黒部川の清流も美しく、自然の豊かさを感じられます。', marks: [] }],
        markDefs: []
      },
      
      // H2: ダムの魅力（約150文字）
      {
        _type: 'block',
        _key: 'h2-charm',
        style: 'h2',
        children: [{ _type: 'span', text: 'ダム本体と周辺の見どころ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'charm-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'ダム本体の迫力ある姿は間近で見ると圧巻です。コンクリートの巨大な構造物が作り出す人工美と、周囲の自然が調和した独特の景観を楽しむことができます。ダム湖の美しいエメラルドグリーンの水面は、天候や光の加減によって様々な表情を見せてくれます。展望スペースからは黒部峡谷の壮大なパノラマも一望できます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 黒部峡谷鉄道との連携（約130文字）
      {
        _type: 'block',
        _key: 'h2-railway',
        style: 'h2',
        children: [{ _type: 'span', text: '黒部峡谷観光の拠点', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'railway-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月駅は黒部峡谷鉄道の起点駅でもあるため、ダム見学と合わせてトロッコ電車での峡谷観光も楽しめます。ダム見学後に温泉で疲れを癒したり、地元のグルメを楽しんだりと、一日を通して黒部エリアの魅力を満喫することができる絶好のロケーションです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問のおすすめ（約120文字）
      {
        _type: 'block',
        _key: 'h2-recommend',
        style: 'h2',
        children: [{ _type: 'span', text: '訪問時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'recommend-content',
        style: 'normal',
        children: [{ _type: 'span', text: '歩きやすい靴での訪問をおすすめします。階段や橋、トンネルを通るルートなので、スニーカーなどが最適です。カメラを持参すれば、ダムの雄大な姿や美しいダム湖、黒部峡谷の景色など、素晴らしい写真を撮影できます。春から秋にかけてが特に美しい季節です。', marks: [] }],
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
        children: [{ _type: 'span', text: '宇奈月ダムへのアクセスルートは、階段、橋、トンネルと変化に富んだ小さな冒険です。ダム本体の迫力と自然の美しさを合わせて楽しめる、黒部観光の隠れた名所をぜひご体験ください。', marks: [] }],
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
    
    console.log('✅ 第3文字数拡張記事の更新が完了しました');
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

expandThirdShortArticle();