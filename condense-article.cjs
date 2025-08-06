const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function condenseArticle() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事を1000文字に縮小中...');
    
    // 縮小版コンテンツ（見出し構造は保持、内容を大幅に短縮）
    const condensedContent = [
      // 導入文（約40文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅前の隠れ家ケーキ店「シャルロッテ パティオさくら富山駅前店」。職人こだわりの絶品ケーキを紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 概要
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
        children: [{ _type: 'span', text: '富山駅前の便利な立地にある落ち着いたケーキ店。幅広い層のお客様に愛されている隠れ家的スポットです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 絶品ケーキ
      {
        _type: 'block',
        _key: 'h2-cake',
        style: 'h2',
        children: [{ _type: 'span', text: '絶品ケーキと職人のこだわり', marks: [] }],
        markDefs: []
      },
      
      // H3: 素材
      {
        _type: 'block',
        _key: 'h3-ingredients',
        style: 'h3',
        children: [{ _type: 'span', text: '厳選された素材へのこだわり', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'ingredients-content',
        style: 'normal',
        children: [{ _type: 'span', text: '北海道産生クリーム、ヨーロッパ産チョコレート、地元富山の水など厳選素材を使用。', marks: [] }],
        markDefs: []
      },
      
      // H3: 職人
      {
        _type: 'block',
        _key: 'h3-craftsman',
        style: 'h3',
        children: [{ _type: 'span', text: '職人の技術と創作への情熱', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'craftsman-content',
        style: 'normal',
        children: [{ _type: 'span', text: '長年の経験を持つパティシエが一つ一つ手作り。ショートケーキやチョコレートケーキが人気。', marks: [] }],
        markDefs: []
      },
      
      // H2: 店内環境
      {
        _type: 'block',
        _key: 'h2-interior',
        style: 'h2',
        children: [{ _type: 'span', text: '居心地の良い店内環境', marks: [] }],
        markDefs: []
      },
      
      // H3: 空間デザイン
      {
        _type: 'block',
        _key: 'h3-design',
        style: 'h3',
        children: [{ _type: 'span', text: '隠れ家的な空間デザイン', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'design-content',
        style: 'normal',
        children: [{ _type: 'span', text: '暖かみのある照明と上品なインテリアで落ち着いた雰囲気。ゆったりくつろげる座席配置。', marks: [] }],
        markDefs: []
      },
      
      // H3: おもてなし
      {
        _type: 'block',
        _key: 'h3-service',
        style: 'h3',
        children: [{ _type: 'span', text: '心温まるおもてなし', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'service-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'スタッフの丁寧な接客と、お客様の好みに合わせたケーキ選びのサポート。', marks: [] }],
        markDefs: []
      },
      
      // H2: 立地
      {
        _type: 'block',
        _key: 'h2-location',
        style: 'h2',
        children: [{ _type: 'span', text: '富山駅前の便利な立地', marks: [] }],
        markDefs: []
      },
      
      // H3: アクセス
      {
        _type: 'block',
        _key: 'h3-access',
        style: 'h3',
        children: [{ _type: 'span', text: 'アクセスの良さ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'access-content',
        style: 'normal',
        children: [{ _type: 'span', text: '富山駅から徒歩すぐの好立地。電車やバス利用者にも便利。', marks: [] }],
        markDefs: []
      },
      
      // H3: 周辺エリア
      {
        _type: 'block',
        _key: 'h3-area',
        style: 'h3',
        children: [{ _type: 'span', text: '周辺エリアとの調和', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'area-content',
        style: 'normal',
        children: [{ _type: 'span', text: '商業施設や観光地が充実した富山駅前エリアで、お買い物や観光の合間に立ち寄れます。', marks: [] }],
        markDefs: []
      },
      
      // HTMLブロック（Googleマップ）を保持
      ...post.body.filter(block => block._type === 'html'),
      
      // H2: 楽しみ方
      {
        _type: 'block',
        _key: 'h2-enjoy',
        style: 'h2',
        children: [{ _type: 'span', text: 'シャルロッテ パティオさくら富山駅前店の楽しみ方', marks: [] }],
        markDefs: []
      },
      
      // H3: 一人時間
      {
        _type: 'block',
        _key: 'h3-solo',
        style: 'h3',
        children: [{ _type: 'span', text: '一人での贅沢な時間', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'solo-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'カウンター席でゆっくりとケーキタイム。読書や景色を楽しみながらの特別なひととき。', marks: [] }],
        markDefs: []
      },
      
      // H3: 特別なひととき
      {
        _type: 'block',
        _key: 'h3-special',
        style: 'h3',
        children: [{ _type: 'span', text: '大切な人との特別なひととき', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'special-content',
        style: 'normal',
        children: [{ _type: 'span', text: '友人や家族との会話を楽しみながら、美味しいケーキで素晴らしい思い出作り。', marks: [] }],
        markDefs: []
      },
      
      // H3: テイクアウト
      {
        _type: 'block',
        _key: 'h3-takeout',
        style: 'h3',
        children: [{ _type: 'span', text: 'テイクアウトでのお楽しみ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'takeout-content',
        style: 'normal',
        children: [{ _type: 'span', text: '自宅や職場でも楽しめるテイクアウト対応。手土産としても喜ばれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ
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
        children: [{ _type: 'span', text: '富山駅前の便利な立地で隠れ家的雰囲気を楽しめる特別なケーキ店。職人こだわりの絶品ケーキと温かいサービスで、至福のひとときを過ごせます。ぜひ一度お訪れください。', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let totalChars = 0;
    condensedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
      }
    });
    
    console.log(`縮小版文字数: ${totalChars}文字（目標: 1000文字）`);
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: condensedContent })
      .commit();
    
    console.log('✅ 記事を1000文字版に縮小しました');
    console.log('📋 TOC見出し構造は維持されています');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

condenseArticle();