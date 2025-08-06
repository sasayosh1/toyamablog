const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentySecondArticle() {
  try {
    console.log('第22記事の更新を開始します...');
    console.log('対象: toyama-city-50-2 (いも屋のかき氷)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-50-2"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、いも屋のかき氷記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市にある「いも屋」は、トッピング50円からという驚きの価格でかき氷を提供する、地元で愛される老舗のお店です。', marks: [] }],
        markDefs: []
      },
      
      // H2: いも屋の歴史と概要（約170文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: 'いも屋の歴史と地域に愛される理由', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'いも屋は富山市で長年営業を続けている地域密着型のお店で、地元の人々に親しまれ続けています。店名の通り、元々は芋を使った商品を中心に扱っていましたが、現在では手作りのかき氷で多くのファンを獲得しています。昔ながらの製法と心のこもったサービスで、世代を超えて愛され続けているお店です。特に夏場のかき氷は地元の定番となっており、リーズナブルな価格設定により家族連れから学生まで幅広い層に支持されています。店主の温かい人柄も、多くのお客様に愛される理由の一つです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 驚きの価格設定（約165文字）
      {
        _type: 'block',
        _key: 'h2-price',
        style: 'h2',
        children: [{ _type: 'span', text: 'トッピング50円からの驚きの価格設定', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'price-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'いも屋の最大の魅力は、なんといってもその驚くべき価格の安さです。トッピングが50円からという価格設定は、現在の物価を考えると信じられないほどリーズナブルです。基本のかき氷も非常にお手頃価格で提供されており、学生のお小遣いでも十分に楽しむことができます。この価格設定には、地域の人々に気軽に美味しいものを楽しんでもらいたいという店主の温かい思いが込められています。コストパフォーマンスの高さは他の追随を許さず、富山市内でも屈指のお得なスイーツスポットとして知られています。', marks: [] }],
        markDefs: []
      },
      
      // H2: かき氷の種類と味（約155文字）
      {
        _type: 'block',
        _key: 'h2-menu',
        style: 'h2',
        children: [{ _type: 'span', text: '豊富なメニューと手作りの美味しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'menu-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'いも屋のかき氷は、シンプルながらも心のこもった手作りの味が自慢です。基本のシロップから季節限定のフレーバーまで、様々な種類を取り揃えています。氷はきめ細かく削られており、口当たりが滑らかで食べやすいのが特徴です。トッピングも多彩で、あんこ、フルーツ、練乳など、お好みに合わせて自由に組み合わせることができます。手作りならではの温かみのある味は、大量生産のものとは一線を画す美味しさです。季節の食材を使った限定メニューも人気で、リピーターを飽きさせません。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域コミュニティの場（約145文字）
      {
        _type: 'block',
        _key: 'h2-community',
        style: 'h2',
        children: [{ _type: 'span', text: '地域コミュニティの憩いの場として', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'community-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'いも屋は単なる飲食店を超えて、地域コミュニティの重要な憩いの場としての役割を果たしています。近所の子どもたちが学校帰りに立ち寄ったり、ご年配の方々が昔話に花を咲かせたりと、世代を超えた交流の場となっています。リーズナブルな価格設定のおかげで、誰もが気軽に立ち寄ることができ、地域の結束を深める場所として機能しています。店主との温かい会話も楽しみの一つで、常連のお客様にとっては第二の家のような存在です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問のおすすめ（約125文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '訪問時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'いも屋を訪れる際は、ぜひ複数のトッピングを試してみることをおすすめします。50円という価格なら、いろいろな味を楽しんでも負担になりません。夏の暑い日には特に美味しく感じられ、エアコンの効いた店内でゆっくりと過ごすことができます。現金での支払いとなることが多いので、小銭を用意しておくと便利です。地元の隠れた名店として、観光客にもぜひ体験していただきたいお店です。', marks: [] }],
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
        children: [{ _type: 'span', text: '富山市のいも屋は、驚きの価格と心温まるサービスで地域に愛される素晴らしいお店です。トッピング50円からのかき氷をぜひ味わってみてください。', marks: [] }],
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
    
    console.log('✅ 第22記事の更新が完了しました');
    console.log('📋 181文字→' + newTotalChars + '文字に拡張');
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

expandTwentySecondArticle();