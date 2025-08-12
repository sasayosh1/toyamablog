const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateMainFocus() {
  try {
    // 統合記事を取得
    const unifiedArticle = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-disney-40th-complete-parade-2023"][0] { _id }`);
    
    if (!unifiedArticle) {
      console.log('統合記事が見つかりませんでした');
      return;
    }
    
    console.log('記事のメインフォーカスをディズニーパレードに変更中...');
    
    // ディズニーパレードをメインにした新しい記事構成
    const newBody = [
      // 導入部（ディズニーパレードがメイン）
      {
        _type: 'block',
        _key: 'intro-disney-main',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年の富山まつりで開催された「東京ディズニーリゾート40周年スペシャルパレード」の完全版をお届けします。東京ディズニーリゾート開園40周年を記念して、ミッキーマウスやディズニーキャラクターたちが富山の街にやってきました。3部構成の豪華なディズニーパレードでは、クラシックキャラクター、ディズニープリンセス、ピクサーキャラクターが次々と登場し、沿道を埋め尽くした観客に夢と魔法の時間をプレゼントしてくれました。また、富山まつりの一環として富山県警察音楽隊による地域密着型のスペシャルパレードも併せて開催され、地域の音楽文化とディズニーの魔法が融合した特別な一日となりました。'
          }
        ]
      },
      
      // H2: 東京ディズニーリゾート40周年の記念意義（メインコンテンツ）
      {
        _type: 'block',
        _key: 'disney-significance-h2-main',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '東京ディズニーリゾート40周年の記念意義'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'disney-significance-content-main',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年は東京ディズニーリゾートが開園してから40周年という記念すべき年でした。1983年の開園以来、多くの人々に愛され続けてきたディズニーリゾートは、日本のテーマパークの代表的存在として、世代を超えて親しまれています。この40周年を記念して、全国各地で特別なイベントが開催され、富山まつりもその一つとして選ばれました。富山という地方都市で本格的なディズニーパレードが見られるという貴重な機会に、県内外から多くのディズニーファンが集まりました。40年間の歴史の重みと、これからの未来への期待を込めたスペシャルパレードは、参加者全員にとって忘れられない思い出となりました。'
          }
        ]
      },

      // H2: vol.1 富山県警察音楽隊スペシャルパレード編（順序は1番だが、サブ扱い）
      {
        _type: 'block',
        _key: 'vol1-police-band-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.1 富山県警察音楽隊スペシャルパレード編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol1-police-intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーパレードの前座として、富山県警察音楽隊によるスペシャルパレードが富山駅前城址大通りで開催されました。地域密着型のこのイベントは、音楽と行進が織りなす華やかなパフォーマンスで会場を温めました。'
          }
        ]
      },
      // vol.1動画（音楽隊）
      {
        _type: 'html',
        _key: 'vol1-police-video',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/dEe6OhiIz5w" title="vol.1 富山県警察音楽隊スペシャルパレード編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol1-police-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県警察音楽隊は、警察官としての職務と音楽活動を両立させる高い専門性を持った楽団として評価されています。クラシックの名曲からポピュラーソング、アニメソングまで幅広いレパートリーを披露し、子供からお年寄りまで全ての世代が楽しめる選曲で会場を盛り上げ、この後に続くディズニーパレードへの期待を高めました。'
          }
        ]
      },

      // H2: vol.2 ミッキーマウス＆クラシックキャラクター編（メインコンテンツ）
      {
        _type: 'block',
        _key: 'vol2-mickey-main-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.2 ミッキーマウス＆クラシックキャラクター編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol2-mickey-intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'いよいよ始まったディズニーパレードの先陣を切るのは、ディズニーの象徴であるミッキーマウスとミニーマウスが40周年記念の特別衣装で登場するクラシックキャラクター編でした。'
          }
        ]
      },
      // vol.2動画（ミッキーマウス）
      {
        _type: 'html',
        _key: 'vol2-mickey-video',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/__kdkbAAY-A" title="vol.2 ミッキーマウス＆クラシックキャラクター編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol2-mickey-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ミッキーマウス＆クラシックキャラクター編では、ディズニーの代表的なキャラクターたちが次々と登場しました。先頭を切って現れたミッキーマウスとミニーマウスは、特別にデザインされた40周年記念の衣装を身にまとい、観客に手を振りながら進みました。続いて登場したのは、ドナルドダック、グーフィー、プルートなどのおなじみのキャラクターたちです。それぞれが乗っているフロートも華やかで、40周年のロゴやシンボルが美しく装飾されていました。パレードでは、ディズニーの名曲に合わせてキャラクターたちがダンスを披露し、観客も一緒に手拍子を打って盛り上がりました。特に子供たちの歓声は大きく、キャラクターとの触れ合いの瞬間は、まさに夢の時間そのものでした。'
          }
        ]
      },

      // H3: ミッキーマウスの特別な魅力
      {
        _type: 'block',
        _key: 'mickey-special-h3',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '40周年記念特別仕様の豪華な演出'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'mickey-special-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '東京ディズニーリゾート40周年スペシャルパレードでは、記念イヤーにふさわしい豪華で特別な演出が施されていました。ミッキーマウスやミニーマウスをはじめとする人気キャラクターたちは、40周年記念の特別衣装に身を包み、きらびやかで美しい装飾が施されたフロートに乗って登場しました。音楽も40周年記念の特別楽曲が使用され、パレード全体が祝祭感に満ちた華やかな雰囲気に包まれていました。普段のディズニーパレードとは一味違う特別感が、観客の心を深く感動させました。'
          }
        ]
      },

      // H2: vol.3 ディズニープリンセス編（メインコンテンツ）
      {
        _type: 'block',
        _key: 'vol3-princess-main-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.3 ディズニープリンセス編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol3-princess-intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3では、シンデレラ、白雪姫、ベル、アリエルなど、愛され続けているディズニープリンセスたちが華麗に登場しました。プリンセスたちを中心とした華やかなパレードは、特に女性や子供たちから大きな歓声を受けました。'
          }
        ]
      },
      // vol.3動画（プリンセス）
      {
        _type: 'html',
        _key: 'vol3-princess-video',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/BXGJW6_gLPM" title="vol.3 ディズニープリンセス編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol3-princess-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3の目玉は、何といってもディズニープリンセスたちの登場でした。シンデレラ、白雪姫、ベル、アリエルなど、愛され続けている歴代プリンセスたちが、それぞれの物語を彷彿とさせる美しいフロートに乗って現れました。プリンセスたちの衣装は映画そのままの美しさで、特にシンデレラのブルーのドレスやベルの黄色いボールガウンは、陽光に映えて一層輝いて見えました。プリンセスたちは観客に向かって優雅に手を振り、特に小さな女の子たちが目を輝かせて見つめる姿が印象的でした。各プリンセスのテーマソングが流れる中でのパレードは、まさに童話の世界が現実になったような幻想的な体験でした。'
          }
        ]
      },

      // H3: プリンセスたちの特別な魅力
      {
        _type: 'block',
        _key: 'princess-special-h3',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'ディズニープリンセスたちの華麗な登場'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'princess-special-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3はvol.2とは異なる構成で、より物語性を重視したパレードとなっていました。vol.2がミッキーマウスをはじめとする基本キャラクターを中心としていたのに対し、vol.3ではディズニープリンセスの物語世界に焦点を当てた演出が行われました。フロートのデザインもより繊細で装飾的になっており、それぞれのプリンセスの物語の世界観を表現した美しい作りとなっていました。音楽も各プリンセスの代表的な楽曲が使用され、観客は聞き馴染みのあるメロディーと共にパレードを楽しむことができました。'
          }
        ]
      },

      // H2: vol.4 ピクサーキャラクター編（メインコンテンツ）
      {
        _type: 'block',
        _key: 'vol4-pixar-main-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.4 ピクサーキャラクター編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol4-pixar-intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーパレードの大団円を飾るvol.4では、トイ・ストーリーやモンスターズ・インクなど、人気ピクサー作品のキャラクターたちが大活躍しました。3D技術の発展と共に愛されてきたピクサーキャラクターたちの登場は、子供から大人まで幅広い世代に愛されるパレードとなりました。'
          }
        ]
      },
      // vol.4動画（ピクサー）
      {
        _type: 'html',
        _key: 'vol4-pixar-video',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/zfEyYIY15zI" title="vol.4 ピクサーキャラクター編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol4-pixar-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.4の最大の見どころは、トイ・ストーリーのウッディとバズ・ライトイヤー、モンスターズ・インクのサリーとマイク、ファインディング・ニモのニモとドリーなど、人気ピクサー作品のキャラクターたちが一堂に会したことでした。それぞれのキャラクターは映画そのままの姿で登場し、特にウッディの陽気なカウボーイスタイルやサリーの愛らしい毛むくじゃらの姿は、観客の心を掴んで離しませんでした。ピクサー作品の特徴である温かみのあるストーリーとキャラクターの魅力が、パレードでも存分に表現されており、家族連れの観客から特に大きな歓声が上がっていました。特にバズ・ライトイヤーの「トゥ・インフィニティ・アンド・ビヨンド！」のセリフが響いた時には、観客も一緒に声を合わせる場面が見られ、パレード全体が一つになったような感動的な瞬間がありました。'
          }
        ]
      },

      // H3: ピクサーキャラクターの特別な魅力
      {
        _type: 'block',
        _key: 'pixar-special-h3',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'ピクサーキャラクターたちの大集合'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'pixar-special-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.4は三部構成の最終章として、これまでのvol.2、vol.3の盛り上がりを受けて、さらにエネルギッシュで派手な演出が施されていました。音響効果も一層豪華になり、各キャラクターのテーマソングが力強く響く中、キャラクターたちは観客との距離をより縮めるような親しみやすい演出を披露しました。フィナーレに向けての盛り上がりは最高潮に達し、40周年スペシャルパレードにふさわしい華々しい締めくくりとなりました。'
          }
        ]
      },

      // H2: 富山まつりへの影響と効果
      {
        _type: 'block',
        _key: 'impact-disney-main-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '富山まつりへの影響と地域への効果'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'impact-disney-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーキャラクターたちの登場に、沿道の観客は大興奮でした。普段は地元の伝統的な祭りが中心の富山まつりに、世界的に有名なディズニーキャラクターが登場するという異色のコラボレーションは、多くの話題を呼びました。家族連れはもちろん、大人のディズニーファンも多数詰めかけ、パレードの進行に合わせて移動しながら写真撮影を楽しむ姿が見られました。このスペシャルパレードにより、富山まつり全体の来場者数も大幅に増加し、地域経済への波及効果も大きかったと言われています。また、SNSでの拡散効果も高く、富山まつりの知名度向上にも大きく貢献しました。富山県警察音楽隊のパレードと合わせて、地域の文化とグローバルなエンターテイメントが見事に融合した特別なイベントとなりました。'
          }
        ]
      },

      // まとめ（ディズニーパレードがメイン）
      {
        _type: 'block',
        _key: 'conclusion-disney-main',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードは、ディズニーの魔法が富山の街に降り注いだ特別な一日となりました。ミッキーマウスから始まり、ディズニープリンセス、ピクサーキャラクターまで、それぞれ異なる魅力を持ったキャラクターたちの登場は、多くの人々の心に深く刻まれました。富山県警察音楽隊のパレードと共に開催されたこのイベントは、地域の伝統祭りと世界的エンターテイメントが融合した特別な体験として、参加した全ての人々の心に素晴らしい思い出を残し、富山まつりの新たな可能性を示してくれました。'
          }
        ]
      }
    ];
    
    // 記事を更新（ディズニーをメインに、メイン動画はミッキーマウスに戻す）
    await client
      .patch(unifiedArticle._id)
      .set({ 
        // タイトルをディズニーメインに変更
        title: '【富山市】東京ディズニーリゾート40周年スペシャルパレード完全版｜富山まつり2023',
        // メイン動画をミッキーマウス（ディズニーの象徴）に変更
        youtubeUrl: 'https://youtube.com/shorts/__kdkbAAY-A',
        // 説明文もディズニーメインに
        excerpt: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードの完全版。ミッキーマウス、ディズニープリンセス、ピクサーキャラクターの3つの豪華なディズニー動画と富山県警察音楽隊パレードをお楽しみください。',
        body: newBody,
        // タグもディズニー重視に調整
        tags: [
          // ディズニー関連を最優先
          'ディズニー',
          'ディズニーパレード', 
          '東京ディズニーリゾート',
          '40周年',
          'ミッキーマウス',
          'ディズニープリンセス',
          'ピクサー',
          'トイストーリー',
          'シンデレラ',
          'バズライトイヤー',
          // 地域関連
          '富山',
          '富山県',
          '富山市',
          '富山まつり',
          '富山観光',
          '富山旅行',
          'TOYAMA',
          // その他
          '#shorts',
          'YouTube Shorts',
          '北陸観光',
          '富山市観光',
          '富山駅',
          '祭り',
          'イベント',
          '警察音楽隊',
          '富山県の観光スポット',
          '富山県でおすすめの場所',
          '富山県の見どころ'
        ]
      })
      .commit();
    
    console.log('✅ メインフォーカスの変更が完了しました！');
    console.log('');
    console.log('🎯 新しいメインコンテンツ:');
    console.log('- メインテーマ: 東京ディズニーリゾート40周年スペシャルパレード');
    console.log('- メイン動画: ミッキーマウス編（SEO重視）');
    console.log('- 動画表示順序: 1.音楽隊 → 2.ミッキー → 3.プリンセス → 4.ピクサー');
    console.log('- SEO最適化: ディズニー関連キーワードを最優先');
    
  } catch (error) {
    console.error('メインフォーカス変更エラー:', error);
  }
}

updateMainFocus();