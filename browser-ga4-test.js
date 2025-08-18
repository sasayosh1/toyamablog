// ブラウザのDevTools Consoleで実行するGA4確認スクリプト
// https://sasakiyoshimasa.com にアクセスしてからConsoleで実行してください

console.log('🎯 GA4実装確認スクリプト開始');
console.log('==========================================');

// 1. 基本的な実装確認
console.log('\n📊 1. 基本的な実装確認');
console.log('測定ID: G-5VS8BF91VH');

// gtag関数の確認
if (typeof window.gtag === 'function') {
    console.log('✅ window.gtag関数が存在します');
    console.log('gtag関数:', window.gtag);
} else {
    console.log('❌ window.gtag関数が見つかりません');
    console.log('💡 ページが完全に読み込まれるまで待ってから再実行してください');
}

// dataLayer の確認
if (Array.isArray(window.dataLayer)) {
    console.log(`✅ window.dataLayerが存在します (${window.dataLayer.length}個の要素)`);
    console.log('dataLayer内容:', window.dataLayer);
    
    // GA4設定を探す
    const ga4Config = window.dataLayer.find(item => 
        item && item[0] === 'config' && item[1] === 'G-5VS8BF91VH'
    );
    if (ga4Config) {
        console.log('✅ GA4設定をdataLayerで確認:', ga4Config);
    }
} else {
    console.log('❌ window.dataLayerが見つかりません');
}

// 2. スクリプトタグの確認
console.log('\n📡 2. GA4スクリプトタグの確認');

const gtagScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
console.log(`GA4 gtag スクリプト数: ${gtagScripts.length}`);

gtagScripts.forEach((script, index) => {
    console.log(`✅ GA4スクリプト ${index + 1}:`, script.src);
});

// 測定IDを含むスクリプトを確認
const allScripts = document.querySelectorAll('script');
let measurementIdFound = false;
let configScriptFound = false;

allScripts.forEach(script => {
    const content = script.innerHTML;
    if (content.includes('G-5VS8BF91VH')) {
        measurementIdFound = true;
        console.log('✅ 測定ID G-5VS8BF91VH を含むスクリプトを発見');
        
        if (content.includes('gtag(\'config\'')) {
            configScriptFound = true;
            console.log('✅ gtag config呼び出しを確認');
        }
    }
});

if (!measurementIdFound) {
    console.log('❌ 測定ID G-5VS8BF91VH を含むスクリプトが見つかりません');
}

// 3. ネットワークリクエストの確認
console.log('\n🌐 3. ネットワークリクエストの確認');

const performanceEntries = performance.getEntriesByType('resource');
const ga4Requests = performanceEntries.filter(entry => 
    entry.name.includes('googletagmanager.com') || 
    entry.name.includes('google-analytics.com') ||
    entry.name.includes('collect?') ||
    entry.name.includes('G-5VS8BF91VH')
);

console.log(`GA4関連リクエスト数: ${ga4Requests.length}`);
ga4Requests.forEach((request, index) => {
    console.log(`✅ リクエスト ${index + 1}:`, request.name);
    console.log(`  開始時刻: ${new Date(request.startTime + performance.timeOrigin).toLocaleTimeString()}`);
    console.log(`  所要時間: ${request.duration.toFixed(2)}ms`);
});

// 4. 手動pageview送信テスト
console.log('\n🚀 4. 手動pageview送信テスト');

if (typeof window.gtag === 'function') {
    console.log('手動でpageviewを送信します...');
    
    // pageview送信
    window.gtag('config', 'G-5VS8BF91VH', {
        page_path: '/devtools-test-' + Date.now(),
        page_title: 'DevTools Manual Test',
        custom_parameter: 'console_test'
    });
    
    console.log('✅ pageviewを送信しました');
    console.log('💡 Networkタブで "collect" をフィルタして確認してください');
    
    // カスタムイベント送信テスト
    window.gtag('event', 'test_event', {
        event_category: 'devtools',
        event_label: 'manual_test',
        value: 1
    });
    
    console.log('✅ カスタムイベントも送信しました');
} else {
    console.log('❌ gtag関数が利用できないため、送信テストをスキップしました');
}

// 5. リアルタイム監視機能の設定
console.log('\n👁️ 5. リアルタイム監視機能の設定');

// Network監視を設定
console.log('ネットワーク監視を設定しています...');

// Performance Observer でリクエストを監視
if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('collect') || 
                entry.name.includes('gtag') || 
                entry.name.includes('analytics')) {
                console.log('🔥 新しいGA4リクエストを検出:', entry.name);
                console.log('  時刻:', new Date().toLocaleTimeString());
            }
        }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    console.log('✅ Performance Observer による監視を開始しました');
}

// Fetch API の監視
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
        url.includes('collect') || 
        url.includes('gtag') || 
        url.includes('analytics')
    )) {
        console.log('🎯 Fetch GA4リクエスト検出:', url);
        console.log('  時刻:', new Date().toLocaleTimeString());
    }
    return originalFetch.apply(this, args);
};

console.log('✅ Fetch API 監視を設定しました');

// 6. ルート変更監視（Next.js App Router用）
console.log('\n🔄 6. ルート変更監視の設定');

// Next.js Router イベントを監視
if (typeof window.next !== 'undefined' && window.next.router) {
    window.next.router.events.on('routeChangeComplete', (url) => {
        console.log('🏃 ルート変更検出:', url);
        console.log('  時刻:', new Date().toLocaleTimeString());
        console.log('💡 この後にGA4 pageviewが送信されるはずです');
    });
    console.log('✅ Next.js Router イベント監視を設定しました');
} else {
    console.log('💡 Next.js Router が見つかりません（App Routerの場合は正常）');
}

// URL変更を監視（App Router用）
let currentUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
        console.log('🔄 URL変更を検出:');
        console.log('  前:', currentUrl);
        console.log('  後:', window.location.href);
        console.log('  時刻:', new Date().toLocaleTimeString());
        currentUrl = window.location.href;
    }
});

urlObserver.observe(document, { subtree: true, childList: true });
console.log('✅ URL変更監視を設定しました');

// 7. 確認完了とまとめ
console.log('\n🎉 7. 確認完了とまとめ');
console.log('==========================================');

const summary = {
    'gtag関数': typeof window.gtag === 'function',
    'dataLayer': Array.isArray(window.dataLayer),
    'GA4スクリプト': gtagScripts.length > 0,
    '測定ID確認': measurementIdFound,
    'config設定': configScriptFound,
    'ネットワークリクエスト': ga4Requests.length > 0
};

console.log('📊 実装状況サマリー:');
Object.entries(summary).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${key}: ${value}`);
});

// 推奨アクション
console.log('\n💡 推奨アクション:');
console.log('1. サイト内のリンクをクリックしてページ遷移を行う');
console.log('2. Networkタブで "collect" をフィルタしてリクエストを確認');
console.log('3. GA4リアルタイムレポートでアクセス状況を確認');
console.log('4. このConsoleでリアルタイムログを監視');

// 監視停止用の関数を定義
window.stopGA4Monitoring = function() {
    if (typeof observer !== 'undefined') observer.disconnect();
    if (typeof urlObserver !== 'undefined') urlObserver.disconnect();
    window.fetch = originalFetch;
    console.log('🛑 GA4監視を停止しました');
};

console.log('\n🔧 監視停止: stopGA4Monitoring() を実行');
console.log('==========================================');
console.log('🎯 GA4確認スクリプト完了！');