const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function removeMapTexts() {
  try {
    console.log('🗺️ 全記事のGoogleマップから上下のテキストを削除中...\n');
    
    // HTMLブロックを含む記事を検索
    const posts = await client.fetch(`*[_type == "post" && defined(body)] {
      _id,
      title,
      body[] {
        _type,
        _key,
        html
      }
    }`);
    
    let updatedCount = 0;
    
    for (const post of posts) {
      let hasMapChanges = false;
      const updatedBody = post.body.map(block => {
        if (block._type === 'html' && block.html && block.html.includes('iframe') && block.html.includes('maps')) {
          // Googleマップのiframeブロックを特定
          const isGoogleMap = block.html.includes('google.com/maps') || block.html.includes('googletagmanager');
          
          if (isGoogleMap) {
            console.log(`📍 マップを発見: ${post.title}`);
            
            // h4タイトルとp説明文を削除し、iframeのみ残す
            let cleanHtml = block.html;
            
            // h4タイトル削除（📍 で始まるタイトル）
            cleanHtml = cleanHtml.replace(/<h4[^>]*>.*?📍.*?<\/h4>/gi, '');
            
            // p説明文削除（下部の説明）
            cleanHtml = cleanHtml.replace(/<p[^>]*style="margin-top: 10px[^"]*"[^>]*>.*?<\/p>/gi, '');
            
            // divのスタイリングも簡素化（パディングと背景色を削除）
            cleanHtml = cleanHtml.replace(
              /style="[^"]*"/gi, 
              'style="margin: 20px 0; text-align: center;"'
            );
            
            if (cleanHtml !== block.html) {
              hasMapChanges = true;
              console.log('  ✅ テキストを削除');
              return {
                ...block,
                html: cleanHtml
              };
            }
          }
        }
        return block;
      });
      
      if (hasMapChanges) {
        await client
          .patch(post._id)
          .set({ body: updatedBody })
          .commit();
        
        updatedCount++;
        console.log(`  📝 記事を更新: ${post.title}\n`);
      }
    }
    
    console.log(`✅ 更新完了！${updatedCount}記事のマップテキストを削除しました`);
    
    if (updatedCount === 0) {
      console.log('📍 マップ付きの記事が見つからないか、既にクリーンな状態です');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

removeMapTexts();