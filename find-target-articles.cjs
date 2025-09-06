const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

const targetTitles = [
  '【南砺市】うさぎ推し必見！「パティスリーまちなみラパン」が可愛すぎた！ #shorts',
  '【富山市】落ち着いた空間で楽しむリトル上海の本格中華ランチ！日常にそっと高級感を #shorts',
  '【高岡市】脱出を企(くわだ)てるペンギン',
  '【魚津市】毎日暑いのでゴマフアザラシを見て涼しさを感じよう！魚津水族館の癒し体験',
  '【氷見市】吉がけ牧場のヤギたちから見習いたいスローライフ体験',
  '【砺波市】イオンモールとなみで『劇場版「鬼滅の刃」無限城編』ポスター展開催中！',
  '【高岡市】ドリア専門店「ドリアリーボ」で行列必至の濃厚ドリアランチ！#shorts',
  '【富山市】富山の学問神社！於保多(おおた)神社で夏詣＆学業祈願',
  '【富山市】涼感MAX！環水公園サマーファウンテン2025で夏の暑さを吹き飛ばそう',
  '【富山市】東京ディズニーリゾート40周年スペシャルパレード完全版｜富山まつり2023'
];

async function findTargetArticles() {
  try {
    console.log('🔍 指定された10件の記事を検索中...\n');
    
    const posts = await client.fetch(`*[_type == "post"] {
      _id,
      title,
      slug,
      description,
      body,
      publishedAt
    }`);

    const foundArticles = [];
    const notFoundTitles = [];

    targetTitles.forEach((targetTitle, index) => {
      const found = posts.find(post => post.title === targetTitle);
      if (found) {
        const bodyText = found.body ? found.body
          .filter(block => block._type === 'block')
          .map(block => block.children && block.children.map(child => child.text).join(''))
          .join(' ') : '';
        
        foundArticles.push({
          index: index + 1,
          id: found._id,
          title: found.title,
          slug: found.slug?.current,
          description: found.description,
          bodyLength: bodyText.length,
          bodyPreview: bodyText.substring(0, 200) + '...'
        });
      } else {
        notFoundTitles.push({
          index: index + 1,
          title: targetTitle
        });
      }
    });

    console.log(`✅ 見つかった記事: ${foundArticles.length}件`);
    console.log(`❌ 見つからなかった記事: ${notFoundTitles.length}件\n`);

    if (foundArticles.length > 0) {
      console.log('📝 見つかった記事の詳細:\n');
      foundArticles.forEach(article => {
        console.log(`${article.index}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   スラッグ: ${article.slug}`);
        console.log(`   現在の説明文: ${article.description || '未設定'}`);
        console.log(`   文字数: ${article.bodyLength}文字`);
        console.log(`   内容プレビュー: ${article.bodyPreview}`);
        console.log('   ---\n');
      });
    }

    if (notFoundTitles.length > 0) {
      console.log('❌ 見つからなかった記事:\n');
      notFoundTitles.forEach(item => {
        console.log(`${item.index}. ${item.title}`);
      });
    }

    return foundArticles;

  } catch (error) {
    console.error('❌ エラー:', error.message);
    return [];
  }
}

findTargetArticles();