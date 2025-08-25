const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugSanityURL() {
  try {
    console.log('🔍 SanityアセットURL構造を詳細デバッグ中...');
    
    // 1. アセット情報の詳細確認
    const postWithAsset = await client.fetch(`
      *[_type == "post" && defined(thumbnail)][0] {
        _id,
        title,
        thumbnail {
          _type,
          asset {
            _type,
            _ref,
            _id
          },
          "assetDetails": asset->{
            _id,
            _type,
            url,
            path,
            extension,
            size,
            metadata {
              dimensions
            }
          },
          alt
        }
      }
    `);
    
    if (!postWithAsset) {
      console.log('❌ サムネイル付き記事が見つかりません');
      return;
    }
    
    console.log('\n📄 記事情報:');
    console.log(`タイトル: ${postWithAsset.title}`);
    console.log(`記事ID: ${postWithAsset._id}`);
    
    console.log('\n🖼️ サムネイル構造:');
    console.log('thumbnail:', JSON.stringify(postWithAsset.thumbnail, null, 2));
    
    // 2. 直接的なアセット取得を試行
    if (postWithAsset.thumbnail?.asset?._ref) {
      console.log(`\n🔍 アセット参照: ${postWithAsset.thumbnail.asset._ref}`);
      
      const directAsset = await client.fetch(`
        *[_type == "sanity.imageAsset" && _id == $assetId][0] {
          _id,
          url,
          path,
          extension,
          size,
          metadata {
            dimensions,
            hasAlpha,
            isOpaque
          }
        }
      `, { assetId: postWithAsset.thumbnail.asset._ref });
      
      if (directAsset) {
        console.log('\n✅ 直接アセット取得成功:');
        console.log('直接URL:', directAsset.url);
        console.log('パス:', directAsset.path);
        console.log('サイズ:', directAsset.size);
        console.log('寸法:', directAsset.metadata?.dimensions);
      }
    }
    
    // 3. PostCardで使用されるクエリの完全な模擬
    console.log('\n🧪 PostCard完全クエリテスト:');
    const postCardQuery = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug,
        youtubeUrl,
        categories,
        excerpt,
        displayExcerpt,
        thumbnail{
          asset->{
            _ref,
            url
          },
          alt
        }
      }
    `);
    
    postCardQuery.forEach((post, idx) => {
      console.log(`\n${idx + 1}. ${post.title.substring(0, 40)}...`);
      console.log(`   thumbnail:`, JSON.stringify(post.thumbnail, null, 2));
    });
    
    // 4. Sanity CDN URL形式の確認
    console.log('\n🌐 Sanity CDN URL構造分析:');
    const allAssets = await client.fetch(`
      *[_type == "sanity.imageAsset"][0...3] {
        _id,
        url,
        path,
        "projectId": sanity::projectId(),
        "dataset": sanity::dataset()
      }
    `);
    
    allAssets.forEach((asset, idx) => {
      console.log(`\nアセット${idx + 1}:`);
      console.log(`  ID: ${asset._id}`);
      console.log(`  URL: ${asset.url}`);
      console.log(`  パス: ${asset.path}`);
      console.log(`  プロジェクト: ${asset.projectId}`);
      console.log(`  データセット: ${asset.dataset}`);
    });
    
  } catch (error) {
    console.error('❌ デバッグエラー:', error.message);
  }
}

debugSanityURL();