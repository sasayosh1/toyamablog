const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugMapDetection() {
  try {
    console.log('🔍 マップ検出のデバッグ開始...');
    
    // 南砺市の記事を詳しくチェック
    const nantoArticle = await client.fetch(`*[_type == "post" && _id == "7gNGK9M49tqCuJRraovihd"][0] { _id, title, body }`);
    
    console.log('\n📄 記事:', nantoArticle.title);
    console.log('🧱 本文ブロック数:', nantoArticle.body ? nantoArticle.body.length : 0);
    
    if (nantoArticle.body) {
      console.log('\n📊 ブロック詳細:');
      nantoArticle.body.forEach((block, index) => {
        console.log(`ブロック ${index + 1}:`);
        console.log(`  タイプ: ${block._type}`);
        
        if (block._type === 'html') {
          console.log(`  HTML内容の長さ: ${block.html ? block.html.length : 0}`);
          if (block.html) {
            const hasMaps = block.html.includes('maps');
            const hasGoogle = block.html.includes('google');
            const hasIframe = block.html.includes('iframe');
            console.log(`  マップ関連チェック:`);
            console.log(`    - "maps"を含む: ${hasMaps}`);
            console.log(`    - "google"を含む: ${hasGoogle}`);
            console.log(`    - "iframe"を含む: ${hasIframe}`);
            
            if (hasMaps || hasGoogle || hasIframe) {
              console.log(`  HTML内容の一部: ${block.html.substring(0, 100)}...`);
            }
          }
        } else if (block._type === 'block' && block.children) {
          const text = block.children.map(child => child.text).join('').substring(0, 50);
          console.log(`  テキスト: ${text}...`);
        }
      });
      
      // マップブロック数をカウント
      const mapBlocks = nantoArticle.body.filter(block => 
        block._type === 'html' && 
        block.html && 
        block.html.includes('maps')
      );
      
      console.log(`\n🗺️ 検出されたマップブロック数: ${mapBlocks.length}`);
    }
    
    // 他の記事もランダムにチェック
    console.log('\n🎲 他の記事のマップ状況をチェック...');
    const randomArticles = await client.fetch(`*[_type == "post"][0...3] { _id, title, body }`);
    
    let totalMapsFound = 0;
    for (const article of randomArticles) {
      if (article.body) {
        const mapCount = article.body.filter(block => 
          block._type === 'html' && 
          block.html && 
          block.html.includes('maps')
        ).length;
        
        totalMapsFound += mapCount;
        console.log(`${article.title.substring(0, 30)}... → マップ: ${mapCount}個`);
      }
    }
    
    console.log(`\n📈 サンプル3記事での総マップ数: ${totalMapsFound}`);
    
    console.log('\n🔚 デバッグ完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

debugMapDetection();