const { readFileSync } = require('fs');
const path = require('path');

console.log('🔍 Google Analytics設定の最終確認...');

try {
  // .env.localの確認
  const envPath = path.join(__dirname, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const gaIdMatch = envContent.match(/NEXT_PUBLIC_GA_ID=(.+)/);
  if (gaIdMatch) {
    const gaId = gaIdMatch[1].trim();
    console.log('✅ 測定ID:', gaId);
    
    if (gaId === 'G-5VS8BF91VH') {
      console.log('✅ 正しい測定IDが設定されています');
    } else {
      console.log('❌ 測定IDが正しくありません');
      return;
    }
  }

  // GAProviderの確認
  const gaProviderPath = path.join(__dirname, 'src/app/ga-provider.tsx');
  const gaProviderContent = readFileSync(gaProviderPath, 'utf-8');
  
  if (gaProviderContent.includes('gtag')) {
    console.log('✅ GAProvider設定確認済み');
  }

  // layout.tsxでのGAProvider読み込み確認
  const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
  const layoutContent = readFileSync(layoutPath, 'utf-8');
  
  if (layoutContent.includes('<GAProvider />')) {
    console.log('✅ layout.tsxでGAProvider読み込み確認済み');
  }

  console.log('\n📊 次のステップでリアルタイム計測を確認:');
  console.log('1. 開発サーバーでサイトにアクセス');
  console.log('2. Google Analytics → リアルタイム → 概要');
  console.log('3. 「現在のユーザー」の数字変化を確認');
  console.log('4. 複数ページを閲覧してページビュー変化を確認');

  console.log('\n🌐 開発サーバーURL: http://localhost:3000');
  console.log('🔗 Google Analytics URL: https://analytics.google.com/analytics/web/#/p123456789/realtime/overview?params=_u..reportId%3Ddefault_overview');

  console.log('\n🎯 計測確認方法:');
  console.log('• ブラウザで localhost:3000 を開く');
  console.log('• 別タブでGoogle Analyticsのリアルタイムを開く');
  console.log('• サイト内を数ページ閲覧');
  console.log('• リアルタイムの数字が増加することを確認');

} catch (error) {
  console.error('❌ エラー:', error.message);
}