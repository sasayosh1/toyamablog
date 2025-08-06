const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function finalCheck() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('=== 最終確認 ===');
    console.log('記事:', post.title);
    console.log('本文ブロック数:', post.body ? post.body.length : 0);
    
    if (post.body) {
      const headings = post.body.filter(block => block.style === 'h2' || block.style === 'h3');
      console.log('見出しブロック数:', headings.length);
      
      console.log('\n現在の見出し一覧:');
      headings.forEach((block, index) => {
        const text = block.children?.map(child => child.text).join('');
        console.log(`${index + 1}. ${block.style.toUpperCase()}: ${text}`);
      });
      
      console.log('\n全ブロックのスタイル統計:');
      const styleStats = {};
      post.body.forEach(block => {
        const style = block.style || 'undefined';
        styleStats[style] = (styleStats[style] || 0) + 1;
      });
      
      Object.entries(styleStats).forEach(([style, count]) => {
        console.log(`  ${style}: ${count}個`);
      });
      
      // TOCが正しく動作するために必要な条件をチェック
      console.log('\n=== TOC動作条件チェック ===');
      console.log('✓ 見出しが存在:', headings.length > 0 ? 'OK' : 'NG');
      console.log('✓ h2/h3スタイル:', headings.length >= 1 ? 'OK' : 'NG');
      console.log('✓ 見出しテキスト:', headings.every(h => h.children?.length > 0) ? 'OK' : 'NG');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

finalCheck();