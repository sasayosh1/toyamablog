const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function reorderVideos() {
  try {
    // 統合記事を取得
    const unifiedArticle = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-disney-40th-complete-parade-2023"][0] { _id, body }`);
    
    if (!unifiedArticle) {
      console.log('統合記事が見つかりませんでした');
      return;
    }
    
    console.log('動画の順番を変更中...');
    
    // 新しい順番で記事構成を再構築
    const newBody = [
      // 導入部
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年の富山まつりで開催された特別なパレードイベントの完全版をお届けします。富山県警察音楽隊による地域密着型のスペシャルパレードと、東京ディズニーリゾート開園40周年を記念したディズニーキャラクターたちの華やかなパレードが富山の街を彩りました。4部構成の豪華なパレードでは、地元の音楽パフォーマンスからミッキーマウス、ディズニープリンセス、ピクサーキャラクターまで多彩な演出で、沿道を埋め尽くした観客に夢と感動の時間をプレゼントしてくれました。'
          }
        ]
      },
      
      // H2: 富山まつり2023の全体概要
      {
        _type: 'block',
        _key: 'festival-overview-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023の特別企画'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'festival-overview-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年の富山まつりは、地域の伝統的な祭りに世界的なエンターテイメントが融合した特別な年でした。富山県警察音楽隊による地域密着型のパレードは、音楽の力で市民の絆を深め、安全で文化的な都市・富山の象徴として開催されました。そして東京ディズニーリゾート40周年という記念すべき年に、全国各地で開催された特別イベントの一環として富山が選ばれ、本格的なディズニーパレードが実現しました。'
          }
        ]
      },

      // H2: vol.1 富山県警察音楽隊スペシャルパレード編（1番目に移動）
      {
        _type: 'block',
        _key: 'vol1-h2-reorder',
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
        _key: 'vol1-video-intro-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023のオープニングを飾ったのは、富山県警察音楽隊によるスペシャルパレードでした。富山駅前城址大通りで行われたこの地域密着型のイベントは、音楽と行進が織りなす華やかなパフォーマンスで多くの市民を魅了しました。'
          }
        ]
      },
      // vol.1動画（音楽隊）
      {
        _type: 'html',
        _key: 'vol1-video-reorder',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/dEe6OhiIz5w" title="vol.1 富山県警察音楽隊スペシャルパレード編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol1-content-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県警察音楽隊は、警察官としての職務と音楽活動を両立させる高い専門性を持った楽団として、県内外で高く評価されています。2023年のスペシャルパレードでは、行進しながらの演奏という高難度のパフォーマンスを見事にこなし、その技術力の高さを存分に発揮しました。クラシックの名曲からポピュラーソング、アニメソングまで幅広いレパートリーを披露し、子供からお年寄りまで全ての世代が楽しめる選曲で会場を盛り上げました。このパレードは、単なる音楽イベントを超えて、地域の安全と平和を願う象徴的な意味を持ち、市民と警察の距離を縮め、相互理解を深める重要な役割を果たしています。'
          }
        ]
      },

      // H2: ディズニーパレードの意義
      {
        _type: 'block',
        _key: 'disney-significance-h2',
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
        _key: 'disney-significance-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年は東京ディズニーリゾートが開園してから40周年という記念すべき年でした。1983年の開園以来、多くの人々に愛され続けてきたディズニーリゾートは、日本のテーマパークの代表的存在として、世代を超えて親しまれています。この40周年を記念して、全国各地で特別なイベントが開催され、富山まつりもその一つとして選ばれました。富山という地方都市で本格的なディズニーパレードが見られるという貴重な機会に、県内外から多くのディズニーファンが集まりました。'
          }
        ]
      },

      // H2: vol.2 ミッキーマウス＆クラシックキャラクター編
      {
        _type: 'block',
        _key: 'vol2-h2-reorder',
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
        _key: 'vol2-video-intro-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーパレードの先陣を切るのは、ディズニーの象徴であるミッキーマウスとミニーマウスが40周年記念の特別衣装で登場するクラシックキャラクター編でした。'
          }
        ]
      },
      // vol.2動画（ミッキーマウス）
      {
        _type: 'html',
        _key: 'vol2-video-reorder',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/__kdkbAAY-A" title="vol.2 ミッキーマウス＆クラシックキャラクター編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol2-content-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ミッキーマウス＆クラシックキャラクター編では、ディズニーの代表的なキャラクターたちが次々と登場しました。先頭を切って現れたミッキーマウスとミニーマウスは、特別にデザインされた40周年記念の衣装を身にまとい、観客に手を振りながら進みました。続いて登場したのは、ドナルドダック、グーフィー、プルートなどのおなじみのキャラクターたちです。それぞれが乗っているフロートも華やかで、40周年のロゴやシンボルが美しく装飾されていました。パレードでは、ディズニーの名曲に合わせてキャラクターたちがダンスを披露し、観客も一緒に手拍子を打って盛り上がりました。'
          }
        ]
      },

      // H2: vol.3 ディズニープリンセス編
      {
        _type: 'block',
        _key: 'vol3-h2-reorder',
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
        _key: 'vol3-video-intro-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3では、シンデレラ、白雪姫、ベル、アリエルなど、愛され続けているディズニープリンセスたちが華麗に登場しました。'
          }
        ]
      },
      // vol.3動画（プリンセス）
      {
        _type: 'html',
        _key: 'vol3-video-reorder',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/BXGJW6_gLPM" title="vol.3 ディズニープリンセス編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol3-content-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3の目玉は、何といってもディズニープリンセスたちの登場でした。シンデレラ、白雪姫、ベル、アリエルなど、愛され続けている歴代プリンセスたちが、それぞれの物語を彷彿とさせる美しいフロートに乗って現れました。プリンセスたちの衣装は映画そのままの美しさで、特にシンデレラのブルーのドレスやベルの黄色いボールガウンは、陽光に映えて一層輝いて見えました。プリンセスたちは観客に向かって優雅に手を振り、特に小さな女の子たちが目を輝かせて見つめる姿が印象的でした。各プリンセスのテーマソングが流れる中でのパレードは、まさに童話の世界が現実になったような幻想的な体験でした。'
          }
        ]
      },

      // H2: vol.4 ピクサーキャラクター編
      {
        _type: 'block',
        _key: 'vol4-h2-reorder',
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
        _key: 'vol4-video-intro-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'パレードの大団円を飾るvol.4では、トイ・ストーリーやモンスターズ・インクなど、人気ピクサー作品のキャラクターたちが大活躍しました。'
          }
        ]
      },
      // vol.4動画（ピクサー）
      {
        _type: 'html',
        _key: 'vol4-video-reorder',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/zfEyYIY15zI" title="vol.4 ピクサーキャラクター編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol4-content-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.4の最大の見どころは、トイ・ストーリーのウッディとバズ・ライトイヤー、モンスターズ・インクのサリーとマイク、ファインディング・ニモのニモとドリーなど、人気ピクサー作品のキャラクターたちが一堂に会したことでした。それぞれのキャラクターは映画そのままの姿で登場し、特にウッディの陽気なカウボーイスタイルやサリーの愛らしい毛むくじゃらの姿は、観客の心を掴んで離しませんでした。特にバズ・ライトイヤーの「トゥ・インフィニティ・アンド・ビヨンド！」のセリフが響いた時には、観客も一緒に声を合わせる場面が見られ、パレード全体が一つになったような感動的な瞬間がありました。'
          }
        ]
      },

      // H2: 富山まつりへの影響と効果
      {
        _type: 'block',
        _key: 'impact-h2-reorder',
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
        _key: 'impact-content-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県警察音楽隊とディズニーキャラクターたちの登場に、沿道の観客は大興奮でした。普段は地元の伝統的な祭りが中心の富山まつりに、地域密着型の音楽パレードと世界的に有名なディズニーキャラクターが登場するという特別なコラボレーションは、多くの話題を呼びました。家族連れはもちろん、大人のディズニーファンも多数詰めかけ、パレードの進行に合わせて移動しながら写真撮影を楽しむ姿が見られました。このスペシャルパレードにより、富山まつり全体の来場者数も大幅に増加し、地域経済への波及効果も大きかったと言われています。また、SNSでの拡散効果も高く、富山まつりの知名度向上にも大きく貢献しました。'
          }
        ]
      },

      // まとめ
      {
        _type: 'block',
        _key: 'conclusion-reorder',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023で開催された特別なパレードイベントは、地域の音楽文化とディズニーの魔法が富山の街に降り注いだ特別な一日となりました。富山県警察音楽隊から始まり、ミッキーマウス、ディズニープリンセス、ピクサーキャラクターまで、それぞれ異なる魅力を持ったパフォーマンスの登場は、多くの人々の心に深く刻まれました。地域の伝統祭りと世界的エンターテイメントが融合した特別な体験は、参加した全ての人々の心に素晴らしい思い出を残し、富山まつりの新たな可能性を示してくれました。'
          }
        ]
      }
    ];
    
    // 記事を更新（動画順序変更）
    await client
      .patch(unifiedArticle._id)
      .set({ 
        body: newBody,
        // メイン動画URLも音楽隊に変更
        youtubeUrl: 'https://youtube.com/shorts/dEe6OhiIz5w'
      })
      .commit();
    
    console.log('✅ 動画の順番変更が完了しました！');
    console.log('');
    console.log('🎬 新しい動画順序:');
    console.log('1. vol.1: 富山県警察音楽隊スペシャルパレード編');
    console.log('2. vol.2: ミッキーマウス＆クラシックキャラクター編');
    console.log('3. vol.3: ディズニープリンセス編');
    console.log('4. vol.4: ピクサーキャラクター編');
    
  } catch (error) {
    console.error('順番変更エラー:', error);
  }
}

reorderVideos();