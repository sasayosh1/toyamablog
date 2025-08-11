const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function updateTonamiFestivalArticle() {
  try {
    console.log('「tonami-city-festival」記事を更新中...\n');
    
    // 記事IDを取得
    const existingArticle = await client.fetch(`
      *[_type == "post" && slug.current == "tonami-city-festival"][0] {
        _id
      }
    `);

    if (!existingArticle) {
      console.log('記事が見つかりませんでした。');
      return;
    }

    const articleId = existingArticle._id;
    
    // 新しい記事内容
    const newContent = [
      // 導入文
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県砺波市で毎年6月に開催される「夜高祭」は、大正時代から100年以上続く伝統的な豊作祈願祭です。高さ6mの巨大な夜高行燈が激しくぶつかり合う「突き合わせ」は、全国でも珍しい勇猛な喧嘩祭りとして知られ、約20台の絢爛豪華な行燈が砺波の夜を彩ります。',
            marks: []
          }
        ],
        markDefs: []
      },
      
      // YouTubeの埋め込みは既存のものを保持
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EWfIlEa8Jzw" frameborder="0" allowfullscreen></iframe>'
          }
        ]
      },

      // H2: 夜高祭の基本情報と魅力
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '夜高祭の基本情報と魅力'
          }
        ]
      },

      // H3: 100年以上続く歴史と伝統
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '100年以上続く歴史と伝統'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '砺波市の夜高祭は大正時代に始まり、豊年満作と五穀豊穣を祈願する歴史ある祭りです。最も古い福野の夜高は300年以上の歴史を誇り、伊勢神宮の御分霊を迎える際に行燈を掲げたことが起源とされています。'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '現在では砺波市内約30の集落で様々な形の夜高祭が継承されており、地域の重要な文化的遺産として大切に守られています。特に砺波地区の夜高祭は、その勇猛さと華麗さで県内外から多くの観光客を魅了しています。'
          }
        ]
      },

      // H3: 約20台の夜高行燈が織りなす絢爛豪華な世界
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '約20台の夜高行燈が織りなす絢爛豪華な世界'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '夜高行燈の特徴と見どころ：'
          }
        ]
      },

      // 箇条書き: 夜高行燈の特徴
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🏮 高さ約6m、幅約3mの大迫力サイズ'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🎨 竹・和紙・染料を使った伝統技法で制作'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '❤️ 赤を基調とした鮮やかな色彩デザイン'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🎭 武者絵や歌舞伎の名場面を描いた豪華絢爛な絵柄'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '👥 大小合わせて約20台の行燈が一堂に会する圧巻の光景'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '各町内が1年をかけて制作する夜高行燈は、まさに職人技の結晶です。昼間の優雅な美しさとは対照的に、夜になって灯りが入ると幻想的で力強い存在感を放ちます。'
          }
        ]
      },

      // H2: 祭りの見どころと開催スケジュール
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '祭りの見どころと開催スケジュール'
          }
        ]
      },

      // H3: 迫力満点！高さ6mの大行燈による「突き合わせ」
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '迫力満点！高さ6mの大行燈による「突き合わせ」'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '夜高祭最大の見どころは、2基の巨大な夜高行燈がぶつかり合う「突き合わせ」です。北陸銀行砺波支店前や富山第一銀行砺波支店前で繰り広げられるこの激しいぶつかり合いは、全国でも珍しい勇猛な祭りとして知られています。'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '突き合わせの流れ：'
          }
        ]
      },

      // 箇条書き: 突き合わせの流れ
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '⏰ 約10〜15m離れた位置に2基の行燈が対峙'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '👨‍⚖️ 裁許（さいきょ）の合図で開始'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '💨 全速力で激突！迫力満点の衝突音が響く'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '💪 数十人の担ぎ手による激しい押し合い'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🎌 勝敗が決するまで続く白熱の戦い'
          }
        ]
      },

      // H3: 2日間のイベントスケジュールと開催日程
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '2日間のイベントスケジュールと開催日程'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '毎年6月第2金曜・土曜日の2日間開催される夜高祭のスケジュール：'
          }
        ]
      },

      // 箇条書き: 2025年開催情報
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '📅 2025年開催予定日：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🗓️ 2025年6月13日（金） 宵祭り'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '🗓️ 2025年6月14日（土） 本祭り'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '⏰ タイムスケジュール：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '19:00〜 各町内から行燈が出発'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '20:00〜 本町通りに行燈が集結'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '20:30〜 突き合わせ開始（最大の見どころ）'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '22:00頃 祭り終了'
          }
        ]
      },

      // H2: アクセス・駐車場情報と参加方法
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'アクセス・駐車場情報と参加方法'
          }
        ]
      },

      // H3: JR砺波駅からのアクセスと交通規制情報
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'JR砺波駅からのアクセスと交通規制情報'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '🚃 電車でのアクセス：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: 'JR城端線「砺波駅」下車徒歩10分'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '富山駅から砺波駅まで約40分'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '高岡駅から砺波駅まで約25分'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '🚗 車でのアクセス：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '砺波ICから約15分'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '小杉ICから約25分'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '⚠️ 祭り当日は会場周辺で交通規制あり'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '🅿️ 駐車場情報：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '砺波駅周辺の有料駐車場を利用（約300台分）'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '臨時駐車場も設置される場合あり'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '公共交通機関の利用を強く推奨'
          }
        ]
      },

      // H3: 祭り見学のポイントと注意事項
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '祭り見学のポイントと注意事項'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '🔥 ベストな観覧スポット：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '本町交差点付近（突き合わせのメイン会場）'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '北陸銀行砺波支店前'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '富山第一銀行砺波支店前'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '早めの場所取りがおすすめ（19:00頃から）'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '⚠️ 見学時の注意事項：'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '行燈の移動経路には近づかない'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '突き合わせ時は安全な距離を保つ'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '小さなお子様連れは特に注意が必要'
          }
        ]
      },
      {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: '祭り関係者の指示に従って見学'
          }
        ]
      },

      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '砺波市の夜高祭は、富山県が全国に誇る勇猛で美しい祭りです。100年以上続く伝統と、地域の人々の熱い想いが込められた夜高行燈の競演をぜひ間近でご覧ください。毎年6月の2日間だけの特別な体験が、きっと忘れられない思い出となることでしょう。'
          }
        ]
      },

      // 公式サイト情報
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '#富山 #砺波 #となみ #まつり #夜高祭 #夜高まつり'
          }
        ]
      }
    ];

    // 新しいタグ配列
    const newTags = [
      '富山', '富山県', 'TOYAMA', '砺波市', '夜高祭', '夜高まつり', '祭り', 'イベント', 
      '伝統', '文化', '地域行事', '富山観光', '富山旅行', '北陸観光', '突き合わせ',
      '夜高行燈', '豊年満作', '五穀豊穣', '大正時代', '100年の歴史', 
      'JR砺波駅', '本町通り', '6月開催', '2日間開催', '高さ6m', '約20台',
      '北陸銀行前', '富山第一銀行前', '富山県の観光スポット', 
      '富山県でおすすめの場所', '富山県の名所', '富山県の見どころ',
      '富山県の文化', '富山県のイベント', '#shorts', 'YouTube Shorts'
    ];

    // 新しい概要文
    const newExcerpt = '富山県砺波市で毎年6月に開催される「夜高祭」は、大正時代から100年以上続く伝統的な豊作祈願祭です。高さ6mの巨大な夜高行燈約20台が激しくぶつかり合う「突き合わせ」は圧巻の迫力！';

    // Sanityで記事を更新
    const result = await client
      .patch(articleId)
      .set({
        body: newContent,
        tags: newTags,
        excerpt: newExcerpt,
        category: '富山県の祭り・イベント'
      })
      .commit();

    console.log('記事更新が完了しました！');
    console.log(`記事ID: ${result._id}`);
    console.log(`更新日時: ${result._updatedAt}`);
    
    // 更新後の文字数をカウント
    const textContent = newContent.map(block => {
      if (block._type === 'block' && block.children) {
        return block.children.map(child => child.text || '').join('');
      }
      return '';
    }).join('');
    
    console.log(`\n=== 更新結果 ===`);
    console.log(`新文字数: ${textContent.length}文字`);
    console.log(`H2見出し数: ${(textContent.match(/## /g) || []).length}個`);
    console.log(`H3見出し数: ${(textContent.match(/### /g) || []).length}個`);
    console.log(`箇条書き数: ${(textContent.match(/🏮|🎨|❤️|🎭|👥|⏰|👨‍⚖️|💨|💪|🎌|🗓️|🚃|🚗|⚠️|🅿️|🔥/g) || []).length}個`);
    console.log(`タグ数: ${newTags.length}個`);
    console.log(`概要文: ${newExcerpt}`);

  } catch (error) {
    console.error('更新エラー:', error);
  }
}

updateTonamiFestivalArticle();