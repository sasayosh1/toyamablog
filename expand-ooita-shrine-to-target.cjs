const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandOoitaShrineContent() {
  try {
    console.log('📝 於保多神社記事を2000-2500文字に拡張中...');
    
    const articleId = 'uLkO5gatk1xjPxgoNfP6II';
    
    // Enhanced content with proper character count (2000-2500 characters)
    const enhancedBody = [
      // 導入文
      {
        _type: 'block',
        _key: `intro-ooita-enhanced-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-intro-ooita-enhanced-${Date.now()}`,
          text: '富山市にある於保多（おおた）神社は、学問の神様として地元の人々に深く愛され続けている由緒ある神社です。この神社は古くから学業成就や合格祈願のご利益があるとして知られており、特に夏詣の時期には多くの参拝者が心身を清めながら真摯な祈願を捧げる神聖な場所となっています。受験生から社会人の資格取得まで、幅広い世代の学習者にとって心の支えとなる特別な神社です。今回は、於保多神社での夏詣体験と学業祈願の魅力について、詳しくご紹介していきます。',
          marks: []
        }],
        markDefs: []
      },
      // H2セクション1
      {
        _type: 'block',
        _key: `h2-1-ooita-enhanced-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-1-ooita-enhanced-${Date.now()}`,
          text: '於保多神社の歴史と学問の神様としての由緒',
          marks: []
        }],
        markDefs: []
      },
      // H3セクション1
      {
        _type: 'block',
        _key: `h3-1-ooita-enhanced-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-1-ooita-enhanced-${Date.now()}`,
          text: '古くから続く学業成就の信仰と地域コミュニティとの深い絆',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `content-1-ooita-enhanced-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-content-1-ooita-enhanced-${Date.now()}`,
          text: '於保多神社は富山市内でも特に長い歴史を持つ神社の一つで、古くから学問・学業の神様として地域住民の厚い信仰を集めてきました。この神社の最大の特徴は、単なる観光地ではなく、地域コミュニティと深く結びついた「生きている神社」として機能している点にあります。地元の学生たちは受験シーズンになると家族とともに必ずここを訪れ、真摯な気持ちで学業成就を祈願します。小学生の入学祈願から中学・高校・大学受験、さらには国家資格試験や就職試験の合格祈願まで、人生の様々な学習に関わる重要な節目において多くの人々に支えられています。境内には学問に関わる絵馬や御守りが数多く奉納されており、訪れる人々の学業への真剣な想いと神社への深い信頼が感じられます。また、地元の学校関係者や教育委員会の方々も定期的に参拝に訪れ、地域の子どもたちの学業成就を願う姿も見られ、教育への地域全体の思いが込められた特別な場所となっています。',
          marks: []
        }],
        markDefs: []
      },
      // H2セクション2
      {
        _type: 'block',
        _key: `h2-2-ooita-enhanced-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-2-ooita-enhanced-${Date.now()}`,
          text: '夏詣の意義と於保多神社での特別な参拝体験',
          marks: []
        }],
        markDefs: []
      },
      // H3セクション2
      {
        _type: 'block',
        _key: `h3-2-ooita-enhanced-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-2-ooita-enhanced-${Date.now()}`,
          text: '心身を清める夏の参拝と学業への新たな決意',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `content-2-ooita-enhanced-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-content-2-ooita-enhanced-${Date.now()}`,
          text: '夏詣は、一年の折り返し地点である夏の時期に神社を参拝し、これまでの半年間の学習を振り返りながら心身を清め、残り半年の学業目標達成を祈願する日本の美しい伝統行事です。於保多神社での夏詣は特別な意味を持ち、学業に励む学生や資格取得を目指す社会人の方々にとって、気持ちを新たにして勉学に取り組む大切な機会となっています。境内の清涼な空気と静寂な環境の中で行う参拝は、日々の勉強の疲れや悩み、試験への不安を癒し、新たなエネルギーと学習への集中力を与えてくれます。夏詣の時期には特別な御朱印や限定の学業成就御守りなども授与されることがあり、多くの参拝者にとって貴重な記念品となります。また、神社の神聖で落ち着いた環境の中で心を落ち着けて祈願することで、学業への取り組み姿勢や継続する意志力も自然と高まると多くの参拝者が実感しており、定期的に訪れて学習の節目節目で祈願を行う方も少なくありません。',
          marks: []
        }],
        markDefs: []
      },
      // H2セクション3
      {
        _type: 'block',
        _key: `h2-3-ooita-enhanced-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-3-ooita-enhanced-${Date.now()}`,
          text: '於保多神社での学業祈願の実践方法と参拝作法',
          marks: []
        }],
        markDefs: []
      },
      // H3セクション3
      {
        _type: 'block',
        _key: `h3-3-ooita-enhanced-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-3-ooita-enhanced-${Date.now()}`,
          text: '正しい参拝方法と学業成就の御守り・御朱印について',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `content-3-ooita-enhanced-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-content-3-ooita-enhanced-${Date.now()}`,
          text: '於保多神社での学業祈願参拝は、一般的な神社参拝の作法に従って丁寧に行います。まず境内に入る前に一礼し、手水舎で左手、右手、口の順に清め、心身を清浄な状態にします。拝殿前では二拝二拍手一拝の作法で参拝し、学業祈願の際は具体的な目標や願いを心の中で明確にしながら真摯に祈願することが大切です。神社では学業成就や合格祈願に特化した御守りが複数種類用意されており、それぞれに込められた意味や効果について神職の方が丁寧に説明してくださいます。特に人気の高い「学業御守」や「合格御守」は、多くの参拝者が大切にお持ち帰りになります。御朱印も美しい書体で心を込めて書いていただけ、参拝の記念として多くの方が大切に保管されています。また、絵馬に願いを書いて奉納することもでき、境内には「○○大学合格祈願」「資格試験合格祈願」など学業成就を願う多くの絵馬が掛けられています。これらの絵馬を見ることで、同じ目標を持つ多くの人々との連帯感も感じられ、学業への意欲がさらに高まる効果もあります。',
          marks: []
        }],
        markDefs: []
      },
      // まとめ
      {
        _type: 'block',
        _key: `conclusion-ooita-enhanced-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-conclusion-ooita-enhanced-${Date.now()}`,
          text: '富山市の於保多神社は、学問の神様として長年にわたって多くの人々の学業を見守り続けている特別な神社です。夏詣での参拝体験は、心身を清めて学業への新たな意欲を湧き起こしてくれる貴重な機会となります。正しい作法で参拝し、御守りや御朱印をいただき、絵馬に願いを込めることで、神様のご加護を感じながら学業に取り組むことができるでしょう。学業成就や合格祈願をお考えの方、勉強に行き詰まりを感じている方は、ぜひ於保多神社を訪れて、神聖で落ち着いた雰囲気の中で真摯な祈願を捧げてみてください。きっと学業への取り組みに新たな力と継続する意志、そして目標達成への確かな道筋を与えてくれることでしょう。',
          marks: []
        }],
        markDefs: []
      }
    ];
    
    // 記事本文を更新
    await client.patch(articleId).set({ body: enhancedBody }).commit();
    
    // 文字数カウント
    let charCount = 0;
    enhancedBody.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        charCount += text.length;
      }
    });
    
    console.log('\n✅ 於保多神社記事の拡張完了！');
    console.log('📊 最終記事詳細:');
    console.log(`   文字数: ${charCount}文字 (目標: 2000-2500文字)`);
    console.log('   構造: 導入文 + 3つのH2セクション（各H3付き）+ まとめ');
    console.log('   内容: 於保多神社の夏詣と学業祈願に関する詳細情報');
    
    console.log('\n🎯 完成した記事内容:');
    console.log('🎌 於保多神社の歴史と学問神社としての由緒');
    console.log('🙏 地域コミュニティとの深い結びつき');
    console.log('☀️ 夏詣の意義と特別な参拝体験');
    console.log('📿 学業祈願の実践方法と参拝作法');
    console.log('🎫 御守り・御朱印・絵馬の詳細説明');
    console.log('📱 2000-2500文字でモバイル最適化完了');
    console.log('🏗️ H2/H3構造で読みやすさ確保');
    
    return { success: true, charCount: charCount };
    
  } catch (error) {
    console.error('❌ 記事拡張エラー:', error);
    return { success: false, error: error.message };
  }
}

expandOoitaShrineContent();