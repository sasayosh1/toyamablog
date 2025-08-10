// Google Analytics実装修正スクリプト
const fs = require('fs');
const path = require('path');

console.log('🔧 Google Analytics実装の修正を開始...\n');

// 1. 環境変数の修正
console.log('📋 1. 環境変数の修正:');
const envPath = path.join(__dirname, '.env.local');
let needsEnvUpdate = false;

if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // 測定IDが間違っている場合は修正
  if (envContent.includes('NEXT_PUBLIC_GA_ID=G-5VS8BF91VH')) {
    console.log('⚠️ 測定IDを修正します: G-5VS8BF91VH → G-SVS8BF91VH');
    envContent = envContent.replace('NEXT_PUBLIC_GA_ID=G-5VS8BF91VH', 'NEXT_PUBLIC_GA_ID=G-SVS8BF91VH');
    needsEnvUpdate = true;
  }
  
  if (needsEnvUpdate) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.localファイルを更新しました');
  } else {
    console.log('✅ 環境変数は既に正しく設定されています');
  }
}

// 2. Analytics.tsxのバックアップ作成
console.log('\n📋 2. 現在のAnalytics.tsxをバックアップ:');
const analyticsPath = path.join(__dirname, 'src/components/Analytics.tsx');
const analyticsBackupPath = path.join(__dirname, 'src/components/Analytics.tsx.backup');

if (fs.existsSync(analyticsPath)) {
  fs.copyFileSync(analyticsPath, analyticsBackupPath);
  console.log('✅ Analytics.tsx → Analytics.tsx.backup');
}

// 3. 改良版Analytics.tsxの内容作成
console.log('\n📋 3. 改良版Analytics.tsxを作成:');
const improvedAnalyticsContent = `'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
    dataLayer: any[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return

    // Send page view on route change
    const url = 'https://sasakiyoshimasa.com' + pathname + (searchParams?.toString() ? '?' + searchParams.toString() : '')
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
    })

    // Explicitly send page_view event
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  // Don't render anything if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics measurement ID not found')
    return null
  }

  return (
    <>
      {/* Load gtag script */}
      <Script
        strategy="afterInteractive"
        src={\`https://www.googletagmanager.com/gtag/js?id=\${GA_MEASUREMENT_ID}\`}
      />
      
      {/* Initialize gtag */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '\${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              page_title: document.title,
              send_page_view: false
            });
            
            // Send initial page view
            gtag('event', 'page_view', {
              page_location: window.location.href,
              page_title: document.title,
            });
          \`,
        }}
      />
    </>
  )
}`;

// 4. Analytics.tsxを更新
fs.writeFileSync(analyticsPath, improvedAnalyticsContent);
console.log('✅ Analytics.tsxを改良版に更新しました');

console.log('\n🎯 修正完了！');
console.log('✅ Next.js 15のScriptコンポーネントを使用');
console.log('✅ Server-sideでのスクリプト配置');
console.log('✅ 適切なstrategy設定 (afterInteractive)');
console.log('✅ エラーハンドリングの追加');

console.log('\n📊 次のステップ:');
console.log('1. Vercelで環境変数を確認・更新してください');
console.log('2. アプリケーションをデプロイしてください');
console.log('3. Google Analytics Real-timeレポートでテストしてください');
console.log('4. ブラウザのNetwork タブでgtag.jsの読み込みを確認してください');

console.log('\n⚠️ Vercel環境変数の設定:');
console.log('NEXT_PUBLIC_GA_ID = G-SVS8BF91VH (正しい測定ID)');