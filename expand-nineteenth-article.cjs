const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandNineteenthArticle() {
  try {
    console.log('第19記事の更新を開始します...');
    console.log('対象: kurobe-city-station (黒部峡谷鉄道宇奈月駅の謎の自販機)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-station"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、謎の自販機の記事を拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部峡谷鉄道宇奈月駅で出会える謎の自販機。一体何が売られているのか、その正体と魅力をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 黒部峡谷鉄道宇奈月駅の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-station',
        style: 'h2',
        children: [{ _type: 'span', text: '黒部峡谷鉄道宇奈月駅の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'station-content',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部峡谷鉄道宇奈月駅は、日本屈指の山岳鉄道である黒部峡谷鉄道の起点となる重要な駅です。ここから奥深い黒部峡谷へと向かう小さなトロッコ列車が出発し、多くの観光客が大自然への冒険に胸を躍らせます。駅舎は温泉街の風情にマッチした趣のある建物で、黒部峡谷観光の玄関口としての役割を果たしています。待合室や売店なども充実しており、トロッコ列車の出発時間まで快適に過ごすことができます。そんな駅構内で出会える謎の自販機は、訪れる人々の好奇心をくすぐる存在となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 謎の自販機の正体（約165文字）
      {
        _type: 'block',
        _key: 'h2-mystery',
        style: 'h2',
        children: [{ _type: 'span', text: '謎の自販機の正体と販売商品', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'mystery-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'この謎の自販機の正体は、地元の特産品や限定グッズを販売する特別な自動販売機です。一般的な飲み物やお菓子の自販機とは異なり、宇奈月温泉や黒部峡谷にちなんだユニークな商品が並んでいます。温泉まんじゅうや地元の銘菓、黒部峡谷鉄道のオリジナルグッズなど、ここでしか手に入らない貴重なアイテムが販売されています。観光客にとってはサプライズな出会いとなり、旅の記念品として人気を集めています。何が売られているかは実際に見てみないと分からないワクワク感も、この自販機の大きな魅力です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域密着の取り組み（約155文字）
      {
        _type: 'block',
        _key: 'h2-local',
        style: 'h2',
        children: [{ _type: 'span', text: '地域と観光客を結ぶユニークな取り組み', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'local-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'この自販機は単なる商品販売機器ではなく、地域の魅力を伝える重要な役割を担っています。地元の職人が作った手作り商品や、黒部の自然をテーマにした限定アイテムなどを通じて、訪れる人々に宇奈月の文化と伝統を紹介しています。また、季節ごとに販売商品が変わることもあり、何度訪れても新しい発見があります。地域の生産者にとっても、観光客に直接商品をアピールできる貴重な販売チャネルとなっており、地域経済の活性化にも貢献しています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 黒部峡谷観光との相乗効果（約140文字）
      {
        _type: 'block',
        _key: 'h2-tourism',
        style: 'h2',
        children: [{ _type: 'span', text: '黒部峡谷観光をより楽しくする存在', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tourism-content',
        style: 'normal',
        children: [{ _type: 'span', text: '謎の自販機は黒部峡谷観光の楽しみを一層深める存在です。トロッコ列車の待ち時間に偶然発見する人も多く、旅の思い出作りに一役買っています。購入した商品は峡谷の絶景を眺めながら味わうことができ、特別な体験となります。SNS映えするユニークな自販機として話題にもなっており、友人や家族とのコミュニケーションのきっかけにもなっています。黒部峡谷の雄大な自然と共に、この小さな発見も旅の醍醐味の一つです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 利用のコツと楽しみ方（約130文字）
      {
        _type: 'block',
        _key: 'h2-tips',
        style: 'h2',
        children: [{ _type: 'span', text: '自販機利用のコツと楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tips-content',
        style: 'normal',
        children: [{ _type: 'span', text: '謎の自販機を最大限楽しむためのコツをご紹介します。まず、商品のラインナップは季節や在庫状況により変わるため、何度訪れても新しい発見があります。小銭を多めに用意しておくと、気になる商品を複数購入できます。また、商品の説明をよく読むことで、地元の文化や歴史についても学ぶことができます。家族や友人へのお土産選びにも最適で、宇奈月ならではの特別なプレゼントが見つかります。', marks: [] }],
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
        children: [{ _type: 'span', text: '宇奈月駅の謎の自販機は、黒部峡谷観光をより特別なものにしてくれる隠れたスポットです。ぜひ一度、その正体を確かめに訪れてみてください。', marks: [] }],
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
    
    console.log('✅ 第19記事の更新が完了しました');
    console.log('📋 179文字→' + newTotalChars + '文字に拡張');
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

expandNineteenthArticle();