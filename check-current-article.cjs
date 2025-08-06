const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function getCurrentArticle() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('現在の記事構造:');
    console.log('タイトル:', post.title);
    console.log('ブロック数:', post.body.length);
    
    let totalChars = 0;
    const textBlocks = [];
    
    post.body.forEach((block, index) => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        if (text.trim()) {
          console.log(`ブロック${index + 1}: ${block.style || 'normal'} - ${text.length}文字`);
          console.log(`内容: ${text.substring(0, 80)}...`);
          totalChars += text.length;
          textBlocks.push({
            index: index + 1,
            style: block.style || 'normal',
            text: text,
            length: text.length
          });
        }
      }
    });
    
    console.log(`\n現在の総文字数: ${totalChars}文字`);
    console.log('目標: 1000文字に縮小');
    console.log(`削減必要文字数: ${totalChars - 1000}文字`);
    
    // 見出しブロックを確認
    const headings = textBlocks.filter(block => block.style === 'h2' || block.style === 'h3');
    console.log(`\n見出し数: ${headings.length}個`);
    headings.forEach(h => {
      console.log(`- ${h.style.toUpperCase()}: ${h.text}`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

getCurrentArticle();