const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function runFinalSiteHealthCheck() {
  try {
    console.log('🏥 「富山のくせに」最終ヘルスチェック実行中...');
    
    // 1. 基本統計の取得
    console.log('\n📊 基本統計:');
    const totalPosts = await client.fetch(`count(*[_type == "post"])`);
    const publishedPosts = await client.fetch(`count(*[_type == "post" && defined(publishedAt)])`);
    const withThumbnails = await client.fetch(`count(*[_type == "post" && defined(thumbnail.asset)])`);
    const withYouTube = await client.fetch(`count(*[_type == "post" && defined(youtubeUrl)])`);
    const withExcerpts = await client.fetch(`count(*[_type == "post" && defined(excerpt)])`);
    const withCategories = await client.fetch(`count(*[_type == "post" && defined(category)])`);
    const withAuthors = await client.fetch(`count(*[_type == "post" && defined(author)])`);
    
    console.log(`   総記事数: ${totalPosts}件`);
    console.log(`   公開済み記事: ${publishedPosts}件 (${(publishedPosts/totalPosts*100).toFixed(1)}%)`);
    console.log(`   サムネイル付き: ${withThumbnails}件 (${(withThumbnails/totalPosts*100).toFixed(1)}%)`);
    console.log(`   YouTube動画付き: ${withYouTube}件 (${(withYouTube/totalPosts*100).toFixed(1)}%)`);
    console.log(`   概要文付き: ${withExcerpts}件 (${(withExcerpts/totalPosts*100).toFixed(1)}%)`);
    console.log(`   カテゴリー付き: ${withCategories}件 (${(withCategories/totalPosts*100).toFixed(1)}%)`);
    console.log(`   著者付き: ${withAuthors}件 (${(withAuthors/totalPosts*100).toFixed(1)}%)`);
    
    // 2. 品質スコア計算
    console.log('\n🎯 品質スコア分析:');
    const qualityMetrics = {
      dataIntegrity: publishedPosts / totalPosts,
      thumbnailCoverage: withThumbnails / totalPosts,
      contentRichness: withYouTube / totalPosts,
      seoOptimization: withExcerpts / totalPosts,
      categoryOrganization: withCategories / totalPosts,
      authorshipCompletion: withAuthors / totalPosts
    };
    
    const overallQuality = Object.values(qualityMetrics).reduce((sum, score) => sum + score, 0) / 6;
    
    console.log(`   データ整合性: ${(qualityMetrics.dataIntegrity * 100).toFixed(1)}%`);
    console.log(`   サムネイル充足度: ${(qualityMetrics.thumbnailCoverage * 100).toFixed(1)}%`);
    console.log(`   コンテンツ充実度: ${(qualityMetrics.contentRichness * 100).toFixed(1)}%`);
    console.log(`   SEO最適化度: ${(qualityMetrics.seoOptimization * 100).toFixed(1)}%`);
    console.log(`   カテゴリー整理度: ${(qualityMetrics.categoryOrganization * 100).toFixed(1)}%`);
    console.log(`   著者情報完成度: ${(qualityMetrics.authorshipCompletion * 100).toFixed(1)}%`);
    console.log(`   🏆 総合品質スコア: ${(overallQuality * 100).toFixed(1)}%`);
    
    // 3. エラーチェック
    console.log('\n🔍 エラーチェック:');
    const errorChecks = await Promise.all([
      client.fetch(`count(*[_type == "post" && title match "*&#x*"])`), // 文字化け
      client.fetch(`count(*[_type == "post" && !defined(publishedAt)])`), // 未公開日
      client.fetch(`count(*[_type == "post" && length(body) == 0])`), // 空本文
      client.fetch(`count(*[_type == "post" && youtubeUrl match "*" && !youtubeUrl match "*youtu*"])`) // 無効YouTube
    ]);
    
    const [corruptedTitles, missingDates, emptyBodies, invalidYouTube] = errorChecks;
    
    console.log(`   文字化けタイトル: ${corruptedTitles}件`);
    console.log(`   公開日未設定: ${missingDates}件`);
    console.log(`   空の本文: ${emptyBodies}件`);
    console.log(`   無効YouTube URL: ${invalidYouTube}件`);
    
    const totalErrors = corruptedTitles + missingDates + emptyBodies + invalidYouTube;
    console.log(`   🚨 総エラー数: ${totalErrors}件`);
    
    // 4. パフォーマンス評価
    console.log('\n⚡ パフォーマンス評価:');
    const performanceScore = Math.max(0, 100 - totalErrors * 2 - (totalPosts - publishedPosts) * 1);
    console.log(`   エラー減点: -${totalErrors * 2}点`);
    console.log(`   未公開減点: -${(totalPosts - publishedPosts) * 1}点`);
    console.log(`   🎯 パフォーマンススコア: ${performanceScore}点/100点`);
    
    // 5. 最新記事チェック
    console.log('\n🆕 最新記事チェック:');
    const recentPosts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...3] {
      title, publishedAt, 
      "hasThumbnail": defined(thumbnail.asset),
      "hasYouTube": defined(youtubeUrl)
    }`);
    
    recentPosts.forEach((post, idx) => {
      const date = new Date(post.publishedAt).toLocaleDateString('ja-JP');
      const thumbnail = post.hasThumbnail ? '🖼️' : '❌';
      const youtube = post.hasYouTube ? '🎥' : '❌';
      console.log(`   ${idx + 1}. ${post.title.substring(0, 40)}... (${date}) ${thumbnail}${youtube}`);
    });
    
    // 6. 総合評価
    console.log('\n🏆 「富山のくせに」総合評価:');
    
    if (overallQuality >= 0.9 && totalErrors === 0) {
      console.log('   🌟 【EXCELLENT】最高品質レベル達成！');
      console.log('   ✨ 全システム正常稼働、エラーゼロ状態');
    } else if (overallQuality >= 0.8 && totalErrors <= 3) {
      console.log('   🎯 【VERY GOOD】優秀な品質レベル');
      console.log('   📈 継続的な改善により高品質を維持');
    } else if (overallQuality >= 0.7) {
      console.log('   👍 【GOOD】良好な品質レベル');
      console.log('   🔧 軽微な調整で更なる向上が可能');
    } else {
      console.log('   ⚠️ 【NEEDS IMPROVEMENT】改善が必要');
      console.log('   🛠️ 重要な課題の解決が推奨されます');
    }
    
    console.log(`\n📈 主要指標サマリー:`);
    console.log(`   📊 記事数: ${totalPosts}件（公開率${(publishedPosts/totalPosts*100).toFixed(1)}%）`);
    console.log(`   🖼️ サムネイル: ${(withThumbnails/totalPosts*100).toFixed(1)}%完備`);
    console.log(`   🎥 動画連携: ${withYouTube}件（${(withYouTube/totalPosts*100).toFixed(1)}%）`);
    console.log(`   📝 SEO最適化: ${(withExcerpts/totalPosts*100).toFixed(1)}%完了`);
    console.log(`   🚨 エラー件数: ${totalErrors}件`);
    console.log(`   🏆 総合品質: ${(overallQuality * 100).toFixed(1)}%`);
    
    console.log('\n🎉 「富山のくせに」ヘルスチェック完了！');
    
    return {
      totalPosts,
      qualityScore: overallQuality,
      errorCount: totalErrors,
      status: overallQuality >= 0.9 && totalErrors === 0 ? 'EXCELLENT' : 
              overallQuality >= 0.8 && totalErrors <= 3 ? 'VERY_GOOD' : 
              overallQuality >= 0.7 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    };
    
  } catch (error) {
    console.error('❌ ヘルスチェックエラー:', error.message);
    return null;
  }
}

runFinalSiteHealthCheck().then(result => {
  if (result) {
    console.log(`\n🏁 最終ステータス: ${result.status}`);
    process.exit(0);
  } else {
    process.exit(1);
  }
});