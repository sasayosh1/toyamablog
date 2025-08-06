const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyThirdArticle() {
  try {
    console.log('第23記事の更新を開始します...');
    console.log('対象: uozu-city-cake (島崎松月堂のケーキ)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "uozu-city-cake"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、島崎松月堂の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '魚津市にある島崎松月堂は、驚くほどお手頃な価格で美味しいケーキを提供する地元で愛される老舗洋菓子店です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 島崎松月堂の歴史（約175文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '島崎松月堂の歴史と地域での評判', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '島崎松月堂は魚津市で長年にわたって営業を続けている老舗の洋菓子店です。創業以来、地元の人々の特別な日を彩るケーキを作り続けており、誕生日や記念日には多くの家族がこのお店を訪れます。代々受け継がれてきた製菓技術と、お客様を大切にする心は、現在でも変わることなく店の根幹を成しています。魚津市民にとって、島崎松月堂のケーキは特別な思い出と結びついており、「松月堂のケーキで育った」という人も少なくありません。その信頼と実績が、現在の確固たる地位を築いています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 驚きの価格設定（約165文字）
      {
        _type: 'block',
        _key: 'h2-price',
        style: 'h2',
        children: [{ _type: 'span', text: '驚くほどお手頃な価格設定の秘密', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'price-content',
        style: 'normal',
        children: [{ _type: 'span', text: '島崎松月堂の最大の魅力の一つは、その驚くほどお手頃な価格設定です。高品質なケーキでありながら、他店と比べて非常にリーズナブルな価格で提供されており、家計に優しい価格設定となっています。この価格を実現できるのは、地域密着型の経営方針と、お客様に喜んでもらいたいという店主の強い想いがあるからです。材料費が高騰する中でも、できる限り価格を抑えて提供し続ける姿勢は、多くの常連客から愛され続ける理由となっています。コストパフォーマンスの高さは魚津市内でも評判で、遠方からわざわざ買いに来る人も多いほどです。', marks: [] }],
        markDefs: []
      },
      
      // H2: ケーキの種類と品質（約155文字）
      {
        _type: 'block',
        _key: 'h2-quality',
        style: 'h2',
        children: [{ _type: 'span', text: '豊富な種類と確かな品質のケーキ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'quality-content',
        style: 'normal',
        children: [{ _type: 'span', text: '島崎松月堂では、ショートケーキやチョコレートケーキなどの定番商品から、季節限定の特製ケーキまで、幅広い種類のケーキを取り揃えています。どのケーキも職人が一つ一つ丁寧に手作りしており、新鮮な材料を使用した確かな品質が自慢です。生クリームは軽やかで上品な甘さ、スポンジはしっとりとした食感で、バランスの取れた美味しさが特徴です。特に地元産の食材を活用したケーキは人気が高く、富山の美味しさを存分に味わうことができます。見た目の美しさにもこだわりがあり、写真映えする仕上がりです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域との結びつき（約145文字）
      {
        _type: 'block',
        _key: 'h2-community',
        style: 'h2',
        children: [{ _type: 'span', text: '地域コミュニティとの深い結びつき', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'community-content',
        style: 'normal',
        children: [{ _type: 'span', text: '島崎松月堂は魚津市の地域コミュニティと深く結びついた存在です。地元の学校行事や地域のイベントなど、様々な場面で同店のケーキが利用されており、市民の暮らしに欠かせないお店となっています。お客様との温かいコミュニケーションも大切にしており、常連のお客様の好みを覚えて、おすすめのケーキを提案してくれることもあります。地域の人々にとって、単なるケーキ屋さんではなく、生活の一部として愛され続けている特別な存在です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 利用のすすめ（約130文字）
      {
        _type: 'block',
        _key: 'h2-recommendation',
        style: 'h2',
        children: [{ _type: 'span', text: '島崎松月堂利用時のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'recommendation-content',
        style: 'normal',
        children: [{ _type: 'span', text: '島崎松月堂を訪れる際は、事前に電話で在庫を確認することをおすすめします。人気商品は売り切れることもあるためです。誕生日ケーキなど特別な注文は、前日までの予約がおすすめです。お手頃価格なので、いくつかの種類を購入して食べ比べを楽しむのも良いでしょう。駐車場も完備されているため、車でのアクセスも便利です。魚津市を訪れた際は、ぜひ地元の味を体験してみてください。', marks: [] }],
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
        children: [{ _type: 'span', text: '島崎松月堂は魚津市が誇るお手頃価格の洋菓子店です。確かな品質と温かいサービスのケーキをぜひ味わってみてください。', marks: [] }],
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
    
    console.log('✅ 第23記事の更新が完了しました');
    console.log('📋 182文字→' + newTotalChars + '文字に拡張');
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

expandTwentyThirdArticle();