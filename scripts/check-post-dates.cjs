const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function checkPostDates() {
  console.log('📊 記事の日付設定を確認中...\n');

  try {
    // 最新51件の記事を取得（ホームページと同じ件数）
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...51] {
        _id,
        title,
        publishedAt,
        _createdAt,
        _updatedAt
      }
    `);

    console.log(`✅ 取得した記事数: ${posts.length}\n`);
    console.log('=== 最新20件の記事の日付情報 ===\n');

    posts.slice(0, 20).forEach((post, index) => {
      const publishedDate = new Date(post.publishedAt);
      const createdDate = new Date(post._createdAt);

      console.log(`${index + 1}. ${post.title}`);
      console.log(`   公開日 (publishedAt): ${publishedDate.toLocaleString('ja-JP')}`);
      console.log(`   作成日 (_createdAt):  ${createdDate.toLocaleString('ja-JP')}`);
      console.log('');
    });

    // publishedAt が未設定の記事をチェック
    const postsWithoutDate = await client.fetch(`
      *[_type == "post" && !defined(publishedAt)] {
        _id,
        title,
        _createdAt
      }
    `);

    if (postsWithoutDate.length > 0) {
      console.log(`⚠️  警告: publishedAt が未設定の記事が ${postsWithoutDate.length} 件あります\n`);
      postsWithoutDate.slice(0, 10).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   作成日: ${new Date(post._createdAt).toLocaleString('ja-JP')}\n`);
      });
    } else {
      console.log('✅ 全ての記事に publishedAt が設定されています\n');
    }

    // 日付の整合性チェック
    console.log('=== 日付の整合性チェック ===\n');
    let inconsistentCount = 0;

    for (let i = 0; i < posts.length - 1; i++) {
      const current = new Date(posts[i].publishedAt);
      const next = new Date(posts[i + 1].publishedAt);

      if (current < next) {
        console.log(`⚠️  順序エラー: ${i + 1}番目と${i + 2}番目の記事の日付が逆順です`);
        console.log(`   ${posts[i].title} (${current.toLocaleString('ja-JP')})`);
        console.log(`   ${posts[i + 1].title} (${next.toLocaleString('ja-JP')})\n`);
        inconsistentCount++;
      }
    }

    if (inconsistentCount === 0) {
      console.log('✅ 記事の並び順は正しく、最新順（降順）になっています\n');
    } else {
      console.log(`❌ ${inconsistentCount} 箇所で並び順の問題が検出されました\n`);
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

checkPostDates();
