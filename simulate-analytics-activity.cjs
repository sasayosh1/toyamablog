console.log('🎭 Google Analytics 活動シミュレーション');
console.log('=====================================');

// 現在の時刻を表示
const now = new Date();
console.log(`⏰ 開始時刻: ${now.toLocaleTimeString()}`);

console.log('\n📊 シミュレーション シナリオ:');
console.log('1. ユーザーがサイトに訪問');
console.log('2. トップページを閲覧 (pageview イベント)');
console.log('3. 記事一覧を閲覧 (pageview イベント)');
console.log('4. 個別記事を3つ閲覧 (pageview イベント x3)');
console.log('5. 合計5つのページビューが発生');

console.log('\n🔄 予想されるGoogle Analyticsの変化:');
console.log('=====================================');

// 時間経過をシミュレート
function simulatePageView(pageName, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`📄 [${timestamp}] ${pageName} - ページビュー送信`);
      console.log(`   → gtag('config', 'G-5VS8BF91VH', { page_path: '${pageName}' })`);
      resolve();
    }, delay);
  });
}

async function simulateUserSession() {
  console.log('\n👤 ユーザーセッション開始...');
  
  await simulatePageView('/', 0);
  console.log('   📈 リアルタイム: 現在のユーザー数 → 1');
  
  await simulatePageView('/posts', 2000);
  console.log('   📈 リアルタイム: ページビュー → 2');
  
  await simulatePageView('/posts/toyama-city-cake-station', 2000);
  console.log('   📈 リアルタイム: ページビュー → 3');
  
  await simulatePageView('/posts/tonami-city-temple', 2000);
  console.log('   📈 リアルタイム: ページビュー → 4');
  
  await simulatePageView('/posts/himi-city-onsen', 2000);
  console.log('   📈 リアルタイム: ページビュー → 5');
  
  const endTime = new Date();
  console.log(`\n✅ セッション完了: ${endTime.toLocaleTimeString()}`);
  
  console.log('\n📊 Google Analytics で確認できるデータ:');
  console.log('• 現在のユーザー数: 1');
  console.log('• ページビュー: 5');
  console.log('• 滞在時間: 約8秒');
  console.log('• 閲覧ページ: 5つの異なるページ');
  console.log('• 国: Japan');
  
  console.log('\n🎯 実際の確認方法:');
  console.log('上記と同じようにサイトを閲覧すると、');
  console.log('Google Analytics のリアルタイムレポートで');
  console.log('同じような数字の変化が確認できます！');
}

// シミュレーション実行
simulateUserSession();