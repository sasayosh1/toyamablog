const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

const articlesWithDescriptions = [
  {
    slug: 'nanto-city-1756354798877',
    title: '【南砺市】うさぎ推し必見！「パティスリーまちなみラパン」が可愛すぎた！ #shorts',
    description: '南砺市の「パティスリーまちなみラパン」は、うさぎモチーフの可愛いスイーツが評判のケーキ店。うさぎ好きなら必見の店内装飾とオリジナルケーキで、地元に愛される特別な空間です。'
  },
  {
    slug: 'toyama-city-1756354795933',
    title: '【富山市】落ち着いた空間で楽しむリトル上海の本格中華ランチ！日常にそっと高級感を #shorts',
    description: '富山市の「リトル上海」で味わう本格中華ランチ。落ち着いた上品な店内で、地元食材を使った心温まる中華料理を堪能。日常に高級感を添える隠れ家的な名店です。'
  },
  {
    slug: 'takaoka-city-1756354793286',
    title: '【高岡市】脱出を企(くわだ)てるペンギン',
    description: '高岡古城公園動物園で話題のペンギンたち。まるで脱出を企てているかのような愛らしくて賢明な行動が人気。個性豊かなペンギンとの触れ合いを楽しめます。'
  },
  {
    slug: 'uozu-city-aquarium-spotted-seal-healing-experience',
    title: '【魚津市】毎日暑いのでゴマフアザラシを見て涼しさを感じよう！魚津水族館の癒し体験',
    description: '魚津水族館のゴマフアザラシで暑い夏を涼しく！水中を優雅に泳ぐアザラシたちの癒しの姿で心もクールダウン。日本海側最大級の水族館で特別な涼体験を。'
  },
  {
    slug: 'himi-city-yoshigake-farm-goat-slow-life-experience',
    title: '【氷見市】吉がけ牧場のヤギたちから見習いたいスローライフ体験',
    description: '氷見市の吉がけ牧場で、のんびり草を食むヤギたちから学ぶスローライフ。マイペースな牧場生活の魅力と、都市部の忙しさを忘れさせる癒しの体験をお届け。'
  },
  {
    slug: 'tonami-city-aeon-mall-kimetsu-no-yaiba-poster-exhibition',
    title: '【砺波市】イオンモールとなみで『劇場版「鬼滅の刃」無限城編』ポスター展開催中！',
    description: '砺波市イオンモールとなみで開催の「劇場版『鬼滅の刃』無限城編」ポスター展。迫力満点のポスターと関連グッズで作品の世界観を堪能できる鬼滅ファン必見のイベント。'
  },
  {
    slug: 'takaoka-city-doria-libo-specialty-store',
    title: '【高岡市】ドリア専門店「ドリアリーボ」で行列必至の濃厚ドリアランチ！#shorts',
    description: '高岡市の人気ドリア専門店「ドリアリーボ」で味わう絶品ランチ。専門店ならではのこだわりと技術で作られる濃厚ドリアは行列必至の美味しさ。地元民も観光客も大満足。'
  },
  {
    slug: 'toyama-city-ooita-shrine-summer-visit',
    title: '【富山市】富山の学問神社！於保多(おおた)神社で夏詣＆学業祈願',
    description: '富山市の於保多（おおた）神社は学問の神様として有名な由緒ある神社。夏詣での心身の浄化と学業成就・合格祈願で、受験生から社会人まで幅広く支持される聖地です。'
  },
  {
    slug: 'toyama-city-kansui-park-summer-fountain-2025',
    title: '【富山市】涼感MAX！環水公園サマーファウンテン2025で夏の暑さを吹き飛ばそう',
    description: '富山市の環水公園サマーファウンテン2025で夏の暑さを爽快に吹き飛ばそう！涼感MAXの水しぶきと美しい景観で、暑い日でも快適に過ごせる人気スポットです。'
  },
  {
    slug: 'toyama-city-disney-40th-complete-parade-2023',
    title: '【富山市】東京ディズニーリゾート40周年スペシャルパレード完全版｜富山まつり2023',
    description: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードの完全版。ミッキーたちディズニーキャラクターが富山の街を彩った特別なイベントを収録。'
  }
];

async function updateDescriptions() {
  console.log('🚀 Sanity API経由での記事説明文自動設定を開始します...');
  console.log(`📊 対象記事数: ${articlesWithDescriptions.length}件`);
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const article of articlesWithDescriptions) {
    try {
      console.log(`\n📝 更新中: ${article.title}`);
      console.log(`🔗 スラッグ: ${article.slug}`);
      console.log(`💬 説明文: ${article.description}`);
      
      // スラッグで記事を検索
      const posts = await client.fetch(`*[_type == "post" && slug.current == $slug]`, {
        slug: article.slug
      });
      
      if (posts.length === 0) {
        console.log(`❌ エラー: スラッグ "${article.slug}" の記事が見つかりません`);
        failureCount++;
        continue;
      }
      
      const post = posts[0];
      console.log(`✅ 記事発見: ID ${post._id}`);
      
      // 説明文を更新
      const result = await client
        .patch(post._id)
        .set({ description: article.description })
        .commit();
      
      console.log(`✅ 更新完了: ${article.title}`);
      successCount++;
      
      // レート制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ エラー: ${article.title}`);
      console.error(`エラー詳細: ${error.message}`);
      failureCount++;
    }
  }
  
  console.log('\n📊 更新結果サマリー:');
  console.log(`✅ 成功: ${successCount}件`);
  console.log(`❌ 失敗: ${failureCount}件`);
  console.log(`📈 成功率: ${Math.round((successCount / articlesWithDescriptions.length) * 100)}%`);
  
  if (successCount === articlesWithDescriptions.length) {
    console.log('\n🎉 全ての記事の説明文設定が完了しました！');
    console.log('💡 SEO効果の向上が期待されます。');
  } else {
    console.log(`\n⚠️  ${failureCount}件の記事で問題が発生しました。手動での確認をお勧めします。`);
  }
}

updateDescriptions().catch(console.error);