const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fixCategoriesForMissingImages() {
  console.log('\n🔧 カテゴリ情報を修正します\n');

  // 画像ソースがない記事を取得（カテゴリ参照を展開）
  const posts = await client.fetch(`
    *[_type == "post" && !defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      category,
      "categoryRefs": categories[]-> {
        _id,
        title
      }
    }
  `);

  console.log(`📊 対象記事: ${posts.length}件\n`);

  for (const post of posts) {
    const location = post.title.match(/【(.+?)】/)?.[1];
    const currentCategory = post.category;
    const categoryTitles = post.categoryRefs?.map(c => c.title) || [];

    console.log(`記事: ${post.title.substring(0, 60)}`);
    console.log(`  現在のcategory: ${currentCategory || '未設定'}`);
    console.log(`  カテゴリ参照: ${categoryTitles.join(', ') || '未設定'}`);
    console.log(`  タイトルから抽出した地域: ${location || '不明'}`);

    // categoryフィールドが未設定の場合、地域名を設定
    if (!currentCategory && location) {
      try {
        await client
          .patch(post._id)
          .set({ category: location })
          .commit();

        console.log(`  ✅ categoryフィールドに「${location}」を設定しました`);
      } catch (error) {
        console.error(`  ❌ 更新エラー:`, error.message);
      }
    } else {
      console.log(`  ℹ️  categoryは既に設定されているか、地域名が抽出できませんでした`);
    }
    console.log('');
  }

  console.log('\n✅ 処理完了');
}

fixCategoriesForMissingImages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });
