import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// タイトルからキーワードを抽出する関数
function extractKeywordsFromTitle(title) {
  // 【】内の地域名を抽出
  const locationMatch = title.match(/【([^】]+)】/);
  const location = locationMatch ? locationMatch[1] : '';
  
  // 店舗名や施設名を抽出（「」で囲まれた部分）
  const storeMatches = title.match(/「([^」]+)」/g);
  const stores = storeMatches ? storeMatches.map(match => match.replace(/[「」]/g, '')) : [];
  
  // ｜で区切られた後の部分（副題）を取得
  const subtitleMatch = title.match(/｜(.+)$/);
  const subtitle = subtitleMatch ? subtitleMatch[1] : '';
  
  // キーワードを抽出（食べ物、観光、体験などのキーワード）
  const keywords = [];
  
  // 食べ物関連のキーワード
  const foodKeywords = ['ケーキ', 'パン', 'どら焼き', 'たい焼き', 'りんご飴', 'カレーパン', 'ラーメン', 'スイーツ', '和菓子'];
  foodKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // 観光・施設関連のキーワード
  const tourismKeywords = ['神社', '寺', '公園', '温泉', '博物館', '水族館', '祭り', '花火', '桜', '紅葉', 'イルミネーション'];
  tourismKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // 体験・アクティビティ関連のキーワード
  const activityKeywords = ['散歩', '見学', '工場見学', 'まつり', 'フェスティバル', 'ライトアップ'];
  activityKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return {
    location,
    stores,
    subtitle,
    keywords,
    originalTitle: title
  };
}

// 1000文字程度の記事内容を生成する関数
function generateArticleContent(extractedData) {
  const { location, stores, subtitle, keywords, originalTitle } = extractedData;
  
  let content = '';
  
  // 導入部分
  content += `${location}を訪れた際に、ぜひ足を運んでいただきたいスポットをご紹介します。`;
  
  if (stores.length > 0) {
    content += `今回は「${stores[0]}」について詳しくお伝えしていきます。\n\n`;
  } else {
    content += `\n\n`;
  }
  
  // 場所の魅力について
  content += `## ${location}の魅力\n\n`;
  content += `${location}は富山県内でも特に魅力的なエリアの一つです。歴史ある街並みと現代的な施設が調和し、訪れる人々に様々な体験を提供してくれます。地元の方々の温かいおもてなしと、美しい自然環境が織りなす風景は、きっと心に残る思い出となることでしょう。\n\n`;
  
  // 具体的な店舗や施設について
  if (stores.length > 0) {
    content += `## ${stores[0]}について\n\n`;
    
    if (keywords.includes('ケーキ') || keywords.includes('スイーツ')) {
      content += `こちらのお店では、職人が心を込めて作る絶品スイーツを味わうことができます。厳選された材料を使用し、伝統的な製法と革新的なアイデアを組み合わせて作られるお菓子は、一口食べればその違いを実感できるはずです。`;
    } else if (keywords.includes('パン')) {
      content += `毎朝焼きたてのパンが並ぶこちらのベーカリーでは、小麦の香りが店内いっぱいに広がります。職人の技術と情熱が込められたパンは、地元の方々にも愛され続けています。`;
    } else if (keywords.includes('たい焼き') || keywords.includes('どら焼き')) {
      content += `昔ながらの製法で作られる和菓子は、どこか懐かしい味わいが特徴です。一つ一つ丁寧に手作りされており、素材の味を活かした優しい甘さが楽しめます。`;
    } else {
      content += `この場所では、${location}ならではの特色ある体験をすることができます。地域の文化や歴史を感じながら、ゆっくりとした時間を過ごすことができるでしょう。`;
    }
    
    content += `\n\n`;
  }
  
  // 体験・アクセス情報
  content += `## 訪問の楽しみ方\n\n`;
  content += `${location}を訪れる際は、周辺エリアも合わせて散策することをおすすめします。それぞれの季節によって異なる魅力を発見できるため、何度訪れても新しい発見があることでしょう。\n\n`;
  
  if (keywords.includes('祭り') || keywords.includes('花火')) {
    content += `特にイベント開催時期には、地域全体が活気に満ち溢れます。地元の伝統や文化を肌で感じることができる貴重な機会となるでしょう。`;
  } else if (keywords.includes('桜') || keywords.includes('紅葉')) {
    content += `自然の美しさを楽しむなら、季節の移ろいとともに変化する風景に注目してください。特に春の桜や秋の紅葉の時期は、多くの方々が訪れる人気のシーズンです。`;
  } else {
    content += `地元の方々との交流も、旅の醍醐味の一つです。温かい人柄に触れることで、より深く地域の魅力を理解することができるでしょう。`;
  }
  
  content += `\n\n`;
  
  // まとめ
  content += `## まとめ\n\n`;
  content += `${location}でのひとときは、きっと特別な思い出となることでしょう。`;
  
  if (stores.length > 0) {
    content += `${stores[0]}をはじめとする地域の魅力的なスポットを巡りながら、`;
  }
  
  content += `富山の素晴らしさを存分に味わってください。次回の${location}訪問時にも、新たな発見と感動が待っていることと思います。ぜひゆっくりとした時間をお過ごしください。`;
  
  return content;
}

// Sanity用のPortableTextブロックに変換する関数
function convertToPortableText(content) {
  const blocks = [];
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') return;
    
    if (paragraph.startsWith('## ')) {
      // 見出し
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h2',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph.replace('## ', ''),
          marks: []
        }]
      });
    } else {
      // 通常の段落
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'normal',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph,
          marks: []
        }]
      });
    }
  });
  
  return blocks;
}

async function generateContentForEmptyArticles() {
  try {
    console.log('🔧 記事コンテンツ生成を開始します...\n');
    
    // 本文が空の記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && (!defined(body) || length(body) == 0)]{ 
        _id,
        title, 
        description,
        category,
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 処理対象記事数: ${posts.length}件\n`);
    
    if (posts.length === 0) {
      console.log('✅ 本文が空の記事はありません。');
      return;
    }
    
    let processedCount = 0;
    
    for (const post of posts) {
      console.log(`🔧 処理中: ${post.title}`);
      console.log(`   スラッグ: ${post.slug}`);
      
      try {
        // タイトルからキーワードを抽出
        const extractedData = extractKeywordsFromTitle(post.title);
        console.log(`   抽出キーワード: 地域=${extractedData.location}, 店舗=${extractedData.stores.join(', ')}, その他=${extractedData.keywords.join(', ')}`);
        
        // 1000文字程度の記事内容を生成
        const articleContent = generateArticleContent(extractedData);
        console.log(`   生成文字数: ${articleContent.length}文字`);
        
        // PortableTextブロックに変換
        const portableTextBlocks = convertToPortableText(articleContent);
        
        // Sanityに保存
        await client
          .patch(post._id)
          .set({ body: portableTextBlocks })
          .commit();
        
        console.log(`   ✅ 更新成功\n`);
        processedCount++;
        
        // レート制限対策（1記事処理後に少し待機）
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ 更新失敗: ${error.message}\n`);
      }
    }
    
    console.log('🎉 記事コンテンツ生成完了！');
    console.log(`📊 結果: ${processedCount}/${posts.length}件の記事を処理しました。`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

generateContentForEmptyArticles();