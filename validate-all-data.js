import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function validateAllData() {
  try {
    console.log('🔍 TOYAMA BLOG - 全データ品質検証');
    console.log('=' * 60);
    
    // 全記事データを取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        description,
        tags,
        category,
        body,
        "youtubeShorts": body[_type == "youtubeShorts"][0].url
      }
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}`);
    
    // 品質チェック項目
    let issues = [];
    let validationStats = {
      totalPosts: allPosts.length,
      validTitles: 0,
      validDescriptions: 0,
      validTags: 0,
      validCategories: 0,
      validYouTubeShorts: 0,
      validSlugs: 0,
      validPublishDates: 0,
      duplicateTitles: 0,
      duplicateSlugs: 0
    };
    
    console.log('\n🔎 品質検証開始...');
    
    // タイトル重複チェック用
    const titleMap = new Map();
    const slugMap = new Map();
    
    allPosts.forEach((post, index) => {
      const postNum = index + 1;
      
      // 1. タイトル検証
      if (post.title && post.title.trim().length > 0) {
        validationStats.validTitles++;
        
        // 重複チェック
        if (titleMap.has(post.title)) {
          issues.push(`⚠️ 重複タイトル: "${post.title}"`);
          validationStats.duplicateTitles++;
        } else {
          titleMap.set(post.title, post._id);
        }
      } else {
        issues.push(`❌ 空のタイトル: Post ID ${post._id}`);
      }
      
      // 2. 説明文検証
      if (post.description && post.description.trim().length > 0) {
        validationStats.validDescriptions++;
      } else {
        issues.push(`❌ 説明文なし: "${post.title?.substring(0, 30)}..."`);
      }
      
      // 3. タグ検証
      if (post.tags && Array.isArray(post.tags) && post.tags.length >= 3) {
        validationStats.validTags++;
      } else {
        issues.push(`❌ タグ不足: "${post.title?.substring(0, 30)}..." (${post.tags?.length || 0}個)`);
      }
      
      // 4. カテゴリ検証
      if (post.category && post.category !== '未分類' && post.category.trim().length > 0) {
        validationStats.validCategories++;
      } else {
        issues.push(`❌ カテゴリ未設定: "${post.title?.substring(0, 30)}..."`);
      }
      
      // 5. YouTube Shorts検証
      if (post.youtubeShorts && post.youtubeShorts.includes('youtube.com')) {
        validationStats.validYouTubeShorts++;
      } else {
        issues.push(`❌ YouTube Shorts なし: "${post.title?.substring(0, 30)}..."`);
      }
      
      // 6. スラグ検証
      if (post.slug && post.slug.current) {
        validationStats.validSlugs++;
        
        // 重複チェック
        if (slugMap.has(post.slug.current)) {
          issues.push(`⚠️ 重複スラグ: "${post.slug.current}"`);
          validationStats.duplicateSlugs++;
        } else {
          slugMap.set(post.slug.current, post._id);
        }
      } else {
        issues.push(`❌ スラグなし: "${post.title?.substring(0, 30)}..."`);
      }
      
      // 7. 公開日検証
      if (post.publishedAt) {
        validationStats.validPublishDates++;
      } else {
        issues.push(`❌ 公開日なし: "${post.title?.substring(0, 30)}..."`);
      }
      
      // 進捗表示
      if (postNum % 50 === 0) {
        console.log(`📋 検証進捗: ${postNum}/${allPosts.length} (${Math.round(postNum/allPosts.length*100)}%)`);
      }
    });
    
    console.log('\n📊 品質検証結果:');
    console.log('=' * 40);
    
    // 品質スコア計算
    const qualityScores = {
      titles: Math.round((validationStats.validTitles / validationStats.totalPosts) * 100),
      descriptions: Math.round((validationStats.validDescriptions / validationStats.totalPosts) * 100),
      tags: Math.round((validationStats.validTags / validationStats.totalPosts) * 100),
      categories: Math.round((validationStats.validCategories / validationStats.totalPosts) * 100),
      youtubeShorts: Math.round((validationStats.validYouTubeShorts / validationStats.totalPosts) * 100),
      slugs: Math.round((validationStats.validSlugs / validationStats.totalPosts) * 100),
      publishDates: Math.round((validationStats.validPublishDates / validationStats.totalPosts) * 100)
    };
    
    console.log(`✅ タイトル: ${validationStats.validTitles}/${validationStats.totalPosts} (${qualityScores.titles}%)`);
    console.log(`✅ 説明文: ${validationStats.validDescriptions}/${validationStats.totalPosts} (${qualityScores.descriptions}%)`);
    console.log(`✅ タグ: ${validationStats.validTags}/${validationStats.totalPosts} (${qualityScores.tags}%)`);
    console.log(`✅ カテゴリ: ${validationStats.validCategories}/${validationStats.totalPosts} (${qualityScores.categories}%)`);
    console.log(`✅ YouTube Shorts: ${validationStats.validYouTubeShorts}/${validationStats.totalPosts} (${qualityScores.youtubeShorts}%)`);
    console.log(`✅ スラグ: ${validationStats.validSlugs}/${validationStats.totalPosts} (${qualityScores.slugs}%)`);
    console.log(`✅ 公開日: ${validationStats.validPublishDates}/${validationStats.totalPosts} (${qualityScores.publishDates}%)`);
    
    // 総合品質スコア
    const overallScore = Math.round(
      (qualityScores.titles + qualityScores.descriptions + qualityScores.tags + 
       qualityScores.categories + qualityScores.youtubeShorts + qualityScores.slugs + 
       qualityScores.publishDates) / 7
    );
    
    console.log(`\n🎯 総合品質スコア: ${overallScore}%`);
    
    // 問題報告
    if (issues.length > 0) {
      console.log(`\n⚠️ 検出された問題: ${issues.length}件`);
      console.log('=' * 40);
      
      // 最初の10件のみ表示
      issues.slice(0, 10).forEach(issue => {
        console.log(issue);
      });
      
      if (issues.length > 10) {
        console.log(`... および ${issues.length - 10} 件の追加問題`);
      }
    } else {
      console.log('\n🎉 問題なし! 全データが完璧です!');
    }
    
    // カテゴリ分布
    const categoryStats = {};
    allPosts.forEach(post => {
      const cat = post.category || '未分類';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    
    console.log('\n🏷️ カテゴリ分布:');
    Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      const percentage = Math.round((count / allPosts.length) * 100);
      console.log(`  ${category}: ${count}件 (${percentage}%)`);
    });
    
    // サンプル記事表示
    console.log('\n📄 サンプル記事 (最新3件):');
    allPosts.slice(0, 3).forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   説明: ${post.description}`);
      console.log(`   カテゴリ: ${post.category}`);
      console.log(`   タグ: ${post.tags?.join(', ')}`);
      console.log(`   YouTube: ${post.youtubeShorts ? '✅' : '❌'}`);
    });
    
    return {
      totalPosts: validationStats.totalPosts,
      overallScore,
      issues: issues.length,
      categoryStats,
      qualityScores
    };
    
  } catch (error) {
    console.error('❌ 検証エラー:', error.message);
    return null;
  }
}

validateAllData();