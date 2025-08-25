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

// サムネイルの有効性をチェック
async function checkThumbnailValidity(videoId) {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  try {
    const response = await fetch(thumbnailUrl);
    if (response.ok && response.headers.get('content-length') > 1000) {
      return thumbnailUrl;
    }
  } catch (error) {
    // エラーの場合は無効
  }
  return null;
}

async function setThumbnailForArticle(article) {
  try {
    console.log(`\n🎯 処理中: ${article.title}`);
    
    const videoId = extractVideoId(article.youtubeUrl);
    if (!videoId) {
      console.log('❌ ビデオIDを抽出できませんでした');
      return false;
    }
    
    console.log(`🎬 ビデオID: ${videoId}`);
    
    const thumbnailUrl = await checkThumbnailValidity(videoId);
    if (!thumbnailUrl) {
      console.log('❌ 有効なサムネイルが見つかりませんでした');
      return false;
    }
    
    console.log('📥 サムネイル画像をダウンロード中...');
    const response = await fetch(thumbnailUrl);
    const buffer = await response.arrayBuffer();
    
    // 画像アセットを作成
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `thumbnail-${article.slug?.current || 'article'}-${Date.now()}.jpg`,
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
    
    console.log('🎉 サムネイル設定完了!');
    console.log(`🔗 URL: https://sasakiyoshimasa.com/blog/${article.slug?.current}`);
    return true;
    
  } catch (error) {
    console.log('❌ エラー:', error.message);
    return false;
  }
}

async function fixMultipleThumbnails() {
  try {
    console.log('🚀 複数記事のサムネイル一括設定を開始...');
    
    // YouTube URLがあるのにサムネイルがない記事を取得（最新10件）
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...10] {
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
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] 処理中...`);
      
      const success = await setThumbnailForArticle(article);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // API制限を避けるため少し待機
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 サムネイル設定が完了した記事のキャッシュをクリアします...');
      
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
      
      console.log('🔄 キャッシュクリア完了');
      console.log('\n💡 サイトでの反映確認方法:');
      console.log('1. https://sasakiyoshimasa.com でブラウザ強制リロード (Ctrl+F5)');
      console.log('2. 各記事ページで個別確認');
      console.log('3. 5-10分後に再確認（CDN更新待ち）');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixMultipleThumbnails();