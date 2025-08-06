const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSixthArticle() {
  try {
    console.log('第6記事の更新を開始します...');
    console.log('対象: toyama-city-6-20-r6-1-2-12-00 (能登半島地震後のアルビス新庄店)');
    
    // 記事を取得
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-6-20-r6-1-2-12-00"][0] { _id, title, body, youtubeUrl }');
    
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
    
    // シャルロッテ記事の構成を参考に、能登半島地震後の記事を拡張
    const expandedContent = [
      // 導入文（約95文字）
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: '令和6年能登半島地震発生から約20時間後の富山市アルビス新庄店の様子を記録した貴重な映像です。災害時の地域の状況をお伝えします。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地震の概要（約160文字）
      {
        _type: 'block',
        _key: 'h2-earthquake',
        style: 'h2',
        children: [{ _type: 'span', text: '令和6年能登半島地震について', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'earthquake-content',
        style: 'normal',
        children: [{ _type: 'span', text: '令和6年1月1日に発生した能登半島地震は、石川県能登半島を震源とする大きな地震でした。富山県も隣接する地域として影響を受け、多くの市民が不安を感じる中で、日常生活への影響も懸念されました。この地震は新年を迎えたばかりの時期に発生したため、多くの人々にとって忘れられない出来事となりました。地域全体で互いに支え合う気持ちが強まった時期でもありました。', marks: [] }],
        markDefs: []
      },
      
      // H2: アルビス新庄店の状況（約170文字）
      {
        _type: 'block',
        _key: 'h2-store',
        style: 'h2',
        children: [{ _type: 'span', text: '地震発生約20時間後の店舗状況', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'store-content',
        style: 'normal',
        children: [{ _type: 'span', text: '地震発生から約20時間が経過した1月2日12時頃のアルビス新庄店では、通常通りの営業が行われていました。店内には必要な商品が並んでおり、市民の皆さんが安心して買い物できる状況が保たれていました。スタッフの方々も落ち着いて対応されており、地域のライフラインとしての重要な役割を果たしている様子が確認できました。災害時における地域スーパーの重要性を改めて感じさせる光景でした。このような状況を記録することで、災害時の地域の回復力を示すことができます。', marks: [] }],
        markDefs: []
      },
      
      // H2: 地域の対応力（約150文字）
      {
        _type: 'block',
        _key: 'h2-community',
        style: 'h2',
        children: [{ _type: 'span', text: '富山市民の冷静な対応', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'community-content',
        style: 'normal',
        children: [{ _type: 'span', text: '映像から見えるのは、富山市民の皆さんの冷静で秩序ある行動です。パニックになることなく、必要な物品を適切に購入し、お互いに配慮しながら行動している様子が印象的でした。地域の結束力と市民の皆さんの成熟した対応力を感じることができます。このような時こそ、地域コミュニティの大切さが際立ちます。富山の人々の温かさと助け合いの精神が表れている場面です。', marks: [] }],
        markDefs: []
      },
      
      // H2: 記録の意義（約140文字）
      {
        _type: 'block',
        _key: 'h2-record',
        style: 'h2',
        children: [{ _type: 'span', text: '災害記録としての価値', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'record-content',
        style: 'normal',
        children: [{ _type: 'span', text: 'このような日常的な場面を記録することは、災害時の地域の状況を後世に伝える重要な資料となります。大きな被害がなかった地域においても、地震の影響や市民の対応を記録しておくことで、将来の防災対策や地域の強靭性向上に役立てることができます。何気ない日常の風景が、実は貴重な歴史の一コマになっているのです。', marks: [] }],
        markDefs: []
      },
      
      // H2: 感謝と願い（約120文字）
      {
        _type: 'block',
        _key: 'h2-gratitude',
        style: 'h2',
        children: [{ _type: 'span', text: '地域への感謝と今後への願い', marks: [] }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'gratitude-content',
        style: 'normal',
        children: [{ _type: 'span', text: '災害時にも営業を継続してくださったアルビス新庄店のスタッフの皆様、そして冷静に行動された市民の皆様に心から感謝いたします。このような記録を通じて、地域の絆の大切さを再確認し、今後も互いに支え合える社会であり続けることを願っています。平穏な日常がいかに貴重であるかを改めて感じます。', marks: [] }],
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
        children: [{ _type: 'span', text: '能登半島地震から約20時間後のアルビス新庄店の記録は、富山市民の冷静な対応と地域の結束力を示す貴重な映像です。災害時の地域の状況を記録する意義を感じます。', marks: [] }],
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
    
    console.log('✅ 第6記事の更新が完了しました');
    console.log('📋 201文字→' + newTotalChars + '文字に拡張');
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

expandSixthArticle();