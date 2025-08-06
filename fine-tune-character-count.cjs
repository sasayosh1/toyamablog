const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fineTuneCharacterCount() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('文字数を1000文字により近づけるよう調整中...');
    
    // より簡潔にした内容（約950文字を目標）
    const fineTunedContent = [
      // 導入文（約65文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅前エリアの「シャルロッテ パティオさくら富山駅前店」は、地元で愛され続ける隠れ家的ケーキ店です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 概要（約130文字）
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
        children: [{ _type: 'span', text: '富山駅前の便利な立地で落ち着いたケーキ店。店名の「シャルロッテ」はフランス語でケーキの一種、「パティオ」は中庭を意味し、お客様に心地よい時間を提供したいという想いが込められています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 絶品ケーキ（約160文字）
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
        children: [{ _type: 'span', text: '北海道産の生クリームやヨーロッパ産チョコレート、地元富山の水など厳選素材を使用。経験豊富なパティシエが一つ一つ手作りで仕上げ、季節のフルーツケーキも人気です。クラシックなショートケーキや濃厚チョコレートケーキは絶品です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 店内環境（約120文字）
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
        children: [{ _type: 'span', text: '「隠れ家」的な落ち着いた雰囲気で、暖かな照明と上品なインテリアが魅力。ゆったりとした座席配置で、スタッフの親切な接客がケーキ選びをサポートしてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 立地（約120文字）
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
        children: [{ _type: 'span', text: '富山駅から徒歩すぐの好立地で、電車・バス利用者に便利。周辺には商業施設や観光スポットも多く、お買い物や観光の合間に気軽に立ち寄れます。', marks: [] }],
        markDefs: []
      },
      
      // HTMLブロック（Googleマップ）を保持
      ...post.body.filter(block => block._type === 'html'),
      
      // H2: 楽しみ方（約100文字）
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
        children: [{ _type: 'span', text: 'カウンター席でお一人様タイムや、友人・ご家族との団らんにも最適。テイクアウト対応で自宅や手土産としても楽しめます。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約100文字）
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
        children: [{ _type: 'span', text: '富山駅前の便利な立地で隠れ家的雰囲気を楽しめる特別なケーキ店。職人こだわりの絶品ケーキと温かいサービスをぜひご体験ください。', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let totalChars = 0;
    fineTunedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
      }
    });
    
    console.log(`調整後文字数: ${totalChars}文字（目標: 1000文字前後）`);
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: fineTunedContent })
      .commit();
    
    console.log('✅ 文字数を1000文字により近づけました');
    console.log('📋 H2見出し6個の構成を維持');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

fineTuneCharacterCount();