const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFourteenthArticle() {
  try {
    console.log('第14記事の更新を開始します...');
    console.log('対象: nanto-city-2 (五箇山相倉合掌造り集落)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "nanto-city-2"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、五箇山相倉合掌造り集落の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '五箇山相倉合掌造り集落は、世界文化遺産に登録された日本の代表的な山村集落です。昔ながらの合掌造りの家屋が美しい景観を作り出しています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 世界遺産の価値（約170文字）
      {
        _type: 'block',
        _key: 'h2-world-heritage',
        style: 'h2',
        children: [{ _type: 'span', text: '世界文化遺産相倉合掌造り集落', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'world-heritage-content',
        style: 'normal',
        children: [{ _type: 'span', text: '1995年に白川郷と共に世界文化遺産に登録された相倉合掌造り集落は、日本の伝統的な山村文化を現在に伝える貴重な文化遺産です。急峻な山間部にありながら、人々が自然と調和しながら生活してきた知恵と技術が凝縮されています。合掌造りの建築様式は、豪雪地帯での生活に適応した日本独特の建築技術として、世界的にも高く評価されています。現在も約20棟の合掌造りの家屋が現存し、その多くで実際に人々が生活を営んでいます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 合掌造りの建築美（約165文字）
      {
        _type: 'block',
        _key: 'h2-architecture',
        style: 'h2',
        children: [{ _type: 'span', text: '合掌造りの建築技術と美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'architecture-content',
        style: 'normal',
        children: [{ _type: 'span', text: '合掌造りは、手のひらを合わせたような急勾配の茅葺き屋根が特徴的な建築様式です。この構造は豪雪に耐えるため考案されたもので、屋根の角度は約60度という急勾配になっています。屋根裏は養蚕業に使われており、3～4階建ての構造となっています。釘を一本も使わず、縄と木組みだけで建てられた建物は、地震にも強い柔軟な構造を持っています。この伝統的な建築技術は、現代の建築学においても注目される優れた工法です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 四季折々の景観（約150文字）
      {
        _type: 'block',
        _key: 'h2-seasons',
        style: 'h2',
        children: [{ _type: 'span', text: '四季が彩る集落の美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'seasons-content',
        style: 'normal',
        children: [{ _type: 'span', text: '相倉集落は四季を通じて異なる美しさを見せてくれます。春は山桜と新緑に囲まれた合掌造りが清々しく、夏は深い緑の中に茅葺き屋根が映えます。秋には紅葉が集落全体を包み込み、まるで絵画のような景観を作り出します。冬は雪化粧した合掌造りが幻想的な風景を演出し、多くの写真愛好家や観光客を魅了しています。どの季節に訪れても、日本の原風景の美しさを感じることができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 伝統文化と生活（約140文字）
      {
        _type: 'block',
        _key: 'h2-culture',
        style: 'h2',
        children: [{ _type: 'span', text: '山村の伝統文化と暮らし', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'culture-content',
        style: 'normal',
        children: [{ _type: 'span', text: '集落では古くから養蚕業や和紙作り、炭焼きなどの山村産業が営まれてきました。厳しい自然環境の中で培われた共同体意識と相互扶助の精神は、現在でも集落の人々に受け継がれています。年中行事や祭りも大切に保存されており、訪問者は日本の山村文化の本質を体験することができます。民宿や食事処では、地元の食材を使った郷土料理も味わうことができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 観光のポイント（約130文字）
      {
        _type: 'block',
        _key: 'h2-tourism',
        style: 'h2',
        children: [{ _type: 'span', text: '集落見学のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tourism-content',
        style: 'normal',
        children: [{ _type: 'span', text: '集落内には見学できる合掌造りの民家や展示館があり、建築構造や生活様式について詳しく学ぶことができます。展望台からは集落全体を見渡すことができ、合掌造りの屋根が織りなす美しい景観を一望できます。散策路も整備されており、ゆっくりと集落を歩きながら歴史と文化に触れることができます。お土産品や地元の工芸品も購入できます。', marks: [] }],
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
        children: [{ _type: 'span', text: '五箇山相倉合掌造り集落は、日本の伝統的な山村文化を現代に伝える貴重な世界遺産です。合掌造りの建築美と四季の自然が織りなす景観をぜひ体験してください。', marks: [] }],
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
    
    console.log('✅ 第14記事の更新が完了しました');
    console.log('📋 実際の文字数→' + newTotalChars + '文字に拡張');
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

expandFourteenthArticle();