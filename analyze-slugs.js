import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// タイトルからslugを生成する関数
function generateSlugFromTitle(title) {
  if (!title) return '';
  
  // 【】で囲まれた地域名を抽出
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1] : '';
  
  // タイトルから不要な文字を除去してslugを作成
  let slug = title
    .replace(/【[^】]+】/g, '') // 【】を除去
    .replace(/#shorts?/gi, '') // #shorts除去
    .replace(/[｜|]/g, '-') // ｜を-に変換
    .replace(/[！!？?]/g, '') // 感嘆符・疑問符除去
    .replace(/[（）()]/g, '') // 括弧除去
    .replace(/[。、，,]/g, '') // 句読点除去
    .replace(/\s+/g, '-') // スペースを-に変換
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '') // 日本語と英数字のみ残す
    .replace(/-+/g, '-') // 連続する-を1つに
    .replace(/^-|-$/g, '') // 先頭末尾の-を除去
    .toLowerCase();
  
  // 地域名をプレフィックスとして追加
  if (region) {
    const regionSlug = region
      .replace(/[市町村]/g, '')
      .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
      .toLowerCase();
    slug = `${regionSlug}-${slug}`;
  }
  
  // 長すぎる場合は短縮
  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-[^-]*$/, '');
  }
  
  return slug || 'untitled';
}

async function analyzeAndFixSlugs() {
  try {
    console.log('🔍 TOYAMA BLOG - Slug分析と修正');
    console.log('=' * 60);
    
    // 全記事のslug情報を取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt
      }
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}`);
    
    // Slug問題の分析
    let issues = {
      missing: [], // slugがない
      invalid: [], // 不正なslug
      duplicates: [], // 重複slug
      malformed: [], // 文字化け・エンコード問題
      tooLong: [], // 長すぎる
      tooShort: [] // 短すぎる
    };
    
    const slugMap = new Map();
    let fixNeeded = [];
    
    console.log('\n🔎 Slug分析開始...');
    
    allPosts.forEach((post, index) => {
      const postNum = index + 1;
      const currentSlug = post.slug?.current;
      
      // 1. slugが存在しない
      if (!currentSlug) {
        issues.missing.push(post);
        const newSlug = generateSlugFromTitle(post.title);
        fixNeeded.push({ post, newSlug, reason: 'missing' });
        return;
      }
      
      // 2. 重複チェック
      if (slugMap.has(currentSlug)) {
        issues.duplicates.push({ post, duplicate: slugMap.get(currentSlug) });
        const newSlug = generateSlugFromTitle(post.title) + `-${postNum}`;
        fixNeeded.push({ post, newSlug, reason: 'duplicate' });
      } else {
        slugMap.set(currentSlug, post);
      }
      
      // 3. エンコード問題チェック（URLエンコードされている）
      if (currentSlug.includes('%') || currentSlug.includes('-e3-')) {
        issues.malformed.push(post);
        const newSlug = generateSlugFromTitle(post.title);
        fixNeeded.push({ post, newSlug, reason: 'malformed' });
      }
      
      // 4. 長さチェック
      if (currentSlug.length > 100) {
        issues.tooLong.push(post);
        const newSlug = generateSlugFromTitle(post.title);
        fixNeeded.push({ post, newSlug, reason: 'too_long' });
      } else if (currentSlug.length < 3) {
        issues.tooShort.push(post);
        const newSlug = generateSlugFromTitle(post.title);
        fixNeeded.push({ post, newSlug, reason: 'too_short' });
      }
      
      // 5. 不正文字チェック
      if (!/^[a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]+$/.test(currentSlug)) {
        issues.invalid.push(post);
        const newSlug = generateSlugFromTitle(post.title);
        fixNeeded.push({ post, newSlug, reason: 'invalid_chars' });
      }
      
      // 進捗表示
      if (postNum % 50 === 0) {
        console.log(`📋 分析進捗: ${postNum}/${allPosts.length} (${Math.round(postNum/allPosts.length*100)}%)`);
      }
    });
    
    // 結果表示
    console.log('\n📊 Slug問題分析結果:');
    console.log('=' * 40);
    console.log(`❌ slugなし: ${issues.missing.length}件`);
    console.log(`🔄 重複slug: ${issues.duplicates.length}件`);
    console.log(`🔤 文字化け: ${issues.malformed.length}件`);
    console.log(`📏 長すぎる: ${issues.tooLong.length}件`);
    console.log(`📏 短すぎる: ${issues.tooShort.length}件`);
    console.log(`⚠️ 不正文字: ${issues.invalid.length}件`);
    console.log(`🔧 修正必要: ${fixNeeded.length}件`);
    
    // 問題のあるslugサンプル表示
    if (issues.malformed.length > 0) {
      console.log('\n🔤 文字化けslugサンプル:');
      issues.malformed.slice(0, 5).forEach(post => {
        console.log(`  "${post.slug?.current}" ← "${post.title?.substring(0, 50)}..."`);
      });
    }
    
    if (issues.duplicates.length > 0) {
      console.log('\n🔄 重複slugサンプル:');
      issues.duplicates.slice(0, 3).forEach(({ post, duplicate }) => {
        console.log(`  "${post.slug?.current}"`);
        console.log(`    - "${post.title?.substring(0, 40)}..."`);
        console.log(`    - "${duplicate.title?.substring(0, 40)}..."`);
      });
    }
    
    // 修正プレビュー
    if (fixNeeded.length > 0) {
      console.log('\n🛠️ 修正プレビュー (最初の10件):');
      fixNeeded.slice(0, 10).forEach(({ post, newSlug, reason }) => {
        console.log(`\n${reason}: "${post.title?.substring(0, 40)}..."`);
        console.log(`  現在: "${post.slug?.current || 'なし'}"`);
        console.log(`  修正後: "${newSlug}"`);
      });
    }
    
    return {
      totalPosts: allPosts.length,
      issues,
      fixNeeded
    };
    
  } catch (error) {
    console.error('❌ Slug分析エラー:', error.message);
    return null;
  }
}

analyzeAndFixSlugs();