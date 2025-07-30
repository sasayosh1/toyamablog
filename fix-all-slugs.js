import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// タイトルからslugを生成する関数（改良版）
function generateSlugFromTitle(title) {
  if (!title) return 'untitled';
  
  // 【】で囲まれた地域名を抽出
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1] : '';
  
  // タイトルから内容部分を抽出
  let content = title
    .replace(/【[^】]+】/g, '') // 【地域名】を除去
    .replace(/#shorts?/gi, '') // #shorts除去
    .trim();
  
  // 地域名をプレフィックスに使用
  let regionSlug = '';
  if (region) {
    regionSlug = region
      .replace(/[市町村]/g, '') // 市町村を除去
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '') // 日本語と英数字のみ
      .toLowerCase();
  }
  
  // コンテンツ部分をslugに変換
  let contentSlug = content
    .replace(/[｜|]/g, '-') // ｜を-に変換
    .replace(/[！!？?]/g, '') // 感嘆符・疑問符除去
    .replace(/[（）()「」【】]/g, '') // 括弧除去
    .replace(/[。、，,]/g, '') // 句読点除去
    .replace(/[・･]/g, '-') // 中点を-に変換
    .replace(/\s+/g, '-') // スペースを-に変換
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '') // 日本語、英数字、ハイフンのみ
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-|-$/g, '') // 先頭末尾のハイフンを除去
    .toLowerCase();
  
  // 地域とコンテンツを結合
  let finalSlug = regionSlug ? `${regionSlug}-${contentSlug}` : contentSlug;
  
  // 長すぎる場合は適切に短縮
  if (finalSlug.length > 80) {
    // 単語境界で切る
    finalSlug = finalSlug.substring(0, 80);
    const lastDash = finalSlug.lastIndexOf('-');
    if (lastDash > 20) {
      finalSlug = finalSlug.substring(0, lastDash);
    }
  }
  
  // 最低限の長さを確保
  if (finalSlug.length < 3) {
    finalSlug = regionSlug || 'post';
  }
  
  return finalSlug;
}

// 重複を避けるためのカウンター管理
function generateUniqueSlug(baseSlug, existingSlugs, counter = 0) {
  let slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
  
  if (existingSlugs.has(slug)) {
    return generateUniqueSlug(baseSlug, existingSlugs, counter + 1);
  }
  
  existingSlugs.add(slug);
  return slug;
}

async function fixAllSlugs(batchSize = 10) {
  try {
    console.log('🔧 TOYAMA BLOG - 全Slug修正');
    console.log('=' * 60);
    
    // 全記事データを取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt
      }
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}`);
    
    // 修正が必要な記事を特定
    const postsToFix = [];
    const existingSlugs = new Set();
    
    allPosts.forEach(post => {
      const currentSlug = post.slug?.current;
      let needsFix = false;
      let reason = [];
      
      // 問題チェック
      if (!currentSlug) {
        needsFix = true;
        reason.push('missing');
      } else {
        // URLエンコード問題
        if (currentSlug.includes('%') || currentSlug.includes('-e3-')) {
          needsFix = true;
          reason.push('encoded');
        }
        
        // 長すぎる
        if (currentSlug.length > 100) {
          needsFix = true;
          reason.push('too_long');
        }
        
        // 不正文字
        if (!/^[a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]+$/.test(currentSlug)) {
          needsFix = true;
          reason.push('invalid_chars');
        }
      }
      
      if (needsFix) {
        postsToFix.push({ post, reason: reason.join(', ') });
      } else {
        existingSlugs.add(currentSlug);
      }
    });
    
    console.log(`🔧 修正対象: ${postsToFix.length}件`);
    
    if (postsToFix.length === 0) {
      console.log('✅ 修正の必要なslugはありません');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    console.log('🚀 Slug修正開始...');
    
    // バッチ処理
    for (let i = 0; i < postsToFix.length; i += batchSize) {
      const batch = postsToFix.slice(i, i + batchSize);
      
      console.log(`\\n--- バッチ ${Math.floor(i / batchSize) + 1} (${batch.length}件) ---`);
      
      for (const { post, reason } of batch) {
        try {
          // 新しいslugを生成
          const baseSlug = generateSlugFromTitle(post.title);
          const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
          
          // Slugを更新
          await client
            .patch(post._id)
            .set({
              slug: {
                current: uniqueSlug,
                _type: 'slug'
              }
            })
            .commit();
          
          successCount++;
          processed++;
          
          console.log(`✅ ${processed}/${postsToFix.length}: ${post.title?.substring(0, 30)}...`);
          console.log(`   ${reason} → "${uniqueSlug}"`);
          
          // APIレート制限対策
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
          errorCount++;
          processed++;
        }
      }
      
      // バッチ間待機
      if (i + batchSize < postsToFix.length) {
        console.log('⏳ バッチ間待機 (2秒)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\\n🎉 Slug修正完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 修正後の確認
    const updatedPosts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug
      }
    `);
    
    // 重複チェック
    const slugCounts = {};
    let duplicates = 0;
    
    updatedPosts.forEach(post => {
      const slug = post.slug?.current;
      if (slug) {
        slugCounts[slug] = (slugCounts[slug] || 0) + 1;
        if (slugCounts[slug] > 1) {
          duplicates++;
        }
      }
    });
    
    console.log('\\n📊 修正後統計:');
    console.log(`📝 総記事数: ${updatedPosts.length}`);
    console.log(`🔄 重複slug: ${duplicates}件`);
    console.log(`✅ ユニークslug: ${Object.keys(slugCounts).length}件`);
    
    // サンプル表示
    console.log('\\n📄 修正済みslugサンプル:');
    updatedPosts.slice(0, 5).forEach(post => {
      console.log(`"${post.slug?.current}" ← "${post.title?.substring(0, 40)}..."`);
    });
    
    return { 
      success: successCount, 
      error: errorCount,
      duplicates,
      totalUnique: Object.keys(slugCounts).length
    };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

fixAllSlugs(10);