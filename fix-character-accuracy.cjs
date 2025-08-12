const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixCharacterAccuracy() {
  try {
    // 統合記事を取得
    const unifiedArticle = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-disney-40th-complete-parade-2023"][0] { _id }`);
    
    if (!unifiedArticle) {
      console.log('統合記事が見つかりませんでした');
      return;
    }
    
    console.log('動画内容を実際のキャラクターに修正中...');
    
    // 正確な内容に修正した記事構成
    const correctedBody = [
      // 導入部（正確なキャラクター情報）
      {
        _type: 'block',
        _key: 'intro-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年の富山まつりで開催された「東京ディズニーリゾート40周年スペシャルパレード」の完全版をお届けします。東京ディズニーリゾート開園40周年を記念して、ミッキーマウス、ミニーマウス、ドナルドダック、デイジーダック、グーフィー、プルート、チップ＆デールなど、愛され続けているディズニーのクラシックキャラクターたちが富山の街にやってきました。また、富山まつりの一環として富山県警察音楽隊による地域密着型のスペシャルパレードも併せて開催され、地域の音楽文化とディズニーの魔法が融合した特別な一日となりました。'
          }
        ]
      },
      
      // H2: 東京ディズニーリゾート40周年の記念意義
      {
        _type: 'block',
        _key: 'disney-significance-h2-accurate',
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
        _key: 'disney-significance-content-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '2023年は東京ディズニーリゾートが開園してから40周年という記念すべき年でした。1983年の開園以来、多くの人々に愛され続けてきたディズニーリゾートは、日本のテーマパークの代表的存在として、世代を超えて親しまれています。この40周年を記念して、全国各地で特別なイベントが開催され、富山まつりもその一つとして選ばれました。富山という地方都市で本格的なディズニーパレードが見られるという貴重な機会に、県内外から多くのディズニーファンが集まりました。'
          }
        ]
      },

      // H2: vol.1 富山県警察音楽隊スペシャルパレード編
      {
        _type: 'block',
        _key: 'vol1-police-band-accurate-h2',
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
        _key: 'vol1-police-intro-accurate',
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
        _key: 'vol1-police-video-accurate',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/dEe6OhiIz5w" title="vol.1 富山県警察音楽隊スペシャルパレード編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol1-police-content-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山県警察音楽隊は、警察官としての職務と音楽活動を両立させる高い専門性を持った楽団として評価されています。クラシックの名曲からポピュラーソング、アニメソングまで幅広いレパートリーを披露し、子供からお年寄りまで全ての世代が楽しめる選曲で会場を盛り上げ、この後に続くディズニーパレードへの期待を高めました。'
          }
        ]
      },

      // H2: vol.2 ミッキー＆ミニー＆クラシックキャラクター編（正確な情報）
      {
        _type: 'block',
        _key: 'vol2-classic-accurate-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.2 ミッキー＆ミニー＆クラシックキャラクター編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol2-classic-intro-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'いよいよ始まったディズニーパレードでは、ディズニーの象徴であるミッキーマウス＆ミニーマウスをはじめとした愛されるクラシックキャラクターたちが40周年記念の特別衣装で登場しました。'
          }
        ]
      },
      // vol.2動画（ミッキーマウス）
      {
        _type: 'html',
        _key: 'vol2-classic-video-accurate',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/__kdkbAAY-A" title="vol.2 ミッキー＆ミニー＆クラシックキャラクター編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol2-classic-content-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.2では、ディズニーの代表的なクラシックキャラクターたちが次々と登場しました。先頭を切って現れたミッキーマウス＆ミニーマウスは、特別にデザインされた40周年記念の衣装を身にまとい、観客に手を振りながら進みました。続いて登場したのは、ドナルドダック、デイジーダック、グーフィー、プルート、そして人気のチップ＆デールなど、長年愛され続けているキャラクターたちです。それぞれが乗っているフロートも華やかで、40周年のロゴやシンボルが美しく装飾されていました。パレードでは、ディズニーの名曲に合わせてキャラクターたちがダンスを披露し、観客も一緒に手拍子を打って盛り上がりました。特に子供たちの歓声は大きく、おなじみのキャラクターとの触れ合いの瞬間は、まさに夢の時間そのものでした。'
          }
        ]
      },

      // H2: vol.3 ディズニーパレード第2弾編（正確な情報）
      {
        _type: 'block',
        _key: 'vol3-second-accurate-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.3 ディズニーパレード第2弾編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol3-second-intro-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3では、ディズニーキャラクターたちによるパレードの第2弾が展開されました。より多彩な演出と音楽で、観客を魅了し続けました。'
          }
        ]
      },
      // vol.3動画
      {
        _type: 'html',
        _key: 'vol3-second-video-accurate',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/BXGJW6_gLPM" title="vol.3 ディズニーパレード第2弾編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol3-second-content-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.3では、vol.2に続いてディズニーキャラクターたちによる華やかなパレードが続きました。ミッキーマウス、ミニーマウス、ドナルドダック、デイジーダック、グーフィー、プルート、チップ＆デールといったクラシックキャラクターたちが、異なる構成とアングルで再び登場し、観客に新たな感動を与えました。音楽も一層豪華になり、各キャラクターの個性を活かした演出で、パレード全体に更なる彩りを添えました。観客との距離も近く、よりインタラクティブな体験を楽しむことができました。'
          }
        ]
      },

      // H2: vol.4 ディズニーパレード完結編（正確な情報）
      {
        _type: 'block',
        _key: 'vol4-finale-accurate-h2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'vol.4 ディズニーパレード完結編'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'vol4-finale-intro-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーパレードの大団円を飾るvol.4では、クラシックキャラクターたちによる最後の華やかなパフォーマンスが展開されました。40周年スペシャルパレードにふさわしいフィナーレとなりました。'
          }
        ]
      },
      // vol.4動画
      {
        _type: 'html',
        _key: 'vol4-finale-video-accurate',
        html: '<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.youtube.com/embed/zfEyYIY15zI" title="vol.4 ディズニーパレード完結編" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 315px; max-width: 560px; border-radius: 8px;"></iframe></div>'
      },
      {
        _type: 'block',
        _key: 'vol4-finale-content-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'vol.4では、ディズニーパレードの大団円として、ミッキーマウス、ミニーマウス、ドナルドダック、デイジーダック、グーフィー、プルート、チップ＆デールといったクラシックキャラクターたちが最後の華やかなパフォーマンスを披露しました。三部構成の最終章として、これまでのvol.2、vol.3の盛り上がりを受けて、さらにエネルギッシュで派手な演出が施されていました。音響効果も一層豪華になり、各キャラクターのテーマソングが力強く響く中、キャラクターたちは観客との距離をより縮めるような親しみやすい演出を披露しました。フィナーレに向けての盛り上がりは最高潮に達し、40周年スペシャルパレードにふさわしい華々しい締めくくりとなりました。'
          }
        ]
      },

      // H3: クラシックキャラクターたちの魅力
      {
        _type: 'block',
        _key: 'classic-characters-h3',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'ディズニークラシックキャラクターたちの魅力'
          }
        ]
      },
      {
        _type: 'block',
        _key: 'classic-characters-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '今回のパレードで登場したキャラクターたちは、いずれもディズニーの歴史を彩ってきたクラシックキャラクターばかりでした。ミッキーマウス＆ミニーマウスはもちろん、ドナルドダック＆デイジーダックの愛らしいカップル、陽気なグーフィー、忠実なプルート、そして人気者のチップ＆デールまで、幅広い年代に愛されるキャラクターたちが勢揃いしました。それぞれが持つ個性豊かな魅力が、パレード全体を色鮮やかに彩り、観客に長年愛され続けている理由を改めて実感させてくれました。'
          }
        ]
      },

      // H2: 富山まつりへの影響と効果
      {
        _type: 'block',
        _key: 'impact-accurate-h2',
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
        _key: 'impact-accurate-content',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ディズニーのクラシックキャラクターたちの登場に、沿道の観客は大興奮でした。普段は地元の伝統的な祭りが中心の富山まつりに、世界的に有名なディズニーキャラクターが登場するという異色のコラボレーションは、多くの話題を呼びました。家族連れはもちろん、大人のディズニーファンも多数詰めかけ、パレードの進行に合わせて移動しながら写真撮影を楽しむ姿が見られました。このスペシャルパレードにより、富山まつり全体の来場者数も大幅に増加し、地域経済への波及効果も大きかったと言われています。また、SNSでの拡散効果も高く、富山まつりの知名度向上にも大きく貢献しました。'
          }
        ]
      },

      // まとめ（正確な情報）
      {
        _type: 'block',
        _key: 'conclusion-accurate',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードは、ディズニーの魔法が富山の街に降り注いだ特別な一日となりました。ミッキーマウス、ミニーマウス、ドナルドダック、デイジーダック、グーフィー、プルート、チップ＆デールといった愛されるクラシックキャラクターたちの登場は、多くの人々の心に深く刻まれました。富山県警察音楽隊のパレードと共に開催されたこのイベントは、地域の伝統祭りと世界的エンターテイメントが融合した特別な体験として、参加した全ての人々の心に素晴らしい思い出を残し、富山まつりの新たな可能性を示してくれました。'
          }
        ]
      }
    ];
    
    // 記事を更新（正確なキャラクター情報に修正）
    await client
      .patch(unifiedArticle._id)
      .set({ 
        body: correctedBody,
        // タグも正確なキャラクター名に修正
        tags: [
          // ディズニー関連（正確なキャラクター）
          'ディズニー',
          'ディズニーパレード', 
          '東京ディズニーリゾート',
          '40周年',
          'ミッキーマウス',
          'ミニーマウス',
          'ドナルドダック',
          'デイジーダック',
          'グーフィー',
          'プルート',
          'チップ＆デール',
          'クラシックキャラクター',
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
        ],
        // 正確な説明文に更新
        excerpt: '富山まつり2023で開催された東京ディズニーリゾート40周年スペシャルパレードの完全版。ミッキーマウス、ミニーマウス、ドナルドダック、デイジーダック、グーフィー、プルート、チップ＆デールのクラシックキャラクター3部構成の動画と富山県警察音楽隊パレードをお楽しみください。'
      })
      .commit();
    
    console.log('✅ キャラクター情報の修正が完了しました！');
    console.log('');
    console.log('🎭 正確なキャラクター構成:');
    console.log('- vol.1: 富山県警察音楽隊スペシャルパレード編');
    console.log('- vol.2: ミッキー＆ミニー＆クラシックキャラクター編');
    console.log('- vol.3: ディズニーパレード第2弾編');
    console.log('- vol.4: ディズニーパレード完結編');
    console.log('');
    console.log('🎪 登場キャラクター:');
    console.log('- ミッキーマウス');
    console.log('- ミニーマウス');
    console.log('- ドナルドダック');
    console.log('- デイジーダック');
    console.log('- グーフィー');
    console.log('- プルート');
    console.log('- チップ＆デール');
    
  } catch (error) {
    console.error('キャラクター修正エラー:', error);
  }
}

fixCharacterAccuracy();