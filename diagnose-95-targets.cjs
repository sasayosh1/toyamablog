const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function diagnose95PercentTargets() {
  try {
    console.log('🎯 95%達成のための精密診断...');
    
    // 現在の統計
    const totalPosts = await client.fetch('count(*[_type == "post"])');
    const longArticles = await client.fetch('count(*[_type == "post" && length(pt::text(body)) >= 1000])');
    const mapsCount = await client.fetch('count(*[_type == "post" && count(body[_type == "html" && html match "*maps*"]) > 0])');
    
    const longArticlePercentage = Math.round((longArticles / totalPosts) * 100);
    const mapPercentage = Math.round((mapsCount / totalPosts) * 100);
    
    console.log(`📊 現在の状況:`);
    console.log(`📔 長文記事: ${longArticles}/${totalPosts}件 (${longArticlePercentage}%)`);
    console.log(`🗺️ マップ: ${mapsCount}/${totalPosts}件 (${mapPercentage}%)`);
    
    // 95%達成に必要な数
    const target95Count = Math.ceil(totalPosts * 0.95);
    const needLongArticles = target95Count - longArticles;
    const needMaps = target95Count - mapsCount;
    
    console.log(`\n🎯 95%達成には:`);
    console.log(`📔 長文記事: あと${Math.max(0, needLongArticles)}件必要 (目標: ${target95Count}件)`);
    console.log(`🗺️ マップ: あと${Math.max(0, needMaps)}件必要 (目標: ${target95Count}件)`);
    
    if (needLongArticles > 0) {
      console.log(`\n📑 長文化候補記事:`);
      const mediumArticles = await client.fetch(`*[_type == "post" && length(pt::text(body)) >= 500 && length(pt::text(body)) < 1000] | order(length(pt::text(body)) desc) [0...${Math.min(needLongArticles + 3, 15)}] { _id, title, category, "charCount": length(pt::text(body)) }`);
      
      mediumArticles.forEach((article, i) => {
        console.log(`   ${i+1}. ID: ${article._id}`);
        console.log(`      タイトル: ${article.title.substring(0, 50)}...`);
        console.log(`      文字数: ${article.charCount}文字 | カテゴリー: ${article.category}\n`);
      });
    }
    
    if (needMaps > 0) {
      console.log(`\n🗺️ マップ追加候補記事:`);
      const postsWithoutMap = await client.fetch(`*[_type == "post" && count(body[_type == "html" && html match "*maps*"]) == 0] | order(publishedAt desc) [0...${Math.min(needMaps + 3, 15)}] { _id, title, category }`);
      
      postsWithoutMap.forEach((post, i) => {
        console.log(`   ${i+1}. ID: ${post._id}`);
        console.log(`      タイトル: ${post.title.substring(0, 50)}...`);
        console.log(`      カテゴリー: ${post.category}\n`);
      });
    }
    
    if (needLongArticles <= 0 && needMaps <= 0) {
      console.log(`\n🎉 既に95%目標を達成済み！`);
    }
    
  } catch (error) {
    console.error('❌ 診断エラー:', error.message);
  }
}

diagnose95PercentTargets();