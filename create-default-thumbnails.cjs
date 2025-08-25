const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// カテゴリー別のデフォルトサムネイル色
const categoryColors = {
  '富山市': '#FF6B6B',  // 赤系
  '高岡市': '#4ECDC4',  // 青緑系
  '氷見市': '#45B7D1',  // 青系
  '砺波市': '#96CEB4',  // 緑系
  '小矢部市': '#FFEAA7', // 黄系
  '南砺市': '#DDA0DD',  // 紫系
  '射水市': '#FFB6C1',  // ピンク系
  '魚津市': '#87CEEB',  // 水色系
  '黒部市': '#98FB98',  // 薄緑系
  '滑川市': '#F0E68C',  // カーキ系
  '立山町': '#D3D3D3',  // 灰系
  '上市町': '#FFA07A',  // 橙系
  '舟橋村': '#20B2AA',  // ダークターコイズ
  '八尾町': '#CD853F',  // 茶系
  '婦中町': '#FF69B4',  // 濃いピンク系
  '入善町': '#32CD32',  // ライム系
  '朝日町': '#FFD700',  // 金系
  'その他': '#808080'   // グレー系
};

// SVGサムネイルを生成
function createThumbnailSVG(title, category) {
  const color = categoryColors[category] || categoryColors['その他'];
  const shortTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
  
  return `<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color}CC;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#grad)"/>
    <rect x="10" y="10" width="300" height="160" fill="none" stroke="white" stroke-width="2" rx="5"/>
    <text x="160" y="50" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${category}</text>
    <text x="160" y="90" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">${shortTitle}</text>
    <text x="160" y="130" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white">富山ブログ</text>
    <circle cx="280" cy="40" r="15" fill="white" opacity="0.8"/>
    <text x="280" y="45" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="${color}">🎥</text>
  </svg>`;
}

async function setDefaultThumbnailForArticle(article) {
  try {
    console.log(`\n🎯 処理中: ${article.title}`);
    console.log(`📍 カテゴリー: ${article.category || 'その他'}`);
    
    // SVGサムネイルを生成
    const svgContent = createThumbnailSVG(article.title, article.category || 'その他');
    const svgBuffer = Buffer.from(svgContent, 'utf-8');
    
    // 画像アセットを作成
    const asset = await client.assets.upload('image', svgBuffer, {
      filename: `default-thumbnail-${article.slug?.current || 'article'}-${Date.now()}.svg`,
      contentType: 'image/svg+xml'
    });
    
    console.log('✅ デフォルトサムネイル作成完了:', asset._id);
    
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
          alt: article.title + ' デフォルトサムネイル'
        },
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('🎉 デフォルトサムネイル設定完了!');
    console.log(`🔗 記事URL: https://sasakiyoshimasa.com/blog/${article.slug?.current}`);
    return true;
    
  } catch (error) {
    console.log('❌ エラー:', error.message);
    return false;
  }
}

async function createDefaultThumbnails() {
  try {
    console.log('🎨 デフォルトサムネイル一括作成を開始...');
    console.log('📌 YouTube動画はあるがサムネイル取得できなかった記事にデフォルトサムネイルを設定します');
    
    // YouTube URLがあるのにサムネイルがない記事を取得（最新5件）
    const articles = await client.fetch(`*[_type == "post" && defined(youtubeUrl) && !defined(thumbnail)] | order(publishedAt desc)[0...5] {
      _id,
      title,
      slug,
      category,
      youtubeUrl,
      publishedAt
    }`);
    
    console.log(`📊 処理対象記事: ${articles.length}件`);
    
    if (articles.length === 0) {
      console.log('✅ 処理が必要な記事はありません');
      return;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] デフォルトサムネイル作成中...`);
      
      const success = await setDefaultThumbnailForArticle(article);
      if (success) {
        successCount++;
      }
      
      // API制限を避けるため待機
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${articles.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 デフォルトサムネイル設定完了！');
      console.log('🔄 キャッシュクリア中...');
      
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
      
      console.log('\n🎨 作成されたデフォルトサムネイルの特徴:');
      console.log('- カテゴリー別の色分け');
      console.log('- 記事タイトルの表示');  
      console.log('- YouTube動画マーク付き');
      console.log('- 「富山ブログ」ブランディング');
      
      console.log('\n💡 確認方法:');
      console.log('📱 https://sasakiyoshimasa.com でブラウザ強制リロード');
      console.log('⏱️  5-10分後にCDN更新完了');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

createDefaultThumbnails();