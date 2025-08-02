import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// HTMLエンティティをデコードする関数
function decodeHtmlEntities(text) {
  const entities = {
    '&#x1f338;': '🌸',
    '&#x1f431;': '🐱', 
    '&#x1f525;': '🔥',
    '&#x2668;': '♨',
    '&#xfe0f;': '', // 異体字セレクター（通常は削除）
    '&#x263a;': '☺',
    '&#x2728;': '✨',
    '&#x1f390;': '🎐',
    '&#x2b50;': '⭐',
    '&#038;': '&',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  };
  
  let decoded = text;
  for (const [entity, replacement] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
  }
  
  return decoded;
}

// タイトルをクリーンアップする関数
function cleanTitle(title) {
  if (!title) return title;
  
  let cleaned = title;
  
  // HTMLエンティティをデコード
  cleaned = decodeHtmlEntities(cleaned);
  
  // #shortsを削除（前後の空白も含めて）
  cleaned = cleaned.replace(/\s*#shorts\s*/gi, '');
  
  // 末尾の余分な空白や記号を削除
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function fixTitles() {
  try {
    console.log('🔧 タイトルの修正を開始します...\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 総記事数: ${posts.length}件\n`);
    
    let fixedCount = 0;
    
    for (const post of posts) {
      const originalTitle = post.title;
      const cleanedTitle = cleanTitle(originalTitle);
      
      // タイトルに変更があるかチェック
      if (originalTitle !== cleanedTitle) {
        console.log(`🔧 修正対象: ${post.slug}`);
        console.log(`   変更前: "${originalTitle}"`);
        console.log(`   変更後: "${cleanedTitle}"`);
        
        try {
          // タイトルを更新
          await client
            .patch(post._id)
            .set({ title: cleanedTitle })
            .commit();
          
          console.log(`   ✅ 更新成功\n`);
          fixedCount++;
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`   ❌ 更新失敗: ${error.message}\n`);
        }
      }
    }
    
    console.log('🎉 タイトル修正完了！');
    console.log(`📊 修正結果:`);
    console.log(`- 総記事数: ${posts.length}件`);
    console.log(`- 修正した記事数: ${fixedCount}件`);
    console.log(`- 修正が不要だった記事数: ${posts.length - fixedCount}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

fixTitles();