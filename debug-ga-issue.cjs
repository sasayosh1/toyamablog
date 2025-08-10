// 詳細なGoogle Analytics問題診断スクリプト
const fs = require('fs');
const path = require('path');

console.log('🔍 Google Analytics問題診断を開始...\n');

// 1. 環境変数の詳細確認
console.log('📋 1. 環境変数詳細確認:');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env.localファイル存在確認');
  
  if (envContent.includes('NEXT_PUBLIC_GA_ID=G-5VS8BF91VH')) {
    console.log('✅ 測定ID「G-5VS8BF91VH」設定確認');
    
    // 正しい測定IDかチェック
    if (envContent.includes('G-SVS8BF91VH')) {
      console.log('❌ 問題発見: 測定IDに誤りがあります！');
      console.log('   現在: G-5VS8BF91VH');
      console.log('   正解: G-SVS8BF91VH');
      console.log('   → 「5」と「S」が間違っています');
    }
  }
  
  // 他のGA設定もチェック
  if (envContent.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID')) {
    console.log('⚠️  重複設定: NEXT_PUBLIC_GA_MEASUREMENT_IDも設定されています');
  }
} else {
  console.log('❌ .env.localファイルが見つかりません');
}

// 2. Analytics.tsxの詳細確認
console.log('\n📋 2. Analytics.tsx詳細確認:');
const analyticsPath = path.join(__dirname, 'src/components/Analytics.tsx');
if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  
  // 環境変数の参照方法をチェック
  if (analyticsContent.includes('process.env.NEXT_PUBLIC_GA_ID')) {
    console.log('✅ 正しい環境変数名で参照しています');
  }
  
  // スクリプトの動的読み込みをチェック
  if (analyticsContent.includes('createElement(\'script\')')) {
    console.log('✅ スクリプトを動的に作成しています');
  }
  
  // useEffectの実装をチェック
  if (analyticsContent.includes('useEffect(')) {
    console.log('✅ useEffectでの初期化を実装しています');
  }
  
  // URLの設定をチェック
  if (analyticsContent.includes('sasakiyoshimasa.com')) {
    console.log('✅ 正しいドメインを設定しています');
  }
} else {
  console.log('❌ Analytics.tsx が見つかりません');
}

// 3. layout.tsxの統合確認
console.log('\n📋 3. layout.tsx統合確認:');
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('import { Analytics }')) {
    console.log('✅ Analyticsコンポーネントをimportしています');
  }
  
  if (layoutContent.includes('<Analytics />')) {
    console.log('✅ Analyticsコンポーネントを配置しています');
  }
  
  if (layoutContent.includes('<Suspense')) {
    console.log('✅ Suspenseでラップしています');
  }
  
  // Google検証コードもチェック
  if (layoutContent.includes('verification')) {
    console.log('✅ Google Search Console認証コードが設定されています');
  }
}

// 4. パッケージ.jsonとNext.js設定確認
console.log('\n📋 4. 設定ファイル確認:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  console.log(`✅ Next.js バージョン: ${packageJson.dependencies.next}`);
  console.log(`✅ React バージョン: ${packageJson.dependencies.react}`);
}

// 5. ビルド環境での問題チェック
console.log('\n📋 5. 潜在的な問題:');
console.log('⚠️  Client-side実装の問題:');
console.log('   - useEffectは初回レンダリング後に実行されます');
console.log('   - 動的スクリプト読み込みは非同期で処理されます');
console.log('   - ページ遷移時のイベント送信が正常に動作しない可能性があります');

console.log('\n⚠️  環境変数の問題:');
console.log('   - 測定IDに誤りがある可能性があります（G-5VS8BF91VH vs G-SVS8BF91VH）');
console.log('   - Vercelの環境変数設定との不整合の可能性があります');

console.log('\n🔧 推奨される修正:');
console.log('1. 測定IDの修正: G-5VS8BF91VH → G-SVS8BF91VH');
console.log('2. Server-sideでのスクリプト配置 (next/script使用)');
console.log('3. 環境変数の統一');
console.log('4. エラーハンドリングの追加');

console.log('\n📊 次のステップ:');
console.log('1. Google Analytics管理画面で正しい測定IDを確認');
console.log('2. Real-timeレポートでデータ収集状況を確認');
console.log('3. ブラウザのDeveloper Toolsでネットワークリクエストを確認');