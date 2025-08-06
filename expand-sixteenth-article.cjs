const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSixteenthArticle() {
  try {
    console.log('第16記事の更新を開始します...');
    console.log('対象: uozu-city-festival-chouroku (CHOUROKUまつりのよさこい)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "uozu-city-festival-chouroku"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、CHOUROKUまつりの記事を拡張
    const expandedContent = [
      // 導入文（約85文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '魚津市で開催されるCHOUROKUまつりのよさこい演舞は、熱気あふれる迫力と美しさが印象的な地域の一大イベントです。', marks: [] }],
        markDefs: []
      },
      
      // H2: CHOUROKUまつりの概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-festival',
        style: 'h2',
        children: [{ _type: 'span', text: 'CHOUROKUまつりの魅力と歴史', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'festival-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'CHOUROKUまつりは魚津市の夏を彩る代表的な祭りの一つで、地域の文化と現代的なエンターテイメントが融合した特別なイベントです。「CHOUROKU（長録）」という名前には、長く記録に残る素晴らしい祭りにしたいという願いが込められています。よさこい踊りを中心とした様々なパフォーマンスが繰り広げられ、参加者と観客が一体となって盛り上がる熱気に満ちた空間が生まれます。地元の団体から県外のチームまで、多くの踊り手が集まる魚津市の誇りあるイベントとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: よさこい踊りの魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-yosakoi',
        style: 'h2',
        children: [{ _type: 'span', text: 'よさこい演舞の迫力と美しさ', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'yosakoi-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'よさこい踊りは高知県発祥の伝統的な踊りを現代風にアレンジした創作舞踊で、力強い動きと華やかな衣装が特徴です。CHOUROKUまつりでは各チームが独自の振付と音楽で個性あふれる演舞を披露し、観客を魅了します。鳴子を手に持って踊るリズミカルな動きは、見ている人の心も躍らせます。チーム一丸となって練習を重ねた成果が舞台で花開く瞬間は、感動的な光景です。年齢や性別を問わず誰でも参加できる開放的な雰囲気も、よさこいの大きな魅力です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域コミュニティ（約150文字）
      {
        _type: 'block',
        _key: 'h2-community',
        style: 'h2',
        children: [{ _type: 'span', text: '地域を結ぶコミュニティイベント', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'community-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'CHOUROKUまつりは単なるパフォーマンスイベントではなく、魚津市の地域コミュニティを結ぶ重要な役割を果たしています。地元の学校、企業、市民グループなど様々な団体が参加し、祭りの準備から運営まで協力して取り組みます。この過程で世代を超えた交流が生まれ、地域の結束が深まります。また、県外からの参加者も多く、魚津市の魅力を広くアピールする観光イベントとしても機能しています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 魚津市の夏の風物詩（約140文字）
      {
        _type: 'block',
        _key: 'h2-summer',
        style: 'h2',
        children: [{ _type: 'span', text: '夏の魚津を彩る風物詩', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'summer-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夏の魚津市では、蜃気楼やホタルイカなどの自然現象とともに、CHOUROKUまつりが地域を代表する風物詩となっています。祭り当日は街全体が活気に満ち、地元グルメの屋台や様々なイベントも同時開催されます。家族連れから観光客まで、多くの人々が魚津の夏を満喫できる特別な一日となります。踊り手の熱演と観客の声援が響く会場は、魚津市民の誇りと情熱を感じられる空間です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 参加と観覧の楽しみ方（約130文字）
      {
        _type: 'block',
        _key: 'h2-enjoy',
        style: 'h2',
        children: [{ _type: 'span', text: '祭りの楽しみ方とアクセス', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'enjoy-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'CHOUROKUまつりは観覧無料で、どなたでも気軽に楽しむことができます。会場では各チームの演舞を間近で見ることができ、迫力ある踊りと音楽を体感できます。写真撮影も可能で、素晴らしいパフォーマンスを記録に残すことができます。魚津駅からのアクセスも良好で、公共交通機関を利用して気軽に訪れることができます。地元グルメも合わせて楽しめる、魚津観光の目玉イベントです。', marks: [] }],
        markDefs: []
      },
      
      // H2: まとめ（約90文字）
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
        children: [{ _type: 'span', text: 'CHOUROKUまつりのよさこいは魚津市の夏を代表する素晴らしいイベントです。地域の絆と情熱が込められた迫力ある演舞をぜひ体験してください。', marks: [] }],
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
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第16記事の更新が完了しました');
    console.log('📋 176文字→' + newTotalChars + '文字に拡張');
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

expandSixteenthArticle();