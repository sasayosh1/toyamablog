const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirtySecondArticle() {
  try {
    console.log('第32記事の更新を開始します...');
    console.log('対象: imizu-city-sakura (射水市の太閤山ランド桜吹雪)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "imizu-city-sakura"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、太閤山ランドの桜吹雪の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市の太閤山ランドで体験した圧巻の桜吹雪。春の訪れを告げる美しい桜の舞い散る瞬間をお伝えします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 太閤山ランドの桜の魅力（約175文字）
      {
        _type: 'block',
        _key: 'h2-sakura-charm',
        style: 'h2',
        children: [{ _type: 'span', text: '太閤山ランドが誇る桜の名所としての魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'sakura-charm-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドは射水市が誇る県民公園として、春の桜の季節には特別な美しさを見せてくれます。園内には数百本の桜の木が植えられており、品種も豊富で長期間にわたって桜を楽しむことができます。ソメイヨシノを中心に、八重桜や枝垂れ桜など様々な種類の桜が咲き誇り、訪れる人々の目を楽しませています。広大な敷地に点在する桜は、それぞれが異なる表情を見せ、園内のどこを歩いても美しい桜風景に出会うことができます。特に桜のトンネルとなる遊歩道は、まさに春の絶景スポットとして多くの花見客に愛されています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 桜吹雪の圧巻の瞬間（約165文字）
      {
        _type: 'block',
        _key: 'h2-sakura-blizzard',
        style: 'h2',
        children: [{ _type: 'span', text: '息をのむ美しさの桜吹雪体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'sakura-blizzard-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドで体験した桜吹雪は、まさに圧巻の美しさでした。満開を過ぎた桜の花びらが風に舞い、まるで雪が降るように空から舞い散る光景は、自然が作り出す芸術作品そのものです。特に風の強い日には、一面に花びらが舞い踊り、幻想的な世界を演出してくれます。歩いているだけで花びらが頭や肩に降りかかり、まさに桜のシャワーを浴びているような感覚を味わうことができます。この瞬間は写真や動画に収めたくなる美しさですが、実際にその場にいないと感じることのできない特別な体験です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 春の太閤山ランドの魅力（約155文字）
      {
        _type: 'block',
        _key: 'h2-spring-park',
        style: 'h2',
        children: [{ _type: 'span', text: '春の太閤山ランドが見せる特別な表情', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'spring-park-content',
        style: 'normal',
        children: [{ _type: 'span', text: '春の太閤山ランドは、桜以外にも様々な魅力に溢れています。園内の池に映る桜の姿は美しく、水面に散った花びらが作り出す自然のアートも見どころの一つです。新緑の芽吹きと桜のピンクのコントラストは、春ならではの色彩美を楽しませてくれます。園内を散策する家族連れやカップル、写真愛好家など、多くの人々が春の訪れを満喫しています。芝生広場では花見を楽しむグループも多く、穏やかな春の一日を過ごすには最適な環境が整っています。鳥たちのさえずりも聞こえ、五感で春を感じることができる特別な場所です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 花見のおすすめポイント（約145文字）
      {
        _type: 'block',
        _key: 'h2-hanami-tips',
        style: 'h2',
        children: [{ _type: 'span', text: '太閤山ランドでの花見を最大限楽しむコツ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'hanami-tips-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドで花見を楽しむなら、桜の開花状況を事前にチェックするのがおすすめです。満開の時期だけでなく、散り始めの桜吹雪も美しいので、少し遅めの時期でも十分に楽しめます。園内にはベンチやテーブルが設置されているので、お弁当を持参してピクニックも可能です。駐車場は桜の季節には混雑するため、早めの時間帯での訪問をおすすめします。写真撮影をする場合は、逆光を利用した花びらの透け感や、池に映る桜の撮影などが特に美しい仕上がりになります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 季節の移ろいと自然の美しさ（約130文字）
      {
        _type: 'block',
        _key: 'h2-seasonal-beauty',
        style: 'h2',
        children: [{ _type: 'span', text: '桜が教えてくれる季節の移ろいの美学', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'seasonal-beauty-content',
        style: 'normal',
        children: [{ _type: 'span', text: '太閤山ランドの桜吹雪は、日本の美意識である「もののあはれ」を体現している光景でもあります。満開の美しさから散りゆく儚さまで、桜は季節の移ろいの美しさを私たちに教えてくれます。散った花びらが地面を覆い尽くす桜の絨毯も、また別の美しさがあります。この短い春の期間にしか見ることのできない特別な光景は、自然が与えてくれる贈り物といえるでしょう。毎年変わらずに咲き、そして散っていく桜の営みに、生命の尊さと美しさを感じることができます。', marks: [] }],
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
        children: [{ _type: 'span', text: '射水市の太閤山ランドの桜吹雪は、春の訪れを告げる美しい自然の芸術作品です。この感動的な瞬間をぜひ体験してみてください。', marks: [] }],
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
    
    console.log('✅ 第32記事の更新が完了しました');
    console.log('📋 122文字→' + newTotalChars + '文字に拡張');
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

expandThirtySecondArticle();