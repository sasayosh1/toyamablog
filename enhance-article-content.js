import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// 拡張された記事内容を生成する関数（1000文字目標）
function generateEnhancedArticleContent(extractedData) {
  const { location, stores, subtitle, keywords, originalTitle } = extractedData;
  
  let content = '';
  
  // 導入部分（より詳細に）
  content += `${location}を訪れる皆様にとって、きっと特別な体験となるスポットをご紹介させていただきます。`;
  
  if (stores.length > 0) {
    content += `今回は「${stores[0]}」について、その魅力を余すことなくお伝えしていきたいと思います。\n\n`;
  } else {
    content += `地域の魅力を存分に味わえる、とっておきの場所についてご紹介いたします。\n\n`;
  }
  
  // 地域の背景と特色
  content += `## ${location}の魅力と特色\n\n`;
  content += `${location}は富山県内でも特に魅力的なエリアとして知られており、長い歴史と豊かな文化を誇っています。立山連峰を望む美しい景観と、四季折々の自然の変化が楽しめるこの地域では、訪れる度に新しい発見があります。地元の方々の温かいおもてなしの心と、代々受け継がれてきた伝統が、現代の生活と見事に調和しているのも、この地域ならではの特徴といえるでしょう。\n\n`;
  
  // 具体的な店舗や施設についての詳細
  if (stores.length > 0) {
    content += `## ${stores[0]}の魅力\n\n`;
    
    if (keywords.includes('ケーキ') || keywords.includes('スイーツ')) {
      content += `こちらのお店では、熟練の職人が心を込めて作る絶品スイーツを味わうことができます。厳選された上質な材料を使用し、伝統的な製法と革新的なアイデアを巧みに組み合わせて作られるお菓子は、見た目の美しさはもちろん、一口食べればその繊細な味わいの違いを実感していただけるはずです。季節ごとに変わる限定メニューも人気で、何度訪れても新しい美味しさに出会えるのも魅力の一つです。`;
    } else if (keywords.includes('パン')) {
      content += `毎朝早くから焼きたてのパンが店内に並ぶこちらのベーカリーでは、小麦の香ばしい香りが店内いっぱいに広がり、訪れる人々を温かく迎えてくれます。長年培われた職人の確かな技術と、美味しいパンへの情熱が込められた一つ一つの商品は、地元の方々にも長く愛され続けています。特に人気の商品は早い時間に売り切れてしまうこともあるため、お目当ての商品がある場合は早めの来店をおすすめします。`;
    } else if (keywords.includes('たい焼き') || keywords.includes('どら焼き')) {
      content += `昔ながらの伝統的な製法で丁寧に作られる和菓子は、どこか懐かしく、心温まる味わいが特徴です。一つ一つ手作業で心を込めて作られており、素材本来の自然な甘さを活かした優しい味わいが楽しめます。忙しい日常を忘れて、ゆっくりとした時間を過ごしながら味わっていただければ、きっと心が癒されることでしょう。`;
    } else if (keywords.includes('りんご飴')) {
      content += `新鮮なりんごを使用した特製のりんご飴は、パリッとした食感と程よい甘さが絶妙なバランスを保っています。見た目にも美しく、SNS映えする商品として若い世代からも人気を集めています。職人が一つ一つ丁寧に仕上げる手作りの温かさを感じられる逸品です。`;
    } else {
      content += `この場所では、${location}ならではの特色ある体験をすることができます。地域の文化や歴史の深さを肌で感じながら、ゆっくりとした贅沢な時間を過ごすことができるでしょう。`;
    }
    
    content += `\n\n`;
  }
  
  // 周辺環境とアクセス情報
  content += `## 周辺環境と楽しみ方\n\n`;
  content += `${location}を訪れる際は、メインの目的地だけでなく、周辺エリアも合わせて散策することを強くおすすめいたします。徒歩圏内には他にも魅力的なスポットが点在しており、それぞれの季節によって全く異なる表情を見せてくれるため、何度訪れても新しい発見と感動があることでしょう。特に地元の方々がおすすめする隠れたスポットを探してみるのも、旅の醍醐味の一つです。\n\n`;
  
  if (keywords.includes('祭り') || keywords.includes('花火')) {
    content += `特にお祭りや花火大会などのイベント開催時期には、地域全体が活気に満ち溢れ、普段とは違った特別な雰囲気を楽しむことができます。地元の伝統文化や習慣を直接肌で感じることができる貴重な機会となり、きっと忘れられない思い出となることでしょう。`;
  } else if (keywords.includes('桜') || keywords.includes('紅葉')) {
    content += `自然の美しさを存分に楽しむなら、季節の移ろいとともに劇的に変化する風景にぜひ注目してください。特に春の桜が咲き誇る時期や、秋の紅葉が山々を彩る時期は、多くの観光客や写真愛好家が訪れる人気のシーズンです。`;
  } else {
    content += `地元の方々との何気ない交流も、旅の大きな醍醐味の一つです。温かい人柄に触れ、地域の生活や文化について教えていただくことで、より深くこの土地の真の魅力を理解し、心に残る体験をすることができるでしょう。`;
  }
  
  content += `\n\n`;
  
  // 訪問のコツとマナー
  content += `## 訪問時のポイント\n\n`;
  content += `${location}を訪れる際は、地域の文化や習慣を尊重し、マナーを守って楽しい時間を過ごしていただければと思います。また、混雑する時間帯を避けて、ゆっくりと落ち着いて楽しめる時間を選ぶことで、より充実した体験ができるでしょう。地元の方々にとっても大切な場所ですので、お互いに気持ちよく過ごせるよう心がけることが大切です。\n\n`;
  
  // まとめ
  content += `## まとめ\n\n`;
  content += `${location}でのひとときは、きっと皆様にとって特別で心に残る思い出となることでしょう。`;
  
  if (stores.length > 0) {
    content += `${stores[0]}をはじめとする地域の魅力的なスポットを巡りながら、`;
  }
  
  content += `富山の奥深い魅力と温かい人情を存分に味わっていただければと思います。四季を通じて異なる表情を見せてくれるこの地域は、次回の${location}訪問時にも、また新たな発見と感動が待っていることと思います。ぜひ時間に余裕を持って、ゆっくりとした癒しの時間をお過ごしください。`;
  
  return content;
}

// タイトルからキーワードを抽出する関数（再利用）
function extractKeywordsFromTitle(title) {
  const locationMatch = title.match(/【([^】]+)】/);
  const location = locationMatch ? locationMatch[1] : '';
  
  const storeMatches = title.match(/「([^」]+)」/g);
  const stores = storeMatches ? storeMatches.map(match => match.replace(/[「」]/g, '')) : [];
  
  const subtitleMatch = title.match(/｜(.+)$/);
  const subtitle = subtitleMatch ? subtitleMatch[1] : '';
  
  const keywords = [];
  
  const foodKeywords = ['ケーキ', 'パン', 'どら焼き', 'たい焼き', 'りんご飴', 'カレーパン', 'ラーメン', 'スイーツ', '和菓子'];
  foodKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  const tourismKeywords = ['神社', '寺', '公園', '温泉', '博物館', '水族館', '祭り', '花火', '桜', '紅葉', 'イルミネーション'];
  tourismKeywords.forEach(keyword => {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
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

// Sanity用のPortableTextブロックに変換する関数（再利用）
function convertToPortableText(content) {
  const blocks = [];
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') return;
    
    if (paragraph.startsWith('## ')) {
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

async function enhanceArticleContent() {
  try {
    console.log('📝 記事コンテンツを1000文字程度に拡張します...\n');
    
    // 先ほど処理した3つの記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && slug.current in ["toyama-city-cake-station", "toyama-city-50", "toyama-city-candy-apple-maroot"]]{ 
        _id,
        title, 
        description,
        category,
        "slug": slug.current,
        publishedAt
      }
    `);
    
    console.log(`📋 拡張対象記事数: ${posts.length}件\n`);
    
    let processedCount = 0;
    
    for (const post of posts) {
      console.log(`📝 拡張中: ${post.title}`);
      console.log(`   スラッグ: ${post.slug}`);
      
      try {
        // タイトルからキーワードを抽出
        const extractedData = extractKeywordsFromTitle(post.title);
        
        // 1000文字程度の充実した記事内容を生成
        const enhancedContent = generateEnhancedArticleContent(extractedData);
        console.log(`   拡張後文字数: ${enhancedContent.length}文字`);
        
        // PortableTextブロックに変換
        const portableTextBlocks = convertToPortableText(enhancedContent);
        
        // Sanityに保存
        await client
          .patch(post._id)
          .set({ body: portableTextBlocks })
          .commit();
        
        console.log(`   ✅ 拡張完了\n`);
        processedCount++;
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ 拡張失敗: ${error.message}\n`);
      }
    }
    
    console.log('🎉 記事コンテンツ拡張完了！');
    console.log(`📊 結果: ${processedCount}/${posts.length}件の記事を拡張しました。`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

enhanceArticleContent();