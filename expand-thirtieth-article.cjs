const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirtiethArticle() {
  try {
    console.log('第30記事の更新を開始します...');
    console.log('対象: kurobe-city-onsen-fireworks (宇奈月温泉冬物語)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-onsen-fireworks"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、宇奈月温泉冬物語の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部市の宇奈月温泉で開催される冬の夜空を彩る豪華花火ショー「宇奈月温泉冬物語 雪上花火大会」の幻想的な美しさをお伝えします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 宇奈月温泉冬物語の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-event',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月温泉冬物語の魅力とコンセプト', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'event-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉冬物語は、黒部峡谷の入り口に位置する宇奈月温泉で毎年開催される冬の一大イベントです。雪に覆われた温泉街を舞台に、色とりどりの花火が夜空を彩る光景は、まさに冬の絶景と言えるでしょう。このイベントは単なる花火大会ではなく、雪景色と温泉という日本の冬の美しさを最大限に活かした特別な催しです。温泉街の宿泊施設からも花火を楽しむことができ、温泉に浸かりながら花火を眺めるという贅沢な体験も可能です。地域の冬季観光の目玉として、多くの観光客に愛され続けています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 雪上花火大会の壮観（約165文字）
      {
        _type: 'block',
        _key: 'h2-fireworks',
        style: 'h2',
        children: [{ _type: 'span', text: '雪上に響く豪華花火ショーの迫力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'fireworks-content',
        style: 'normal',
        children: [{ _type: 'span', text: '雪上花火大会の最大の魅力は、純白の雪景色と色鮮やかな花火のコントラストです。雪に反射する花火の光が幻想的な世界を作り出し、夏の花火大会とは全く異なる美しさを演出します。黒部峡谷の山々に花火の音が響き渡る様子は、自然の雄大さを改めて感じさせてくれます。特にスターマインや仕掛け花火は圧巻で、観客からは感嘆の声が上がります。花火が雪面を照らす瞬間は、まるで雪原が宝石のように輝いて見え、写真に収めたくなる美しい瞬間が次々と訪れます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 冬の宇奈月温泉の魅力（約155文字）
      {
        _type: 'block',
        _key: 'h2-winter-onsen',
        style: 'h2',
        children: [{ _type: 'span', text: '冬の宇奈月温泉街の特別な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'winter-onsen-content',
        style: 'normal',
        children: [{ _type: 'span', text: '冬の宇奈月温泉は、雪景色に包まれた温泉街として格別の美しさを見せます。雪化粧した温泉街の風情は、日本の冬の情緒を存分に味わえる特別な環境です。寒い外気と温かな温泉のコントラストは、身も心も温めてくれる最高の癒し体験となります。花火大会の会場となる宇奈月公園周辺は、雪に覆われた静寂な空間が広がり、花火の美しさを一層引き立てます。温泉旅館の窓からも花火を楽しむことができ、宿泊者にとっては忘れられない冬の思い出となります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 観覧のポイント（約145文字）
      {
        _type: 'block',
        _key: 'h2-viewing',
        style: 'h2',
        children: [{ _type: 'span', text: '花火大会を最大限楽しむポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'viewing-content',
        style: 'normal',
        children: [{ _type: 'span', text: '雪上花火大会を楽しむためには、防寒対策が何より重要です。雪の上で長時間過ごすため、厚着をして足元の防寒もしっかりと準備しましょう。宇奈月公園が主な観覧場所となりますが、温泉街の各所からも花火を楽しむことができます。宿泊予定の方は、花火が見える部屋を事前に予約することをおすすめします。カメラやスマートフォンで撮影する際は、バッテリーが寒さで消耗しやすいので予備を準備しておくと安心です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 温泉との特別な組み合わせ（約130文字）
      {
        _type: 'block',
        _key: 'h2-onsen-combination',
        style: 'h2',
        children: [{ _type: 'span', text: '温泉と花火の贅沢な組み合わせ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'onsen-combination-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉冬物語の醍醐味は、温泉と花火を同時に楽しめることです。花火大会の前後に温泉に浸かることで、冷えた体を温めることができ、一層花火の美しさを堪能できます。露天風呂から花火を眺められる旅館もあり、このような体験は宇奈月温泉ならではの特別なものです。花火大会後の温泉は格別で、興奮した気持ちを落ち着かせながらゆっくりと温まることができます。', marks: [] }],
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
        children: [{ _type: 'span', text: '宇奈月温泉冬物語の雪上花火大会は、冬の夜空を彩る幻想的なイベントです。温泉と花火の贅沢な組み合わせをぜひ体験してみてください。', marks: [] }],
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
    
    // 記事を慎重に更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第30記事の更新が完了しました');
    console.log('📋 190文字→' + newTotalChars + '文字に拡張');
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

expandThirtiethArticle();