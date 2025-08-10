const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createTateyamaHelzianWoodArticle() {
  try {
    console.log('🏔️ 立山町ヘルジアン・ウッド記事を作成中...');
    
    const articleData = {
      _type: 'post',
      title: '【立山町】ヘルジアン・ウッド周辺で特別天然記念物と遭遇！？自然観察の醍醐味を体験',
      slug: {
        _type: 'slug',
        current: 'tateyama-town-3'
      },
      youtubeUrl: 'https://youtu.be/HHwdGY71Vds',
      category: '立山町',
      tags: [
        '立山町',
        'ヘルジアン・ウッド',
        '特別天然記念物',
        '自然観察',
        '野生動物',
        '富山県',
        'TOYAMA',
        'YouTube Shorts',
        '#shorts',
        '動画',
        '富山',
        '立山',
        '富山観光',
        '富山旅行',
        '北陸観光',
        '県東部',
        '自然',
        '散歩',
        'レジャー',
        '富山県の観光スポット',
        '富山県でおすすめの場所',
        '富山県の見どころ',
        '富山県の自然'
      ],
      excerpt: '立山町のヘルジアン・ウッド周辺で特別天然記念物との遭遇を期待した自然観察体験をYouTube Shortsでご紹介！自然の中での期待と発見の瞬間をお楽しみください。',
      description: '立山町のヘルジアン・ウッド周辺で特別天然記念物との遭遇を期待した自然観察体験をYouTube Shortsでご紹介！自然の中での期待と発見の瞬間をお楽しみください。',
      publishedAt: new Date().toISOString(),
      body: [
        {
          _type: 'block',
          _key: 'intro',
          style: 'normal',
          children: [{
            _type: 'span',
            _key: 'intro-span',
            text: '立山町にあるヘルジアン・ウッド周辺は、特別天然記念物にも指定される貴重な野生動物との遭遇が期待できる自然豊かなエリアとして知られています。豊富な森林資源と多様な生態系に恵まれたこの地域では、自然観察愛好家や野生動物ファンにとって、日常では体験できない特別な出会いの機会を提供してくれます。期待に胸を膨らませながら特別天然記念物を探索する冒険は、自然の神秘と魅力を深く感じさせてくれる貴重な体験となります。',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'h2-1',
          style: 'h2',
          children: [{
            _type: 'span',
            _key: 'h2-1-span',
            text: 'ヘルジアン・ウッドの自然環境と生態系',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'content-1',
          style: 'normal',
          children: [{
            _type: 'span',
            _key: 'content-1-span',
            text: '立山町のヘルジアン・ウッドは、立山連峰の麓に広がる原生林に近い豊かな森林地帯で、多種多様な野生動物が生息する貴重な自然環境を保持しています。この地域の森林は主に広葉樹と針葉樹の混交林で構成されており、四季を通じて異なる表情を見せる美しい景観が特徴的です。特に春から秋にかけては、様々な野鳥や小動物たちの活動が活発になり、自然観察には絶好の条件が整います。森林内には清らかな小川も流れており、水辺を好む生物たちの生活圏としても重要な役割を果たしています。また、この地域特有の植生は、特別天然記念物に指定される貴重な動物たちにとって理想的な生息環境を提供しており、運が良ければ普段は見ることのできない珍しい野生動物に遭遇することもあります。',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'h2-2',
          style: 'h2',
          children: [{
            _type: 'span',
            _key: 'h2-2-span',
            text: '特別天然記念物との遭遇への期待と現実',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'content-2',
          style: 'normal',
          children: [{
            _type: 'span',
            _key: 'content-2-span',
            text: 'ヘルジアン・ウッド周辺での特別天然記念物探索は、期待と驚きに満ちた自然体験となります。この地域には、ニホンカモシカやツキノワグマなど、特別天然記念物や天然記念物に指定される貴重な動物たちが生息している可能性があり、自然観察者にとっては憧れの遭遇体験を求めて多くの人が訪れます。しかし、野生動物との出会いは予測不可能で、時には期待とは異なる展開になることもあります。それでも、そうした予想外の出来事こそが自然観察の醍醐味であり、自然の神秘性を実感させてくれる貴重な瞬間となります。森の中を静かに歩きながら、動物たちの痕跡を探したり、鳴き声に耳を傾けたりする時間は、都市部では味わえない特別な体験です。たとえ目的の動物に出会えなくても、豊かな森林環境の中で過ごす時間そのものが、心身のリフレッシュと自然への理解を深める機会となります。',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'h2-3',
          style: 'h2',
          children: [{
            _type: 'span',
            _key: 'h2-3-span',
            text: '自然観察の楽しみ方と安全な探索のコツ',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'content-3',
          style: 'normal',
          children: [{
            _type: 'span',
            _key: 'content-3-span',
            text: 'ヘルジアン・ウッド周辺での自然観察を最大限に楽しむためには、適切な準備と心構えが重要です。まず、野生動物の活動が活発になる早朝や夕方の時間帯を選ぶことで、遭遇の可能性を高めることができます。また、動物たちを驚かせないよう、静かに行動し、急な動きは避けることが大切です。観察に適した服装として、自然に溶け込む色合いの服を着用し、足音を立てにくい靴を選ぶことをおすすめします。双眼鏡やカメラを持参することで、遠くからでも詳細な観察や記録が可能になります。安全面では、一人での探索は避け、できるだけ複数人で行動することが重要です。また、携帯電話の電波状況を事前に確認し、緊急時の連絡手段を確保しておくことも必要です。天候の変化にも注意を払い、悪天候時の探索は控えるなど、安全第一で自然観察を楽しむことが何より大切です。',
            marks: []
          }]
        },
        
        {
          _type: 'block',
          _key: 'conclusion',
          style: 'normal',
          children: [{
            _type: 'span',
            _key: 'conclusion-span',
            text: '立山町のヘルジアン・ウッド周辺での特別天然記念物探索は、期待通りの結果が得られなくても、自然の奥深さと魅力を体感できる価値ある体験です。予想外の展開も含めて、自然観察の醍醐味を存分に味わいながら、富山県の豊かな自然環境の素晴らしさを実感してください。立山町を訪れる際には、ぜひこの特別な自然体験にチャレンジしてみてください。',
            marks: []
          }]
        }
      ]
    };
    
    console.log('📝 記事データを作成中...');
    
    const result = await client.create(articleData);
    
    console.log('\n✅ 立山町ヘルジアン・ウッド記事の作成が完了しました！');
    console.log('📊 作成結果:');
    console.log(`   記事ID: ${result._id}`);
    console.log(`   タイトル: ${result.title}`);
    console.log(`   スラッグ: ${result.slug.current}`);
    console.log(`   YouTube URL: ${result.youtubeUrl}`);
    console.log(`   カテゴリー: ${result.category}`);
    console.log(`   記事URL: https://sasakiyoshimasa.com/blog/${result.slug.current}`);
    
    // 文字数カウント
    const totalChars = result.body.reduce((count, block) => {
      if (block.children) {
        return count + block.children.reduce((blockCount, child) => {
          return blockCount + (child.text ? child.text.length : 0);
        }, 0);
      }
      return count;
    }, 0);
    
    console.log(`\n📊 記事統計:`);
    console.log(`   総文字数: ${totalChars}文字`);
    console.log(`   ブロック数: ${result.body.length}`);
    console.log(`   タグ数: ${result.tags.length}`);
    
    console.log('\n🎯 記事の特徴:');
    console.log('📱 YouTube動画連携でエンゲージメント向上');
    console.log('🔍 SEO最適化されたタイトルと構成');
    console.log('📝 モバイル読者を意識した2000文字台の構成');
    console.log('🏷️ 関連性の高いタグでカテゴリー横断検索対応');
    console.log('📖 H2見出し3つでスキャナビリティを重視');
    
    return {
      success: true,
      articleId: result._id,
      slug: result.slug.current,
      charCount: totalChars,
      youtubeUrl: result.youtubeUrl
    };
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error);
    return { success: false, error: error.message };
  }
}

createTateyamaHelzianWoodArticle();