const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandMediumArticle(article) {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "${article.slug}"][0] { _id, title, body }`);
    if (!post) throw new Error(`記事が見つかりません: ${article.slug}`);

    // 現在の文字数カウント
    let currentChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        currentChars += text.length;
      }
    });

    // 既存コンテンツを保持
    const existingContent = [...post.body];
    
    // スマホ最適化：2000-2500文字、2つのH2セクション（各1つのH3）
    const expandedBody = [
      // 導入文
      {
        _type: 'block',
        _key: `intro-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-intro-${Date.now()}`,
          text: article.content[0].intro,
          marks: []
        }],
        markDefs: []
      },
      // 既存コンテンツを保持
      ...existingContent,
      // H2セクション1
      {
        _type: 'block',
        _key: `h2-1-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-1-${Date.now()}`,
          text: article.content[1].h2,
          marks: []
        }],
        markDefs: []
      },
      // H3セクション1
      {
        _type: 'block',
        _key: `h3-1-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-1-${Date.now()}`,
          text: article.content[1].h3,
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `h3content-1-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-h3content-1-${Date.now()}`,
          text: article.content[1].text,
          marks: []
        }],
        markDefs: []
      },
      // H2セクション2
      {
        _type: 'block',
        _key: `h2-2-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-2-${Date.now()}`,
          text: article.content[2].h2,
          marks: []
        }],
        markDefs: []
      },
      // H3セクション2
      {
        _type: 'block',
        _key: `h3-2-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-2-${Date.now()}`,
          text: article.content[2].h3,
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `h3content-2-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-h3content-2-${Date.now()}`,
          text: article.content[2].text,
          marks: []
        }],
        markDefs: []
      },
      // まとめ
      {
        _type: 'block',
        _key: `conclusion-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-conclusion-${Date.now()}`,
          text: article.content[3].conclusion,
          marks: []
        }],
        markDefs: []
      }
    ];

    await client.patch(post._id).set({ body: expandedBody }).commit();
    
    // 新文字数カウント
    let newChars = 0;
    expandedBody.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        newChars += text.length;
      }
    });

    return { 
      success: true, 
      title: article.title, 
      id: article.id,
      charsBefore: currentChars, 
      charsAfter: newChars,
      expansion: newChars - currentChars
    };

  } catch (error) {
    return { 
      success: false, 
      title: article.title, 
      id: article.id,
      error: error.message 
    };
  }
}

// 中記事第5バッチ: スマホ最適化版（2000-2500文字、2H2+各1H3）
const articles = [
  {
    id: 21,
    slug: 'toyama-city-park-sakura-2',
    title: '【富山市】富山城址公園の桜が見事すぎた！',
    content: [
      { 
        intro: '富山市の中心部に位置する富山城址公園は、春の桜シーズンになると市内屈指のお花見スポットとして多くの人々に愛される美しい公園です。天守閣を背景にした桜の風景は、歴史と自然が調和した富山らしい絶景として、地元住民から観光客まで幅広い層に親しまれています。'
      },
      { 
        h2: '富山城址公園の桜の見どころ',
        h3: '天守閣と桜のコラボレーション',
        text: '富山城址公園の最大の魅力は、復元された天守閣と満開の桜が織りなす美しいコントラストです。歴史ある城の佇まいと薄紅色の桜の花びらが作り出す風景は、まさに日本の春の美しさを象徴する光景として多くの写真愛好家にも愛されています。特に夕方の時間帯は、西日に照らされた天守閣と桜が黄金色に輝き、一日の中でも最も美しい瞬間を楽しむことができます。'
      },
      {
        h2: '地域に愛されるお花見文化',
        h3: '市民の憩いの場としての役割',
        text: '富山城址公園は富山市民にとって身近なお花見スポットとして長年愛され続けています。桜の開花期には多くの家族連れや友人グループが訪れ、シートを敷いてのんびりとお花見を楽しむ光景が見られます。都市の中心部にありながら緑豊かな環境が保たれているこの公園は、忙しい日常の中で季節の移ろいを感じることのできる貴重な場所として、地域コミュニティの絆を深める重要な役割を果たしています。'
      },
      {
        conclusion: '富山城址公園の桜は、富山市の春を代表する美しい風景です。天守閣との調和が生み出す趣深い光景と、地域の人々に愛され続ける温かい雰囲気は、訪れる人々に特別な感動をもたらしてくれます。富山市の春を感じたい方には、ぜひおすすめしたい素晴らしいお花見スポットです。'
      }
    ]
  }
];

async function findAndProcessBatch5() {
  console.log('🚀 中記事第5バッチ - スマホ最適化版開始！');
  console.log('📱 目標: 2000-2500文字（スマホ読了率最適化）');
  console.log('🏗️ 構造: 導入文 + 既存 + 2つのH2（各1つのH3）+ まとめ');
  console.log('🎯 SEO効果維持 + UX向上の両立');
  
  // まず第5バッチの候補を取得
  const posts = await client.fetch('*[_type == "post"] { _id, title, slug, body, category } | order(title asc)');
  
  const candidates = [];
  for (const post of posts) {
    if (!post.body || !Array.isArray(post.body)) continue;
    
    let totalChars = 0;
    post.body.forEach(block => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text || '').join('');
        totalChars += text.length;
      }
    });
    
    // 1201-1500文字の記事を対象
    if (totalChars > 1200 && totalChars <= 1500) {
      candidates.push({
        slug: post.slug.current,
        title: post.title,
        chars: totalChars,
        category: post.category || 'その他'
      });
    }
  }
  
  // 文字数順でソート（短い順）
  candidates.sort((a, b) => a.chars - b.chars);
  
  console.log('\n=== 中記事第5バッチ候補（第21-25記事）===');
  const fifthBatch = candidates.slice(20, 25); // 21番目から25番目まで
  
  if (fifthBatch.length === 0) {
    console.log('🎉 中記事の処理が完了しました！');
    return;
  }
  
  fifthBatch.forEach((article, index) => {
    console.log(`第${index + 21}記事:`);
    console.log(`  タイトル: ${article.title}`);
    console.log(`  スラッグ: ${article.slug}`);
    console.log(`  現在文字数: ${article.chars}文字`);
    console.log(`  カテゴリー: ${article.category}`);
    console.log(`  目標文字数: 2000-2500文字（スマホ最適化）`);
    console.log('');
  });
  
  console.log(`中記事総数: ${candidates.length}記事`);
  console.log(`処理済み: 20記事`);
  console.log(`第5バッチ対象: ${fifthBatch.length}記事`);
  console.log(`残り: ${candidates.length - 25}記事`);
}

findAndProcessBatch5().catch(console.error);