import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function checkExistingData() {
  try {
    console.log('📡 TOYAMA BLOGプロジェクトに接続中...');
    
    // 既存の記事を確認
    const existingPosts = await client.fetch('*[_type == "blogPost"] | order(pubDate desc)');
    console.log(`✅ 接続成功！既存記事数: ${existingPosts.length}`);
    
    if (existingPosts.length > 0) {
      console.log('\n📝 既存記事一覧:');
      existingPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}" (${post.slug?.current || '無題'})`);
        console.log(`     公開日: ${post.pubDate ? new Date(post.pubDate).toLocaleDateString('ja-JP') : '未設定'}`);
      });
    }
    
    // 利用可能なドキュメントタイプを確認
    console.log('\n🔍 利用可能なドキュメントタイプ:');
    const allDocs = await client.fetch('*[defined(_type)] | order(_type) {_type} | group(_type)');
    const docTypes = [...new Set(allDocs.map(doc => doc._type))];
    console.log(docTypes.join(', '));
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkExistingData();