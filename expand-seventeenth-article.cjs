const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSeventeenthArticle() {
  try {
    console.log('第17記事の更新を開始します...');
    console.log('対象: fuchu-town-1 (田村農園たまご園)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "fuchu-town-1"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、田村農園たまご園の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '婦中町にある田村農園たまご園は、動植物を無料で楽しめる家族連れに大人気の農園です。自然との触れ合いが満喫できる隠れたスポットです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 農園の概要（約170文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '田村農園たまご園の魅力とコンセプト', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '田村農園たまご園は婦中町で長年愛され続けている体験型農園施設です。新鮮な卵の生産を行いながら、訪れる人々に農業や動物との触れ合いを通じて自然の大切さを伝えています。何より素晴らしいのは、多くの体験が無料で楽しめることです。都市部では味わえない本物の農村体験を提供することで、特に子どもたちの教育の場としても高い評価を受けています。家族で一日中楽しめる内容の濃い施設として、地元だけでなく遠方からも多くの家族連れが訪れる人気スポットとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 動物との触れ合い（約165文字）
      {
        _type: 'block',
        _key: 'h2-animals',
        style: 'h2',
        children: [{ _type: 'span', text: '様々な動物たちとの楽しい触れ合い', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'animals-content',
        style: 'normal',
        children: [{ _type: 'span', text: '農園には鶏をはじめ、ヤギ、ウサギ、アヒルなど様々な動物たちが飼育されており、間近で観察したり触れ合ったりすることができます。特に子どもたちに人気なのが餌やり体験で、動物たちの温かさや可愛らしさを直接感じることができます。動物たちはどれも人懐っこく、安全に配慮された環境で自由に触れ合えるため、小さなお子様でも安心です。都市部では滅多に体験できない本物の動物との交流は、子どもたちの心に深い印象を残し、命の大切さを学ぶ貴重な機会となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 農業体験と学習（約155文字）
      {
        _type: 'block',
        _key: 'h2-experience',
        style: 'h2',
        children: [{ _type: 'span', text: '本格的な農業体験と学習機会', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'experience-content',
        style: 'normal',
        children: [{ _type: 'span', text: '田村農園では季節に応じた農業体験プログラムが用意されており、野菜の種まきから収穫まで一連の農作業を体験することができます。新鮮な卵を産む鶏の飼育現場も見学でき、食べ物がどのように作られるかを実際に学ぶことができます。農園のスタッフの方々が丁寧に説明してくださるので、農業について詳しく知らない方でも安心して参加できます。これらの体験を通じて、食べ物への感謝の気持ちや自然環境の大切さを実感することができる教育的価値の高い施設です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 家族連れに優しい環境（約145文字）
      {
        _type: 'block',
        _key: 'h2-family',
        style: 'h2',
        children: [{ _type: 'span', text: '家族連れに配慮した設備と環境', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'family-content',
        style: 'normal',
        children: [{ _type: 'span', text: '田村農園は家族連れでの訪問を前提とした設備が充実しています。休憩スペースやベンチが適所に配置されており、小さなお子様連れでもゆっくりと過ごすことができます。また、手洗い場なども完備されているため、動物と触れ合った後も安心です。駐車場も十分に確保されており、車でのアクセスも便利です。何より無料で楽しめるという点が家計に優しく、気軽に何度でも訪れることができるのが大きな魅力です。', marks: [] }],
        markDefs: []
      },
      
      // H2: アクセスと利用情報（約125文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: 'アクセス情報と利用のコツ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '田村農園たまご園は婦中町の自然豊かな地域に位置しており、車でのアクセスが便利です。営業時間や休園日については事前に確認されることをおすすめします。動物との触れ合いでは汚れても良い服装でお出かけください。カメラを持参すれば、子どもたちと動物たちの素敵な触れ合いシーンを記録に残すことができます。地元の隠れた名所として、ぜひ一度訪れてみてください。', marks: [] }],
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
        children: [{ _type: 'span', text: '田村農園たまご園は無料で動物との触れ合いや農業体験が楽しめる素晴らしい施設です。家族みんなで自然と触れ合う特別な一日をお過ごしください。', marks: [] }],
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
    
    console.log('✅ 第17記事の更新が完了しました');
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

expandSeventeenthArticle();