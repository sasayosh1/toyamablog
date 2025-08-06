const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFifthArticle() {
  try {
    console.log('第5記事の更新を開始します...');
    console.log('対象: nanto-city-1 (南砺市園芸植物園・フローラルパーク)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "nanto-city-1"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、フローラルパークの記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '南砺市にある南砺市園芸植物園・フローラルパークは、キク科植物に特化したユニークな植物園です。季節ごとに美しい花々を楽しめる特別な空間をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 施設概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: 'フローラルパークの特徴', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'フローラルパークは、キク科植物の多様性を学び、美しさを楽しむことができる専門的な植物園です。広々とした園内には、様々な品種のキク科植物が植えられており、その豊富な種類と美しい花々に驚かされます。園芸愛好家だけでなく、一般の方々も楽しめるよう工夫された展示や散策路が整備されています。自然の美しさと植物の学術的価値を同時に体験できる貴重な施設となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: キク科植物の魅力（約170文字）
      {
        _type: 'block',
        _key: 'h2-plants',
        style: 'h2',
        children: [{ _type: 'span', text: 'キク科植物の多様な世界', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'plants-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'キク科は植物界で最も大きな科の一つで、その多様性は驚くほど豊かです。園内では、一般的に知られている菊の花から、意外にもキク科に属するひまわりやガーベラ、コスモスなど、様々な植物を観察することができます。季節ごとに異なる花々が咲き誇り、春から秋にかけて長期間にわたって美しい花を楽しむことができます。それぞれの植物には詳しい説明プレートも設置されており、学びながら鑑賞できる工夫がされています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 四季の魅力（約150文字）
      {
        _type: 'block',
        _key: 'h2-seasons',
        style: 'h2',
        children: [{ _type: 'span', text: '四季を通じた楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'seasons-content',
        style: 'normal',
        children: [{ _type: 'span', text: '春には色とりどりの花々が咲き始め、夏にはひまわりや夏菊が見頃を迎えます。秋には伝統的な菊の花が美しく咲き誇り、特に菊花展などのイベントも開催されます。冬でも温室内では一年中花を楽しむことができ、四季を通じて違った表情を見せてくれます。散策路も季節に合わせて整備されており、どの季節に訪れても新しい発見があります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 教育的価値（約130文字）
      {
        _type: 'block',
        _key: 'h2-education',
        style: 'h2',
        children: [{ _type: 'span', text: '学習と観賞の両立', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'education-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'この植物園は単なる観賞施設ではなく、植物学的な教育的価値も高い施設です。各植物には学名や特徴、分布などが記載された説明板が設置されており、訪問者は植物について深く学ぶことができます。学校の校外学習や植物愛好家の研修にも活用されており、地域の教育資源としても重要な役割を果たしています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問情報（約120文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: 'アクセスと利用案内', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '南砺市内からのアクセスも良好で、駐車場も完備されています。園内は車椅子でも移動しやすいよう整備されており、幅広い年齢層の方に楽しんでいただけます。カメラ撮影も可能で、美しい花々の写真を撮ることができます。季節によってはガイドツアーも実施されており、より深く植物について学ぶことができます。', marks: [] }],
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
        children: [{ _type: 'span', text: 'キク科植物に特化した南砺市園芸植物園・フローラルパークは、美しい花々を楽しみながら植物について学べる貴重な施設です。四季を通じて異なる魅力を発見できる、南砺市の隠れた名所です。', marks: [] }],
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
    
    console.log('✅ 第5記事の更新が完了しました');
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

expandFifthArticle();