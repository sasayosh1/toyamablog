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

// 複数のサムネイル形式を試す
async function getThumbnailUrl(videoId) {
  const formats = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 最高解像度
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,    // 標準解像度
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,    // 高解像度
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,    // 中解像度
    `https://img.youtube.com/vi/${videoId}/default.jpg`       // 基本解像度
  ];
  
  for (const url of formats) {
    try {
      const response = await fetch(url);
      if (response.ok && response.headers.get('content-length') > 2000) {
        console.log(`✅ 有効なサムネイル見つかった: ${url.split('/').pop()}`);
        return url;
      }
    } catch (error) {
      continue;
    }
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
    console.log(`🔗 YouTube URL: ${article.youtubeUrl}`);
    
    const thumbnailUrl = await getThumbnailUrl(videoId);
    if (!thumbnailUrl) {
      console.log('❌ 有効なサムネイルが見つかりませんでした（全形式で試行済み）');
      return false;
    }
    
    console.log('📥 サムネイル画像をダウンロード中...');
    const response = await fetch(thumbnailUrl);
    const buffer = await response.arrayBuffer();
    
    console.log(`📊 サムネイルサイズ: ${buffer.byteLength} bytes`);
    
    if (buffer.byteLength < 1000) {
      console.log('❌ サムネイルファイルが小さすぎます（無効な可能性）');
      return false;
    }
    
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
    console.log(`🔗 記事URL: https://sasakiyoshimasa.com/blog/${article.slug?.current}`);
    return true;
    
  } catch (error) {
    console.log('❌ エラー:', error.message);
    return false;
  }
}

async function testThumbnailFormats() {
  try {
    console.log('🔍 YouTube Shorts用サムネイル取得テスト開始...');
    
    // YouTube URLがある記事を3件取得
    const testArticles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...3] {
      _id,
      title,
      slug,
      youtubeUrl,
      publishedAt
    }`);
    
    console.log(`📊 テスト対象記事: ${testArticles.length}件`);
    
    let successCount = 0;
    
    for (let i = 0; i < testArticles.length; i++) {
      const article = testArticles[i];
      console.log(`\n[${i + 1}/${testArticles.length}] テスト中...`);
      
      const success = await setThumbnailForArticle(article);
      if (success) {
        successCount++;
      }
      
      // API制限を避けるため待機
      if (i < testArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n📊 テスト結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${testArticles.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 サムネイル設定成功！');
      console.log('🔄 キャッシュクリア中...');
      
      // 成功した記事のキャッシュを強制クリア
      for (const article of testArticles) {
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
      console.log('📱 https://sasakiyoshimasa.com でブラウザ強制リロード');
      console.log('⏱️  5-10分後にCDN更新完了');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testThumbnailFormats();