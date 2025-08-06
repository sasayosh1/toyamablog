const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSecondShortArticle() {
  try {
    console.log('第2文字数拡張記事の更新を開始します...');
    console.log('対象: takaoka-city-park-sakura-castle (高岡古城公園)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "takaoka-city-park-sakura-castle"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、高岡古城公園の記事を拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '高岡市の高岡古城公園は、桜の名所として親しまれている美しい都市公園です。早朝の静寂な時間帯に散策すると、特別な魅力を発見できます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 公園概要（約155文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '高岡古城公園の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '高岡古城公園は、前田利長が築いた高岡城の城跡を整備した歴史ある公園です。約21ヘクタールの広大な敷地内には、美しい堀や石垣などの城郭遺構が残されており、歴史を感じながら散策を楽しむことができます。四季を通じて美しい景観を楽しめますが、特に桜の季節は多くの観光客で賑わいます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 桜の見どころ（約170文字）
      {
        _type: 'block',
        _key: 'h2-sakura',
        style: 'h2',
        children: [{ _type: 'span', text: '桜の名所としての魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'sakura-content',
        style: 'normal',
        children: [{ _type: 'span', text: '園内には約1800本の桜が植えられており、ソメイヨシノを中心に様々な品種の桜を楽しむことができます。水堀に映る桜の姿は特に美しく、多くの写真愛好家に愛されています。早朝の時間帯は人が少なく、静寂な中で桜を独り占めするような贅沢な体験ができます。朝の優しい光に照らされた桜は、昼間とは違った神秘的な美しさを見せてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 早朝散策の魅力（約150文字）
      {
        _type: 'block',
        _key: 'h2-morning',
        style: 'h2',
        children: [{ _type: 'span', text: '早朝散策の特別な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'morning-content',
        style: 'normal',
        children: [{ _type: 'span', text: '早朝の高岡古城公園は、日中とは全く異なる表情を見せてくれます。静寂に包まれた園内では、鳥のさえずりや水のせせらぎといった自然の音を感じることができ、都市の喧騒を忘れて心を癒すことができます。朝の清々しい空気の中で歩く散策路は、一日の始まりにぴったりのリフレッシュタイムとなります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 歴史と文化（約130文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '歴史ある城跡の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '高岡城は加賀藩二代藩主前田利長によって築かれ、高岡の街づくりの起点となった重要な歴史遺産です。現在でも当時の堀や石垣が良好な状態で保存されており、戦国時代の城郭建築の特徴を間近で観察することができます。歴史好きの方にとって、散策しながら学べる貴重なスポットです。', marks: [] }],
        markDefs: []
      },
      
      // H2: アクセスと利用案内（約120文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: 'アクセスと利用案内', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'JR高岡駅から徒歩約15分でアクセス可能で、無料で利用できる市民の憩いの場となっています。早朝は6時頃から散策可能で、ジョギングや散歩を楽しむ地元の方々の姿も見られます。駐車場も完備されているため、車でのアクセスも便利です。', marks: [] }],
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
        children: [{ _type: 'span', text: '高岡古城公園の早朝散策は、歴史と自然を感じられる特別な体験です。桜の季節はもちろん、四季を通じて美しい景色を楽しめます。ぜひ早起きして、静寂な朝の公園を散策してみてください。', marks: [] }],
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
    
    console.log('✅ 第2文字数拡張記事の更新が完了しました');
    console.log('📋 200文字→' + newTotalChars + '文字に拡張');
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

expandSecondShortArticle();