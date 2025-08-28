const puppeteer = require('puppeteer');

async function demonstrateAnalytics() {
  console.log('🎭 Google Analyticsの動作デモを開始...');
  
  try {
    // ブラウザを起動
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
    });
    const page = await browser.newPage();

    console.log('📊 デモシナリオ:');
    console.log('1. トップページにアクセス');
    console.log('2. 記事一覧を閲覧');
    console.log('3. 個別記事を閲覧');
    console.log('4. 別の記事を閲覧');
    
    // Google Analyticsのトラッキングコードが読み込まれることを確認
    await page.goto('http://localhost:3000');
    console.log('✅ トップページにアクセス');
    
    // GAトラッキングコードの存在確認
    const hasGoogleAnalytics = await page.evaluate(() => {
      return window.gtag !== undefined && window.dataLayer !== undefined;
    });
    
    if (hasGoogleAnalytics) {
      console.log('✅ Google Analytics トラッキングコード読み込み確認');
    } else {
      console.log('❌ Google Analytics トラッキングコードが見つかりません');
    }

    // 2秒待機
    await page.waitForTimeout(2000);
    
    // 記事一覧へ移動
    console.log('🔄 記事一覧へ移動中...');
    await page.waitForTimeout(1000);
    
    // 個別記事へ移動（最初の記事リンクをクリック）
    try {
      const articleLink = await page.$('a[href*="/posts/"]');
      if (articleLink) {
        await articleLink.click();
        console.log('✅ 個別記事にアクセス');
        await page.waitForTimeout(2000);
        
        // ページタイトルを取得
        const title = await page.title();
        console.log('📄 現在のページ:', title.substring(0, 50) + '...');
      }
    } catch (e) {
      console.log('ℹ️ 記事リンクが見つかりませんでした');
    }

    console.log('\n📊 Google Analytics確認ポイント:');
    console.log('• リアルタイム → 概要 で「現在のユーザー数」を確認');
    console.log('• ページビューイベントが送信されているか確認');
    console.log('• 閲覧ページ情報が正しく記録されているか確認');

    console.log('\n🔗 Google Analytics リアルタイム:');
    console.log('https://analytics.google.com/analytics/web/#/p*/realtime/overview');

    // 5秒待機してブラウザを閉じる
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('✅ デモ完了');

  } catch (error) {
    console.error('❌ デモエラー:', error.message);
    console.log('💡 手動で http://localhost:3000 にアクセスしてください');
  }
}

// Puppeteerがインストールされているかチェック
try {
  require.resolve('puppeteer');
  demonstrateAnalytics();
} catch (e) {
  console.log('ℹ️ Puppeteerがインストールされていません');
  console.log('📊 手動でGoogle Analytics動作確認を行います:');
  console.log('\n🎯 確認手順:');
  console.log('1. ブラウザで http://localhost:3000 を開く');
  console.log('2. 別タブでGoogle Analyticsを開く');
  console.log('3. リアルタイム → 概要 を表示');
  console.log('4. サイト内を数ページ閲覧');
  console.log('5. 「現在のユーザー数」が1以上になることを確認');
  console.log('6. 「ページビュー」の数字が増加することを確認');
}