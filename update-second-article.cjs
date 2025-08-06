const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateSecondArticle() {
  try {
    console.log('第2記事の更新を開始します...');
    console.log('対象: toyama-city-candy-apple-maroot (りんご飴専門店記事)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-candy-apple-maroot"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事タイトル:', post.title);
    
    // 現在の状態確認
    let totalChars = 0;
    let h2Count = 0;
    let h3Count = 0;
    
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
        
        if (block.style === 'h2') h2Count++;
        if (block.style === 'h3') h3Count++;
      }
    });
    
    console.log('現在の状態:');
    console.log(`文字数: ${totalChars}文字`);
    console.log(`H2見出し: ${h2Count}個`);
    console.log(`H3見出し: ${h3Count}個`);
    
    console.log('\n更新処理を開始...');
    
    // シャルロッテ記事を参考にした構成で更新
    // H3を削除し、6つのH2見出しに再構成
    const optimizedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市のMAROOTに新登場した「代官山candy apple maroot」は、まるごとりんごのパリパリ食感が楽しめるりんご飴専門店です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 店舗概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '代官山candy apple marootの概要', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市のMAROOT内にオープンしたりんご飴専門店で、東京代官山発祥の人気ブランドです。新鮮なりんごを丸ごと使用した本格的なりんご飴は、従来のりんご飴とは一線を画す上質な味わいとパリパリ食感で多くの方に愛されています。見た目も美しく、SNS映えするスイーツとしても注目を集めています。', marks: [] }],
        markDefs: []
      },
      
      // H2: りんご飴の特徴（約180文字）
      {
        _type: 'block',
        _key: 'h2-features',
        style: 'h2',
        children: [{ _type: 'span', text: 'まるごとりんごの魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'features-content',
        style: 'normal',
        children: [{ _type: 'span', text: '最大の特徴は、りんごを丸ごと使用したパリパリ食感のキャンディコーティングです。表面の美しい飴の層は職人技により作られ、噛んだ瞬間の心地良い「パリッ」という音と食感が楽しめます。中のりんごは甘さと酸味のバランスが絶妙で、飴の甘さと相まって上品な味わいを演出しています。見た目も宝石のように美しく、味覚だけでなく視覚でも楽しめる特別なスイーツです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 製法とこだわり（約150文字）
      {
        _type: 'block',
        _key: 'h2-method',
        style: 'h2',
        children: [{ _type: 'span', text: '職人の技術と製法', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'method-content',
        style: 'normal',
        children: [{ _type: 'span', text: '代官山で培われた職人の技術により、一つ一つ丁寧に手作りされています。りんごの選定から飴の温度管理まで、すべての工程にこだわりを持って製造。パリパリ食感を実現するための特別な配合と技術により、他では味わえない上質なりんご飴が完成します。', marks: [] }],
        markDefs: []
      },
      
      // H2: MAROOT店舗の魅力（約140文字）
      {
        _type: 'block',
        _key: 'h2-location',
        style: 'h2',
        children: [{ _type: 'span', text: 'MAROOT店舗の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'location-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市内の人気スポットMAROOT内に位置し、アクセスも良好です。おしゃれな店舗空間で、ゆっくりとりんご飴選びを楽しめます。テイクアウトはもちろん、その場で食べることも可能で、友人やご家族との楽しいひとときを過ごせる空間となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: おすすめの楽しみ方（約120文字）
      {
        _type: 'block',
        _key: 'h2-enjoy',
        style: 'h2',
        children: [{ _type: 'span', text: 'おすすめの楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'enjoy-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'SNS映えする美しい見た目なので、写真撮影もおすすめです。また、手土産やギフトとしても喜ばれます。その場で食べる際は、パリパリ音を楽しみながらゆっくりと味わってください。新感覚のりんご飴体験をお楽しみいただけます。', marks: [] }],
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
        children: [{ _type: 'span', text: '代官山candy apple marootは、まるごとりんごのパリパリ食感が楽しめる特別なスイーツ店です。ぜひMAROOTを訪れた際には、この新感覚のりんご飴をご体験ください。', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let newTotalChars = 0;
    optimizedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        newTotalChars += text.length;
      }
    });
    
    console.log(`新しい文字数: ${newTotalChars}文字`);
    console.log('新しい構成: H2見出し6個');
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: optimizedContent })
      .commit();
    
    console.log('✅ 第2記事の更新が完了しました');
    console.log('📋 H3見出しを削除し、H2のみの構成に変更');
    console.log('🎯 文字数を1000文字前後に調整');
    
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

updateSecondArticle();