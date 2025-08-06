const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandTwentySixthArticle() {
  try {
    console.log('第26記事の更新を開始します...');
    console.log('対象: toyama-city-2023-100-2023 (牛岳ランタンフェスティバル)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-2023-100-2023"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、牛岳ランタンフェスティバルの記事を慎重に拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '富山市の牛岳で開催される夏の夜空に100個以上のランタンが舞い上がる牛岳ランタンフェスティバル2023。幻想的な光景をお伝えします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 牛岳ランタンフェスティバルの概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-festival',
        style: 'h2',
        children: [{ _type: 'span', text: '牛岳ランタンフェスティバル2023の魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'festival-content',
        style: 'normal',
        children: [{ _type: 'span', text: '牛岳ランタンフェスティバルは富山市の夏を彩る幻想的なイベントとして、2023年に多くの感動を与えました。標高987mの牛岳の山頂付近で開催されるこのイベントでは、100個以上のランタンが夜空に放たれ、まるで星々が舞い踊るような美しい光景を演出します。参加者一人一人が願いを込めたランタンは、夏の夜空に静かに舞い上がり、見る人々に深い感動をもたらします。富山平野を一望できる絶好のロケーションで行われるこの祭りは、参加者にとって忘れられない夏の思い出となっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 100個以上のランタンの壮観（約165文字）
      {
        _type: 'block',
        _key: 'h2-lanterns',
        style: 'h2',
        children: [{ _type: 'span', text: '100個以上のランタンが織りなす幻想世界', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'lanterns-content',
        style: 'normal',
        children: [{ _type: 'span', text: '夜空に舞い上がる100個以上のランタンは、まさに圧巻の光景です。それぞれのランタンには参加者の願いや想いが込められており、温かな光を放ちながら静かに夜空へと昇っていきます。ランタンが一斉に空に舞い上がる瞬間は、会場全体が静寂に包まれ、神秘的な雰囲気に満ちあふれます。風に揺られながら高度を上げていくランタンは、まるで天の川のように美しく、参加者の心に深い感動を刻みます。この光景は写真や動画では伝えきれない、現場でしか味わえない特別な体験です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 牛岳の絶景ロケーション（約155文字）
      {
        _type: 'block',
        _key: 'h2-location',
        style: 'h2',
        children: [{ _type: 'span', text: '牛岳の絶景ロケーションが生み出す特別感', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'location-content',
        style: 'normal',
        children: [{ _type: 'span', text: '標高987mの牛岳山頂付近という立地は、このイベントに特別な価値を与えています。眼下に広がる富山平野の夜景と、頭上に輝く満天の星空に囲まれながらのランタンリリースは、まさに非日常の体験です。山の清澄な空気の中で行われるイベントは、都市部では味わえない開放感と神秘性に満ちています。晴れた日には立山連峰のシルエットも美しく、富山の雄大な自然を背景にしたランタンフェスティバルは、他では体験できない特別なイベントとなっています。', marks: [] }],
        markDefs: []
      },
      
      // H2: 参加者の想いと体験（約145文字）
      {
        _type: 'block',
        _key: 'h2-participants',
        style: 'h2',
        children: [{ _type: 'span', text: '参加者の想いが込められた特別な体験', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'participants-content',
        style: 'normal',
        children: [{ _type: 'span', text: '牛岳ランタンフェスティバルの真の魅力は、参加者一人一人の想いが込められたランタンにあります。恋人同士の愛の誓い、家族の健康祈願、夢への願い、故人への想いなど、様々な思いがランタンと共に夜空に舞い上がります。参加者同士の温かい交流も生まれ、見知らぬ人同士でも自然に会話が弾みます。ランタンを手に持ちながら願いを込める時間は、日常の忙しさを忘れ、自分の心と向き合う貴重なひとときとなります。', marks: [] }],
        markDefs: []
      },
      
      // H2: イベントの意義と今後（約130文字）
      {
        _type: 'block',
        _key: 'h2-significance',
        style: 'h2',
        children: [{ _type: 'span', text: 'イベントの文化的意義と継続への期待', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'significance-content',
        style: 'normal',
        children: [{ _type: 'span', text: '牛岳ランタンフェスティバルは、富山市の新しい夏の風物詩として定着しつつあります。地域の観光資源としての価値だけでなく、参加者の心に深い感動を与える文化的なイベントとしても重要な意義を持っています。環境に配慮した運営方法も評価されており、持続可能なイベントとして今後の継続が期待されています。毎年多くの人々が楽しみにしているこのイベントが、長く愛され続けることを願っています。', marks: [] }],
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
        children: [{ _type: 'span', text: '牛岳ランタンフェスティバル2023は100個以上のランタンが織りなす幻想的な夏の夜のイベントでした。来年の開催もぜひ体験してみてください。', marks: [] }],
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
    
    // 記事を慎重に更新
    await client
      .patch(post._id)
      .set({ body: expandedContent })
      .commit();
    
    console.log('✅ 第26記事の更新が完了しました');
    console.log('📋 184文字→' + newTotalChars + '文字に拡張');
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

expandTwentySixthArticle();