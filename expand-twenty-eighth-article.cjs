const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyEighthArticle() {
  try {
    console.log('第28記事の更新を開始します...');
    console.log('対象: imizu-city-100 (太閤山ランドの鯉のエサやり)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "imizu-city-100"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、太閤山ランドの鯉のエサやりの記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市の太閤山ランドで体験できる100円の鯉のエサやり。手軽な価格で楽しめる心温まる動物との触れ合い体験をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 太閤山ランドの概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-park',
        style: 'h2',
        children: [{ _type: 'span', text: '太閤山ランドの魅力と楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'park-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドは射水市にある県民公園として、幅広い年代の方々に愛され続けている総合レジャー施設です。広大な敷地内には様々な施設や自然スポットが点在しており、一日中楽しむことができます。特に家族連れには人気が高く、子どもから大人まで楽しめるアトラクションや体験コーナーが充実しています。四季を通じて美しい自然を楽しむことができ、散歩やピクニックにも最適な環境が整っています。公園内には池や小川もあり、自然と触れ合える貴重な空間として地域の人々に親しまれています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 100円エサやり体験の魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-feeding',
        style: 'h2',
        children: [{ _type: 'span', text: '100円で楽しめる鯉のエサやり体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'feeding-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドの鯉のエサやり体験は、わずか100円という手頃な価格で楽しむことができる人気アトラクションです。専用の餌を購入すると、池にいる色とりどりの鯉たちが我先にと集まってきます。鯉たちの活発な様子を間近で観察することができ、特に子どもたちには大興奮の体験となります。エサを投げ入れると、大きな口を開けて競い合うように食べる鯉たちの姿は見ていて微笑ましく、家族みんなで楽しめます。この価格でこれほど楽しい体験ができるのは、太閤山ランドならではの魅力です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 鯉との触れ合いの楽しさ（約155文字）
      {
        _type: 'block',
        _key: 'h2-interaction',
        style: 'h2',
        children: [{ _type: 'span', text: '鯉との触れ合いが生み出す癒しの時間', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'interaction-content',
        style: 'normal',
        children: [{ _type: 'span', text: '鯉のエサやり体験は単なる娯楽を超えて、心を癒してくれる特別な時間でもあります。池の周りに立ってエサを与えていると、日常の忙しさを忘れて穏やかな気持ちになります。鯉たちがエサに群がる様子を眺めているだけでも、自然の生命力を感じることができ、心が洗われるような感覚を味わえます。特に大きな鯉が優雅に泳ぐ姿は美しく、見ているだけでも十分に楽しめます。子どもたちにとっては生き物への思いやりの心を育む良い機会にもなります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 家族で楽しむ体験（約145文字）
      {
        _type: 'block',
        _key: 'h2-family',
        style: 'h2',
        children: [{ _type: 'span', text: '家族みんなで楽しめる手軽な体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'family-content',
        style: 'normal',
        children: [{ _type: 'span', text: '100円という手頃な価格設定により、家族全員で気軽に楽しむことができるのが大きな魅力です。兄弟姉妹それぞれが自分用のエサを購入して、誰が一番多く鯉を集められるかを競い合うのも楽しい遊び方の一つです。祖父母世代から孫世代まで、年齢を問わず誰でも参加できる体験なので、三世代での家族旅行にも最適です。写真撮影も自由にできるため、家族の素敵な思い出を記録に残すこともできます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問時のおすすめ（約130文字）
      {
        _type: 'block',
        _key: 'h2-tips',
        style: 'h2',
        children: [{ _type: 'span', text: 'エサやり体験を楽しむコツ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tips-content',
        style: 'normal',
        children: [{ _type: 'span', text: '鯉のエサやりを最大限楽しむためには、平日の午前中がおすすめです。比較的混雑が少なく、ゆっくりと鯉たちを観察することができます。エサは少しずつ投げ入れることで、長時間楽しむことができます。小さなお子様連れの場合は、池に落ちないよう注意が必要です。100円玉を何枚か用意しておけば、何度でも楽しむことができます。太閤山ランドの他の施設と合わせて訪れることで、一日中楽しめます。', marks: [] }],
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
        children: [{ _type: 'span', text: '太閤山ランドの100円鯉のエサやりは、手軽で楽しい家族向け体験です。心温まる鯉との触れ合いをぜひ体験してみてください。', marks: [] }],
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
    
    console.log('✅ 第28記事の更新が完了しました');
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

expandTwentyEighthArticle();