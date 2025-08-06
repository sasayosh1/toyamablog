const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirtyFirstArticle() {
  try {
    console.log('第31記事の更新を開始します...');
    console.log('対象: nanto-city (南砺市の冬のこきりこの里)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "nanto-city"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、南砺市の冬のこきりこの里の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '南砺市にある雪景色が広がる秘境「冬のこきりこの里」。白銀の世界に包まれた伝統的な日本の村落風景の美しさをご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: こきりこの里の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-village',
        style: 'h2',
        children: [{ _type: 'span', text: 'こきりこの里の歴史と文化的価値', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'village-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'こきりこの里は南砺市にある五箇山地域の一部で、世界遺産にも登録されている合掌造り集落として知られています。「こきりこ」は富山県に伝わる民謡の名前で、この地域の文化的アイデンティティを象徴しています。急峻な山々に囲まれた谷間に位置するこの集落は、日本の原風景を今に残す貴重な場所として、多くの観光客や写真愛好家に愛され続けています。伝統的な生活様式が現在も受け継がれており、日本の文化遺産としての価値は計り知れません。特に冬季には、雪に覆われた合掌造りの家屋が幻想的な美しさを演出します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 冬の雪景色の魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-winter-beauty',
        style: 'h2',
        children: [{ _type: 'span', text: '白銀に包まれた冬のこきりこの里', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'winter-beauty-content',
        style: 'normal',
        children: [{ _type: 'span', text: '冬のこきりこの里は、深い雪に覆われた神秘的な世界へと変貌します。合掌造りの屋根に積もった雪は、まるで白い帽子をかぶったような愛らしい姿を見せ、訪れる人々の心を和ませます。雪化粧した古民家と周囲の山々が織りなす風景は、まさに日本の冬の絶景といえるでしょう。静寂に包まれた雪景色の中を歩くと、時が止まったかのような錯覚を覚えます。特に早朝や夕暮れ時には、雪面に反射する光が美しく、写真撮影にも最適な時間帯となります。この季節ならではの特別な美しさが、多くの人々を魅了し続けています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 散策の楽しみ方（約155文字）
      {
        _type: 'block',
        _key: 'h2-exploration',
        style: 'h2',
        children: [{ _type: 'span', text: '冬のこきりこの里散策のポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'exploration-content',
        style: 'normal',
        children: [{ _type: 'span', text: '冬のこきりこの里を散策する際は、十分な防寒対策が必要です。雪道を歩くため、滑りにくい靴の着用も重要です。集落内には歴史ある合掌造りの建物が点在しており、それぞれが異なる表情を見せてくれます。民俗館や資料館では、この地域の歴史や文化について学ぶことができ、より深い理解を得られます。地元の方々が営む食事処では、郷土料理を味わいながら温かいひとときを過ごすことも可能です。ゆっくりと時間をかけて散策することで、この秘境の魅力を存分に感じることができるでしょう。', marks: [] }],
        markDefs: []
      },
      
      // H2: 写真撮影のおすすめポイント（約145文字）
      {
        _type: 'block',
        _key: 'h2-photography',
        style: 'h2',
        children: [{ _type: 'span', text: '絶景を撮影するベストスポット', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'photography-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'こきりこの里は写真愛好家にとって絶好の撮影スポットです。特に展望台からの全景は圧巻で、雪に覆われた集落全体を一望できます。朝霧が立ち込める早朝や、夕日に染まる雪景色は特に美しく、神秘的な雰囲気を演出します。個々の合掌造り建物も魅力的な被写体で、雪景色との対比が印象的な写真を生み出します。撮影の際は、地元の方々への配慮を忘れずに、マナーを守って楽しみましょう。寒い環境下での撮影になるため、カメラのバッテリー管理にも注意が必要です。', marks: [] }],
        markDefs: []
      },
      
      // H2: アクセスと訪問時の注意点（約130文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: '冬季のアクセスと安全な訪問のために', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '冬季のこきりこの里へのアクセスには、雪道運転の経験が必要です。スタッドレスタイヤやタイヤチェーンの準備は必須となります。公共交通機関も運行状況が天候に左右されるため、事前の確認が重要です。集落内は積雪により足場が悪くなるため、歩きやすい靴と防寒着の準備をしましょう。営業時間や施設の開館状況も冬季には変更になる場合があるため、訪問前の確認をおすすめします。安全第一で、無理のない計画を立てて訪問してください。', marks: [] }],
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
        children: [{ _type: 'span', text: '南砺市の冬のこきりこの里は、雪景色に包まれた秘境の美しさを堪能できる特別な場所です。日本の原風景をぜひ体験してみてください。', marks: [] }],
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
    
    console.log('✅ 第31記事の更新が完了しました');
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

expandThirtyFirstArticle();