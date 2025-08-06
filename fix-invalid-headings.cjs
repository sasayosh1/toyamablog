const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixInvalidHeadings() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事を修正中:', post.title);
    
    // 正しい見出しのマッピング（短いタイトルのみ）
    const validHeadings = [
      'シャルロッテ パティオさくら富山駅前店の概要',
      '絶品ケーキと職人のこだわり',
      '厳選された素材へのこだわり',
      '職人の技術と創作への情熱',
      '居心地の良い店内環境',
      '隠れ家的な空間デザイン',
      '心温まるおもてなし',
      '富山駅前の便利な立地',
      'アクセスの良さ',
      '周辺エリアとの調和',
      'シャルロッテ パティオさくら富山駅前店の楽しみ方',
      '一人での贅沢な時間',
      '大切な人との特別なひととき',
      'テイクアウトでのお楽しみ',
      'まとめ'
    ];
    
    const updatedBody = post.body.map((block, index) => {
      if (block.style === 'h2' || block.style === 'h3') {
        const text = block.children?.map(child => child.text).join('').trim();
        
        // 有効な見出しリストに含まれていないか、50文字を超える場合は通常テキストに戻す
        if (!validHeadings.includes(text) || text.length > 50) {
          console.log(`ブロック${index + 1}を通常テキストに変更: ${text.substring(0, 30)}...`);
          return {
            ...block,
            style: 'normal'
          };
        }
      }
      return block;
    });
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: updatedBody })
      .commit();
    
    console.log('無効な見出しを修正しました');
    
    // 修正後の確認
    const updatedPost = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { body }');
    const headings = updatedPost.body.filter(block => block.style === 'h2' || block.style === 'h3');
    
    console.log('\n修正後の見出し一覧:');
    headings.forEach((block, index) => {
      const text = block.children?.map(child => child.text).join('');
      console.log(`  ${index + 1}. ${block.style.toUpperCase()}: ${text}`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

fixInvalidHeadings();