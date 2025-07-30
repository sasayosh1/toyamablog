import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testPermissions() {
  try {
    console.log('🔍 API権限テスト開始');
    console.log('=' * 40);
    
    // 読み取りテスト
    console.log('📖 読み取りテスト...');
    const posts = await client.fetch(`*[_type == "post"][0...2] { _id, title }`);
    console.log(`✅ 読み取り成功: ${posts.length}件取得`);
    
    // 書き込みテスト（安全なテスト）
    console.log('\n✏️ 書き込み権限テスト...');
    
    // テスト用の一時的な更新
    const testPost = posts[0];
    if (testPost) {
      try {
        // 現在の値を取得
        const currentPost = await client.fetch(`*[_id == "${testPost._id}"][0] { _id, title, description }`);
        
        // 一時的な更新（同じ値で更新してテスト）
        await client
          .patch(testPost._id)
          .set({ 
            title: currentPost.title // 同じ値で更新
          })
          .commit();
        
        console.log('✅ 書き込み権限確認: 更新可能');
        return { canRead: true, canWrite: true };
        
      } catch (writeError) {
        console.log('❌ 書き込み権限不足:', writeError.message);
        return { canRead: true, canWrite: false };
      }
    }
    
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    return { canRead: false, canWrite: false };
  }
}

async function showCurrentToken() {
  const token = process.env.SANITY_API_TOKEN;
  if (token) {
    console.log('\n🔑 現在のトークン情報:');
    console.log(`長さ: ${token.length}文字`);
    console.log(`開始: ${token.substring(0, 8)}...`);
    console.log(`終了: ...${token.substring(token.length - 8)}`);
  } else {
    console.log('❌ 環境変数 SANITY_API_TOKEN が設定されていません');
  }
}

console.log('🚀 Sanity API権限診断ツール');
showCurrentToken();
testPermissions().then(result => {
  console.log('\n📋 診断結果:');
  console.log(`読み取り権限: ${result.canRead ? '✅ あり' : '❌ なし'}`);
  console.log(`書き込み権限: ${result.canWrite ? '✅ あり' : '❌ なし'}`);
  
  if (!result.canWrite) {
    console.log('\n💡 次のステップ:');
    console.log('1. https://www.sanity.io/manage にアクセス');
    console.log('2. プロジェクト aoxze287 を選択');
    console.log('3. API > Tokens で Editor または Admin 権限のトークンを作成');
    console.log('4. SANITY_API_TOKEN 環境変数を新しいトークンに更新');
  } else {
    console.log('\n🎉 権限OK! メタデータ完了作業を実行できます');
  }
});