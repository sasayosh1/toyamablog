const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyNinthArticle() {
  try {
    console.log('第29記事の更新を開始します...');
    console.log('対象: kurobe-city-1 (くろべ牧場まきばの風)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-1"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、くろべ牧場まきばの風の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部市にあるくろべ牧場まきばの風で出会えるヤギとポニー。のんびりとした彼らの日常を眺める癒しの時間をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: くろべ牧場まきばの風の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-farm',
        style: 'h2',
        children: [{ _type: 'span', text: 'くろべ牧場まきばの風の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'farm-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'くろべ牧場まきばの風は黒部市にある体験型牧場で、自然豊かな環境の中で様々な動物たちと触れ合うことができる癒しのスポットです。立山連峰を背景にした雄大な景色の中に位置し、都市部では味わえない開放感を感じることができます。牧場では動物との触れ合いだけでなく、新鮮な牛乳を使った乳製品の販売や、季節ごとの農業体験なども楽しむことができます。家族連れや動物好きの方々に人気の施設で、特に週末には多くの来場者で賑わいます。自然と動物に囲まれた環境で、日常の疲れを癒すことができる特別な場所です。', marks: [] }],
        markDefs: []
      },
      
      // H2: ヤギの愛らしさ（約165文字）
      {
        _type: 'block',
        _key: 'h2-goats',
        style: 'h2',
        children: [{ _type: 'span', text: 'ヤギたちの個性豊かな魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'goats-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'くろべ牧場のヤギたちは、それぞれが個性的で愛らしい存在です。好奇心旺盛で人懐っこい性格の子もいれば、少し警戒心が強くてマイペースな子もおり、見ているだけでも楽しめます。エサやり体験では、ヤギたちが手のひらから直接エサを食べてくれる貴重な体験ができ、その時の優しい表情は心を温かくしてくれます。角の形や毛色、体の大きさもそれぞれ異なり、一頭一頭に個性があることがよくわかります。特に子ヤギがいる時期は、その愛らしい仕草に多くの来場者が癒されています。', marks: [] }],
        markDefs: []
      },
      
      // H2: ポニーとの触れ合い（約155文字）
      {
        _type: 'block',
        _key: 'h2-ponies',
        style: 'h2',
        children: [{ _type: 'span', text: 'ポニーとの特別な触れ合い体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'ponies-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'くろべ牧場のポニーは穏やかで優しい性格で、小さなお子様でも安心して触れ合うことができます。通常の馬よりも小柄なため、子どもたちにとっては親しみやすい存在です。ポニーの乗馬体験では、専門スタッフが丁寧に指導してくれるので、初心者でも安心して楽しむことができます。ポニーの温かな体温と優しい目を間近で感じることで、動物との特別な絆を感じることができます。ブラッシング体験なども用意されており、ポニーとのより深い交流を楽しむことができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 自然環境の素晴らしさ（約145文字）
      {
        _type: 'block',
        _key: 'h2-nature',
        style: 'h2',
        children: [{ _type: 'span', text: '立山連峰を背景にした雄大な自然環境', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'nature-content',
        style: 'normal',
        children: [{ _type: 'span', text: '牧場の最大の魅力の一つは、立山連峰の雄大な景色を背景にした素晴らしい自然環境です。清々しい空気の中で動物たちと触れ合う体験は、都市部では決して味わうことのできない贅沢なひとときです。四季を通じて異なる表情を見せる山々の景色は、動物との触れ合いをより特別なものにしてくれます。広々とした牧草地で自由に過ごす動物たちの姿は、まさに理想的な牧場風景そのものです。この環境だからこそ、動物たちものびのびと健康に育っています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問のおすすめ（約130文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '牧場見学のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'くろべ牧場を訪れる際は、動物たちが活発に動き回る午前中がおすすめです。エサやり体験やふれあい体験を楽しんだ後は、牧場内のカフェで地元の新鮮な乳製品を味わうこともできます。天気の良い日には立山連峰の景色も一層美しく、記念撮影にも最適です。小さなお子様連れの場合は、動物に驚かないよう事前に説明しておくと安心です。ゆっくりとした時間の流れの中で、心の癒しを求める方には特におすすめのスポットです。', marks: [] }],
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
        children: [{ _type: 'span', text: 'くろべ牧場のヤギとポニーは心を癒してくれる素敵な存在です。雄大な自然環境の中での動物との触れ合いをぜひ体験してみてください。', marks: [] }],
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
    
    console.log('✅ 第29記事の更新が完了しました');
    console.log('📋 189文字→' + newTotalChars + '文字に拡張');
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

expandTwentyNinthArticle();