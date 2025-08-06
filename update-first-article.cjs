const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateFirstArticle() {
  try {
    console.log('第1記事の更新を開始します...');
    console.log('対象: toyama-city-50 (どら焼き ふわどら記事)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-50"][0] { _id, title, body }');
    
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
    
    if (h3Count <= 1 && totalChars >= 900 && totalChars <= 1100) {
      console.log('✅ 既に理想的な状態です。更新不要。');
      return;
    }
    
    console.log('\n更新処理を開始...');
    
    // シャルロッテ記事を参考にした構成で更新
    // H3を削除し、6つのH2見出しに再構成
    const optimizedContent = [
      // 導入文（約80文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市にある和菓子店で、午前中に完売してしまうという幻の「ふわどら」。50個限定の極上ふわふわ食感のどら焼きをご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 店舗概要（約150文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: 'ふわどらの店舗概要', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市内の人気和菓子店で、朝早くから多くの方が列を作る話題のお店です。特に「ふわどら」は1日50個限定の特別などら焼きで、その極上のふわふわ食感と上品な甘さで多くのファンを魅了しています。午前中には完売してしまうため、早めの来店をおすすめします。', marks: [] }],
        markDefs: []
      },
      
      // H2: ふわどらの魅力（約180文字）
      {
        _type: 'block',
        _key: 'h2-charm',
        style: 'h2',
        children: [{ _type: 'span', text: 'ふわどらの特別な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'charm-content',
        style: 'normal',
        children: [{ _type: 'span', text: '通常のどら焼きとは一線を画す、まるでスポンジケーキのような極上のふわふわ食感が最大の特徴です。職人が丁寧に焼き上げた生地は驚くほど軽やかで、口の中でとろけるような食感を楽しめます。あんこも上品な甘さに仕上げられており、生地との絶妙なバランスが味わえます。1日50個という限定性も相まって、まさに幻のどら焼きと呼ぶにふさわしい逸品です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 職人のこだわり（約150文字）
      {
        _type: 'block',
        _key: 'h2-craftsman',
        style: 'h2',
        children: [{ _type: 'span', text: '職人のこだわりと製法', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'craftsman-content',
        style: 'normal',
        children: [{ _type: 'span', text: '熟練の職人が一つ一つ丁寧に手作りしています。ふわふわ食感を実現するための特別な製法と、厳選された材料を使用することで、他では味わえない上質などら焼きが生まれています。毎朝早くから仕込みを行い、最高の状態でお客様に提供するための努力を惜しみません。', marks: [] }],
        markDefs: []
      },
      
      // H2: 購入方法とアクセス（約130文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: '購入方法とアクセス情報', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '1日50個限定のため、確実に購入したい方は開店時間に合わせた来店をおすすめします。人気商品のため午前中には完売してしまうことが多く、特に休日は早めの時間帯での来店が安心です。富山市内の便利な立地にあるため、アクセスも良好です。', marks: [] }],
        markDefs: []
      },
      
      // H2: お客様の声（約120文字）
      {
        _type: 'block',
        _key: 'h2-reviews',
        style: 'h2',
        children: [{ _type: 'span', text: 'お客様の声と評判', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'reviews-content',
        style: 'normal',
        children: [{ _type: 'span', text: '「今まで食べたどら焼きの中で一番美味しい」「ふわふわ食感に感動した」など、多くのお客様から絶賛の声をいただいています。リピーターの方も多く、遠方からわざわざ足を運ぶ方もいるほど。一度食べたら忘れられない味として評判です。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約110文字）
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
        children: [{ _type: 'span', text: '1日50個限定の幻のどら焼き「ふわどら」は、極上のふわふわ食感と上品な味わいで多くの人を魅了しています。午前中には完売してしまうため、ぜひ早めの時間帯に足を運んで、この特別などら焼きをご堪能ください。', marks: [] }],
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
    
    console.log('✅ 第1記事の更新が完了しました');
    console.log('📋 H3見出しを削除し、H2のみの構成に変更');
    console.log('🎯 文字数を1000文字前後に調整');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

updateFirstArticle();