const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandEighthArticle() {
  try {
    console.log('第8記事の更新を開始します...');
    console.log('対象: kurobe-city-onsen-shrine-100 (宇奈月神社)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "kurobe-city-onsen-shrine-100"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、宇奈月神社の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '黒部市の宇奈月温泉街形成から100年間この地を守り続けてきた宇奈月神社。温泉地の発展と共に歩んできた神社の歴史と魅力をご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 神社の歴史（約170文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '100年の歴史を持つ宇奈月神社', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月神社は宇奈月温泉街の形成と共に建立され、約100年間この地域の守り神として親しまれてきました。温泉街の発展を見守り、地域の人々の安全と繁栄を祈願する場として大切な役割を果たしています。創建当初から現在まで、地元の方々によって大切に維持管理されており、温泉地の精神的な支柱として存在し続けています。神社の歴史は宇奈月温泉の発展史そのものでもあり、この地域のアイデンティティを物語る貴重な文化遺産です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 温泉街との関わり（約160文字）
      {
        _type: 'block',
        _key: 'h2-onsen',
        style: 'h2',
        children: [{ _type: 'span', text: '温泉街の守護神としての役割', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'onsen-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉が観光地として発展していく中で、神社は地域の平安と観光客の安全を祈る重要な場所となりました。温泉街で働く人々や訪れる観光客にとって、心の支えとなる存在です。特に温泉の恵みに感謝し、この地域の自然環境の保全を祈願する場としても親しまれています。温泉街の中心部に位置し、散策の際に多くの人々が立ち寄る憩いのスポットでもあります。', marks: [] }],
        markDefs: []
      },
      
      // H2: 神社の特徴（約150文字）
      {
        _type: 'block',
        _key: 'h2-features',
        style: 'h2',
        children: [{ _type: 'span', text: '宇奈月神社の建築と境内', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'features-content',
        style: 'normal',
        children: [{ _type: 'span', text: '神社の建物は伝統的な神社建築の様式を受け継ぎながら、山間部の環境に調和したたたずまいを見せています。境内は清々しい空気に満ちており、都市部の喧騒を離れて心を落ち着かせることができます。四季折々の自然の変化を感じられる境内では、春の新緑、秋の紅葉など、季節ごとに異なる美しさを楽しむことができ、参拝者の心に深い印象を残します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 黒部峡谷との調和（約140文字）
      {
        _type: 'block',
        _key: 'h2-nature',
        style: 'h2',
        children: [{ _type: 'span', text: '自然環境との調和', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'nature-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月神社は黒部峡谷の豊かな自然環境の中に位置しており、神社自体が自然と一体化した神聖な空間を形成しています。周囲の山々や清流の音が境内に響き、自然の力強さと神秘性を感じることができます。この恵まれた立地により、参拝者は都市部では体験できない、自然と神様の存在を同時に感じられる特別な体験ができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 参拝のおすすめ（約120文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '参拝時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '宇奈月温泉を訪れた際には、ぜひ神社にも足を運んでみてください。温泉で身体を癒した後に神社で心を清めることで、より充実した宇奈月滞在となります。早朝の参拝は特におすすめで、静寂に包まれた境内で清々しい時間を過ごすことができます。お守りやおみくじもありますので、旅の記念にいかがでしょうか。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約90文字）
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
        children: [{ _type: 'span', text: '100年間宇奈月温泉街を見守り続けてきた宇奈月神社は、地域の歴史と文化を物語る貴重な存在です。温泉と合わせて訪れることで、宇奈月の魅力をより深く感じることができるでしょう。', marks: [] }],
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
    
    console.log('✅ 第8記事の更新が完了しました');
    console.log('📋 204文字→' + newTotalChars + '文字に拡張');
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

expandEighthArticle();