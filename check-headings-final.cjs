const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkHeadingStyles() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事:', post.title);
    console.log('本文ブロック数:', post.body ? post.body.length : 0);
    
    if (post.body) {
      const headings = post.body.filter(block => block.style === 'h2' || block.style === 'h3');
      console.log('見出しブロック数:', headings.length);
      
      console.log('\n見出し一覧:');
      headings.forEach((block, index) => {
        const text = block.children?.map(child => child.text).join('');
        console.log(`  ${index + 1}. ${block.style.toUpperCase()}: ${text}`);
      });
      
      // 全ブロックの最初の10個をチェック
      console.log('\n最初の10ブロックのスタイル:');
      post.body.slice(0, 10).forEach((block, index) => {
        const text = block.children?.map(child => child.text).join('').substring(0, 50);
        console.log(`  ブロック${index + 1}: style=${block.style || 'undefined'} - ${text}...`);
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkHeadingStyles();