const { createClient } = require('@sanity/client');

console.log('🔍 API認証問題のデバッグ中...');
console.log('環境変数SANITY_API_TOKEN:', process.env.SANITY_API_TOKEN ? '設定あり' : '設定なし');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugTokenIssue() {
  try {
    console.log('🧪 簡単なクエリでAPI接続をテスト中...');
    
    const result = await client.fetch(`*[_type == "post"] | order(_createdAt desc)[0] {
      _id,
      title
    }`);
    
    console.log('✅ API接続成功');
    console.log('取得した記事:', result.title);
    
  } catch (error) {
    console.error('❌ API接続エラー:', error.message);
    console.error('エラー詳細:', error.response?.body || error);
    
    // 複数のトークンでテスト
    const alternativeTokens = [
      'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZWeb',
      'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZWeb'
    ];
    
    for (const token of alternativeTokens) {
      try {
        console.log(`🔄 代替トークンでテスト中... (${token.substring(0, 10)}...)`);
        
        const testClient = createClient({
          projectId: 'aoxze287',
          dataset: 'production',
          apiVersion: '2024-01-01',
          useCdn: false,
          token: token
        });
        
        const testResult = await testClient.fetch(`*[_type == "post"] | order(_createdAt desc)[0] {
          _id,
          title
        }`);
        
        console.log('✅ 代替トークンで成功:', testResult.title);
        break;
        
      } catch (tokenError) {
        console.log('❌ 代替トークンも失敗:', tokenError.message);
      }
    }
  }
}

debugTokenIssue();