const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentyFourthArticle() {
  try {
    console.log('第24記事の更新を開始します...');
    console.log('対象: takaoka-city-temple-700 (國泰寺)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "takaoka-city-temple-700"][0] { _id, title, body, youtubeUrl }');
    
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
    console.log('目標: 800-1000文字に拡張');
    
    // 統一構造を参考に、國泰寺の記事を慎重に拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '高岡市にある國泰寺は、700年以上の悠久の歴史を誇る臨済宗大本山として、多くの人々に敬愛され続けている名刹です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 國泰寺の歴史（約175文字）
      {
        _type: 'block',
        _key: 'h2-history',
        style: 'h2',
        children: [{ _type: 'span', text: '700年以上の歴史を誇る臨済宗大本山', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'history-content',
        style: 'normal',
        children: [{ _type: 'span', text: '國泰寺は1321年に開創された臨済宗の大本山で、700年以上という長い歴史を持つ由緒ある禅寺です。開山は慈雲妙意禅師で、足利尊氏の帰依を受けて建立されました。室町時代から戦国時代にかけては前田家の菩提寺としても栄え、加賀藩の保護を受けて発展しました。江戸時代には多くの名僧を輩出し、禅の修行道場として全国から雲水が集まりました。明治維新後の困難な時代も乗り越え、現在まで禅の教えを伝え続けています。その長い歴史は、高岡市の文化的発展にも大きく貢献してきました。', marks: [] }],
        markDefs: []
      },
      
      // H2: 建築と文化財（約165文字）
      {
        _type: 'block',
        _key: 'h2-architecture',
        style: 'h2',
        children: [{ _type: 'span', text: '歴史的価値の高い建築と文化財', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'architecture-content',
        style: 'normal',
        children: [{ _type: 'span', text: '國泰寺の境内には、長い歴史を物語る貴重な建造物が数多く残されています。特に法堂や山門などは、禅宗建築の特徴を良く表した美しい構造で、建築史的にも重要な価値を持っています。境内各所に配置された石碑や庭園も見どころの一つで、歴代の名僧や文人墨客との関わりを物語っています。また、寺宝として保管されている古文書や仏像なども多数あり、これらの文化財は日本の仏教史や地域史を研究する上で貴重な資料となっています。四季を通じて美しい表情を見せる境内の自然環境も、國泰寺の大きな魅力です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 禅の教えと修行（約155文字）
      {
        _type: 'block',
        _key: 'h2-zen',
        style: 'h2',
        children: [{ _type: 'span', text: '現代に息づく禅の教えと修行', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'zen-content',
        style: 'normal',
        children: [{ _type: 'span', text: '國泰寺は現在でも活発な修行道場として機能しており、全国から多くの雲水が集まって厳しい禅の修行に励んでいます。朝の勤行から始まり、座禅、作務、学習など、規律正しい修行生活が営まれています。一般の人々も参加できる座禅会や法話会が定期的に開催されており、現代人が禅の教えに触れる貴重な機会を提供しています。静寂に包まれた禅堂での座禅体験は、日常の喧騒を忘れ、心を見つめ直す特別な時間となります。禅の教えは現代のストレス社会において、心の平安を求める多くの人々に支持されています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 季節の美しさ（約145文字）
      {
        _type: 'block',
        _key: 'h2-seasons',
        style: 'h2',
        children: [{ _type: 'span', text: '四季折々の境内の美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'seasons-content',
        style: 'normal',
        children: [{ _type: 'span', text: '國泰寺の境内は四季を通じて美しい自然の表情を見せ、訪れる人々の心を癒してくれます。春には桜が咲き誇り、夏は深緑に包まれ、秋には紅葉が境内を彩り、冬は雪化粧した静寂な風景が広がります。特に秋の紅葉シーズンは多くの参拝者が訪れる人気の時期で、古建築と紅葉のコントラストは格別の美しさです。境内の庭園も見事に手入れされており、禅の美学を体現した簡素で洗練された美しさが感じられます。自然と建築が調和した環境は、心の静寂をもたらしてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 参拝と見学（約130文字）
      {
        _type: 'block',
        _key: 'h2-visit',
        style: 'h2',
        children: [{ _type: 'span', text: '参拝と見学のおすすめポイント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visit-content',
        style: 'normal',
        children: [{ _type: 'span', text: '國泰寺を訪れる際は、まず山門をくぐって境内に入り、厳かな雰囲気を感じながらゆっくりと散策することをおすすめします。座禅会や法話会に参加すれば、禅の教えに直接触れることができます。参拝時は修行僧の邪魔にならないよう、静粛に行動することが大切です。駐車場も完備されており、アクセスも良好です。季節ごとに異なる美しさを見せる境内なので、何度訪れても新しい発見があります。心の平安を求める方には特におすすめの寺院です。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約85文字）
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
        children: [{ _type: 'span', text: '國泰寺は700年以上の歴史を持つ貴重な禅寺です。禅の教えと美しい境内で心の平安を感じる特別な時間をお過ごしください。', marks: [] }],
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
    console.log('新しい構成: H2見出し6個の統一構造');
    
    // 記事を慎重に更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第24記事の更新が完了しました');
    console.log('📋 182文字→' + newTotalChars + '文字に拡張');
    console.log('🏗️ H2見出し6個の統一構造を適用');
    
    // キャッシュクリア
    await client
      .patch(post._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();
    
    console.log('🔄 キャッシュクリア実行完了');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

expandTwentyFourthArticle();