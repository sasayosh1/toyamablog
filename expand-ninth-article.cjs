const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandNinthArticle() {
  try {
    console.log('第9記事の更新を開始します...');
    console.log('対象: namerikawa-city-museum-1 (チンアナゴを知ろう)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "namerikawa-city-museum-1"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、チンアナゴの記事を拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '滑川市のほたるいかミュージアムで出会える愛らしいチンアナゴ。その不思議な生態と魅力について詳しくご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: ほたるいかミュージアム概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-museum',
        style: 'h2',
        children: [{ _type: 'span', text: 'ほたるいかミュージアムの魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'museum-content',
        style: 'normal',
        children: [{ _type: 'span', text: '滑川市にあるほたるいかミュージアムは、富山湾の神秘的な生物「ほたるいか」を中心とした海洋博物館です。ほたるいかの生態や富山湾の豊かな海洋環境について学ぶことができる貴重な施設として、多くの観光客や学習者に愛されています。館内には様々な海洋生物の展示があり、その中でもチンアナゴは来館者に特に人気の高い生物の一つとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: チンアナゴの生態（約180文字）
      {
        _type: 'block',
        _key: 'h2-chinchilla',
        style: 'h2',
        children: [{ _type: 'span', text: 'チンアナゴの不思議な生態', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'chinchilla-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'チンアナゴは砂地に穴を掘って暮らすウナギの仲間で、その名前は体の模様が犬のチンチラに似ていることから付けられました。砂から顔だけを出してゆらゆらと揺れる姿は非常にユニークで、見ているだけで癒されます。流れてくるプランクトンを捕食する習性があり、常に水流に向かって体を向けています。警戒心が強く、危険を感じると素早く砂の中に隠れてしまう臆病な性格も魅力の一つです。群れで生活することが多く、水槽内では複数匹が並んで揺れている様子を観察できます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 観察のポイント（約150文字）
      {
        _type: 'block',
        _key: 'h2-observation',
        style: 'h2',
        children: [{ _type: 'span', text: 'チンアナゴ観察の楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'observation-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'チンアナゴを観察する際は、ゆっくりと近づくことが大切です。急激な動きをすると砂の中に隠れてしまうため、静かに観察することで長時間その愛らしい姿を楽しむことができます。それぞれ個体によって出てくる長さや動きが異なるので、個性を観察するのも面白いポイントです。餌の時間には活発に動き回る様子も見ることができ、普段とは違った表情を見せてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 教育的価値（約140文字）
      {
        _type: 'block',
        _key: 'h2-education',
        style: 'h2',
        children: [{ _type: 'span', text: '海洋生物の学習価値', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'education-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'チンアナゴの展示は、海洋生物の多様性や適応の素晴らしさを学ぶ絶好の機会です。砂地という特殊な環境に適応した生物の生き様を通じて、自然環境の大切さや生物の巧妙な生存戦略について理解を深めることができます。子どもから大人まで、生物学への興味を育む教育的価値の高い展示となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: ミュージアムでの体験（約120文字）
      {
        _type: 'block',
        _key: 'h2-experience',
        style: 'h2',
        children: [{ _type: 'span', text: 'ミュージアムでの特別体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'experience-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'ほたるいかミュージアムでは、チンアナゴの生態について詳しい解説も用意されており、より深く学ぶことができます。写真撮影も可能で、チンアナゴの愛らしい姿を記録に残すことができます。また、他の海洋生物との比較展示もあり、海の生物の多様性を実感できます。', marks: [] }],
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
        children: [{ _type: 'span', text: 'チンアナゴの愛らしい姿と不思議な生態は、訪れる人々に海洋生物の魅力を伝えてくれます。ほたるいかミュージアムで、ぜひこの特別な出会いを体験してみてください。', marks: [] }],
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
    
    console.log('✅ 第9記事の更新が完了しました');
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

expandNinthArticle();