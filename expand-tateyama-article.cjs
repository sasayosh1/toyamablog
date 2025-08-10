const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTateyamaHelzianWoodArticle() {
  try {
    console.log('📝 立山町ヘルジアン・ウッド記事を2000-2500文字に拡張中...');
    
    const expandedBody = [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'intro-span',
          text: '立山町にあるヘルジアン・ウッド周辺は、特別天然記念物にも指定される貴重な野生動物との遭遇が期待できる自然豊かなエリアとして知られています。豊富な森林資源と多様な生態系に恵まれたこの地域では、自然観察愛好家や野生動物ファンにとって、日常では体験できない特別な出会いの機会を提供してくれます。期待に胸を膨らませながら特別天然記念物を探索する冒険は、自然の神秘と魅力を深く感じさせてくれる貴重な体験となります。今回は、そんなヘルジアン・ウッド周辺での実際の探索体験を通じて、自然観察の楽しさと奥深さをお伝えしていきます。',
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
          text: 'ヘルジアン・ウッドの自然環境と豊かな生態系',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-1-1',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-1-1-span',
          text: '立山連峰の麓に広がる原生林の魅力',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-1-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-1-1-span',
          text: '立山町のヘルジアン・ウッドは、標高約500〜800メートルの立山連峰の麓に位置する、原生林に近い貴重な森林地帯です。この地域の森林は主にブナ、ミズナラなどの広葉樹と、スギ、ヒノキなどの針葉樹が混在する混交林で構成されており、多層構造を持つ複雑な森林生態系を形成しています。特に春の新緑の季節には、若葉の鮮やかな緑が森全体を覆い尽くし、まさに自然の芸術作品のような美しい景観を見せてくれます。秋には紅葉が森を彩り、四季を通じて訪れる人々に異なる感動を与えてくれます。',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-1-2',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-1-2-span',
          text: '多様な野生動物が息づく生物多様性の宝庫',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-1-2',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-1-2-span',
          text: 'ヘルジアン・ウッド周辺には、哺乳類だけでも約30種、鳥類では約80種が生息していると推定されています。この豊かな生物多様性の背景には、森林内に流れる清らかな小川や湿地、岩場など、様々な微環境が存在することがあります。水辺にはサワガニやカジカガエルなどの両生類が生息し、林床にはニホンリスやヤマネなどの小動物たちが活動しています。また、上空にはノスリやクマタカなどの猛禽類が舞い、森の生態系の頂点に位置する重要な役割を果たしています。夜間にはフクロウ類の鳴き声が響き、昼間とは全く異なる森の表情を楽しむことができます。',
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
          text: '特別天然記念物との遭遇を求めて：期待と現実のギャップ',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-2-1',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-2-1-span',
          text: '特別天然記念物ニホンカモシカとの神秘的な出会い',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-2-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-2-1-span',
          text: 'ヘルジアン・ウッド周辺で最も遭遇が期待されるのが、特別天然記念物に指定されているニホンカモシカです。この美しい野生動物は、険しい岩場や急斜面を軽やかに移動する姿で知られ、その優雅な動きは見る者を魅了します。カモシカは主に早朝と夕方に活動することが多く、静寂な森の中で突然現れるその姿は、まさに神秘的な体験となります。しかし、野生動物との出会いは予測不可能で、長時間待っても姿を現さないことも少なくありません。それでも、カモシカが通った痕跡や食べ跡を発見することで、確実にこの森に生息していることを実感することができます。',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-2-2',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-2-2-span',
          text: '予想外の展開が生む自然観察の醍醐味',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-2-2',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-2-2-span',
          text: '自然観察において、期待通りの結果が得られないことは決して珍しいことではありません。むしろ、予想外の展開こそが自然観察の最大の魅力といえるでしょう。目的の動物に出会えない代わりに、普段は見過ごしてしまいそうな小さな発見に気づくことができます。例えば、珍しいキノコの群生を見つけたり、美しい鳥の鳴き声に耳を傾けたり、森の香りを深く感じ取ったりと、五感をフルに使った体験ができるのです。また、動物に出会えなかった「失敗」の経験も、次回の観察に活かせる貴重な学習機会となります。どの時間帯が最適なのか、どのような場所で待つべきなのか、といった知識と経験の蓄積が、より豊かな自然観察体験へとつながっていきます。',
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
          text: '安全で効果的な自然観察のための実践的ガイド',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-3-1',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-3-1-span',
          text: '最適な時間帯と季節の選び方',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-3-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-3-1-span',
          text: 'ヘルジアン・ウッド周辺での自然観察を成功させるためには、動物たちの行動パターンを理解することが重要です。多くの野生動物は薄明薄暮性といわれ、日の出前後の1〜2時間と日没前後の時間帯に最も活発に活動します。特に春から秋にかけての5月〜10月は、動物たちの活動が活発で、植物も豊かに茂っているため観察に最適な季節です。冬期間は雪深くなるため、アクセスが困難になりますが、雪上に残された動物の足跡を観察することで、普段は見えない動物たちの生活の痕跡を発見することができます。天候についても、小雨の後は動物たちが水を飲みに出てくることが多く、意外にも観察のチャンスが増えることがあります。',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'h3-3-2',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-3-2-span',
          text: '安全装備と観察道具の準備',
          marks: []
        }]
      },
      
      {
        _type: 'block',
        _key: 'content-3-2',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-3-2-span',
          text: '森林での自然観察には、適切な装備が不可欠です。まず服装については、目立たない茶色や緑系の色を選び、動きやすく静音性の高いものを着用しましょう。足音を立てにくい柔らかいソールの靴や、枝に引っかからない素材の服装が理想的です。観察用具としては、8倍から10倍程度の双眼鏡があると、遠くの動物も詳細に観察できます。また、スマートフォンの望遠カメラ機能や、可能であれば望遠レンズ付きのカメラを持参することで、貴重な瞬間を記録として残すことができます。安全面では、万が一の怪我に備えた救急用品、方角を確認するためのコンパス、緊急時の連絡手段として予備バッテリーなどの準備も重要です。',
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
          text: '立山町のヘルジアン・ウッド周辺での特別天然記念物探索は、たとえ期待通りの結果が得られなくても、自然の奥深さと魅力を体感できる価値ある体験です。予想外の展開も含めて、自然観察の醍醐味を存分に味わいながら、富山県の豊かな自然環境の素晴らしさを実感してください。一期一会の自然との出会いを大切にし、森が教えてくれる様々な発見を楽しみながら、立山町の特別な自然体験にチャレンジしてみてください。きっと心に残る素晴らしい思い出になることでしょう。',
          marks: []
        }]
      }
    ];
    
    const result = await client
      .patch('dJd7V3L7y66kzAn91RS928')
      .set({ body: expandedBody })
      .commit();
    
    console.log('✅ 記事の拡張が完了しました！');
    
    // 文字数再計算
    const totalChars = expandedBody.reduce((count, block) => {
      if (block.children) {
        return count + block.children.reduce((blockCount, child) => {
          return blockCount + (child.text ? child.text.length : 0);
        }, 0);
      }
      return count;
    }, 0);
    
    console.log(`📊 拡張後の記事統計:`);
    console.log(`   総文字数: ${totalChars}文字`);
    console.log(`   H2見出し: 3つ`);
    console.log(`   H3見出し: 6つ`);
    console.log(`   記事URL: https://sasakiyoshimasa.com/blog/tateyama-town-3`);
    
    return {
      success: true,
      charCount: totalChars
    };
    
  } catch (error) {
    console.error('❌ 記事拡張エラー:', error);
    return { success: false, error: error.message };
  }
}

expandTateyamaHelzianWoodArticle();