const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandEighteenthArticle() {
  try {
    console.log('第18記事の更新を開始します...');
    console.log('対象: imizu-city-4 (夜の海王丸)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "imizu-city-4"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、夜の海王丸の記事を拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '射水市の海王丸パークにそびえ立つ帆船海王丸。夜間ライトアップされた純白の船体と4本のマストは、まさに「海の貴婦人」の名にふさわしい美しさです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 海王丸の歴史と概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '海の貴婦人「帆船海王丸」の歴史', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '帆船海王丸は1930年に建造された練習帆船で、長年にわたって海技者の育成に貢献してきました。全長107メートル、4本のマストを持つバーク型帆船として設計され、その美しい船影から「海の貴婦人」という愛称で親しまれています。1989年に現役を引退した後、射水市の海王丸パークに永久保存され、現在は海事博物館として多くの人々に海事教育と感動を提供し続けています。純白に塗装された船体は、時代を超えて人々を魅了する気品と威厳を保っており、射水市のシンボル的存在となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 夜間ライトアップの魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-lighting',
        style: 'h2',
        children: [{ _type: 'span', text: '幻想的な夜間ライトアップの美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'lighting-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜の海王丸の最大の魅力は、船体全体を照らすライトアップです。純白の船体と4本のマストが暖色系の光に包まれる様子は、まさに幻想的な美しさを演出します。日中の力強い印象とは異なり、夜の海王丸は優雅で神秘的な雰囲気に包まれます。周囲の静かな海面に反射する船影も美しく、写真撮影スポットとしても非常に人気があります。特に夕暮れから夜にかけての時間帯は、空の色の変化と共に船の表情も変わり、訪れる人々に感動的な体験をもたらします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 海王丸パークの魅力（約155文字）
      {
        _type: 'block',
        _key: 'h2-park',
        style: 'h2',
        children: [{ _type: 'span', text: '海王丸パークの総合的な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'park-content',
        style: 'normal',
        children: [{ _type: 'span', text: '海王丸パークは帆船海王丸を中心とした総合的な海事テーマパークです。海王丸の船内見学では、実際の船員の生活空間や操船設備を体験でき、海事の歴史と技術について学ぶことができます。また、周辺には広い芝生広場や遊歩道が整備されており、家族連れでゆっくりと過ごせる環境が整っています。売店やレストランもあり、富山湾を眺めながら食事を楽しむこともできます。年間を通じて様々なイベントも開催され、地域の文化的な中心地としても機能しています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 富山湾の絶景（約140文字）
      {
        _type: 'block',
        _key: 'h2-view',
        style: 'h2',
        children: [{ _type: 'span', text: '富山湾と立山連峰の絶景', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'view-content',
        style: 'normal',
        children: [{ _type: 'span', text: '海王丸パークからは富山湾の美しい景色を一望することができ、晴れた日には雄大な立山連峰を背景にした絶景を楽しめます。海と山という富山県ならではの自然の恵みを同時に感じられる贅沢なロケーションです。夜間には対岸の夜景も美しく、ライトアップされた海王丸と共に素晴らしい景観を作り出します。四季を通じて異なる表情を見せる富山湾と海王丸の組み合わせは、何度訪れても新しい発見があります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 撮影スポットとアクセス（約130文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: '撮影スポットとアクセス情報', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜の海王丸は写真愛好家にとって絶好の撮影スポットです。様々な角度から船を撮影でき、特に水面への反射を含めた構図は印象的な作品になります。アクセスは万葉線の海王丸駅から徒歩すぐと便利で、車での来園も可能です。駐車場も完備されており、夜間でも安心して見学できます。ライトアップ時間は季節によって異なるため、事前に確認してから訪問されることをおすすめします。', marks: [] }],
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
        children: [{ _type: 'span', text: '夜の海王丸は射水市が誇る美しい夜景スポットです。幻想的にライトアップされた海の貴婦人の姿をぜひ一度ご覧ください。', marks: [] }],
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
    
    console.log('✅ 第18記事の更新が完了しました');
    console.log('📋 176文字→' + newTotalChars + '文字に拡張');
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

expandEighteenthArticle();