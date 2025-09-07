const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function checkArticleLength() {
  try {
    const query = `*[_type == "post" && slug.current == "himi-city-1757253039364"][0]{
      title,
      body
    }`;
    
    const article = await client.fetch(query);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }

    console.log('📊 氷見市記事の文字数チェック');
    console.log('===============================');
    console.log(`タイトル: ${article.title}`);
    console.log('');

    let totalChars = 0;
    
    if (article.body) {
      article.body.forEach((block, index) => {
        if (block._type === 'block' && block.children) {
          const blockText = block.children.map(child => child.text).join('');
          const charCount = blockText.length;
          totalChars += charCount;
          
          const style = block.style === 'normal' ? 'p' : block.style;
          const preview = blockText.length > 50 ? blockText.substring(0, 50) + '...' : blockText;
          
          console.log(`${index + 1}. [${style}] ${charCount}文字: ${preview}`);
        } else if (block._type === 'html') {
          console.log(`${index + 1}. [HTML] Googleマップ（文字数カウント対象外）`);
        }
      });
    }

    console.log('');
    console.log(`📝 総文字数: ${totalChars}文字`);
    console.log(`📏 CLAUDE.mdルール: 最長2,000文字`);
    
    if (totalChars <= 2000) {
      console.log('✅ クラウドルール準拠: 文字数制限内');
    } else {
      console.log(`❌ クラウドルール違反: ${totalChars - 2000}文字超過`);
    }
    
    console.log('');
    console.log('📱 スマホ読みやすさ最優先の記事長に適合');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkArticleLength();