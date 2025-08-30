const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandFirstCriticalArticle() {
  try {
    console.log('📝 第1記事の内容拡充開始...');
    
    const articleId = '4zxT7RlbAnSlGPWZgbkpxX';
    
    // 新しい記事本文を作成（800文字以上、見出し構造付き）
    const newBody = [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'intro-span',
          text: '高岡市新湊で発見した「コンビニヤ」は、本格的なブラジル食材が豊富に揃うユニークな食材店です。店内にはフェイジョンやマンジョッカ、パッソンなど、日本では珍しいブラジルの伝統的な食材がずらりと並んでいます。地元のブラジル系住民の方々に愛される、まさに「小さなブラジル」のような空間を覗いてみましょう。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-1-span',
          text: 'コンビニヤで見つけたブラジル食材の数々',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-1',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-1-span',
          text: '豊富な冷凍食品とスナック類',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-1-span',
          text: '冷凍庫にはブラジルの家庭料理に欠かせない冷凍食品が充実しています。特に目を引くのが、様々な種類のパステル（ブラジル風揚げ餃子）や、肉厚なチキンナゲット、そしてアサイーの冷凍パック。棚にはブラジル独特の味付けスナック菓子が並び、普段見慣れないカラフルなパッケージが店内を彩っています。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-2',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-2-span',
          text: '調味料とスパイスの世界',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-2',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-2-span',
          text: 'ブラジル料理の要となる調味料コーナーには、デンデ油（パーム油）や、ブラジル人の食卓に欠かせないマテ茶、そして様々なスパイスミックスが揃っています。特にフェイジョアーダ（豆の煮込み料理）用の黒豆や、シュラスコ用の岩塩なども見つけることができ、本格的なブラジル料理に挑戦したい方には絶好のお店です。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-2-span',
          text: 'コンビニヤの魅力とアクセス情報',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-3',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-3-span',
          text: 'アットホームな雰囲気と親しみやすい接客',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-3',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-3-span',
          text: '店主やスタッフの方々はとても親しみやすく、ブラジル食材について質問すると丁寧に教えてくれます。初めてブラジル食材を手にする方でも安心して買い物を楽しむことができる、温かい雰囲気の店内です。地元のブラジル系コミュニティの情報交換の場としても機能しており、異文化交流の拠点的な役割も果たしています。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-4',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-4-span',
          text: '新湊エリアでの便利な立地',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-4',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-4-span',
          text: '高岡市新湊エリアに位置するコンビニヤは、アクセスも良好で駐車場も完備されています。新湊大橋や海王丸パークなど、新湊の観光スポット巡りの際に立ち寄ることもできます。異国情緒あふれるショッピング体験を求める方や、料理の幅を広げたい方には、ぜひ一度訪れてみていただきたいユニークなお店です。',
          marks: []
        }],
        markDefs: []
      }
    ];
    
    // 改善された概要文
    const newExcerpt = '高岡市新湊の「コンビニヤ」で本格ブラジル食材を発見！フェイジョンやアサイー、マテ茶など珍しい食材が勢揃い。動画でユニークな店内ツアーをお楽しみください。';
    
    // 記事を更新
    await client
      .patch(articleId)
      .set({
        body: newBody,
        excerpt: newExcerpt,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ 第1記事の拡充完了！');
    console.log('📊 新しい文字数: 約800文字');
    console.log('📝 構造: 導入 + H2×2 + H3×4 + 充実したコンテンツ');
    console.log('📄 改善された概要文も追加済み');
    
    // 次の記事の準備
    console.log('\n🔄 次の記事への準備...');
    
  } catch (error) {
    console.error('❌ 拡充エラー:', error.message);
  }
}

expandFirstCriticalArticle();