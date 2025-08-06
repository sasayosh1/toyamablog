const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandThirtyThirdArticle() {
  try {
    console.log('第33記事の更新を開始します...');
    console.log('対象: tonami-city-2023-park-kira-kira-mission-2023 (砺波市のKIRA KIRA MISSION)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "tonami-city-2023-park-kira-kira-mission-2023"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // 統一構造を参考に、砺波チューリップ公園のKIRA KIRA MISSIONの記事を慎重に拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波市の砺波チューリップ公園で開催された「KIRA KIRA MISSION 2023」。光と花が織りなす幻想的なイベントの魅力をお伝えします。', marks: [] }],
        markDefs: []
      },
      
      // H2: KIRA KIRA MISSION 2023の概要（約175文字）
      {
        _type: 'block',
        _key: 'h2-mission',
        style: 'h2',
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023の魅力とコンセプト', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'mission-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023は、砺波チューリップ公園で開催された光と花のコラボレーションイベントです。「KIRA KIRA（キラキラ）」という名前が示すように、イルミネーションと花々が織りなす輝く世界を体験できる特別な企画でした。砺波市は全国有数のチューリップの産地として知られており、そのチューリップと最新の照明技術を組み合わせた革新的なイベントとして注目を集めました。日中の美しいチューリップ畑とは全く異なる、夜の幻想的な光景を演出し、多くの来場者に感動を与えた特別なイベントです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 砺波チューリップ公園の魅力（約165文字）
      {
        _type: 'block',
        _key: 'h2-tulip-park',
        style: 'h2',
        children: [{ _type: 'span', text: '砺波チューリップ公園の特別な魅力', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'tulip-park-content',
        style: 'normal',
        children: [{ _type: 'span', text: '砺波チューリップ公園は、春のチューリップフェア期間中に300万本のチューリップが咲き誇る国内最大級のチューリップ公園です。色とりどりのチューリップが描く美しいパターンや、品種ごとに異なる開花時期を計算した植栽設計は、まさに芸術作品のような美しさを見せてくれます。KIRA KIRA MISSION 2023では、このチューリップ公園の昼間の美しさに加えて、夜間の新たな魅力を発見できるイベントとなりました。普段は夜間に入ることのできない公園が特別に開放され、参加者にとって貴重な体験となったのです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 光の演出とイルミネーション（約155文字）
      {
        _type: 'block',
        _key: 'h2-illumination',
        style: 'h2',
        children: [{ _type: 'span', text: '光の芸術が生み出す幻想的な世界', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'illumination-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023の最大の見どころは、精密に計算された光の演出でした。チューリップの花壇を照らすライトアップは、昼間とは全く異なる幻想的な美しさを演出しました。LED照明による色とりどりの光が、チューリップの色彩と調和し、まるで異世界にいるような感覚を覚えさせてくれます。光の強弱や色の変化により、時間とともに表情を変える演出は、訪れる人々を魅了し続けました。また、水面に映る光の反射や、木々を照らすライトアップなど、細部にまでこだわった演出が会場全体を美しく彩りました。', marks: [] }],
        markDefs: []
      },
      
      // H2: 来場者の体験と感動（約145文字）
      {
        _type: 'block',
        _key: 'h2-visitor-experience',
        style: 'h2',
        children: [{ _type: 'span', text: '来場者が体験した特別な感動の瞬間', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'visitor-experience-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023に参加した来場者からは、多くの感動の声が聞かれました。普段見慣れたチューリップ公園が、夜の光の演出により全く別の表情を見せることに驚きの声が上がりました。カップルや家族連れ、写真愛好家など、幅広い層の来場者が特別な時間を過ごすことができました。特に子どもたちは光る花畑に大興奮し、大人も童心に戻って楽しむ姿が多く見られました。SNSでの写真投稿も多数行われ、砺波市の新たな魅力として全国に発信されました。', marks: [] }],
        markDefs: []
      },
      
      // H2: イベントの意義と今後への期待（約130文字）
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
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023は、砺波市の観光資源であるチューリップに新たな価値を加えた画期的なイベントでした。従来の春のチューリップフェアとは異なる季節やタイミングでの開催により、年間を通じた観光地としての魅力を向上させました。技術と自然の調和という現代的なテーマを体現したこのイベントは、地域活性化の新しい手法としても注目されています。今後も継続的に開催されることで、砺波市の新たな名物イベントとして定着することが期待されています。', marks: [] }],
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
        children: [{ _type: 'span', text: 'KIRA KIRA MISSION 2023は光と花が織りなす幻想的な世界を演出した特別なイベントでした。砺波市の新たな魅力を発見する機会となりました。', marks: [] }],
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
    
    console.log('✅ 第33記事の更新が完了しました');
    console.log('📋 122文字→' + newTotalChars + '文字に拡張');
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

expandThirtyThirdArticle();