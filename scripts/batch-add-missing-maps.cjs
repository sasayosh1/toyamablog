const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// マップが不足している記事を取得
async function getArticlesWithoutMaps() {
  const query = `*[_type == "post"] {
    _id,
    title,
    slug,
    body,
    "hasGoogleMapsType": defined(body[_type == "googleMaps"]),
    "hasHtmlMap": defined(body[_type == "html" && html match "*google.com/maps*"]),
    "hasMap": defined(body[_type == "googleMaps"]) || defined(body[_type == "html" && html match "*google.com/maps*"])
  } | order(publishedAt desc)`;

  const articles = await client.fetch(query);

  // デバッグ情報を出力
  console.log('📋 記事検出状況:');
  const withoutMaps = articles.filter(article => !article.hasMap);
  const withMaps = articles.filter(article => article.hasMap);

  console.log(`🗺️ マップあり: ${withMaps.length}件`);
  console.log(`❌ マップなし: ${withoutMaps.length}件`);

  if (withoutMaps.length > 0) {
    console.log('\n🚨 マップが不足している記事（上位10件）:');
    withoutMaps.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`   ID: ${article._id}`);
      console.log(`   GoogleMapsType: ${article.hasGoogleMapsType}`);
      console.log(`   HTMLMap: ${article.hasHtmlMap}`);
      console.log('   ---');
    });
  }

  return withoutMaps;
}

function generateMapInfo(title) {
  const locationMap = {
    '富山市': { coords: { lat: 36.70, lng: 137.21 }, area: '富山市' },
    '高岡市': { coords: { lat: 36.75, lng: 137.02 }, area: '高岡市' },
    '射水市': { coords: { lat: 36.78, lng: 137.10 }, area: '射水市' },
    '氷見市': { coords: { lat: 36.86, lng: 136.99 }, area: '氷見市' },
    '砺波市': { coords: { lat: 36.65, lng: 136.96 }, area: '砺波市' },
    '小矢部市': { coords: { lat: 36.68, lng: 136.87 }, area: '小矢部市' },
    '南砺市': { coords: { lat: 36.55, lng: 136.85 }, area: '南砺市' },
    '魚津市': { coords: { lat: 36.82, lng: 137.41 }, area: '魚津市' },
    '黒部市': { coords: { lat: 36.87, lng: 137.45 }, area: '黒部市' },
    '滑川市': { coords: { lat: 36.77, lng: 137.35 }, area: '滑川市' },
    '上市町': { coords: { lat: 36.70, lng: 137.37 }, area: '上市町' },
    '立山町': { coords: { lat: 36.58, lng: 137.33 }, area: '立山町' },
    '舟橋村': { coords: { lat: 36.70, lng: 137.32 }, area: '舟橋村' },
    '入善町': { coords: { lat: 36.93, lng: 137.52 }, area: '入善町' },
    '朝日町': { coords: { lat: 36.95, lng: 137.72 }, area: '朝日町' },
    '婦中町': { coords: { lat: 36.65, lng: 137.15 }, area: '富山市' },
    '八尾町': { coords: { lat: 36.58, lng: 137.23 }, area: '富山市' },
    '福岡町': { coords: { lat: 36.78, lng: 137.08 }, area: '高岡市' }
  };

  let location = locationMap['富山市']; // デフォルト
  for (const [area, info] of Object.entries(locationMap)) {
    if (title.includes(area)) {
      location = info;
      break;
    }
  }

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${location.coords.lat},${location.coords.lng}&zoom=15`;

  return {
    mapUrl: embedUrl,
    area: location.area,
    coords: location.coords
  };
}

async function addMapToArticle(articleId, title) {
  try {
    const mapInfo = generateMapInfo(title);

    const mapBlock = {
      _type: 'html',
      _key: `map-${Date.now()}`,
      html: `<iframe src="${mapInfo.mapUrl}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    };

    await client
      .patch(articleId)
      .setIfMissing({ body: [] })
      .append('body', [mapBlock])
      .commit();

    console.log(`✅ マップ追加成功: ${title.substring(0, 50)}...`);
    return { success: true };
  } catch (error) {
    console.error(`❌ マップ追加エラー (${articleId}):`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🔍 マップが不足している記事を取得中...');
    const articlesWithoutMaps = await getArticlesWithoutMaps();

    console.log(`📊 対象記事数: ${articlesWithoutMaps.length}件`);

    if (articlesWithoutMaps.length === 0) {
      console.log('🎉 すべての記事にマップが設定済みです！');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    console.log('🚀 マップ追加処理を開始...');

    // 5件ずつバッチ処理（API制限対策）
    for (let i = 0; i < articlesWithoutMaps.length; i += 5) {
      const batch = articlesWithoutMaps.slice(i, i + 5);

      await Promise.all(batch.map(async (article) => {
        const result = await addMapToArticle(article._id, article.title);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }));

      console.log(`📈 進捗: ${Math.min(i + 5, articlesWithoutMaps.length)}/${articlesWithoutMaps.length}件完了`);

      // API制限回避のため1秒待機
      if (i + 5 < articlesWithoutMaps.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n🎯 処理完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📊 総計: ${successCount + errorCount}件`);

  } catch (error) {
    console.error('💥 メイン処理エラー:', error);
  }
}

main();