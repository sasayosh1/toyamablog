const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateUnifiedArticle() {
  try {
    // 統合記事のIDを取得
    const unifiedArticle = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-disney-40th-complete-parade-2023"][0] { _id, body }`);
    
    if (!unifiedArticle) {
      console.log('統合記事が見つかりませんでした');
      return;
    }
    
    console.log('統合記事を更新中...');
    
    // 新しいセクションを追加（最後のまとめの前に挿入）
    const updatedBody = [...unifiedArticle.body];
    
    // まとめの前に新しいセクションを挿入
    const conclusionIndex = updatedBody.findIndex(block => 
      block._key === 'conclusion'
    );
    
    // 新しいセクションのブロック
    const newSections = [
      // H2: vol.4 富山県警察音楽隊編
      {
        _type: 'block',
        _key: 'vol4-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.4 富山県警察音楽隊スペシャルパレード編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol4-video-intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023では、ディズニーパレードと併せて富山県警察音楽隊によるスペシャルパレードも開催されました。富山駅前城址大通りで行われたこの地域密着型のイベントは、音楽と行進が織りなす華やかなパフォーマンスで多くの市民を魅了しました。'
          }
        ]
      },
      // vol.4動画埋め込み用HTML
      {
        _type: 'html',
        _key: 'vol4-video',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/dEe6OhiIz5w" title="vol.4 富山県警察音楽隊スペシャルパレード編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol4-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県警察音楽隊は、警察官としての職務と音楽活動を両立させる高い専門性を持った楽団として、県内外で高く評価されています。2023年のスペシャルパレードでは、行進しながらの演奏という高難度のパフォーマンスを見事にこなし、その技術力の高さを存分に発揮しました。クラシックの名曲からポピュラーソング、アニメソングまで幅広いレパートリーを披露し、子供からお年寄りまで全ての世代が楽しめる選曲で会場を盛り上げました。このパレードは、単なる音楽イベントを超えて、地域の安全と平和を願う象徴的な意味を持ち、市民と警察の距離を縮め、相互理解を深める重要な役割を果たしています。'
          }
        ]
      }
    ];
    
    // まとめの前に新セクションを挿入
    if (conclusionIndex !== -1) {
      updatedBody.splice(conclusionIndex, 0, ...newSections);
    } else {
      // まとめが見つからない場合は最後に追加
      updatedBody.push(...newSections);
    }
    
    // 統合記事を更新
    await client
      .patch(unifiedArticle._id)
      .set({ 
        title: '【富山市】富山まつり2023完全版｜東京ディズニーリゾート40周年＆警察音楽隊スペシャルパレード',
        body: updatedBody,
        // タグも更新
        tags: [
          '富山',
          '富山県',
          'TOYAMA',
          '#shorts',
          'YouTube Shorts',
          '富山観光',
          '富山旅行',
          '北陸観光',
          '富山市',
          '富山市観光',
          '富山駅',
          '祭り',
          'イベント',
          '伝統',
          'ディズニー',
          'ディズニーパレード',
          '東京ディズニーリゾート',
          '40周年',
          'ミッキーマウス',
          'プリンセス',
          'ピクサー',
          'トイストーリー',
          '警察音楽隊',
          '富山県警察',
          '音楽パレード',
          '富山県の観光スポット',
          '富山県でおすすめの場所',
          '富山県の見どころ'
        ],
        excerpt: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードと富山県警察音楽隊パレードの完全版。4つの動画でディズニーキャラクターと地域の音楽パフォーマンスをお楽しみください。'
      })
      .commit();
    
    console.log('✅ 統合記事の更新が完了しました！');
    console.log('新しいタイトル: 【富山市】富山まつり2023完全版｜東京ディズニーリゾート40周年＆警察音楽隊スペシャルパレード');
    console.log('4つの動画セクションが含まれています:');
    console.log('- vol.1: ミッキーマウス＆クラシックキャラクター編');
    console.log('- vol.2: ディズニープリンセス編');
    console.log('- vol.3: ピクサーキャラクター編');
    console.log('- vol.4: 富山県警察音楽隊スペシャルパレード編');
    
  } catch (error) {
    console.error('更新エラー:', error);
  }
}

updateUnifiedArticle();