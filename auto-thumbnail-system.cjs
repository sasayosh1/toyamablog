const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// YouTube URLからビデオIDを抽出
function extractVideoId(url) {
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('v');
  } else if (url.includes('youtube.com/shorts/')) {
    return url.split('shorts/')[1].split('?')[0];
  }
  return null;
}

// サムネイルの自動設定
async function setAutoThumbnail(article) {
  try {
    console.log(`🎯 自動サムネイル設定中: ${article.title}`);
    
    const videoId = extractVideoId(article.youtubeUrl);
    if (!videoId) {
      console.log('❌ ビデオIDを抽出できませんでした');
      return false;
    }
    
    console.log(`🎬 ビデオID: ${videoId}`);
    
    // 複数のサムネイル形式を試す
    const formats = ['maxresdefault.jpg', 'sddefault.jpg', 'hqdefault.jpg', 'mqdefault.jpg', 'default.jpg'];
    let thumbnailUrl = null;
    
    for (const format of formats) {
      const testUrl = `https://img.youtube.com/vi/${videoId}/${format}`;
      try {
        const response = await fetch(testUrl);
        if (response.ok && response.headers.get('content-length') > 2000) {
          thumbnailUrl = testUrl;
          console.log(`✅ サムネイル取得成功: ${format}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!thumbnailUrl) {
      console.log('❌ 有効なサムネイルが見つかりませんでした');
      return false;
    }
    
    console.log('📥 サムネイル画像をダウンロード中...');
    const response = await fetch(thumbnailUrl);
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength < 1000) {
      console.log('❌ サムネイルファイルが小さすぎます');
      return false;
    }
    
    // 画像アセットを作成
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `auto-thumbnail-${article.slug?.current || 'video'}-${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log('✅ 画像アセット作成完了:', asset._id);
    
    // 記事を更新
    await client
      .patch(article._id)
      .set({
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id
          },
          alt: article.title + ' サムネイル'
        },
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('🎉 自動サムネイル設定完了!');
    console.log(`🔗 記事URL: https://sasakiyoshimasa.com/blog/${article.slug?.current}`);
    return true;
    
  } catch (error) {
    console.log('❌ エラー:', error.message);
    return false;
  }
}

async function processRemainingThumbnails() {
  try {
    console.log('🚀 残りの記事に自動サムネイル設定を実行中...');
    
    // YouTube URLがあるのにサムネイルがない記事を取得（最新15件）
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...15] {
      _id,
      title,
      slug,
      youtubeUrl,
      publishedAt
    }`);
    
    console.log(`📊 処理対象記事: ${articles.length}件`);
    
    if (articles.length === 0) {
      console.log('✅ 処理が必要な記事はありません');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    const processedArticles = [];
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] 処理中...`);
      
      const success = await setAutoThumbnail(article);
      if (success) {
        successCount++;
        processedArticles.push({
          title: article.title,
          slug: article.slug?.current,
          url: article.youtubeUrl
        });
      } else {
        failCount++;
      }
      
      // API制限を避けるため待機
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 自動サムネイル設定完了！');
      
      console.log('\n✅ サムネイル設定が完了した記事:');
      processedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   URL: https://sasakiyoshimasa.com/blog/${article.slug}`);
      });
      
      console.log('\n🔄 キャッシュクリア中...');
      
      // 成功した記事のキャッシュを強制クリア
      for (const article of articles) {
        try {
          await client
            .patch(article._id)
            .set({ _updatedAt: new Date().toISOString() })
            .commit();
        } catch (error) {
          // キャッシュクリアの失敗は無視
        }
      }
      
      console.log('\n💡 確認方法:');
      console.log('📱 https://sasakiyoshimasa.com でブラウザ強制リロード (Ctrl+F5)');
      console.log('⏱️  5-10分後にCDN更新完了');
      
      console.log('\n🎯 今回の成果:');
      console.log(`- ${successCount}件の記事に自動でサムネイルを設定`);
      console.log('- YouTube動画の表示品質向上');
      console.log('- ブログ全体の見た目の統一性向上');
    }
    
    if (failCount > 0) {
      console.log(`\n⚠️ サムネイル設定に失敗した${failCount}件の記事は、動画が削除されている可能性があります`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

processRemainingThumbnails();