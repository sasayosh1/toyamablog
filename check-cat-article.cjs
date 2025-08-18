const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkCatArticleContent() {
  try {
    const article = await client.fetch('*[_type == "post" && _id == "o031colbTiBAm1wuPGbpjR"][0] { _id, title, body }');
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事:', article.title);
    console.log('現在のブロック数:', article.body ? article.body.length : 0);
    console.log('\n=== 全ブロック詳細 ===');
    
    if (article.body) {
      article.body.forEach((block, index) => {
        console.log(`\nブロック ${index + 1}:`);
        console.log('タイプ:', block._type);
        console.log('キー:', block._key);
        
        if (block._type === 'youtube') {
          console.log('🎥 YouTube URL:', block.url);
        } else if (block._type === 'html') {
          console.log('🌐 HTML内容:', block.html ? block.html.substring(0, 100) + '...' : 'なし');
          // Rick Astleyの動画が含まれているかチェック
          if (block.html && (block.html.includes('Rick') || block.html.includes('dQw4w9WgXcQ') || block.html.toLowerCase().includes('never gonna'))) {
            console.log('⚠️  このHTMLブロックにRick Astley動画が含まれています！');
          }
        } else if (block._type === 'block') {
          const text = block.children?.map(child => child.text).join('') || '';
          if (text.trim()) {
            console.log('📝 テキスト:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
          }
        }
      });
      
      // 動画関連ブロックのまとめ
      const videoBlocks = article.body.filter(block => 
        block._type === 'youtube' || 
        (block._type === 'html' && block.html && (
          block.html.includes('youtube') || 
          block.html.includes('iframe') ||
          block.html.includes('Rick') ||
          block.html.includes('dQw4w9WgXcQ')
        ))
      );
      
      console.log(`\n=== 動画関連ブロック一覧 (${videoBlocks.length}個) ===`);
      videoBlocks.forEach((block, index) => {
        console.log(`${index + 1}. タイプ: ${block._type}`);
        if (block._type === 'youtube') {
          console.log(`   URL: ${block.url}`);
        } else if (block._type === 'html') {
          console.log(`   HTML: ${block.html?.substring(0, 80)}...`);
        }
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkCatArticleContent();