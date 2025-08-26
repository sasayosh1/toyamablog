const { createClient } = require('@sanity/client');

// Sanity クライアントの設定
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
});

async function testSearch() {
  try {
    console.log('🧪 Sanity接続テスト開始...');
    
    // 基本的なデータ取得テスト
    console.log('📊 記事総数確認中...');
    const totalPosts = await client.fetch(`count(*[_type == "post"])`);
    console.log(`✅ 記事総数: ${totalPosts}件`);
    
    // 検索機能テスト
    console.log('🔍 検索機能テスト開始...');
    const searchTerm = '富山';
    
    console.log(`検索語: "${searchTerm}"`);
    
    // より安全で効果的な検索クエリ
    const posts = await client.fetch(`
      *[_type == "post" && (
        title match "*" + $searchTerm + "*" ||
        description match "*" + $searchTerm + "*" ||
        category match "*" + $searchTerm + "*"
      )] | order(publishedAt desc) [0...5] {
        _id,
        title,
        slug,
        description,
        category,
        publishedAt
      }
    `, { searchTerm });
    
    console.log(`✅ 検索結果: ${posts.length}件`);
    
    if (posts.length > 0) {
      console.log('📋 検索結果サンプル:');
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   カテゴリー: ${post.category || 'なし'}`);
        console.log(`   説明: ${post.description?.substring(0, 50) || 'なし'}...`);
      });
    }
    
    // フォールバック検索テスト
    console.log('🔄 フォールバック検索テスト...');
    const fallbackPosts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...5] {
        _id,
        title,
        slug,
        description,
        category,
        publishedAt
      }
    `);
    
    console.log(`✅ フォールバック検索: ${fallbackPosts.length}件`);
    
    // クライアントサイドフィルタリングテスト
    const clientFiltered = fallbackPosts.filter(post => 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log(`✅ クライアントサイドフィルタリング: ${clientFiltered.length}件`);
    
    console.log('🎉 検索機能テスト完了');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    console.error('エラー詳細:', error.message);
  }
}

testSearch();