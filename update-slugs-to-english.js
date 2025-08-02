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

async function updateSlugsToEnglish() {
  try {
    console.log('🔄 日本語slugを英語slugに変更開始\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📊 総記事数: ${posts.length}件\n`);
    
    // 日本語slugのみを抽出
    const japaneseSlugs = posts.filter(post => containsJapanese(post.slug));
    console.log(`🎯 更新対象: ${japaneseSlugs.length}件\n`);
    
    if (japaneseSlugs.length === 0) {
      console.log('✅ 日本語slugはありませんでした');
      return;
    }
    
    // 既存の英語slugを確認
    const existingSlugs = new Set();
    posts.forEach(post => {
      if (!containsJapanese(post.slug)) {
        existingSlugs.add(post.slug);
      }
    });
    
    const updates = [];
    let successCount = 0;
    let errorCount = 0;
    
    console.log('🚀 段階的更新開始（10件ずつ処理）\n');
    
    // 10件ずつ処理
    for (let i = 0; i < japaneseSlugs.length; i += 10) {
      const batch = japaneseSlugs.slice(i, i + 10);
      
      console.log(`📦 バッチ ${Math.floor(i/10) + 1}: ${i + 1}〜${Math.min(i + 10, japaneseSlugs.length)}件目`);
      
      for (const post of batch) {
        try {
          const newSlug = generateSeoSlug(post.title, existingSlugs);
          
          console.log(`  🔧 更新中: ${post.title.substring(0, 40)}...`);
          console.log(`     旧slug: ${post.slug.substring(0, 50)}...`);
          console.log(`     新slug: ${newSlug}`);
          
          // Sanity更新実行
          const result = await client
            .patch(post._id)
            .set({ 
              slug: {
                current: newSlug,
                _type: 'slug'
              }
            })
            .commit();
          
          updates.push({
            id: post._id,
            title: post.title,
            oldSlug: post.slug,
            newSlug: newSlug,
            success: true
          });
          
          successCount++;
          console.log(`     ✅ 成功`);
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`     ❌ エラー: ${error.message}`);
          errorCount++;
          
          updates.push({
            id: post._id,
            title: post.title,
            oldSlug: post.slug,
            newSlug: 'エラー',
            success: false,
            error: error.message
          });
        }
      }
      
      console.log(`  📊 バッチ完了: 成功 ${successCount}件, エラー ${errorCount}件\n`);
      
      // バッチ間の待機
      if (i + 10 < japaneseSlugs.length) {
        console.log('⏳ 次のバッチまで3秒待機...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('🎉 全更新完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  エラーが発生した記事:');
      updates.filter(u => !u.success).forEach((update, i) => {
        console.log(`${i + 1}. ${update.title.substring(0, 50)}...`);
        console.log(`   エラー: ${update.error}`);
      });
    }
    
    return {
      total: japaneseSlugs.length,
      success: successCount,
      errors: errorCount,
      updates: updates
    };
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
    return null;
  }
}

updateSlugsToEnglish();