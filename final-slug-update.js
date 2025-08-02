import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// 日本語文字を含むslugを検出する関数
function containsJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

// タイトルから適切なslugを生成する関数
function generateSeoSlug(title, existingSlugs = new Set()) {
  // 地名を抽出（【】内）
  const locationMatch = title.match(/【([^】]+)】/);
  const location = locationMatch ? locationMatch[1] : '';
  
  // 地名を英語またはローマ字に変換
  const locationMap = {
    '富山市': 'toyama-city',
    '富山県': 'toyama-prefecture',
    '高岡市': 'takaoka-city',
    '魚津市': 'uozu-city',
    '氷見市': 'himi-city',
    '滑川市': 'namerikawa-city',
    '黒部市': 'kurobe-city',
    '砺波市': 'tonami-city',
    '小矢部市': 'oyabe-city',
    '南砺市': 'nanto-city',
    '射水市': 'imizu-city',
    '舟橋村': 'funahashi-village',
    '上市町': 'kamiichi-town',
    '立山町': 'tateyama-town',
    '入善町': 'nyuzen-town',
    '朝日町': 'asahi-town',
    '八尾町': 'yatsuo-town',
    '婦中町': 'fuchu-town',
    '大沢野': 'osawano',
    '七尾市': 'nanao-city',
    '福岡町': 'fukuoka-town'
  };
  
  // 基本単語の英語変換
  const keywordMap = {
    '温泉': 'onsen',
    '公園': 'park',
    '神社': 'shrine',
    '寺': 'temple',
    'まつり': 'festival',
    '祭り': 'festival',
    '花火': 'fireworks',
    '桜': 'sakura',
    '美術館': 'museum',
    'ラーメン': 'ramen',
    'パン': 'bread',
    'ケーキ': 'cake',
    '海岸': 'coast',
    'ダム': 'dam',
    '駅': 'station',
    '城': 'castle',
    '橋': 'bridge',
    'イルミネーション': 'illumination',
    'ライトアップ': 'lightup',
    '花火大会': 'fireworks-festival',
    'たいやき': 'taiyaki',
    '鯛焼き': 'taiyaki',
    '水族館': 'aquarium',
    'ミュージアム': 'museum',
    'カフェ': 'cafe',
    'レストラン': 'restaurant'
  };
  
  let slug = '';
  
  // 地名を追加
  if (location && locationMap[location]) {
    slug += locationMap[location] + '-';
  }
  
  // タイトルから重要なキーワードを抽出
  let content = title.replace(/【[^】]+】/, ''); // 地名部分を除去
  content = content.replace(/#shorts?/gi, ''); // #shortsを除去
  content = content.replace(/[！？。、｜|]/g, ''); // 句読点を除去
  
  // 年月日を抽出
  const yearMatch = content.match(/(\d{4})/);
  if (yearMatch) {
    slug += yearMatch[1] + '-';
  }
  
  // キーワードを英語に変換
  for (const [jp, en] of Object.entries(keywordMap)) {
    if (content.includes(jp)) {
      slug += en + '-';
      content = content.replace(new RegExp(jp, 'g'), '');
    }
  }
  
  // 英数字を抽出
  const alphanumeric = content.match(/[a-zA-Z0-9]+/g);
  if (alphanumeric) {
    slug += alphanumeric.join('-').toLowerCase() + '-';
  }
  
  // 最後のハイフンを除去
  slug = slug.replace(/-+$/, '');
  slug = slug.replace(/^-+/, '');
  
  // 空の場合は汎用的なslugを生成
  if (!slug) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    slug = `post-${year}-${month}-${Math.random().toString(36).substr(2, 6)}`;
  }
  
  // 連続するハイフンを単一に
  slug = slug.replace(/-+/g, '-');
  
  // 長すぎる場合は短縮
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-[^-]*$/, '');
  }
  
  // 重複チェックと連番追加
  let finalSlug = slug;
  let counter = 1;
  while (existingSlugs.has(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(finalSlug);
  return finalSlug;
}

async function finalSlugsUpdate() {
  try {
    console.log('🏁 日本語slug最終更新開始！\n');
    
    // 日本語slugのみを抽出
    const japanesePosts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    const japaneseSlugPosts = japanesePosts.filter(post => containsJapanese(post.slug));
    const englishSlugPosts = japanesePosts.filter(post => !containsJapanese(post.slug));
    
    console.log(`📊 現在の状況:`);
    console.log(`✅ 英語slug: ${englishSlugPosts.length}件`);
    console.log(`🎯 日本語slug (残り): ${japaneseSlugPosts.length}件\n`);
    
    if (japaneseSlugPosts.length === 0) {
      console.log('🎉 全てのslugが英語化完了済みです！');
      return { success: 0, total: 0 };
    }
    
    // 既存の英語slugを記録
    const existingSlugs = new Set();
    englishSlugPosts.forEach(post => {
      existingSlugs.add(post.slug);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`🚀 最終バッチ処理開始（${japaneseSlugPosts.length}件）\n`);
    
    // 3件ずつ処理（より確実に）
    for (let i = 0; i < japaneseSlugPosts.length; i += 3) {
      const batch = japaneseSlugPosts.slice(i, i + 3);
      
      console.log(`📦 バッチ ${Math.floor(i/3) + 1}/${Math.ceil(japaneseSlugPosts.length/3)}: ${i + 1}〜${Math.min(i + 3, japaneseSlugPosts.length)}件目`);
      
      for (const post of batch) {
        try {
          const newSlug = generateSeoSlug(post.title, existingSlugs);
          
          console.log(`  🔧 ${post.title.substring(0, 30)}...`);
          console.log(`     → ${newSlug}`);
          
          // Sanity更新実行
          await client
            .patch(post._id)
            .set({ 
              slug: {
                current: newSlug,
                _type: 'slug'
              }
            })
            .commit();
          
          successCount++;
          console.log(`     ✅ 成功 (${successCount}/${japaneseSlugPosts.length})`);
          
          // 短い待機時間
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error(`     ❌ エラー: ${error.message}`);
          errorCount++;
        }
      }
      
      // バッチ間の短い待機
      if (i + 3 < japaneseSlugPosts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('\n🎉 全slug英語化完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`📊 総計: ${englishSlugPosts.length + successCount}件が英語slug`);
    
    return {
      success: successCount,
      errors: errorCount,
      total: japaneseSlugPosts.length
    };
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
    return null;
  }
}

finalSlugsUpdate();