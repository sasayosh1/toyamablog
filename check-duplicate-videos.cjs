const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkCatArticleVideos() {
  try {
    const article = await client.fetch('*[_type == "post" && _id == "o031colbTiBAm1wuPGbpjR"][0] { _id, title, body }');
    
    if (!article) {
      console.log('記事が見つかりません');
      return;
    }
    
    console.log('記事:', article.title);
    console.log('現在のブロック数:', article.body ? article.body.length : 0);
    console.log('\n=== 全ブロック一覧 ===');
    
    if (article.body) {
      article.body.forEach((block, index) => {
        console.log(`\nブロック ${index + 1}:`);
        console.log('タイプ:', block._type);
        console.log('キー:', block._key);
        
        if (block._type === 'youtube' || block._type === 'youtubeShorts') {
          console.log('🎥 YouTube URL:', block.url);
          console.log('📝 タイトル:', block.title || 'なし');
        } else if (block._type === 'html' && block.html && block.html.includes('iframe')) {
          console.log('🌐 HTML iframe:', block.html.substring(0, 100) + '...');
        } else if (block._type === 'block') {
          const text = block.children?.map(child => child.text).join('') || '';
          if (text.trim()) {
            console.log('📝 テキスト:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
          }
        }
      });
      
      // 動画ブロックを特定
      const videoBlocks = article.body.filter((block, index) => 
        block._type === 'youtube' || 
        block._type === 'youtubeShorts' ||
        (block._type === 'html' && block.html && block.html.includes('iframe'))
      );
      
      console.log(`\n=== 動画ブロック一覧 (${videoBlocks.length}個) ===`);
      videoBlocks.forEach((block, index) => {
        const originalIndex = article.body.findIndex(b => b._key === block._key);
        console.log(`${index + 1}. ブロック位置: ${originalIndex + 1}, タイプ: ${block._type}`);
        if (block.url) {
          console.log(`   URL: ${block.url}`);
        }
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkCatArticleVideos();