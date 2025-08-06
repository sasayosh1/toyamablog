const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function verifyCurrentState() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('現在の記事状態:');
    console.log('タイトル:', post.title);
    
    let totalChars = 0;
    const headings = [];
    
    post.body.forEach((block, index) => {
      if (block._type === 'block' && block.children) {
        const text = block.children.map(child => child.text).join('');
        totalChars += text.length;
        
        if (block.style === 'h2' || block.style === 'h3') {
          headings.push({
            style: block.style,
            text: text
          });
        }
      }
    });
    
    console.log('総文字数:', totalChars + '文字');
    console.log('見出し構造:');
    headings.forEach((h, i) => {
      console.log((i + 1) + '. ' + h.style.toUpperCase() + ': ' + h.text);
    });
    
    console.log('H2見出し数:', headings.filter(h => h.style === 'h2').length);
    console.log('H3見出し数:', headings.filter(h => h.style === 'h3').length);
    
    if (headings.filter(h => h.style === 'h3').length === 0) {
      console.log('✅ H3見出しの削除が完了しています');
    }
    
    if (totalChars >= 950 && totalChars <= 1050) {
      console.log('✅ 文字数が1000文字前後に調整されています');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

verifyCurrentState();