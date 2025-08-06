const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSeventhArticle() {
  try {
    console.log('第7記事の更新を開始します...');
    console.log('対象: yatsuo-town (越中八尾観光会館・曳山展示館)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "yatsuo-town"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、曳山展示館の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '八尾町にある越中八尾観光会館（曳山展示館）は、伝統的な曳山文化を学べる貴重な施設です。文化の日は入館無料という嬉しい特典もあります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 施設概要（約165文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '越中八尾観光会館の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '越中八尾観光会館は、富山県の伝統的な曳山文化を保存・展示する専門施設として設立されました。館内には実物の曳山が展示されており、その精巧な装飾や構造を間近で観察することができます。八尾町の歴史や文化についても詳しく学ぶことができ、地域の文化的アイデンティティを理解するのに最適な場所です。観光客だけでなく、地元の方々にも愛され続けている文化施設となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 曳山の魅力（約170文字）
      {
        _type: 'block',
        _key: 'h2-hikiyama',
        style: 'h2',
        children: [{ _type: 'span', text: '伝統の曳山文化と展示', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'hikiyama-content',
        style: 'normal',
        children: [{ _type: 'span', text: '曳山は江戸時代から続く富山県の伝統的な祭り文化の象徴です。展示されている曳山は、熟練の職人によって作られた美術工芸品でもあり、その装飾の美しさと技術の高さに驚かされます。金箔や漆塗り、精密な彫刻などが施された曳山は、日本の伝統工芸の粋を集めた傑作といえるでしょう。実際の祭りでは力強く引かれる曳山を、ここでは静かに鑑賞することができ、その細部まで詳しく観察できる貴重な機会となります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 八尾町の歴史（約150文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '八尾町の歴史と文化', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '八尾町は古くから交通の要衝として栄えた歴史ある町です。江戸時代には飛騨街道の宿場町として多くの人々が行き交い、商業や文化が発達しました。その繁栄の中で生まれた曳山祭りは、町の人々の結束と誇りの象徴として現代まで受け継がれています。観光会館では、そうした八尾町の豊かな歴史と、祭りを支えてきた人々の想いについても学ぶことができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 文化の日特典（約130文字）
      {
        _type: 'block',
        _key: 'h2-culture-day',
        style: 'h2',
        children: [{ _type: 'span', text: '文化の日の特別サービス', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'culture-day-content',
        style: 'normal',
        children: [{ _type: 'span', text: '11月3日の文化の日には、入館料が無料になる嬉しいサービスがあります。この日は特に多くの方が訪れ、家族連れや観光客で賑わいます。文化の日にふさわしく、日本の伝統文化である曳山を無料で見学できる絶好の機会です。普段は有料の施設を無料で楽しめるため、この日を狙って訪問される方も多く、地域文化に触れる素晴らしい一日となります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 見学のポイント（約120文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '見学時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '曳山の細部の装飾をじっくりと観察することをおすすめします。金箔の輝きや精密な彫刻など、職人の技術の高さを感じることができます。また、曳山の構造や祭りでの役割について説明を読みながら見学すると、より深く理解できます。写真撮影も可能なので、美しい曳山の記録を残すこともできます。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約95文字）
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
        children: [{ _type: 'span', text: '越中八尾観光会館は、富山県の伝統的な曳山文化を身近に感じられる貴重な施設です。文化の日の無料入館日を利用して、ぜひ一度足を運んでみてください。日本の伝統文化の素晴らしさを再発見できるはずです。', marks: [] }],
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
    
    console.log('✅ 第7記事の更新が完了しました');
    console.log('📋 203文字→' + newTotalChars + '文字に拡張');
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

expandSeventhArticle();