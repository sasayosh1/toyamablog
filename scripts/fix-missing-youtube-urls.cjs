const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fixMissingYoutubeUrls() {
  console.log('\n🔧 youtubeUrl フィールド修正スクリプト\n');

  // youtubeUrlがないが、youtubeVideoがある記事を取得
  const postsToFix = await client.fetch(`
    *[_type == "post" && defined(youtubeVideo) && !defined(youtubeUrl)] {
      _id,
      title,
      youtubeVideo
    }
  `);

  console.log(`📊 修正対象: ${postsToFix.length}件\n`);

  if (postsToFix.length === 0) {
    console.log('✅ 修正が必要な記事はありません');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const post of postsToFix) {
    try {
      const youtubeUrl = post.youtubeVideo?.url;

      if (!youtubeUrl) {
        console.log(`⚠️  スキップ: ${post.title.substring(0, 50)} - YouTubeURL が見つかりません`);
        failCount++;
        continue;
      }

      // youtubeUrlフィールドを追加
      await client
        .patch(post._id)
        .set({ youtubeUrl: youtubeUrl })
        .commit();

      console.log(`✅ 修正完了: ${post.title.substring(0, 50)}`);
      successCount++;
    } catch (error) {
      console.error(`❌ エラー: ${post.title.substring(0, 50)}`, error.message);
      failCount++;
    }
  }

  console.log(`\n📈 結果:`);
  console.log(`  - 成功: ${successCount}件`);
  console.log(`  - 失敗: ${failCount}件`);
  console.log(`  - 合計: ${postsToFix.length}件`);
}

fixMissingYoutubeUrls()
  .then(() => {
    console.log('\n✅ スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ スクリプトエラー:', error);
    process.exit(1);
  });
