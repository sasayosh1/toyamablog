import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 簡潔なslug生成関数
function generateCleanSlug(title) {
  if (!title) return 'untitled';
  
  // 地域抽出
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1].replace(/[市町村]/g, '').toLowerCase() : '';
  
  // コンテンツ抽出とクリーンアップ
  let content = title
    .replace(/【[^】]+】/g, '') // 地域除去
    .replace(/#shorts?/gi, '') // shorts除去
    .replace(/[！!？?｜|]/g, '') // 記号除去
    .replace(/[（）()「」]/g, '') // 括弧除去
    .replace(/[。、，,・]/g, '') // 句読点除去
    .replace(/\s+/g, '-') // スペース変換
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '') // 日本語英数字のみ
    .replace(/-+/g, '-') // 連続ハイフン整理
    .replace(/^-|-$/g, '') // 前後ハイフン除去
    .toLowerCase()
    .substring(0, 60); // 長さ制限
  
  return region ? `${region}-${content}` : content || 'post';
}

async function quickFixSlugs() {
  try {
    console.log('⚡ TOYAMA BLOG - Slug高速修正');
    console.log('=' * 50);
    
    // エンコードされたslugのみを対象
    const encodedPosts = await client.fetch(`
      *[_type == "post" && slug.current match "*%*"] {
        _id,
        title,
        slug
      }
    `);
    
    console.log(`🔧 エンコード修正対象: ${encodedPosts.length}件`);
    
    if (encodedPosts.length === 0) {
      console.log('✅ エンコードされたslugはありません');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    const existingSlugs = new Set();
    
    // 既存の正常なslugを取得
    const normalPosts = await client.fetch(`
      *[_type == "post" && !(slug.current match "*%*")] {
        slug
      }
    `);
    
    normalPosts.forEach(post => {
      if (post.slug?.current) {
        existingSlugs.add(post.slug.current);
      }
    });
    
    console.log('🚀 修正開始...');
    
    // 一括処理（20件ずつ）
    for (let i = 0; i < encodedPosts.length; i += 20) {
      const batch = encodedPosts.slice(i, i + 20);
      const promises = [];
      
      for (const post of batch) {
        const baseSlug = generateCleanSlug(post.title);
        let uniqueSlug = baseSlug;
        let counter = 1;
        
        // 重複チェック
        while (existingSlugs.has(uniqueSlug)) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        existingSlugs.add(uniqueSlug);
        
        const promise = client
          .patch(post._id)
          .set({
            slug: {
              current: uniqueSlug,
              _type: 'slug'
            }
          })
          .commit()
          .then(() => {
            successCount++;
            console.log(`✅ ${successCount}: ${post.title?.substring(0, 40)}... → "${uniqueSlug}"`);
          })
          .catch(error => {
            errorCount++;
            console.error(`❌ ${post.title?.substring(0, 30)}...: ${error.message}`);
          });
        
        promises.push(promise);
      }
      
      // バッチ実行
      await Promise.all(promises);
      
      if (i + 20 < encodedPosts.length) {
        console.log(`⏳ ${i + 20}/${encodedPosts.length} 完了、1秒待機...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n🎉 修正完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

quickFixSlugs();