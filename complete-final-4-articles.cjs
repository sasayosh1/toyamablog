const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function completeFinalArticles() {
  try {
    console.log('🎯 最終4記事の拡充...');
    
    const targetIds = [
      '4zxT7RlbAnSlGPWZgbltlI', // 上市川ダム
      'o031colbTiBAm1wuPGalht',  // Great Buddha
      'o031colbTiBAm1wuPGbW45',  // あかりがナイト
      'o031colbTiBAm1wuPGbaKb'   // 城端曳山祭
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < targetIds.length; i++) {
      const articleId = targetIds[i];
      
      try {
        console.log(`\n🔄 [${i+1}/4] 処理中: ${articleId}`);
        
        const article = await client.fetch(`*[_type == "post" && _id == "${articleId}"][0] { _id, title, category, body }`);
        
        if (!article) {
          console.log('   ❌ 記事が見つかりません');
          continue;
        }
        
        console.log('   📄', article.title);
        
        // 既存コンテンツを保持しつつ拡充
        const enhancedBody = [...(article.body || [])];
        
        // 記事別カスタム拡充コンテンツ
        let customSections = [];
        
        if (article.title.includes('上市川ダム')) {
          customSections = [
            {
              h2: '上市町のダムと自然環境',
              content: '上市町には複数のダムが存在し、それぞれが地域の水資源管理と自然保護に重要な役割を果たしています。上市川第二ダムは、上市川水系の治水と利水を担う重要な施設として機能しており、周辺の自然環境との調和も図られています。ダム周辺は豊かな緑に囲まれ、四季折々の美しい景観を楽しむことができます。'
            },
            {
              h2: '上市町観光での位置づけ',
              content: '上市町を訪れる際には、剱岳の登山口としても知られる立山連峰の麓という立地を活かした自然観光が魅力です。ダム施設もその一部として、地域の水利用の歴史や技術を学ぶことができる貴重なスポットとなっています。立山黒部アルペンルートへのアクセス拠点としても重要な位置にあります。'
            },
            {
              h2: 'アクセスと周辺の見どころ',
              content: '上市町内のダム巡りは、地域の地形や自然を理解する良い機会となります。公共交通機関でのアクセスは限られるため、車での移動が便利です。周辺には眼目山立山寺や大岩山日石寺など、歴史ある寺院も点在しており、自然と文化の両方を楽しむことができる地域です。'
            }
          ];
        } else if (article.title.includes('Great Buddha')) {
          customSections = [
            {
              h2: '高岡大仏の歴史的価値',
              content: '高岡大仏は日本三大仏の一つとして知られ、奈良・鎌倉の大仏と並び称される貴重な文化遺産です。高岡の伝統工芸である銅器製作技術の粋を集めて建立されたこの大仏は、地域の職人技術の高さを物語る象徴的な存在として、多くの人々に愛され続けています。'
            },
            {
              h2: '高岡市の観光拠点として',
              content: '高岡大仏は高岡市を代表する観光スポットとして、年間を通じて多くの参拝者や観光客が訪れます。瑞龍寺や雨晴海岸などの他の名所と合わせて楽しむことで、高岡市の豊かな歴史と文化をより深く理解することができます。特に鋳物の町としての高岡の伝統を感じられる貴重な場所です。'
            },
            {
              h2: 'アクセスと参拝の魅力',
              content: '高岡駅からのアクセスも良好で、市内観光の中心的な位置にあります。大仏の台座内部も見学可能で、高岡の銅器づくりの歴史や技術について学ぶことができます。周辺には古い町並みも残っており、散策を楽しみながら高岡の文化に触れることができる環境が整っています。'
            }
          ];
        } else if (article.title.includes('あかりがナイト')) {
          customSections = [
            {
              h2: 'ほたるいかミュージアムの魅力',
              content: 'ほたるいかミュージアムは、富山湾の神秘的な発光現象で知られるほたるいかについて学べる日本唯一の施設です。ほたるいかの生態や富山湾の海洋環境について、体験型の展示を通じて深く理解することができます。特に春の発光シーズンには、実際のほたるいかの光る様子を観察できる貴重な機会もあります。'
            },
            {
              h2: '「あかりがナイト」イベントの特別感',
              content: 'イベント期間中の特別料金での入場は、多くの家族連れや観光客にとって嬉しいサービスです。通常とは異なるナイトミュージアムとしての演出により、昼間とは違った幻想的な雰囲気を楽しむことができます。滑川市の観光振興の一環として企画されるこのイベントは、地域活性化にも大きく貢献しています。'
            },
            {
              h2: '滑川市観光との連携',
              content: '滑川市は富山湾に面した美しい港町として、新鮮な海の幸や自然景観が魅力です。ほたるいかミュージアムを中心とした観光は、富山県の海洋文化や漁業の歴史を学ぶ絶好の機会となります。イベント期間中は周辺施設との連携企画も多数開催され、滑川市全体で観光客をお迎えする体制が整っています。'
            }
          ];
        } else if (article.title.includes('城端曳山祭')) {
          customSections = [
            {
              h2: 'ユネスコ無形文化遺産の価値',
              content: '城端曳山祭は300年以上の歴史を誇る南砺市の代表的な祭礼で、2016年にユネスコ無形文化遺産に登録された「山・鉾・屋台行事」の一つです。精巧な彫刻が施された曳山と、庵唄と呼ばれる独特な民謡が特徴的で、日本の伝統文化の継承において重要な意味を持つ祭りとして世界的に認められています。'
            },
            {
              h2: '南砺市の文化的アイデンティティ',
              content: '城端曳山祭は南砺市城端地区の文化的アイデンティティの核となる行事です。地域住民が一体となって準備し、世代を超えて技術や伝統を受け継ぐことで、コミュニティの結束を深める重要な役割を果たしています。祭りに使われる曳山や庵屋台の装飾は、地域の職人技術の粋を集めた芸術作品としても高く評価されています。'
            },
            {
              h2: '観光と文化継承の両立',
              content: '近年は観光資源としても注目を集める一方で、地域住民による文化継承の取り組みが最重要視されています。祭り期間中は多くの観光客が訪れますが、地域の伝統を尊重した観光振興が図られています。南砺市全体の文化観光の中心的な役割を担い、他の伝統行事との連携により、地域全体の文化的価値向上に貢献しています。'
            }
          ];
        }
        
        // セクションを追加
        customSections.forEach((section, index) => {
          enhancedBody.push({
            _type: 'block',
            _key: `custom-h2-${index + 1}-${Date.now()}`,
            style: 'h2',
            children: [{
              _type: 'span',
              _key: `custom-h2-span-${index + 1}-${Date.now()}`,
              text: section.h2,
              marks: []
            }],
            markDefs: []
          });
          
          enhancedBody.push({
            _type: 'block',
            _key: `custom-content-${index + 1}-${Date.now()}`,
            style: 'normal',
            children: [{
              _type: 'span',
              _key: `custom-content-span-${index + 1}-${Date.now()}`,
              text: section.content,
              marks: []
            }],
            markDefs: []
          });
        });
        
        // 記事を更新
        await client
          .patch(articleId)
          .set({
            body: enhancedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('   ✅ 拡充完了');
        successCount++;
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${error.message}`);
      }
    }
    
    console.log(`\n🎊 最終結果: ${successCount}/4件 完了`);
    
    if (successCount === 4) {
      console.log('\n🌟 PHASE 3 完全完了！');
      console.log('短い記事の拡充が全て完了しました！');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

completeFinalArticles();