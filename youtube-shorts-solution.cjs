const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testYoutubeShortsAlternatives() {
  try {
    console.log('🔬 YouTube Shorts サムネイル取得の代替方法をテスト中...');
    
    // テスト用のビデオID（Shortsではない通常の動画も含める）
    const testVideos = [
      { id: 'kX8yH9vM2nA', type: 'Shorts', title: '安田城月見の宴' },
      { id: 'dQw4w9WgXcQ', type: '通常動画', title: 'Rick Roll (テスト用)' }
    ];
    
    for (const video of testVideos) {
      console.log(`\n📹 テスト: ${video.title} (${video.type})`);
      console.log(`🆔 ビデオID: ${video.id}`);
      
      // 方法1: YouTube oEmbed API
      try {
        console.log('🔗 方法1: YouTube oEmbed API');
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`;
        const oembedResponse = await fetch(oembedUrl);
        
        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();
          console.log(`✅ oEmbed成功: ${oembedData.thumbnail_url}`);
          
          // サムネイルURLの有効性をテスト
          const thumbnailResponse = await fetch(oembedData.thumbnail_url);
          console.log(`  📸 サムネイル: ${thumbnailResponse.ok ? '✅ 利用可能' : '❌ 利用不可'}`);
          
          if (thumbnailResponse.ok) {
            console.log(`  📏 サイズ: ${thumbnailResponse.headers.get('content-length')} bytes`);
            console.log(`  📝 タイプ: ${thumbnailResponse.headers.get('content-type')}`);
          }
        } else {
          console.log(`❌ oEmbed失敗: HTTP ${oembedResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ oEmbed エラー: ${error.message}`);
      }
      
      // 方法2: 従来のサムネイルURL（比較用）
      console.log('🔗 方法2: 従来のサムネイルURL');
      const traditionalUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
      try {
        const traditionalResponse = await fetch(traditionalUrl);
        console.log(`  📸 従来方式: ${traditionalResponse.ok ? '✅ 利用可能' : '❌ 利用不可'} (HTTP ${traditionalResponse.status})`);
      } catch (error) {
        console.log(`  📸 従来方式: ❌ エラー`);
      }
      
      console.log('─'.repeat(60));
    }
    
    console.log('\n📊 結論:');
    console.log('- YouTube Shorts は従来のサムネイルURL方式では取得不可');
    console.log('- oEmbed API が有効な代替手段の可能性');
    console.log('- 実装には oEmbed API を使用することを推奨');
    
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

testYoutubeShortsAlternatives();