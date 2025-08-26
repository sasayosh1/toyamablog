const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkOyabeArticleContent() {
  try {
    console.log('🔍 小矢部市記事の本文構造を確認中...');
    
    const article = await client.fetch(`*[_type == "post" && _id == "o031colbTiBAm1wuPGbqSb"][0] {
      _id, title, body
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log(`📄 記事: ${article.title}`);
    console.log(`📊 本文ブロック数: ${article.body ? article.body.length : 0}`);
    
    if (article.body) {
      article.body.forEach((block, index) => {
        console.log(`\nブロック ${index + 1}: ${block._type}`);
        
        if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('');
          console.log(`  内容: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
          
          // YouTube概要欄からの引用部分を検索
          if (text.includes('[YouTube:') || 
              text.includes('【公式】') || 
              text.includes('http://www.cross-oyabe.jp') ||
              text.includes('#富山') ||
              text.includes('#小矢部') ||
              text.includes('#クロスランドおやべ') ||
              text.includes('YouTube Shorts:')) {
            console.log('  ⚠️ YouTube概要欄からの引用部分を検出');
            console.log(`  🗑️ 削除対象: ${text}`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 確認エラー:', error.message);
  }
}

checkOyabeArticleContent();