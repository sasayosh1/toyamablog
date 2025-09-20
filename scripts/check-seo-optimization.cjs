const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkSEOOptimization() {
  try {
    console.log('🔍 SEO最適化状況をチェック中...');

    const query = `*[_type == "post"] {
      _id,
      title,
      slug,
      excerpt,
      description,
      "excerptLength": length(excerpt),
      "descriptionLength": length(description),
      "hasExcerpt": defined(excerpt) && length(excerpt) > 0,
      "hasDescription": defined(description) && length(description) > 0,
      "titleHasLocation": title match "*【*】*",
      "excerptOptimal": defined(excerpt) && length(excerpt) >= 50 && length(excerpt) <= 160,
      "descriptionOptimal": defined(description) && length(description) >= 50 && length(description) <= 160,
      tags,
      "tagCount": count(tags),
      publishedAt
    } | order(publishedAt desc)`;

    const articles = await client.fetch(query);

    console.log(`📊 総記事数: ${articles.length}件`);

    // SEO分析
    const withExcerpt = articles.filter(a => a.hasExcerpt);
    const withDescription = articles.filter(a => a.hasDescription);
    const withOptimalExcerpt = articles.filter(a => a.excerptOptimal);
    const withOptimalDescription = articles.filter(a => a.descriptionOptimal);
    const withLocationInTitle = articles.filter(a => a.titleHasLocation);
    const withGoodTags = articles.filter(a => a.tagCount >= 5 && a.tagCount <= 15);

    console.log('\n📈 SEO最適化統計:');
    console.log(`📝 説明文(excerpt)あり: ${withExcerpt.length}件 / ${articles.length}件 (${Math.round(withExcerpt.length/articles.length*100)}%)`);
    console.log(`📄 description設定済み: ${withDescription.length}件 / ${articles.length}件 (${Math.round(withDescription.length/articles.length*100)}%)`);
    console.log(`✅ 最適化されたexcerpt: ${withOptimalExcerpt.length}件 / ${articles.length}件 (${Math.round(withOptimalExcerpt.length/articles.length*100)}%)`);
    console.log(`✅ 最適化されたdescription: ${withOptimalDescription.length}件 / ${articles.length}件 (${Math.round(withOptimalDescription.length/articles.length*100)}%)`);
    console.log(`📍 タイトルに地域名: ${withLocationInTitle.length}件 / ${articles.length}件 (${Math.round(withLocationInTitle.length/articles.length*100)}%)`);
    console.log(`🏷️ 適切なタグ数(5-15個): ${withGoodTags.length}件 / ${articles.length}件 (${Math.round(withGoodTags.length/articles.length*100)}%)`);

    // 改善が必要な記事を特定
    const needsImprovement = articles.filter(a =>
      !a.hasExcerpt ||
      !a.hasDescription ||
      !a.excerptOptimal ||
      !a.descriptionOptimal ||
      a.tagCount < 5 ||
      a.tagCount > 15
    );

    console.log(`\n🔧 改善が必要な記事: ${needsImprovement.length}件`);

    if (needsImprovement.length > 0) {
      console.log('\n🚨 優先改善対象（上位10件）:');
      needsImprovement.slice(0, 10).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`   ID: ${article._id}`);
        console.log(`   Excerpt: ${article.hasExcerpt ? `${article.excerptLength}文字` : '未設定'} ${article.excerptOptimal ? '✅' : '❌'}`);
        console.log(`   Description: ${article.hasDescription ? `${article.descriptionLength}文字` : '未設定'} ${article.descriptionOptimal ? '✅' : '❌'}`);
        console.log(`   Tags: ${article.tagCount}個 ${article.tagCount >= 5 && article.tagCount <= 15 ? '✅' : '❌'}`);
        console.log('   ---');
      });
    }

    // 問題別の分類
    const noExcerpt = articles.filter(a => !a.hasExcerpt);
    const noDescription = articles.filter(a => !a.hasDescription);
    const excerptTooShort = articles.filter(a => a.hasExcerpt && a.excerptLength < 50);
    const excerptTooLong = articles.filter(a => a.hasExcerpt && a.excerptLength > 160);
    const descriptionTooShort = articles.filter(a => a.hasDescription && a.descriptionLength < 50);
    const descriptionTooLong = articles.filter(a => a.hasDescription && a.descriptionLength > 160);
    const tagsTooFew = articles.filter(a => a.tagCount < 5);
    const tagsTooMany = articles.filter(a => a.tagCount > 15);

    console.log('\n📋 問題別分類:');
    console.log(`📝 Excerpt未設定: ${noExcerpt.length}件`);
    console.log(`📄 Description未設定: ${noDescription.length}件`);
    console.log(`📏 Excerpt短すぎ(<50文字): ${excerptTooShort.length}件`);
    console.log(`📏 Excerpt長すぎ(>160文字): ${excerptTooLong.length}件`);
    console.log(`📏 Description短すぎ(<50文字): ${descriptionTooShort.length}件`);
    console.log(`📏 Description長すぎ(>160文字): ${descriptionTooLong.length}件`);
    console.log(`🏷️ タグ少なすぎ(<5個): ${tagsTooFew.length}件`);
    console.log(`🏷️ タグ多すぎ(>15個): ${tagsTooMany.length}件`);

    return {
      total: articles.length,
      needsImprovement: needsImprovement.length,
      issues: {
        noExcerpt: noExcerpt.length,
        noDescription: noDescription.length,
        excerptTooShort: excerptTooShort.length,
        excerptTooLong: excerptTooLong.length,
        descriptionTooShort: descriptionTooShort.length,
        descriptionTooLong: descriptionTooLong.length,
        tagsTooFew: tagsTooFew.length,
        tagsTooMany: tagsTooMany.length
      }
    };

  } catch (error) {
    console.error('❌ SEOチェックエラー:', error);
    return null;
  }
}

async function main() {
  await checkSEOOptimization();
}

main();