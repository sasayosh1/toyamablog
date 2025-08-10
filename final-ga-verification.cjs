// 最終Google Analytics検証スクリプト
const fs = require('fs');
const path = require('path');

console.log('🎯 最終Google Analytics設定検証\n');

// 1. 環境変数確認
console.log('📋 1. 環境変数確認:');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_GA_ID=G-SVS8BF91VH')) {
    console.log('✅ 測定ID: G-SVS8BF91VH (修正済み)');
  } else {
    console.log('❌ 測定IDが見つからないか間違っています');
  }
} else {
  console.log('❌ .env.localファイルが見つかりません');
}

// 2. 改良版Analytics.tsx確認
console.log('\n📋 2. 改良版Analytics.tsx確認:');
const analyticsPath = path.join(__dirname, 'src/components/Analytics.tsx');
if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  
  let checks = [];
  
  if (analyticsContent.includes("import Script from 'next/script'")) {
    checks.push('✅ Next.js Scriptコンポーネントを使用');
  } else {
    checks.push('❌ Next.js Scriptコンポーネントが見つからない');
  }
  
  if (analyticsContent.includes("strategy=\"afterInteractive\"")) {
    checks.push('✅ 適切なstrategy設定 (afterInteractive)');
  } else {
    checks.push('❌ strategy設定が見つからない');
  }
  
  if (analyticsContent.includes('dangerouslySetInnerHTML')) {
    checks.push('✅ インライン初期化スクリプト実装');
  } else {
    checks.push('❌ 初期化スクリプトが見つからない');
  }
  
  if (analyticsContent.includes('console.warn')) {
    checks.push('✅ エラーハンドリング実装');
  } else {
    checks.push('❌ エラーハンドリングが見つからない');
  }
  
  if (analyticsContent.includes('page_view')) {
    checks.push('✅ ページビューイベント送信実装');
  } else {
    checks.push('❌ ページビューイベント送信が見つからない');
  }
  
  checks.forEach(check => console.log('   ' + check));
} else {
  console.log('❌ Analytics.tsx が見つかりません');
}

// 3. バックアップファイル確認
console.log('\n📋 3. バックアップファイル確認:');
const backupPath = path.join(__dirname, 'src/components/Analytics.tsx.backup');
if (fs.existsSync(backupPath)) {
  console.log('✅ 旧Analytics.tsxのバックアップ作成済み');
} else {
  console.log('⚠️ バックアップファイルが見つかりません');
}

// 4. Layout統合確認
console.log('\n📋 4. Layout統合確認:');
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('import { Analytics }')) {
    console.log('✅ Layout.tsxでAnalyticsコンポーネントをimport');
  }
  
  if (layoutContent.includes('<Analytics />')) {
    console.log('✅ Layout.tsx内でAnalyticsコンポーネントを使用');
  }
  
  if (layoutContent.includes('<Suspense')) {
    console.log('✅ Suspenseでラッピング');
  }
}

console.log('\n🎯 修正内容まとめ:');
console.log('1. 測定IDの修正: G-5VS8BF91VH → G-SVS8BF91VH');
console.log('2. 動的スクリプト読み込みからNext.js Scriptコンポーネントに変更');
console.log('3. Server-sideでのスクリプト配置実装');
console.log('4. エラーハンドリングとコンソール警告の追加');
console.log('5. ページビューイベントの明示的送信');

console.log('\n📊 デプロイ前チェックリスト:');
console.log('□ Vercel環境変数の更新 (NEXT_PUBLIC_GA_ID=G-SVS8BF91VH)');
console.log('□ アプリケーションのビルドテスト');
console.log('□ デプロイ実行');
console.log('□ Google Analytics Real-timeレポートでのテスト');
console.log('□ ブラウザDeveloper ToolsでのNetworkタブ確認');

console.log('\n⚠️ 重要な注意点:');
console.log('- Vercelの環境変数設定も忘れずに更新してください');
console.log('- デプロイ後、必ずReal-timeレポートでテストしてください');
console.log('- ブラウザでgoogletagmanager.comへのリクエストを確認してください');