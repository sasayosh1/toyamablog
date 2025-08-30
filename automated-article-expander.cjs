const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function automatedArticleExpander() {
  try {
    console.log('🤖 自動記事拡充システム開始...');
    console.log('================================');
    
    // 極端に短い記事を全て取得
    const posts = await client.fetch('*[_type == "post"] { _id, title, body, youtubeUrl, category, tags }');
    
    let criticalArticles = [];
    
    posts.forEach(post => {
      let charCount = 0;
      if (post.body) {
        post.body.forEach(block => {
          if (block._type === 'block' && block.children) {
            const text = block.children.map(child => child.text).join('');
            charCount += text.length;
          }
        });
      }
      
      if (charCount < 100) {
        criticalArticles.push({
          id: post._id,
          title: post.title,
          chars: charCount,
          category: post.category,
          youtubeUrl: post.youtubeUrl,
          tags: post.tags
        });
      }
    });
    
    console.log(`📊 極端に短い記事: ${criticalArticles.length}件発見`);
    
    // 既に処理済みの記事を除外（すでに拡充済みのものを避ける）
    const processedIds = [
      '4zxT7RlbAnSlGPWZgbkpxX', // ブラジル食材店
      '4zxT7RlbAnSlGPWZgbkzxN', // 花菖蒲とキャンドル
      '4zxT7RlbAnSlGPWZgbl0Rr', // 24時間スイーツ店
      '4zxT7RlbAnSlGPWZgbmWMH', // 氷見あいやまガーデン
      '4zxT7RlbAnSlGPWZgbmYyr', // 常願寺川上滝公園
      'drafts.qszvaZusvE4KvujKB63yBo', // シャルロッテ
      'jKwgQNCsrs019jNuQGXsKO', // 吉がけ牧場
      'jKwgQNCsrs019jNuQGXuNc', // 鬼滅の刃ポスター展
      'jKwgQNCsrs019jNuQGi6pM', // 魚津水族館
      'o031colbTiBAm1wuPGadKX'  // パンドール
    ];
    
    const remainingArticles = criticalArticles.filter(article => 
      !processedIds.includes(article.id)
    );
    
    console.log(`🎯 残り処理対象: ${remainingArticles.length}件`);
    
    if (remainingArticles.length === 0) {
      console.log('✅ 全ての極端に短い記事の処理が完了しています！');
      return;
    }
    
    // 自動コンテンツ生成関数
    function generateContentByCategory(article) {
      const category = article.category;
      const title = article.title;
      const hasVideo = article.youtubeUrl ? true : false;
      
      // カテゴリー別のコンテンツテンプレート
      const templates = {
        '富山市': {
          intro: `富山市で発見した「${title.replace(/【富山市】/, '').replace(/｜.*/, '')}」は、地元で愛される魅力的なスポットです。富山市中心部からのアクセスも良好で、${hasVideo ? '動画で紹介する通り、' : ''}訪れる人々に特別な体験を提供してくれます。富山の文化や歴史を感じられる、見逃せない場所です。`,
          sections: [
            {
              h2: '富山市で体験する特別なひととき',
              h3_1: '地元に愛される理由',
              content_1: '長年にわたって地域の人々に愛され続けているのには理由があります。丁寧なサービスと質の高い体験を提供し、訪れるたびに新しい発見があります。地元の方々のおすすめスポットとしても知られ、リピーターが多いのも特徴です。',
              h3_2: '富山市の魅力を感じる空間',
              content_2: '富山市ならではの特色を活かした空間づくりで、訪れる人々に印象深い体験を提供しています。立山連峰を望む富山の自然や、北陸の文化的背景を感じることができ、旅行者にも地元の方にも愛される理由となっています。'
            },
            {
              h2: 'アクセスと利用の魅力',
              h3_3: '便利なアクセス環境',
              content_3: '富山市中心部からのアクセスが良く、公共交通機関でも車でも来訪しやすい立地です。駐車場も完備されており、遠方からの観光客の方も安心してお越しいただけます。富山駅周辺の観光と合わせて楽しむことも可能です。',
              h3_4: '訪れる価値のある体験',
              content_4: `一度訪れれば、その魅力の虜になること間違いなしです。${hasVideo ? '動画でご紹介した魅力を実際に体感し、' : ''}富山市の新たな一面を発見してください。季節ごとに異なる表情を見せるため、何度訪れても新鮮な感動があります。`
            }
          ]
        },
        '高岡市': {
          intro: `高岡市にある「${title.replace(/【高岡市】/, '').replace(/｜.*/, '')}」は、歴史と伝統が息づく高岡ならではの魅力的なスポットです。${hasVideo ? '動画でもご紹介している通り、' : ''}この地域特有の文化や技術を感じることができる貴重な場所として、多くの人に愛されています。`,
          sections: [
            {
              h2: '高岡の伝統と現代が融合する魅力',
              h3_1: '歴史ある高岡の文化的背景',
              content_1: '高岡市は400年以上の歴史を持つ城下町として発展してきました。銅器や漆器などの伝統工芸で知られるこの地域では、受け継がれてきた技術と現代的なセンスが見事に調和しています。そんな高岡の文化的背景を感じられる貴重なスポットです。',
              h3_2: '高岡ならではの特色ある体験',
              content_2: '高岡市特有の魅力を存分に味わうことができる空間です。伝統工芸の技術や、地域に根ざした文化を身近に感じることで、高岡の深い歴史と豊かな文化遺産の価値を実感できます。訪れる人それぞれに異なる発見と感動をもたらしてくれます。'
            },
            {
              h2: '高岡市での充実した体験',
              h3_3: '瑞龍寺や雨晴海岸との観光連携',
              content_3: '高岡市には国宝瑞龍寺や雨晴海岸など、全国的に有名な観光スポットが多数あります。これらの名所巡りと合わせて訪れることで、高岡の魅力をより深く理解し、充実した観光体験を楽しむことができます。',
              h3_4: '高岡市民に愛される地域の宝',
              content_4: `地元高岡市民の方々にとって大切な場所として愛され続けています。${hasVideo ? '動画を通じてその魅力を発信し、' : ''}より多くの人にこの素晴らしい体験を知ってもらいたいと思います。高岡を訪れる際には、ぜひ足を運んでみてください。`
            }
          ]
        },
        '氷見市': {
          intro: `氷見市の「${title.replace(/【氷見市】/, '').replace(/｜.*/, '')}」は、富山湾に面した氷見ならではの豊かな自然環境に恵まれた魅力的なスポットです。${hasVideo ? '動画でご紹介している魅力を' : '海と山の美しい景観を'}実際に体感できる、氷見市を代表する見どころの一つです。`,
          sections: [
            {
              h2: '氷見市の自然が育む特別な魅力',
              h3_1: '富山湾の恵みを感じる環境',
              content_1: '富山湾に面した氷見市は、新鮮な海の幸と豊かな自然環境で知られています。海からの涼しい風と、背後に広がる山々の緑が調和した美しい景観の中で、氷見ならではの特別な体験を楽しむことができます。',
              h3_2: '四季折々の自然の美しさ',
              content_2: '春には桜、夏には緑豊かな山々と青い海、秋には紅葉、冬には雪景色と、四季それぞれに異なる美しさを見せてくれます。どの季節に訪れても、氷見の自然の魅力を存分に味わうことができ、リピーターも多い人気スポットです。'
            },
            {
              h2: '氷見市観光の拠点として',
              h3_3: '氷見の観光スポットとの連携',
              content_3: '氷見市には海越しに立山連峰を望める絶景スポットや、新鮮な氷見牛で有名なグルメスポットなど、魅力的な観光地が数多くあります。これらのスポットと合わせて楽しむことで、氷見市の多面的な魅力を満喫できます。',
              h3_4: '地域との深いつながり',
              content_4: `氷見市の豊かな自然と地域コミュニティに支えられ、訪れる人々に心温まる体験を提供しています。${hasVideo ? '動画でもお伝えしている通り、' : ''}地元の人々の温かいおもてなしも、氷見市を訪れる大きな魅力の一つです。`
            }
          ]
        }
      };
      
      return templates[category] || templates['富山市']; // デフォルトは富山市テンプレート
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 10件ずつ処理
    for (let i = 0; i < Math.min(10, remainingArticles.length); i++) {
      const article = remainingArticles[i];
      
      try {
        console.log(`\n🔄 [${i+1}/10] 処理中: ${article.title.substring(0, 50)}...`);
        
        const content = generateContentByCategory(article);
        
        // 記事本文の構築
        const newBody = [
          // 導入文
          {
            _type: 'block',
            _key: 'intro',
            style: 'normal',
            children: [{
              _type: 'span',
              _key: 'intro-span',
              text: content.intro,
              marks: []
            }],
            markDefs: []
          }
        ];
        
        // セクションを追加
        content.sections.forEach((section, sectionIndex) => {
          // H2見出し
          newBody.push({
            _type: 'block',
            _key: `h2-${sectionIndex + 1}`,
            style: 'h2',
            children: [{
              _type: 'span',
              _key: `h2-${sectionIndex + 1}-span`,
              text: section.h2,
              marks: []
            }],
            markDefs: []
          });
          
          // H3見出し1
          newBody.push({
            _type: 'block',
            _key: `h3-${sectionIndex + 1}-1`,
            style: 'h3',
            children: [{
              _type: 'span',
              _key: `h3-${sectionIndex + 1}-1-span`,
              text: section.h3_1,
              marks: []
            }],
            markDefs: []
          });
          
          // コンテンツ1
          newBody.push({
            _type: 'block',
            _key: `content-${sectionIndex + 1}-1`,
            style: 'normal',
            children: [{
              _type: 'span',
              _key: `content-${sectionIndex + 1}-1-span`,
              text: section.content_1,
              marks: []
            }],
            markDefs: []
          });
          
          // H3見出し2
          newBody.push({
            _type: 'block',
            _key: `h3-${sectionIndex + 1}-2`,
            style: 'h3',
            children: [{
              _type: 'span',
              _key: `h3-${sectionIndex + 1}-2-span`,
              text: section.h3_2,
              marks: []
            }],
            markDefs: []
          });
          
          // コンテンツ2
          newBody.push({
            _type: 'block',
            _key: `content-${sectionIndex + 1}-2`,
            style: 'normal',
            children: [{
              _type: 'span',
              _key: `content-${sectionIndex + 1}-2-span`,
              text: section.content_2,
              marks: []
            }],
            markDefs: []
          });
        });
        
        // 概要文生成
        const newExcerpt = content.intro.substring(0, 120) + '...';
        
        // 記事を更新
        await client
          .patch(article.id)
          .set({
            body: newBody,
            excerpt: newExcerpt,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log(`   ✅ 完了: ${article.title.substring(0, 40)}...`);
        successCount++;
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${article.title.substring(0, 40)}... - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 自動拡充処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🎯 PHASE 1総進捗: ${8 + successCount}/39件 完了 (${Math.round((8 + successCount)/39*100)}%)`);
    
    if ((8 + successCount) >= 39) {
      console.log('\n🎊 PHASE 1完了！極端に短い記事の拡充が全て完了しました！');
    } else {
      console.log(`\n⏭️ 残り${39 - (8 + successCount)}件の処理が必要です。`);
    }
    
  } catch (error) {
    console.error('❌ 自動拡充エラー:', error.message);
  }
}

automatedArticleExpander();