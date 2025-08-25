const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanBrokenYouTubeUrls() {
  try {
    console.log('🧹 削除・非公開になったYouTube URLを記事から除去中...');
    
    // 問題のある記事のIDリスト（確認済み）
    const brokenArticles = [
      'fuchu-town-castle-ver-yosakoi',
      'toyama-city-2024-festival-fireworks-bridge-156-2024-7-27', 
      'tonami-city-2024-festival-2024-1',
      'yatsuo-town-2023-300-2023',
      'kurobe-city-2668-onsen-x2668-xfe0f',
      'toyama-city-4',
      'namerikawa-city-park-temple',
      'himi-city-1', 
      'himi-city-2',
      'toyama-city-mairo'
    ];
    
    console.log(`📊 処理対象記事: ${brokenArticles.length}件`);
    
    let successCount = 0;
    
    for (let i = 0; i < brokenArticles.length; i++) {
      const slug = brokenArticles[i];
      console.log(`\n[${i + 1}/${brokenArticles.length}] 処理中: ${slug}`);
      
      try {
        // 記事を取得
        const article = await client.fetch(`*[_type == "post" && slug.current == "${slug}"][0] {
          _id,
          title,
          youtubeUrl
        }`);
        
        if (!article) {
          console.log('❌ 記事が見つかりません');
          continue;
        }
        
        console.log(`📄 記事: ${article.title}`);
        console.log(`🗑️ 削除するURL: ${article.youtubeUrl}`);
        
        // YouTube URLを削除（unset）
        await client
          .patch(article._id)
          .unset(['youtubeUrl'])
          .set({ _updatedAt: new Date().toISOString() })
          .commit();
        
        console.log('✅ YouTube URL削除完了');
        successCount++;
        
      } catch (error) {
        console.log(`❌ エラー: ${error.message}`);
      }
      
      // API制限を避けるため待機
      if (i < brokenArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${brokenArticles.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 削除・非公開YouTube動画のURLを記事から除去しました！');
      console.log('\n📋 実行された処理:');
      console.log('- 削除・非公開されたYouTube動画URLを記事から削除');
      console.log('- 記事の更新日時を現在時刻に変更（キャッシュクリア）');
      console.log('\n💡 効果:');
      console.log('- 記事にアクセスできない動画が表示されなくなります');
      console.log('- サムネイル取得エラーが解消されます');
      console.log('- 必要に応じて新しい有効な動画URLを後で追加可能です');
      
      console.log('\n🔄 変更をサイトに反映中...');
      
      // 追加のキャッシュクリア
      for (const slug of brokenArticles) {
        try {
          const article = await client.fetch(`*[_type == "post" && slug.current == "${slug}"][0] { _id }`);
          if (article) {
            await client
              .patch(article._id)
              .set({ _updatedAt: new Date().toISOString() })
              .commit();
          }
        } catch (error) {
          // キャッシュクリアエラーは無視
        }
      }
      
      console.log('✅ サイトへの反映処理完了');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

cleanBrokenYouTubeUrls();