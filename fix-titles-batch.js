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

async function fixTitlesBatch() {
  try {
    console.log('🔧 残りのタイトル修正を開始します...\n');
    
    // まだ#shortsが含まれている記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && title match "*#shorts*"]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 #shortsが含まれる記事数: ${posts.length}件\n`);
    
    if (posts.length === 0) {
      console.log('✅ 全ての#shortsが削除済みです');
      
      // HTMLエンティティが含まれている記事をチェック
      const htmlEntityPosts = await client.fetch(`
        *[_type == "post" && defined(publishedAt) && (
          title match "*&#*" || 
          title match "*&amp;*" ||
          title match "*&lt;*" ||
          title match "*&gt;*" ||
          title match "*&quot;*"
        )]{ 
          _id,
          title, 
          "slug": slug.current,
          publishedAt
        } | order(publishedAt desc)
      `);
      
      console.log(`🔧 HTMLエンティティが含まれる記事数: ${htmlEntityPosts.length}件\n`);
      
      if (htmlEntityPosts.length > 0) {
        let fixedCount = 0;
        
        for (const post of htmlEntityPosts) {
          const originalTitle = post.title;
          const cleanedTitle = cleanTitle(originalTitle);
          
          if (originalTitle !== cleanedTitle) {
            console.log(`🔧 修正中: ${post.slug}`);
            console.log(`   変更前: "${originalTitle}"`);
            console.log(`   変更後: "${cleanedTitle}"`);
            
            try {
              await client
                .patch(post._id)
                .set({ title: cleanedTitle })
                .commit();
              
              console.log(`   ✅ 更新成功\n`);
              fixedCount++;
              
              // レート制限対策
              await new Promise(resolve => setTimeout(resolve, 200));
              
            } catch (error) {
              console.error(`   ❌ 更新失敗: ${error.message}\n`);
            }
          }
        }
        
        console.log(`📊 HTMLエンティティ修正完了: ${fixedCount}件`);
      } else {
        console.log('✅ HTMLエンティティの修正も完了済みです');
      }
      
      return;
    }
    
    // バッチ処理でトランザクションを作成
    const transaction = client.transaction();
    
    posts.forEach(post => {
      const cleanedTitle = cleanTitle(post.title);
      if (post.title !== cleanedTitle) {
        transaction.patch(post._id, { set: { title: cleanedTitle } });
        console.log(`📝 バッチに追加: ${post.slug}`);
        console.log(`   "${post.title}" → "${cleanedTitle}"`);
      }
    });
    
    console.log('\n🚀 バッチ更新を実行中...');
    await transaction.commit();
    
    console.log('🎉 バッチ更新完了！');
    console.log(`📊 修正した記事数: ${posts.length}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

fixTitlesBatch();