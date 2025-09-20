const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// description未設定の記事を修正
async function fixMissingDescriptions() {
  try {
    console.log('🔍 description未設定の記事を検索中...');

    const articles = await client.fetch(`*[_type == "post" && (!defined(description) || length(description) == 0)] {
      _id,
      title,
      excerpt
    }`);

    console.log(`📄 description未設定記事: ${articles.length}件`);

    if (articles.length === 0) {
      console.log('✅ すべての記事にdescriptionが設定済みです！');
      return 0;
    }

    let fixedCount = 0;

    for (const article of articles) {
      try {
        // excerptをdescriptionとして使用
        const description = article.excerpt || `${article.title.replace(/【.*?】/, '').replace(/#shorts.*/, '').trim()}の詳細情報をお届けします。`;

        await client
          .patch(article._id)
          .set({ description })
          .commit();

        console.log(`✅ Description追加: ${article.title.substring(0, 50)}...`);
        fixedCount++;

        // API制限回避
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Description追加エラー (${article._id}):`, error.message);
      }
    }

    console.log(`📄 Description修正完了: ${fixedCount}件`);
    return fixedCount;

  } catch (error) {
    console.error('❌ Description修正エラー:', error);
    return 0;
  }
}

// タグ数を最適化（15個以内に削減）
async function optimizeTags() {
  try {
    console.log('🔍 タグ過多の記事を検索中...');

    const articles = await client.fetch(`*[_type == "post" && count(tags) > 15] {
      _id,
      title,
      tags,
      "tagCount": count(tags)
    } | order(tagCount desc)`);

    console.log(`🏷️ タグ過多記事: ${articles.length}件`);

    if (articles.length === 0) {
      console.log('✅ すべての記事のタグが適切です！');
      return 0;
    }

    let fixedCount = 0;

    for (const article of articles) {
      try {
        // 重要度順にタグを選別・最適化
        const optimizedTags = optimizeTagList(article.tags, article.title);

        await client
          .patch(article._id)
          .set({ tags: optimizedTags })
          .commit();

        console.log(`✅ タグ最適化: ${article.title.substring(0, 40)}... (${article.tagCount}個 → ${optimizedTags.length}個)`);
        fixedCount++;

        // API制限回避
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ タグ最適化エラー (${article._id}):`, error.message);
      }
    }

    console.log(`🏷️ タグ最適化完了: ${fixedCount}件`);
    return fixedCount;

  } catch (error) {
    console.error('❌ タグ最適化エラー:', error);
    return 0;
  }
}

// タグリストの最適化ロジック
function optimizeTagList(tags, title) {
  if (!tags || tags.length <= 15) return tags;

  // 優先度の高いタグカテゴリを定義
  const priorityKeywords = [
    // 地域名（最優先）
    '富山市', '高岡市', '射水市', '氷見市', '砺波市', '小矢部市', '南砺市',
    '魚津市', '黒部市', '滑川市', '上市町', '立山町', '舟橋村', '入善町', '朝日町',

    // 業種・カテゴリ（高優先）
    'グルメ', 'カフェ', 'レストラン', 'パン屋', 'スイーツ', 'ケーキ', '和菓子',
    '観光', '公園', '神社', '寺院', '温泉', 'ホテル', '旅館',
    'ショッピング', '専門店', 'アンテナショップ',

    // 体験・アクティビティ（中優先）
    'ランチ', 'ディナー', 'モーニング', 'テイクアウト', 'お土産',
    '散歩', 'ドライブ', 'デート', 'ファミリー', '子連れ',

    // 特徴・形容詞（低優先）
    '美味しい', '人気', '話題', '限定', '新鮮', '地元', '老舗', '有名'
  ];

  // タグを優先度順にソート
  const sortedTags = tags.sort((a, b) => {
    const aPriority = getPriority(a, priorityKeywords, title);
    const bPriority = getPriority(b, priorityKeywords, title);
    return bPriority - aPriority;
  });

  // 上位10個を選択（地域名は必ず含める）
  const optimizedTags = [];
  const locationTags = sortedTags.filter(tag =>
    tag.includes('市') || tag.includes('町') || tag.includes('村')
  );

  // 地域タグを優先追加
  locationTags.slice(0, 2).forEach(tag => {
    if (!optimizedTags.includes(tag)) {
      optimizedTags.push(tag);
    }
  });

  // 残りのタグを追加（重複除去）
  sortedTags.forEach(tag => {
    if (optimizedTags.length < 10 && !optimizedTags.includes(tag)) {
      optimizedTags.push(tag);
    }
  });

  return optimizedTags;
}

// タグの優先度を計算
function getPriority(tag, priorityKeywords, title) {
  let priority = 0;

  // タイトルに含まれるタグは高優先度
  if (title.includes(tag)) {
    priority += 100;
  }

  // 優先キーワードリストでの位置に基づく優先度
  const keywordIndex = priorityKeywords.indexOf(tag);
  if (keywordIndex !== -1) {
    priority += 50 - keywordIndex; // 早い方が高優先度
  }

  // 地域名は最高優先度
  if (tag.includes('市') || tag.includes('町') || tag.includes('村')) {
    priority += 200;
  }

  // 業種・カテゴリは高優先度
  const categories = ['グルメ', 'カフェ', 'レストラン', '観光', '公園', 'ショッピング'];
  if (categories.some(cat => tag.includes(cat))) {
    priority += 80;
  }

  return priority;
}

async function main() {
  try {
    console.log('🚀 SEO最適化処理を開始します...\n');

    // 1. Description修正
    const descriptionFixed = await fixMissingDescriptions();
    console.log('');

    // 2. タグ最適化
    const tagsFixed = await optimizeTags();

    console.log('\n🎯 SEO最適化完了！');
    console.log(`📄 Description修正: ${descriptionFixed}件`);
    console.log(`🏷️ タグ最適化: ${tagsFixed}件`);
    console.log(`📊 総修正: ${descriptionFixed + tagsFixed}件`);

  } catch (error) {
    console.error('💥 SEO最適化エラー:', error);
  }
}

main();