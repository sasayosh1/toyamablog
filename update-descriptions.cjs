const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 各記事のIDと作成した説明文のマッピング
const descriptionsToUpdate = {
  // 1. 【南砺市】うさぎ推し必見！「パティスリーまちなみラパン」が可愛すぎた！ #shorts
  '7gNGK9M49tqCuJRraovihd': '南砺市の「パティスリーまちなみラパン」は、うさぎモチーフの可愛いスイーツが評判のケーキ店。うさぎ好きなら必見の店内装飾とオリジナルケーキで、地元に愛される特別な空間です。',

  // 2. 【富山市】落ち着いた空間で楽しむリトル上海の本格中華ランチ！日常にそっと高級感を #shorts  
  'OYjzGK4kNO9kmOILcKsUpC': '富山市の「リトル上海」で味わう本格中華ランチ。落ち着いた上品な店内で、地元食材を使った心温まる中華料理を堪能。日常に高級感を添える隠れ家的な名店です。',

  // 3. 【高岡市】脱出を企(くわだ)てるペンギン
  'OYjzGK4kNO9kmOILcKsUYU': '高岡古城公園動物園で話題のペンギンたち。まるで脱出を企てているかのような愛らしくて賢明な行動が人気。個性豊かなペンギンとの触れ合いを楽しめます。',

  // 4. 【魚津市】毎日暑いのでゴマフアザラシを見て涼しさを感じよう！魚津水族館の癒し体験
  'jKwgQNCsrs019jNuQGi6pM': '魚津水族館のゴマフアザラシで暑い夏を涼しく！水中を優雅に泳ぐアザラシたちの癒しの姿で心もクールダウン。日本海側最大級の水族館で特別な涼体験を。',

  // 5. 【氷見市】吉がけ牧場のヤギたちから見習いたいスローライフ体験
  'jKwgQNCsrs019jNuQGXsKO': '氷見市の吉がけ牧場で、のんびり草を食むヤギたちから学ぶスローライフ。マイペースな牧場生活の魅力と、都市部の忙しさを忘れさせる癒しの体験をお届け。',

  // 6. 【砺波市】イオンモールとなみで『劇場版「鬼滅の刃」無限城編』ポスター展開催中！
  'jKwgQNCsrs019jNuQGXuNc': '砺波市イオンモールとなみで開催の「劇場版『鬼滅の刃』無限城編」ポスター展。迫力満点のポスターと関連グッズで作品の世界観を堪能できる鬼滅ファン必見のイベント。',

  // 7. 【高岡市】ドリア専門店「ドリアリーボ」で行列必至の濃厚ドリアランチ！#shorts
  'f5IMbE4BjT3OYPNFYUOuu5': '高岡市の人気ドリア専門店「ドリアリーボ」で味わう絶品ランチ。専門店ならではのこだわりと技術で作られる濃厚ドリアは行列必至の美味しさ。地元民も観光客も大満足。',

  // 8. 【富山市】富山の学問神社！於保多(おおた)神社で夏詣＆学業祈願
  'uLkO5gatk1xjPxgoNfP6II': '富山市の於保多（おおた）神社は学問の神様として有名な由緒ある神社。夏詣での心身の浄化と学業成就・合格祈願で、受験生から社会人まで幅広く支持される聖地です。',

  // 9. 【富山市】涼感MAX！環水公園サマーファウンテン2025で夏の暑さを吹き飛ばそう
  'rtuM5GmqOByzZCRYAQl3vv': '富山市の環水公園サマーファウンテン2025で夏の暑さを爽快に吹き飛ばそう！涼感MAXの水しぶきと美しい景観で、暑い日でも快適に過ごせる人気スポットです。',

  // 10. 【富山市】東京ディズニーリゾート40周年スペシャルパレード完全版｜富山まつり2023
  'mfQBFMuZwIktGgzqUTnLwQ': '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードの完全版。ミッキーたちディズニーキャラクターが富山の街を彩った特別なイベントを収録。'
};

async function updateAllDescriptions() {
  try {
    console.log('📝 記事の説明文を一括更新開始...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const [articleId, description] of Object.entries(descriptionsToUpdate)) {
      try {
        console.log(`🔄 更新中: ${articleId}`);
        console.log(`📄 説明文: ${description}\n`);

        // 記事の現在の情報を取得
        const currentArticle = await client.fetch(`*[_type == "post" && _id == $id][0]{
          _id,
          title,
          description
        }`, { id: articleId });

        if (!currentArticle) {
          console.log(`❌ 記事が見つかりません: ${articleId}\n`);
          errorCount++;
          continue;
        }

        // 説明文を更新
        await client
          .patch(articleId)
          .set({
            description: description
          })
          .commit();

        console.log(`✅ 更新完了: ${currentArticle.title}`);
        console.log(`   文字数: ${description.length}文字`);
        console.log(`   ---\n`);

        results.push({
          id: articleId,
          title: currentArticle.title,
          description: description,
          length: description.length,
          status: 'success'
        });

        successCount++;
        
        // API負荷軽減のため少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ 更新エラー: ${articleId}`);
        console.error(`   エラー内容: ${error.message}\n`);
        
        results.push({
          id: articleId,
          status: 'error',
          error: error.message
        });
        
        errorCount++;
      }
    }

    console.log('\n🎉 一括更新完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📊 総処理件数: ${Object.keys(descriptionsToUpdate).length}件\n`);

    // 成功した更新の詳細を表示
    if (successCount > 0) {
      console.log('📋 更新された記事の詳細:');
      results.filter(r => r.status === 'success').forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   説明文: ${result.description}`);
        console.log(`   文字数: ${result.length}文字`);
        console.log('   ---');
      });
    }

    // エラーがあった場合の詳細を表示
    if (errorCount > 0) {
      console.log('\n❌ エラーが発生した記事:');
      results.filter(r => r.status === 'error').forEach((result, index) => {
        console.log(`${index + 1}. ID: ${result.id}`);
        console.log(`   エラー: ${result.error}`);
        console.log('   ---');
      });
    }

    return results;

  } catch (error) {
    console.error('❌ 処理中に予期しないエラーが発生:', error.message);
    return [];
  }
}

// 実行
updateAllDescriptions();