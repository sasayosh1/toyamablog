import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function checkAllContent() {
  try {
    console.log('📡 TOYAMA BLOGの全コンテンツを確認中...');
    
    // すべてのドキュメントタイプを確認
    const allDocs = await client.fetch('*[defined(_type)] {_type, _id, title, name}');
    console.log(`✅ 全ドキュメント数: ${allDocs.length}`);
    
    // ドキュメントタイプ別に分類
    const typeCount = {};
    allDocs.forEach(doc => {
      typeCount[doc._type] = (typeCount[doc._type] || 0) + 1;
    });
    
    console.log('\n📊 ドキュメントタイプ別件数:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}件`);
    });
    
    // 記事っぽいドキュメントを探す
    console.log('\n🔍 記事候補の詳細:');
    
    // 複数のタイプで記事を検索
    const possiblePostTypes = ['post', 'article', 'blog', 'blogPost', 'content'];
    
    for (const type of possiblePostTypes) {
      const posts = await client.fetch(`*[_type == "${type}"] | order(_createdAt desc) [0...5] {
        _id, _type, title, name, slug, _createdAt, _updatedAt
      }`);
      
      if (posts.length > 0) {
        console.log(`\n📝 ${type}タイプの記事 (最新5件):`);
        posts.forEach((post, index) => {
          console.log(`  ${index + 1}. "${post.title || post.name || '無題'}" (ID: ${post._id.substring(0, 8)}...)`);
          console.log(`     作成: ${post._createdAt ? new Date(post._createdAt).toLocaleDateString('ja-JP') : '不明'}`);
        });
      }
    }
    
    // 最新の10件のドキュメントを確認
    console.log('\n📅 最新ドキュメント (10件):');
    const recentDocs = await client.fetch(`*[defined(_type)] | order(_updatedAt desc) [0...10] {
      _id, _type, title, name, _createdAt, _updatedAt
    }`);
    
    recentDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. [${doc._type}] "${doc.title || doc.name || '無題'}"`);
      console.log(`     更新: ${doc._updatedAt ? new Date(doc._updatedAt).toLocaleDateString('ja-JP') : '不明'}`);
    });
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkAllContent();