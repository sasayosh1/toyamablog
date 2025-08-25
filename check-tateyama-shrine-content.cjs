const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkTateyamaShrineContent() {
  try {
    console.log('🔍 立山町神社記事の内容を詳細確認中...');
    
    // スラッグで記事を検索
    const article = await client.fetch(`*[_type == "post" && slug.current == "tateyama-town-shrine"][0] { _id, title, slug, body }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりませんでした');
      return;
    }
    
    console.log('✅ 記事が見つかりました:');
    console.log('ID:', article._id);
    console.log('タイトル:', article.title);
    console.log('本文ブロック数:', article.body.length);
    console.log('');
    
    // 各ブロックを詳しく確認
    article.body.forEach((block, index) => {
      console.log(`ブロック ${index + 1}: ${block._type}`);
      
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        if (text.trim()) {
          console.log(`  テキスト: ${text}`);
          
          // URLらしきものをチェック
          if (text.includes('http') || text.includes('www') || text.includes('.org') || text.includes('.com')) {
            console.log(`  ⚠️ URLを含む可能性: ${text}`);
          }
        }
      } else if (block._type === 'html') {
        console.log(`  HTML: ${block.html ? block.html.substring(0, 100) + '...' : 'なし'}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkTateyamaShrineContent();