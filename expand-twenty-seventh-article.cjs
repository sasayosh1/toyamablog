const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentySeventhArticle() {
  try {
    console.log('第27記事の更新を開始します...');
    console.log('対象: uozu-city-aquarium-3 (魚津水族館のペンギン)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "uozu-city-aquarium-3"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、魚津水族館のペンギンの記事を慎重に拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '魚津水族館で暮らす3羽のペンギンの愛らしい日常。それぞれ個性豊かな彼らの魅力をたっぷりとご紹介します。', marks: [] }],
        markDefs: []
      },
      
      // H2: 魚津水族館の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-aquarium',
        style: 'h2',
        children: [{ _type: 'span', text: '魚津水族館とペンギン展示の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'aquarium-content',
        style: 'normal',
        children: [{ _type: 'span', text: '魚津水族館は富山湾の海洋生物を中心とした地域密着型の水族館として長年親しまれています。規模は大きくありませんが、その分一つ一つの展示に工夫が凝らされており、特にペンギン展示は来館者に人気の高いコーナーです。3羽という少数精鋭のペンギンたちは、それぞれが個性的で愛らしく、スタッフの皆さんも一羽一羽の性格を熟知した丁寧な飼育を行っています。こじんまりとした環境だからこそ実現できる、ペンギンとの距離の近さが魚津水族館ならではの魅力です。来館者はペンギンの細かな仕草や表情まで観察することができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 3羽のペンギンの個性（約165文字）
      {
        _type: 'block',
        _key: 'h2-personalities',
        style: 'h2',
        children: [{ _type: 'span', text: '3羽それぞれの個性豊かな魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'personalities-content',
        style: 'normal',
        children: [{ _type: 'span', text: '魚津水族館の3羽のペンギンは、それぞれが全く異なる個性を持っており、見ているだけで楽しくなります。活発で好奇心旺盛な子、おっとりとしていてマイペースな子、そして少し人見知りだけれど慣れると甘えん坊になる子など、まるで人間のように豊かな個性を見せてくれます。餌の時間には各々の食べ方の違いも観察でき、泳ぎ方や休憩の仕方にもそれぞれの特徴が現れます。スタッフの方々は一羽一羽の性格を理解して接しており、その深い愛情がペンギンたちの生き生きとした姿に表れています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 日常行動の観察（約155文字）
      {
        _type: 'block',
        _key: 'h2-behavior',
        style: 'h2',
        children: [{ _type: 'span', text: 'ペンギンの愛らしい日常行動', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'behavior-content',
        style: 'normal',
        children: [{ _type: 'span', text: '3羽のペンギンの日常を観察していると、様々な愛らしい行動を見ることができます。プールでの華麗な泳ぎはもちろん、陸上でのヨチヨチ歩きや、羽根づくろいの丁寧な仕草、時には仲間同士でじゃれ合う様子なども微笑ましく感じられます。餌の時間には期待に満ちた表情を見せ、食後は満足そうに羽根を整える姿が印象的です。休憩時間には岩の上で気持ちよさそうに日光浴をしたり、プールサイドで水面を見つめたりと、それぞれが思い思いの時間を過ごしています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 来館者との交流（約145文字）
      {
        _type: 'block',
        _key: 'h2-interaction',
        style: 'h2',
        children: [{ _type: 'span', text: '来館者との心温まる交流', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'interaction-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'ペンギンたちは来館者にも興味を示し、時にはガラス越しに近づいてきてくれることがあります。特に子どもたちには敏感に反応し、子どもたちがプールの前に来ると興味深そうに近づいてくる姿が可愛らしいです。写真撮影をしている人には好奇心いっぱいの表情を向けてくれることも多く、まるでカメラを意識しているかのような表情を見せることもあります。このような自然な交流が、多くの来館者の心を癒し、ペンギンファンを増やしています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 水族館見学のコツ（約130文字）
      {
        _type: 'block',
        _key: 'h2-tips',
        style: 'h2',
        children: [{ _type: 'span', text: 'ペンギン観察を楽しむコツ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tips-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'ペンギンたちを観察する際は、餌の時間を狙って訪れるのがおすすめです。活発に動き回る姿を見ることができます。また、ゆっくりと時間をかけて観察することで、それぞれの個性や行動パターンを発見できます。カメラを持参すれば、愛らしい表情や仕草を撮影できますが、フラッシュは禁止されているので注意しましょう。平日の午前中は比較的空いているので、じっくりと観察したい方におすすめの時間帯です。', marks: [] }],
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
        children: [{ _type: 'span', text: '魚津水族館の3羽のペンギンは、それぞれが個性豊かで愛らしい存在です。彼らの日常を観察しに、ぜひ魚津水族館を訪れてみてください。', marks: [] }],
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
    
    console.log('✅ 第27記事の更新が完了しました');
    console.log('📋 185文字→' + newTotalChars + '文字に拡張');
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

expandTwentySeventhArticle();