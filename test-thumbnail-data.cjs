const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testThumbnailData() {
  try {
    console.log('🔍 フロントエンド用サムネイルデータテスト...');
    
    // フロントエンドと同じクエリを実行
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...3] {
        _id,
        title,
        slug,
        description,
        excerpt,
        tags,
        category,
        publishedAt,
        youtubeUrl,
        thumbnail{
          asset->{
            _ref,
            url
          },
          alt
        },
        author->{
          _id,
          name,
          slug,
          bio,
          image{
            asset->{
              _ref,
              url
            }
          }
        },
        "categories": [category],
        "displayExcerpt": coalesce(excerpt, description)
      }
    `);
    
    console.log('📊 取得データ詳細:');
    posts.forEach((post, i) => {
      console.log(`\n${i+1}. 記事: ${post.title.substring(0, 50)}...`);
      console.log(`   _id: ${post._id}`);
      console.log(`   thumbnail存在: ${post.thumbnail ? '✅' : '❌'}`);
      if (post.thumbnail) {
        console.log(`   thumbnail.asset: ${post.thumbnail.asset ? '✅' : '❌'}`);
        if (post.thumbnail.asset) {
          console.log(`   thumbnail.asset._ref: ${post.thumbnail.asset._ref || 'なし'}`);
          console.log(`   thumbnail.asset.url: ${post.thumbnail.asset.url || 'なし'}`);
        }
        console.log(`   thumbnail.alt: ${post.thumbnail.alt || 'なし'}`);
      }
      console.log(`   youtubeUrl: ${post.youtubeUrl ? '✅' : '❌'}`);
    });
    
    // 比較用：データベース上のサムネイル情報
    console.log('\n🔍 データベース上のサムネイル情報比較:');
    const directCheck = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...3] {
        _id,
        title,
        defined(thumbnail),
        "thumbnailRef": thumbnail.asset._ref
      }
    `);
    
    directCheck.forEach((post, i) => {
      console.log(`${i+1}. ${post.title.substring(0, 50)}...`);
      console.log(`   サムネイル定義: ${post.defined ? '✅' : '❌'}`);
      console.log(`   サムネイル参照: ${post.thumbnailRef || 'なし'}`);
    });
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
  }
}

testThumbnailData();