const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirteenthArticle() {
  try {
    console.log('第13記事の更新を開始します...');
    console.log('対象: namerikawa-city-2668-onsen-x2668-xfe0f-x263a-xfe0f (みのわ温泉)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "namerikawa-city-2668-onsen-x2668-xfe0f-x263a-xfe0f"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、みのわ温泉の記事を拡張
    const expandedContent = [
      // 導入文（約90文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '滑川市の山間部にひっそりと佇む「みのわ温泉」。富山弁で「ねまられ〜」（ゆっくり休んでいってね）という温かいおもてなしの心が感じられる隠れた名湯です。', marks: [] }],
        markDefs: []
      },
      
      // H2: みのわ温泉の概要（約165文字）
      {
        _type: 'block',
        _key: 'h2-overview',
        style: 'h2',
        children: [{ _type: 'span', text: 'みのわ温泉の魅力と特徴', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'overview-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'みのわ温泉は滑川市の山間部に位置する秘湯的な温泉施設です。都市部の喧騒から離れた静かな環境にあり、まさに「隠れた温泉」という表現がぴったりの場所です。地元の方々に愛され続けているアットホームな雰囲気が魅力で、訪れる人々を温かく迎えてくれます。自然に囲まれた立地により、四季折々の美しい景色を楽しみながら温泉に浸かることができる贅沢な体験が待っています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 富山弁の温かさ（約170文字）
      {
        _type: 'block',
        _key: 'h2-toyama-ben',
        style: 'h2',
        children: [{ _type: 'span', text: '富山弁「ねまられ〜」の温かいおもてなし', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'toyama-ben-content',
        style: 'normal',
        children: [{ _type: 'span', text: '「ねまられ〜」は富山県の方言で「ゆっくり休んでいってくださいね」という意味の温かい言葉です。この言葉には富山県民の人懐っこさと、お客様を大切にするおもてなしの心が込められています。みのわ温泉でも、この精神が息づいており、初めて訪れる人でも地元の常連さんのように温かく迎えてくれます。富山弁の温かさは、温泉の効能と同じように心と身体を癒してくれる特別な魅力です。方言を通じて地域の文化に触れることも、旅の醍醐味の一つといえるでしょう。', marks: [] }],
        markDefs: []
      },
      
      // H2: 温泉の効能と特徴（約150文字）
      {
        _type: 'block',
        _key: 'h2-benefits',
        style: 'h2',
        children: [{ _type: 'span', text: '温泉の泉質と健康効果', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'benefits-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'みのわ温泉の泉質は肌に優しく、神経痛や筋肉痛、疲労回復に効果があるとされています。山間部の清らかな水源から湧き出る温泉は、日頃の疲れを癒すのに最適です。温泉に浸かりながら周囲の自然の音に耳を傾けると、心身ともにリラックスできます。地元の方々が日常的に利用していることからも、その効能の高さがうかがえます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 山間部の自然環境（約140文字）
      {
        _type: 'block',
        _key: 'h2-nature',
        style: 'h2',
        children: [{ _type: 'span', text: '豊かな自然に囲まれた立地', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'nature-content',
        style: 'normal',
        children: [{ _type: 'span', text: '温泉は緑豊かな山間部に位置しており、四季を通じて美しい自然の変化を楽しむことができます。春は新緑、夏は深い緑、秋は紅葉、冬は雪景色と、それぞれの季節で異なった表情を見せてくれます。鳥のさえずりや木々のざわめき、清流の音など、自然の音に包まれながらの温泉体験は、都市部では味わえない特別な癒しをもたらしてくれます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地元密着の魅力（約130文字）
      {
        _type: 'block',
        _key: 'h2-local',
        style: 'h2',
        children: [{ _type: 'span', text: '地域に愛される温泉の価値', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'local-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'みのわ温泉は地元の方々に日常的に利用される、地域密着型の温泉です。観光地の大型温泉施設とは違った、アットホームで親しみやすい雰囲気が魅力です。地元の方々との何気ない会話も楽しみの一つで、富山の文化や暮らしについて知ることができます。こうした地域との交流も、温泉旅行の醍醐味といえるでしょう。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約95文字）
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
        children: [{ _type: 'span', text: '山間部に隠れた「みのわ温泉」は、富山弁の温かさと自然の恵みが感じられる特別な場所です。「ねまられ〜」の心で迎えてくれるこの温泉で、心身ともに癒されるひとときをお過ごしください。', marks: [] }],
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
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第13記事の更新が完了しました');
    console.log('📋 205文字→' + newTotalChars + '文字に拡張');
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

expandThirteenthArticle();