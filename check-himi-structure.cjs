const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkHimiTempleStructure() {
  try {
    console.log('🔍 氷見市光久寺記事の構造を確認中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "4zxT7RlbAnSlGPWZgbmUTQ"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 記事: ${article.title}`);
    console.log(`📊 総ブロック数: ${article.body ? article.body.length : 0}`);
    console.log('\n📋 記事構造:');
    
    let summaryBlocks = [];
    let mapBlockIndex = -1;
    
    if (article.body) {
      article.body.forEach((block, index) => {
        if (block._type === 'block' && block.style) {
          console.log(`ブロック ${index + 1}: ${block.style.toUpperCase()}`);
          if (block.children) {
            const text = block.children.map(child => child.text).join('');
            console.log(`   内容: ${text.substring(0, 50)}...`);
          }
        } else if (block._type === 'html' && block.html && block.html.includes('maps')) {
          console.log(`ブロック ${index + 1}: HTML (Googleマップ)`);
          mapBlockIndex = index;
        } else if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          
          // まとめ関連キーワードをチェック
          if (text.includes('まとめ') || text.includes('総括') || text.includes('結論') || 
              text.includes('最後に') || text.includes('いかがでしたか') ||
              text.includes('ぜひ一度') || text.includes('訪れてみて')) {
            console.log(`⭐ ブロック ${index + 1}: まとめ関連部分`);
            console.log(`   内容: ${text.substring(0, 100)}...`);
            summaryBlocks.push({ index, text: text.substring(0, 200) });
          } else {
            console.log(`ブロック ${index + 1}: 通常テキスト`);
            console.log(`   内容: ${text.substring(0, 50)}...`);
          }
        } else {
          console.log(`ブロック ${index + 1}: ${block._type}`);
        }
      });
      
      console.log(`\n🗺️ マップの位置: ブロック ${mapBlockIndex + 1}`);
      console.log(`📝 まとめ部分の数: ${summaryBlocks.length}`);
      
      if (summaryBlocks.length > 0) {
        console.log('\n📋 まとめ部分の詳細:');
        summaryBlocks.forEach((summary, i) => {
          console.log(`${i + 1}. ブロック ${summary.index + 1}: ${summary.text}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkHimiTempleStructure();