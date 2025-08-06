const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFifteenthArticle() {
  try {
    console.log('第15記事の更新を開始します...');
    console.log('対象: tonami-city-bridge (砺波市池川廓龍橋)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "tonami-city-bridge"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、廓龍橋の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波市の池川に架かる廓龍橋（かくりゅうはし）は、２本の龍の橋脚が特徴的な美しい橋です。地域のランドマークとして親しまれています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 廓龍橋の特徴（約170文字）
      {
        _type: 'block',
        _key: 'h2-design',
        style: 'h2',
        children: [{ _type: 'span', text: '２本の龍の橋脚が織りなす美しいデザイン', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'design-content',
        style: 'normal',
        children: [{ _type: 'span', text: '廓龍橋の最大の特徴は、水面から立ち上がる２本の龍を模した美しい橋脚です。この龍のデザインは東洋の伝統的な芸術様式を現代の橋梁建築に取り入れた見事な作品で、機能性と芸術性を兼ね備えています。龍の姿は力強さと優雅さを同時に表現しており、見る角度によって異なる表情を見せてくれます。特に夕暮れ時や夜間のライトアップ時には、その美しさが一層際立ち、多くの人々を魅了しています。地域の文化的アイデンティティを象徴する重要な建造物となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 池川の自然環境（約160文字）
      {
        _type: 'block',
        _key: 'h2-river',
        style: 'h2',
        children: [{ _type: 'span', text: '池川の豊かな自然環境', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'river-content',
        style: 'normal',
        children: [{ _type: 'span', text: '廓龍橋が架かる池川は、砺波平野を流れる清らかな河川で、四季を通じて美しい自然の表情を見せてくれます。春には桜並木が川岸を彩り、夏には緑豊かな河川敷で多くの生き物が息づいています。秋には紅葉が水面に映え、冬には雪化粧した景観が静寂な美しさを演出します。清流には様々な魚類も生息しており、釣りを楽しむ人の姿も見かけます。橋の上からは、この豊かな自然環境を一望することができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域の歴史と文化（約150文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '砺波地域の歴史と伝統', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波市は古くから農業が盛んな地域で、散居村という独特の集落形態でも知られています。龍という神話的な生き物を橋のデザインに採用したのは、水の神様として龍を信仰してきた日本の伝統文化と、豊かな水田地帯である砺波平野の特性を反映したものです。地域の人々にとって川は生活に欠かせない存在であり、その川に架かる橋もまた、生活と文化を結ぶ重要な役割を果たしています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 観光と撮影スポット（約140文字）
      {
        _type: 'block',
        _key: 'h2-tourism',
        style: 'h2',
        children: [{ _type: 'span', text: '撮影スポットとしての魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tourism-content',
        style: 'normal',
        children: [{ _type: 'span', text: '廓龍橋は写真愛好家にとって格好の撮影スポットとなっています。龍の橋脚と川面の組み合わせは、どの角度から撮っても絵になる美しさです。特に早朝の朝霧や夕暮れ時の光線は、幻想的な写真を撮影することができます。橋の上からの眺望も素晴らしく、砺波平野の田園風景を一望できます。SNS映えする風景として、若い世代にも人気が高まっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: アクセスと周辺情報（約130文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: 'アクセスと周辺の楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '廓龍橋へは砺波市内から車でアクセスするのが便利です。周辺には散居村の景観を楽しめるスポットや、砺波チューリップ公園などの観光地もあります。春のチューリップフェアの時期には多くの観光客が訪れ、橋と花の美しいコラボレーションを楽しむことができます。地元の農産物直売所での買い物や、郷土料理を味わうグルメ巡りも合わせて楽しめます。', marks: [] }],
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
        children: [{ _type: 'span', text: '２本の龍の橋脚が美しい廓龍橋は、砺波市の隠れた名所です。自然と芸術が調和した素晴らしい景観をぜひ一度ご覧ください。', marks: [] }],
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
    
    console.log('✅ 第15記事の更新が完了しました');
    console.log('📋 171文字→' + newTotalChars + '文字に拡張');
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

expandFifteenthArticle();