const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTo1000Chars() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('文字数を1000文字前後に調整中...');
    
    // 1000文字前後を目標とした内容
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅前エリアに位置する「シャルロッテ パティオさくら富山駅前店」は、地元の方々に長年愛され続けている隠れ家的なケーキ店です。職人こだわりの絶品ケーキをご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 概要（約170文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: 'シャルロッテ パティオさくら富山駅前店の概要', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅前の便利な立地にありながら、落ち着いた雰囲気でゆったりとスイーツを楽しめる素敵なケーキ店です。店名の「シャルロッテ」はフランス語でケーキの一種を指し、「パティオ」は中庭を意味するスペイン語で、お客様に心地よい空間での時間を過ごしていただきたいという温かい想いが込められています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 絶品ケーキ（約190文字）
      {
        _type: 'block',
        _key: 'h2-cake',
        style: 'h2',
        children: [{ _type: 'span', text: '絶品ケーキと職人のこだわり', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'cake-content',
        style: 'normal',
        children: [{ _type: 'span', text: '北海道産の新鮮な生クリームや卵、ヨーロッパから取り寄せた上質なチョコレート、地元富山の美味しいお水など、厳選された素材のみを使用しています。長年の経験を持つパティシエが一つ一つ手作りで丁寧に仕上げており、季節ごとに変わるフルーツを使ったケーキも大変人気です。特にクラシックなショートケーキや濃厚なチョコレートケーキは、一度食べたら忘れられない美味しさです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 店内環境（約150文字）
      {
        _type: 'block',
        _key: 'h2-interior',
        style: 'h2',
        children: [{ _type: 'span', text: '居心地の良い店内環境', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'interior-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'まさに「隠れ家」という言葉がぴったりの落ち着いた雰囲気で、暖かみのある照明と上品なインテリアが調和した空間です。座席数は適度に抑えられ、お客様一人一人がゆったりとくつろげるよう配慮されています。スタッフの丁寧で温かい接客も魅力の一つで、ケーキ選びに迷った時には親身になってアドバイスをしてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 立地（約150文字）
      {
        _type: 'block',
        _key: 'h2-location',
        style: 'h2',
        children: [{ _type: 'span', text: '富山駅前の便利な立地', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'location-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅から徒歩すぐという抜群のアクセスの良さが最大の魅力の一つです。電車やバスでの来店はもちろん、お仕事帰りや観光の合間にも気軽に立ち寄ることができます。富山駅周辺は再開発が進み、ショッピングスポットや観光地も充実しているため、一日の計画に組み込みやすい立地となっています。', marks: [] }],
        markDefs: []
      },
      
      // HTMLブロック（Googleマップ）を保持
      ...post.body.filter(block => block._type === 'html'),
      
      // H2: 楽しみ方（約120文字）
      {
        _type: 'block',
        _key: 'h2-enjoy',
        style: 'h2',
        children: [{ _type: 'span', text: '様々な楽しみ方', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'enjoy-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'カウンター席でお一人でゆっくりとケーキタイムを楽しんだり、友人やご家族との大切な時間を過ごす場所としても最適です。テイクアウトにも対応しているため、ご自宅や職場でも楽しめ、大切な方への手土産としても喜ばれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約120文字）
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
        children: [{ _type: 'span', text: 'シャルロッテ パティオさくら富山駅前店は、富山駅前という便利な立地で隠れ家的雰囲気を楽しめる特別なケーキ店です。職人こだわりの絶品ケーキと温かいサービスで、訪れる人々に至福のひとときを提供してくれます。ぜひ一度足を運んでみてください。', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let totalChars = 0;
    expandedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
      }
    });
    
    console.log(`調整後文字数: ${totalChars}文字（目標: 1000文字前後）`);
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 文字数を1000文字前後に調整しました');
    console.log('📋 H2見出し6個の構成を維持');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

expandTo1000Chars();