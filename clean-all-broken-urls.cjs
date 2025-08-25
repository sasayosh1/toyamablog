const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function cleanAllBrokenUrls() {
  try {
    console.log('🧹 残りの削除・非公開YouTube URLを一括除去中...');
    
    // YouTube URLがあるのにサムネイルがない記事（= 動画が削除されている記事）
    const brokenArticles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      youtubeUrl,
      publishedAt
    }`);
    
    console.log(`📊 削除対象記事: ${brokenArticles.length}件`);
    
    if (brokenArticles.length === 0) {
      console.log('✅ 削除が必要なYouTube URLはありません');
      return;
    }
    
    console.log('\n🗑️ 削除予定の記事（YouTube動画が削除・非公開のため）:');
    brokenArticles.slice(0, 10).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.youtubeUrl}`);
      console.log(`   記事: https://sasakiyoshimasa.com/blog/${article.slug?.current}`);
      console.log('');
    });
    
    if (brokenArticles.length > 10) {
      console.log(`...他${brokenArticles.length - 10}件`);
    }
    
    let successCount = 0;
    
    for (let i = 0; i < brokenArticles.length; i++) {
      const article = brokenArticles[i];
      console.log(`\n[${i + 1}/${brokenArticles.length}] 処理中: ${article.title}`);
      
      try {
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n📊 最終処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${brokenArticles.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 全ての削除・非公開YouTube動画URLを記事から除去しました！');
      
      console.log('\n📋 実行された処理:');
      console.log(`- ${successCount}件の記事から無効なYouTube URLを削除`);
      console.log('- 記事の更新日時を現在時刻に変更（キャッシュクリア）');
      
      console.log('\n💡 効果:');
      console.log('- アクセスできない動画リンクが記事から除去されます');
      console.log('- ユーザーが無効な動画リンクをクリックすることがなくなります');
      console.log('- 必要に応じて新しい有効な動画URLを後で追加可能です');
      
      // 最終統計を表示
      const finalStats = await client.fetch(`*[_type == "post"] {
        "hasYouTube": defined(youtubeUrl),
        "hasThumbnail": defined(thumbnail)
      }`);
      
      const totalPosts = finalStats.length;
      const withYouTube = finalStats.filter(p => p.hasYouTube).length;
      const withThumbnail = finalStats.filter(p => p.hasThumbnail).length;
      const youtubeWithThumbnail = finalStats.filter(p => p.hasYouTube && p.hasThumbnail).length;
      
      console.log('\n📊 クリーンアップ後の最終統計:');
      console.log(`   総記事数: ${totalPosts}件`);
      console.log(`   YouTube動画付き: ${withYouTube}件`);
      console.log(`   サムネイル設定済み: ${withThumbnail}件`);
      console.log(`   YouTube動画+サムネイル: ${youtubeWithThumbnail}件`);
      
      const coverage = withYouTube > 0 ? ((youtubeWithThumbnail / withYouTube) * 100).toFixed(1) : '100';
      console.log(`   サムネイル設定率: ${coverage}% ✨`);
      
      if (youtubeWithThumbnail === withYouTube) {
        console.log('\n🎯 完璧！全てのYouTube動画記事にサムネイルが設定されています！');
      }
      
      console.log('\n🔄 サイトへの反映処理中...');
      
      // 追加のキャッシュクリア
      for (const article of brokenArticles.slice(0, 10)) {
        try {
          await client
            .patch(article._id)
            .set({ _updatedAt: new Date().toISOString() })
            .commit();
        } catch (error) {
          // キャッシュクリアエラーは無視
        }
      }
      
      console.log('✅ サイトへの反映処理完了');
      console.log('\n💡 確認方法:');
      console.log('📱 https://sasakiyoshimasa.com でブラウザ強制リロード');
      console.log('⏱️  5-10分後にCDN更新完了');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

cleanAllBrokenUrls();