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
function generateSeoSlug(title) {
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
    '橋': 'bridge'
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
  
  // キーワードを英語に変換
  for (const [jp, en] of Object.entries(keywordMap)) {
    if (content.includes(jp)) {
      slug += en + '-';
      content = content.replace(new RegExp(jp, 'g'), '');
    }
  }
  
  // 残りの部分から数字と英字を抽出
  const alphanumeric = content.match(/[a-zA-Z0-9]+/g);
  if (alphanumeric) {
    slug += alphanumeric.join('-').toLowerCase() + '-';
  }
  
  // 最後のハイフンを除去
  slug = slug.replace(/-+$/, '');
  
  // 空の場合は汎用的なslugを生成
  if (!slug) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    slug = `post-${year}-${month}-${Math.random().toString(36).substr(2, 6)}`;
  }
  
  // 長すぎる場合は短縮
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-[^-]*$/, '');
  }
  
  return slug;
}

async function analyzeJapaneseSlugs() {
  try {
    console.log('🔍 日本語slugの分析を開始します\n');
    
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
    
    // 日本語slugを特定
    const japaneseSlugs = posts.filter(post => containsJapanese(post.slug));
    const englishSlugs = posts.filter(post => !containsJapanese(post.slug));
    
    console.log('📈 Slug言語分析:');
    console.log(`- 英語・数字slug: ${englishSlugs.length}件`);
    console.log(`- 日本語slug: ${japaneseSlugs.length}件`);
    
    if (japaneseSlugs.length > 0) {
      console.log('\n🚨 日本語slug一覧 (最初の10件):');
      japaneseSlugs.slice(0, 10).forEach((post, i) => {
        const newSlug = generateSeoSlug(post.title);
        console.log(`${i + 1}. 現在: "${post.slug}"`);
        console.log(`   タイトル: ${post.title.substring(0, 60)}...`);
        console.log(`   提案: "${newSlug}"`);
        console.log('');
      });
      
      if (japaneseSlugs.length > 10) {
        console.log(`   ... 他${japaneseSlugs.length - 10}件の日本語slugがあります\n`);
      }
    }
    
    // slug重複チェック（提案されるslugで）
    console.log('🔄 新slug重複チェック中...');
    const proposedSlugs = new Set();
    const duplicateProposals = [];
    
    for (const post of japaneseSlugs) {
      const newSlug = generateSeoSlug(post.title);
      if (proposedSlugs.has(newSlug)) {
        duplicateProposals.push(newSlug);
      } else {
        proposedSlugs.add(newSlug);
      }
    }
    
    if (duplicateProposals.length > 0) {
      console.log(`⚠️  重複予定slug: ${duplicateProposals.length}件`);
      console.log('重複は連番で解決します\n');
    } else {
      console.log('✅ 重複なし\n');
    }
    
    return {
      totalPosts: posts.length,
      japaneseSlugs: japaneseSlugs.length,
      englishSlugs: englishSlugs.length,
      postsToUpdate: japaneseSlugs
    };
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    return null;
  }
}

analyzeJapaneseSlugs();