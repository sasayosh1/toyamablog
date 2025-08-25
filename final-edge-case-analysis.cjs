const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function runFinalEdgeCaseAnalysis() {
  try {
    console.log('🔍 最終エッジケース分析を実行中...');
    
    // 1. タイトルの文字化けチェック
    console.log('\n1. 📝 タイトル文字化けチェック:');
    const corruptedTitles = await client.fetch(`*[_type == "post" && title match "*&#x*"] {
      _id, title, slug
    }`);
    
    if (corruptedTitles.length === 0) {
      console.log('   ✅ 文字化けタイトルなし');
    } else {
      console.log(`   ⚠️ ${corruptedTitles.length}件の文字化けタイトルを検出`);
      corruptedTitles.forEach(post => {
        console.log(`   - ${post.title} (ID: ${post._id})`);
      });
    }
    
    // 2. 長すぎるタイトルのチェック
    console.log('\n2. 📏 タイトル長過ぎチェック:');
    const longTitles = await client.fetch(`*[_type == "post" && length(title) > 60] {
      _id, title, "titleLength": length(title)
    } | order(titleLength desc)[0...5]`);
    
    if (longTitles.length === 0) {
      console.log('   ✅ 長すぎるタイトルなし');
    } else {
      console.log(`   📊 最長タイトル上位5件:`);
      longTitles.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.titleLength}文字: ${post.title.substring(0, 50)}...`);
      });
    }
    
    // 3. 重複スラッグチェック
    console.log('\n3. 🔗 重複スラッグチェック:');
    const duplicateSlugs = await client.fetch(`*[_type == "post"] {
      "slug": slug.current
    } | group(slug) {
      "slug": @.slug,
      "count": count(@[])
    } | [count > 1]`);
    
    if (duplicateSlugs.length === 0) {
      console.log('   ✅ 重複スラッグなし');
    } else {
      console.log(`   ⚠️ ${duplicateSlugs.length}件の重複スラッグを検出`);
      duplicateSlugs.forEach(item => {
        console.log(`   - ${item.slug}: ${item.count}件`);
      });
    }
    
    // 4. YouTubeショート動画の正確性チェック
    console.log('\n4. 🎥 YouTube動画URLチェック:');
    const youtubeData = await client.fetch(`*[_type == "post" && defined(youtubeUrl)] {
      _id, title, youtubeUrl,
      "isYouTubeShorts": youtubeUrl match "*shorts*",
      "isValidYouTube": youtubeUrl match "*youtu*"
    }`);
    
    const invalidYouTube = youtubeData.filter(post => !post.isValidYouTube);
    const shortsCount = youtubeData.filter(post => post.isYouTubeShorts).length;
    
    console.log(`   📊 YouTube動画付き記事: ${youtubeData.length}件`);
    console.log(`   🎬 YouTubeショート: ${shortsCount}件`);
    
    if (invalidYouTube.length === 0) {
      console.log('   ✅ 全YouTube URLが有効');
    } else {
      console.log(`   ⚠️ ${invalidYouTube.length}件の無効なYouTube URL`);
    }
    
    // 5. 公開日の整合性チェック
    console.log('\n5. 📅 公開日整合性チェック:');
    const dateIssues = await client.fetch(`*[_type == "post"] {
      _id, title, publishedAt,
      "hasFutureDate": dateTime(publishedAt) > dateTime(now()),
      "hasValidDate": defined(publishedAt)
    }`);
    
    const futureDated = dateIssues.filter(post => post.hasFutureDate);
    const noDate = dateIssues.filter(post => !post.hasValidDate);
    
    console.log(`   📊 総記事数: ${dateIssues.length}件`);
    if (futureDated.length === 0) {
      console.log('   ✅ 未来日付なし');
    } else {
      console.log(`   ⚠️ ${futureDated.length}件の未来日付記事`);
    }
    
    if (noDate.length === 0) {
      console.log('   ✅ 未公開日記事なし');
    } else {
      console.log(`   ⚠️ ${noDate.length}件の未公開日記事`);
    }
    
    // 6. 本文構造の健全性チェック
    console.log('\n6. 📄 本文構造チェック:');
    const bodyIssues = await client.fetch(`*[_type == "post"] {
      _id, title,
      "hasBody": defined(body),
      "bodyLength": length(body),
      "hasValidBody": length(body) > 0
    }`);
    
    const emptyBody = bodyIssues.filter(post => !post.hasValidBody);
    const shortBody = bodyIssues.filter(post => post.hasValidBody && post.bodyLength < 5);
    
    console.log(`   📊 総記事数: ${bodyIssues.length}件`);
    if (emptyBody.length === 0) {
      console.log('   ✅ 空本文記事なし');
    } else {
      console.log(`   ⚠️ ${emptyBody.length}件の空本文記事`);
    }
    
    if (shortBody.length === 0) {
      console.log('   ✅ 短すぎる本文記事なし');
    } else {
      console.log(`   📝 ${shortBody.length}件の短い本文記事（5ブロック未満）`);
    }
    
    // 7. カテゴリー統計の最終確認
    console.log('\n7. 📂 カテゴリー分布チェック:');
    const categories = await client.fetch(`*[_type == "post" && defined(category)] {
      category
    } | group(category) {
      "category": @.category,
      "count": count(@[])
    } | order(count desc)`);
    
    console.log('   📊 カテゴリー別記事数:');
    categories.slice(0, 8).forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.category}: ${cat.count}件`);
    });
    
    if (categories.length > 8) {
      console.log(`   ... 他${categories.length - 8}カテゴリー`);
    }
    
    // 8. 最終統合評価
    console.log('\n🏁 最終エッジケース分析結果:');
    const issues = [
      corruptedTitles.length > 0 ? `文字化け: ${corruptedTitles.length}件` : null,
      duplicateSlugs.length > 0 ? `重複スラッグ: ${duplicateSlugs.length}件` : null,
      invalidYouTube.length > 0 ? `無効YouTube: ${invalidYouTube.length}件` : null,
      futureDated.length > 0 ? `未来日付: ${futureDated.length}件` : null,
      emptyBody.length > 0 ? `空本文: ${emptyBody.length}件` : null
    ].filter(Boolean);
    
    if (issues.length === 0) {
      console.log('🎉 全てのエッジケースチェックをクリア！');
      console.log('✨ 「富山のくせに」は最高品質状態を維持中');
      return true;
    } else {
      console.log('⚠️ 検出された問題:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      return false;
    }
    
  } catch (error) {
    console.error('❌ エッジケース分析エラー:', error.message);
    return false;
  }
}

runFinalEdgeCaseAnalysis().then(result => {
  process.exit(result ? 0 : 1);
});