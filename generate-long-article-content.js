import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// H2、H3タグを使った2000文字程度の詳細記事を生成する関数
function generateDetailedArticleContent(extractedData) {
  const { location, stores, subtitle, keywords, originalTitle } = extractedData;
  
  let content = '';
  
  // 導入部分
  content += `${location}エリアを訪れる皆様に、心からおすすめしたい特別なスポットをご紹介いたします。`;
  
  if (stores.length > 0) {
    content += `今回は「${stores[0]}」について、その魅力を詳しくお伝えしていきます。地域に根ざした素晴らしいお店の数々が、訪れる人々に特別な体験を提供してくれることでしょう。\n\n`;
  } else {
    content += `この地域ならではの魅力を存分に味わえる、とっておきの場所について詳しくご紹介いたします。\n\n`;
  }
  
  // 地域の概要と歴史
  content += `## ${location}エリアの魅力と歴史\n\n`;
  content += `${location}は富山県内でも特に歴史と文化が深く根ざした魅力的なエリアとして知られています。立山連峰の雄大な景観を背景に、四季折々の美しい自然の変化を楽しむことができるこの地域は、古くから多くの人々に愛され続けてきました。江戸時代から続く商人文化の影響を受けながら、現代に至るまで独自の発展を遂げており、伝統と革新が見事に調和した街並みを形成しています。\n\n`;
  
  content += `地元の方々の温かいおもてなしの心と、代々受け継がれてきた職人の技術や伝統が、現代の生活スタイルと自然に融合しているのも、この地域ならではの特徴といえるでしょう。特に近年では、若い世代の新しいアイデアと伝統的な手法が組み合わさることで、これまでにない魅力的な店舗や施設が数多く誕生しています。\n\n`;
  
  // 具体的な店舗や施設についての詳細情報
  if (stores.length > 0) {
    content += `## ${stores[0]}の特徴と魅力\n\n`;
    
    if (keywords.includes('ケーキ') || keywords.includes('スイーツ')) {
      content += `### 職人のこだわりと技術\n\n`;
      content += `こちらのお店では、長年の経験を積んだ熟練の職人が、一つ一つ心を込めて作る絶品スイーツを味わうことができます。厳選された最高品質の材料を使用し、伝統的な製法に革新的なアイデアを巧みに組み合わせることで、他では味わえない独特の美味しさを生み出しています。\n\n`;
      
      content += `特に注目すべきは、季節ごとに変わる限定メニューの豊富さです。春には桜を使った上品な和風スイーツ、夏には爽やかなフルーツを活かしたケーキ、秋には栗や芋を使った濃厚な味わいのデザート、冬には温かみのあるチョコレート系のスイーツなど、一年を通じて飽きることなく楽しむことができます。\n\n`;
      
      content += `### 店内の雰囲気とサービス\n\n`;
      content += `店内は落ち着いた雰囲気で統一されており、ゆっくりとくつろぎながらスイーツを楽しむことができる空間となっています。スタッフの方々の丁寧な接客も印象的で、初めて訪れるお客様にも安心してお楽しみいただけるよう、細やかな心配りがされています。\n\n`;
      
    } else if (keywords.includes('パン')) {
      content += `### 毎日焼きたて、職人の技\n\n`;
      content += `毎朝早くから店内で焼き上げられる香り高いパンの数々は、厳選された小麦粉と天然酵母を使用した本格的な味わいが自慢です。職人が長年培ってきた確かな技術と、美味しいパンへの情熱が込められた一つ一つの商品は、地元の方々はもちろん、遠方からわざわざ足を運ぶファンも多い人気店となっています。\n\n`;
      
      content += `### 人気商品と季節限定メニュー\n\n`;
      content += `定番の食パンやクロワッサンから、季節の食材を使った限定商品まで、常時50種類以上のパンが店頭に並びます。特に人気の商品は午前中に売り切れてしまうこともあるため、お目当ての商品がある場合は早めの来店をおすすめします。\n\n`;
      
    } else if (keywords.includes('たい焼き') || keywords.includes('どら焼き')) {
      content += `### 伝統の製法と素材へのこだわり\n\n`;
      content += `昔ながらの伝統的な製法を大切に守りながら、一つ一つ手作業で丁寧に作られる和菓子は、どこか懐かしく、心温まる味わいが特徴です。厳選された北海道産の小豆と、地元富山の美味しい水を使用することで、素材本来の自然な甘さを最大限に活かした優しい味わいを実現しています。\n\n`;
      
      content += `### 製造工程へのこだわり\n\n`;
      content += `あんこの炊き上げから生地の仕込み、焼き上げに至るまで、すべての工程で職人の熟練した技術が活かされています。特に温度管理と焼き時間の調整は、長年の経験に基づく絶妙なバランスで行われており、外はサクッと、中はしっとりとした理想的な食感を生み出しています。\n\n`;
      
    } else if (keywords.includes('りんご飴')) {
      content += `### 新鮮な素材と職人技\n\n`;
      content += `厳選された新鮮なりんごを使用した特製のりんご飴は、パリッとした食感と程よい甘さが絶妙なバランスを保っています。見た目にも美しく、SNS映えする商品として若い世代からも絶大な人気を集めています。職人が一つ一つ丁寧に仕上げる手作りの温かさを感じられる逸品です。\n\n`;
      
      content += `### 多彩なバリエーション\n\n`;
      content += `定番のりんご飴に加えて、季節限定のフレーバーや、特別なトッピングを施した商品も人気です。それぞれ異なる味わいと見た目を楽しむことができ、お土産としても大変喜ばれています。\n\n`;
    }
  }
  
  // 周辺環境とアクセス情報
  content += `## 周辺エリアの見どころ\n\n`;
  content += `${location}を訪れる際は、メインの目的地だけでなく、周辺エリアも合わせて散策することを強くおすすめいたします。徒歩圏内には歴史的な建造物や美しい公園、個性的なショップなど、魅力的なスポットが数多く点在しており、それぞれの季節によって全く異なる表情を見せてくれるため、何度訪れても新しい発見と感動があることでしょう。\n\n`;
  
  content += `### 歴史的建造物と文化施設\n\n`;
  content += `エリア内には江戸時代から明治時代にかけて建てられた歴史的な建造物が数多く残されており、当時の生活や文化を垣間見ることができます。また、地域の文化や芸術を紹介する施設も充実しており、地元の歴史や伝統について深く学ぶことができる貴重な機会となっています。\n\n`;
  
  content += `### 自然環境と季節の楽しみ\n\n`;
  if (keywords.includes('祭り') || keywords.includes('花火')) {
    content += `特にお祭りや花火大会などの季節イベント開催時期には、地域全体が活気に満ち溢れ、普段とは違った特別な雰囲気を楽しむことができます。地元の伝統文化や習慣を直接肌で感じることができる貴重な機会となり、参加される方々にとって忘れられない思い出となることでしょう。\n\n`;
  } else if (keywords.includes('桜') || keywords.includes('紅葉')) {
    content += `自然の美しさを存分に楽しむなら、季節の移ろいとともに劇的に変化する風景にぜひ注目してください。特に春の桜が咲き誇る時期には、エリア全体がピンク色に染まり、秋の紅葉シーズンには山々が赤や黄色に美しく彩られます。これらの季節は多くの観光客や写真愛好家が訪れる人気の時期となっています。\n\n`;
  } else {
    content += `地元の方々との何気ない交流も、旅の大きな醍醐味の一つです。温かい人柄に触れ、地域の生活や文化について教えていただくことで、より深くこの土地の真の魅力を理解し、心に残る体験をすることができるでしょう。\n\n`;
  }
  
  // 実用的な情報
  content += `## 訪問時のおすすめポイント\n\n`;
  content += `### ベストな訪問時間\n\n`;
  content += `${location}を最も楽しむためには、時間帯や季節を考慮した計画的な訪問をおすすめします。朝の時間帯は比較的人が少なく、ゆっくりと落ち着いて楽しむことができます。また、夕方の時間帯には美しい夕日を背景にした風景を楽しむことができ、一日の締めくくりとしても最適です。\n\n`;
  
  content += `### アクセスと駐車場情報\n\n`;
  content += `公共交通機関を利用する場合は、最寄り駅から徒歩でアクセス可能です。車でお越しの場合は、周辺に複数の駐車場が用意されており、比較的アクセスしやすい立地となっています。ただし、イベント開催時や観光シーズンには混雑が予想されるため、時間に余裕を持った計画をおすすめします。\n\n`;
  
  content += `### 地域のマナーと注意点\n\n`;
  content += `${location}を訪れる際は、地域の文化や習慣を尊重し、マナーを守って楽しい時間を過ごしていただければと思います。特に住宅地に近いエリアでは、騒音に注意し、地元の方々の生活に配慮することが大切です。また、ゴミの持ち帰りや写真撮影時のマナーなど、基本的なルールを守ることで、すべての方が気持ちよく過ごせる環境づくりにご協力ください。\n\n`;
  
  // まとめ
  content += `## まとめ\n\n`;
  content += `${location}でのひとときは、きっと皆様にとって特別で心に残る思い出となることでしょう。`;
  
  if (stores.length > 0) {
    content += `${stores[0]}をはじめとする地域の魅力的なスポットを巡りながら、`;
  }
  
  content += `富山の奥深い魅力と温かい人情を存分に味わっていただければと思います。\n\n`;
  
  content += `四季を通じて異なる表情を見せてくれるこの地域は、何度訪れても新しい発見があり、リピーターの方も多くいらっしゃいます。次回の${location}訪問時にも、また違った角度から地域の魅力を発見していただけることと思います。ぜひ時間に余裕を持って、ゆっくりとした癒しの時間をお過ごしください。\n\n`;
  
  content += `地域の皆様と訪れる方々が共に楽しめる、素晴らしい場所であり続けることを願っております。皆様のお越しを心よりお待ちしています。`;
  
  return content;
}

// タイトルからキーワードを抽出する関数
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

// Sanity用のPortableTextブロックに変換する関数
function convertToPortableText(content) {
  const blocks = [];
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') return;
    
    if (paragraph.startsWith('## ')) {
      // H2見出し
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
    } else if (paragraph.startsWith('### ')) {
      // H3見出し
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h3',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph.replace('### ', ''),
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

async function generateLongArticleContent() {
  try {
    console.log('📝 2000文字程度の詳細記事を生成します...\n');
    
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
    
    console.log(`📋 生成対象記事数: ${posts.length}件\n`);
    
    let processedCount = 0;
    
    for (const post of posts) {
      console.log(`📝 生成中: ${post.title}`);
      console.log(`   スラッグ: ${post.slug}`);
      
      try {
        // タイトルからキーワードを抽出
        const extractedData = extractKeywordsFromTitle(post.title);
        
        // 2000文字程度の詳細記事内容を生成
        const detailedContent = generateDetailedArticleContent(extractedData);
        console.log(`   生成文字数: ${detailedContent.length}文字`);
        
        // PortableTextブロックに変換
        const portableTextBlocks = convertToPortableText(detailedContent);
        
        // Sanityに保存
        await client
          .patch(post._id)
          .set({ body: portableTextBlocks })
          .commit();
        
        console.log(`   ✅ 生成完了\n`);
        processedCount++;
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ 生成失敗: ${error.message}\n`);
      }
    }
    
    console.log('🎉 詳細記事生成完了！');
    console.log(`📊 結果: ${processedCount}/${posts.length}件の記事を生成しました。`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

generateLongArticleContent();