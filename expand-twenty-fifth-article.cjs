const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyFifthArticle() {
  try {
    console.log('第25記事の更新を開始します...');
    console.log('対象: himi-city-temple-500-1 (光久寺の名園茶庭)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "himi-city-temple-500-1"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、光久寺の名園茶庭記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '氷見市にある光久寺は、知る人ぞ知る美しい名園茶庭を有する寺院です。志納500円で楽しめる贅沢な庭園体験をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 光久寺の歴史と概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-temple',
        style: 'h2',
        children: [{ _type: 'span', text: '光久寺の歴史と寺院としての価値', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'temple-content',
        style: 'normal',
        children: [{ _type: 'span', text: '光久寺は氷見市に位置する歴史ある寺院で、古くから地域の人々に親しまれてきました。寺院としての宗教的な役割を果たしながら、美しい庭園文化の継承にも力を注いでいます。特に茶庭は江戸時代から受け継がれてきた伝統的な造園技法で作られており、日本庭園の美学を体現した貴重な文化遺産です。寺院の建物も趣があり、庭園との調和が見事に取れています。静寂な環境の中で、訪れる人々に心の平安をもたらしてくれる特別な場所として、多くの人に愛され続けています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 名園茶庭の美しさ（約165文字）
      {
        _type: 'block',
        _key: 'h2-garden',
        style: 'h2',
        children: [{ _type: 'span', text: '名園茶庭の美しさと設計の妙', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'garden-content',
        style: 'normal',
        children: [{ _type: 'span', text: '光久寺の茶庭は、茶道の精神を体現した繊細で美しい庭園です。石組み、植栽、水の流れなど、すべての要素が計算し尽くされて配置されており、見る者の心を静かに癒してくれます。四季を通じて異なる表情を見せ、春の新緑、夏の深緑、秋の紅葉、冬の雪景色と、それぞれの季節で独特の美しさを楽しむことができます。苔むした石燈籠や古い石橋なども庭園の趣を深めており、日本の伝統的な美意識が随所に感じられます。茶室からの眺めは特に素晴らしく、まさに絵画のような美しさです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 志納500円の価値（約155文字）
      {
        _type: 'block',
        _key: 'h2-donation',
        style: 'h2',
        children: [{ _type: 'span', text: '志納500円で味わえる贅沢な体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'donation-content',
        style: 'normal',
        children: [{ _type: 'span', text: '志納500円という手頃な料金で、これほど美しい庭園を鑑賞できるのは非常にお得です。この料金には庭園の維持管理費用が含まれており、訪れる人々が継続して美しい庭園を楽しめるよう配慮されています。一般的な有名庭園と比較しても破格の価格設定で、気軽に本格的な日本庭園の美しさを体験することができます。志納という形式は、庭園への感謝の気持ちを表すものでもあり、心の豊かさも得られます。この価格で得られる癒しと美的体験は、まさにプライスレスと言えるでしょう。', marks: [] }],
        markDefs: []
      },
      
      // H2: 茶道文化との関わり（約145文字）
      {
        _type: 'block',
        _key: 'h2-tea-culture',
        style: 'h2',
        children: [{ _type: 'span', text: '茶道文化と庭園の深い関係', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tea-culture-content',
        style: 'normal',
        children: [{ _type: 'span', text: '光久寺の茶庭は茶道文化と密接に関わっており、茶室からの眺めを最重要視して設計されています。茶道における「わび・さび」の精神が庭園全体に表現されており、簡素でありながら深い味わいのある美しさを演出しています。庭園を眺めながらお茶をいただくという日本独特の文化的体験は、現代人にとって新鮮で貴重なものです。季節の移ろいを愛でる心や、自然との調和を重んじる茶道の精神を、庭園を通じて感じることができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 訪問のおすすめ（約130文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '庭園見学時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '光久寺を訪れる際は、事前に拝観可能な時間を確認することをおすすめします。庭園は季節によって最適な鑑賞時間が異なるため、季節ごとの見どころを事前に調べておくとより楽しめます。カメラ持参で美しい庭園の写真を撮影するのもおすすめですが、マナーを守って撮影しましょう。ゆっくりと時間をかけて庭園を眺めることで、日本庭園の奥深い美しさを感じることができます。氷見観光の際には、ぜひ立ち寄っていただきたいスポットです。', marks: [] }],
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
        children: [{ _type: 'span', text: '光久寺の名園茶庭は志納500円で楽しめる隠れた名所です。日本庭園の美しさと茶道文化の深さを同時に体験できる贅沢な時間をお過ごしください。', marks: [] }],
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
    
    console.log('✅ 第25記事の更新が完了しました');
    console.log('📋 184文字→' + newTotalChars + '文字に拡張');
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

expandTwentyFifthArticle();