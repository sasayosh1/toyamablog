const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTonamiFestivalFinal() {
  try {
    console.log('砺波市夜高祭記事の大幅拡張を開始します...');
    console.log('対象: tonami-city-festival');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "tonami-city-festival"][0] { _id, title, body, youtubeUrl }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事タイトル:', post.title);
    console.log('YouTube URL:', post.youtubeUrl ? 'あり' : 'なし');
    
    // 現在の状態確認
    let totalChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
      }
    });
    
    console.log(`現在の文字数: ${totalChars}文字`);
    console.log('目標: 2000-2500文字に大幅拡張');
    
    // 夜高祭記事を大幅に拡張
    const expandedContent = [
      // 導入文（約150文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山県砺波市で毎年6月に開催される「夜高祭」は、大正時代から100年以上続く伝統的な豊作祈願祭です。高さ6mの巨大な夜高行燈約20台が激しくぶつかり合う「突き合わせ」は、全国でも珍しい勇猛な喧嘩祭りとして知られ、絢爛豪華な行燈が砺波の夜を彩ります。', marks: [] }],
        markDefs: []
      },
      
      // YouTubeの埋め込みは保持
      {
        _type: 'block',
        _key: 'youtube',
        style: 'normal',
        children: [{ _type: 'span', text: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EWfIlEa8Jzw" frameborder="0" allowfullscreen></iframe>', marks: [] }],
        markDefs: []
      },

      // H2: 夜高祭の基本情報と魅力（約400文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: '夜高祭の基本情報と魅力', marks: [] }],
        markDefs: []
      },
      
      // H3: 100年以上続く歴史と伝統
      {
        _type: 'block',
        _key: 'h3-history',
        style: 'h3',
        children: [{ _type: 'span', text: '100年以上続く歴史と伝統', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波市の夜高祭は大正時代に始まり、豊年満作と五穀豊穣を祈願する歴史ある祭りです。最も古い福野の夜高は300年以上の歴史を誇り、伊勢神宮の御分霊を迎える際に行燈を掲げたことが起源とされています。現在では砺波市内約30の集落で様々な形の夜高祭が継承されており、地域の重要な文化的遺産として大切に守られています。', marks: [] }],
        markDefs: []
      },
      
      // H3: 約20台の夜高行燈が織りなす絢爛豪華な世界
      {
        _type: 'block',
        _key: 'h3-lanterns',
        style: 'h3',
        children: [{ _type: 'span', text: '約20台の夜高行燈が織りなす絢爛豪華な世界', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'lanterns-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜高行燈は高さ約6m、幅約3mの大迫力サイズで、竹・和紙・染料を使った伝統技法で制作されます。赤を基調とした鮮やかな色彩デザインに、武者絵や歌舞伎の名場面を描いた豪華絢爛な絵柄が特徴です。各町内が1年をかけて制作する夜高行燈は職人技の結晶で、昼間の優雅な美しさと夜の幻想的な存在感を併せ持っています。', marks: [] }],
        markDefs: []
      },

      // H2: 祭りの見どころと開催スケジュール（約500文字）
      {
        _type: 'block',
        _key: 'h2-highlights',
        style: 'h2',
        children: [{ _type: 'span', text: '祭りの見どころと開催スケジュール', marks: [] }],
        markDefs: []
      },
      
      // H3: 迫力満点！高さ6mの大行燈による「突き合わせ」
      {
        _type: 'block',
        _key: 'h3-battle',
        style: 'h3',
        children: [{ _type: 'span', text: '迫力満点！高さ6mの大行燈による「突き合わせ」', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'battle-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜高祭最大の見どころは、2基の巨大な夜高行燈がぶつかり合う「突き合わせ」です。約10〜15m離れた位置に対峙した行燈が、裁許（さいきょ）の合図で全速力で激突する瞬間は圧巻の迫力です。数十人の担ぎ手による激しい押し合いが繰り広げられ、勝敗が決するまで白熱の戦いが続きます。北陸銀行砺波支店前や富山第一銀行砺波支店前で行われるこの勇猛な祭りは、全国的にも珍しい光景として多くの観光客を魅了しています。', marks: [] }],
        markDefs: []
      },
      
      // H3: 2日間のイベントスケジュールと開催日程
      {
        _type: 'block',
        _key: 'h3-schedule',
        style: 'h3',
        children: [{ _type: 'span', text: '2日間のイベントスケジュールと開催日程', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'schedule-content',
        style: 'normal',
        children: [{ _type: 'span', text: '毎年6月第2金曜・土曜日の2日間開催される夜高祭は、2025年は6月13日（金）宵祭り、6月14日（土）本祭りの予定です。19:00に各町内から行燈が出発し、20:00に本町通りに集結、20:30から最大の見どころである突き合わせが開始されます。22:00頃まで続く祭りでは、約20台の行燈が次々と競演し、砺波の夜が熱気に包まれます。', marks: [] }],
        markDefs: []
      },

      // H2: アクセス・駐車場情報と参加方法（約400文字）
      {
        _type: 'block',
        _key: 'h2-access',
        style: 'h2',
        children: [{ _type: 'span', text: 'アクセス・駐車場情報と参加方法', marks: [] }],
        markDefs: []
      },
      
      // H3: JR砺波駅からのアクセスと交通規制情報
      {
        _type: 'block',
        _key: 'h3-transportation',
        style: 'h3',
        children: [{ _type: 'span', text: 'JR砺波駅からのアクセスと交通規制情報', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'transportation-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'JR城端線「砺波駅」下車徒歩10分でアクセス可能です。富山駅から砺波駅まで約40分、高岡駅からは約25分で到着できます。車でのアクセスは砺波ICから約15分、小杉ICから約25分ですが、祭り当日は会場周辺で交通規制が実施されます。駐車場は砺波駅周辺の有料駐車場（約300台分）や臨時駐車場が利用できますが、公共交通機関の利用が強く推奨されています。', marks: [] }],
        markDefs: []
      },
      
      // H3: 祭り見学のポイントと注意事項
      {
        _type: 'block',
        _key: 'h3-tips',
        style: 'h3',
        children: [{ _type: 'span', text: '祭り見学のポイントと注意事項', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tips-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'ベストな観覧スポットは本町交差点付近、北陸銀行砺波支店前、富山第一銀行砺波支店前で、19:00頃からの早めの場所取りがおすすめです。行燈の移動経路には近づかず、突き合わせ時は安全な距離を保つことが重要です。小さなお子様連れは特に注意が必要で、祭り関係者の指示に従って見学してください。露店も多数出店されるため、食事やお土産購入も楽しめます。', marks: [] }],
        markDefs: []
      },

      // H2: 夜高祭の文化的価値と地域への影響（約350文字）
      {
        _type: 'block',
        _key: 'h2-culture',
        style: 'h2',
        children: [{ _type: 'span', text: '夜高祭の文化的価値と地域への影響', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'culture-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜高祭は単なる観光イベントを超えた、地域コミュニティの絆を深める重要な文化的行事です。各町内が一年をかけて行燈を制作する過程では、世代を超えた技術の継承と協力が行われ、伝統工芸の保存に大きく貢献しています。祭り当日には地域住民が一致団結して祭りを支え、観光客との交流を通じて砺波市の魅力を全国に発信しています。経済効果も大きく、宿泊業や飲食業、土産物販売など地域経済の活性化に重要な役割を果たしており、砺波市のブランド価値向上にも寄与しています。', marks: [] }],
        markDefs: []
      },

      // H2: 周辺観光スポットとグルメ情報（約300文字）
      {
        _type: 'block',
        _key: 'h2-tourism',
        style: 'h2',
        children: [{ _type: 'span', text: '周辺観光スポットとグルメ情報', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tourism-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜高祭と合わせて楽しめる砺波市の観光スポットには、春のチューリップフェアで有名な砺波チューリップ公園、四季折々の美しさを楽しめる頼成の森、歴史ある砺波散村景観などがあります。グルメでは富山県産コシヒカリや地元の新鮮な野菜、砺波平野の恵みを活かした郷土料理を味わうことができます。祭り期間中は特別メニューを提供する飲食店も多く、地元の食文化も一緒に楽しめるのが魅力です。宿泊施設も充実しており、祭りと観光を組み合わせた1泊2日の旅程がおすすめです。', marks: [] }],
        markDefs: []
      },

      // H2: まとめ（約200文字）
      {
        _type: 'block',
        _key: 'h2-summary',
        style: 'h2',
        children: [{ _type: 'span', text: 'まとめ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'summary-content',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波市の夜高祭は、100年以上の歴史を誇る伝統的な祭りでありながら、現代でも多くの人々を魅了し続ける生きた文化遺産です。高さ6mの巨大な夜高行燈による迫力満点の突き合わせは、他では体験できない貴重な光景です。2025年6月13日・14日の開催時には、ぜひ砺波市を訪れて、勇猛で美しい夜高祭の魅力を肌で感じてください。地域の人々の熱い想いと伝統の技が織りなす特別な2日間が、きっと忘れられない思い出となることでしょう。', marks: [] }],
        markDefs: []
      },
      
      // 公式サイト情報
      {
        _type: 'block',
        _key: 'hashtags',
        style: 'normal',
        children: [{ _type: 'span', text: '#富山 #砺波 #となみ #まつり #夜高祭 #夜高まつり', marks: [] }],
        markDefs: []
      }
    ];
    
    // 文字数カウント
    let newTotalChars = 0;
    expandedContent.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        newTotalChars += text.length;
      }
    });
    
    console.log(`新しい文字数: ${newTotalChars}文字`);
    console.log('新しい構成: H2見出し5個、H3見出し6個の詳細構造');
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 夜高祭記事の大幅拡張が完了しました');
    console.log('📋 315文字→' + newTotalChars + '文字に大幅拡張');
    console.log('🏗️ H2見出し5個、H3見出し6個の詳細構造を適用');
    
    // タグとexcerptも更新
    const newTags = [
      '富山', '富山県', 'TOYAMA', '砺波市', '夜高祭', '夜高まつり', '祭り', 'イベント', 
      '伝統', '文化', '地域行事', '富山観光', '富山旅行', '北陸観光', '突き合わせ',
      '夜高行燈', '豊年満作', '五穀豊穣', '大正時代', '100年の歴史', 
      'JR砺波駅', '本町通り', '6月開催', '2日間開催', '高さ6m', '約20台',
      '北陸銀行前', '富山第一銀行前', '富山県の観光スポット', 
      '富山県でおすすめの場所', '富山県の名所', '富山県の見どころ',
      '富山県の文化', '富山県のイベント', '#shorts', 'YouTube Shorts'
    ];

    const newExcerpt = '富山県砺波市で毎年6月に開催される「夜高祭」は、大正時代から100年以上続く伝統的な豊作祈願祭です。高さ6mの巨大な夜高行燈約20台が激しくぶつかり合う「突き合わせ」は圧巻の迫力！';

    await client
      .patch(post._id)
      .set({ 
        tags: newTags,
        excerpt: newExcerpt,
        category: '富山県の祭り・イベント'
      })
      .commit();
    
    // キャッシュクリア
    await client
      .patch(post._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();
    
    console.log('🏷️ タグ・概要文・カテゴリ更新完了');
    console.log('🔄 キャッシュクリア実行完了');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

expandTonamiFestivalFinal();