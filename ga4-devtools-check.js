// GA4 DevTools確認スクリプト
// Chrome DevToolsのConsoleで実行してGA4の実装を確認

console.log('🎯 GA4実装確認スクリプト開始');
console.log('測定ID: G-5VS8BF91VH');
console.log('==========================================');

// 1. gtag関数の存在確認
if (typeof window.gtag === 'function') {
    console.log('✅ window.gtag関数が存在します');
} else {
    console.warn('❌ window.gtag関数が見つかりません');
}

// 2. dataLayer配列の確認
if (Array.isArray(window.dataLayer)) {
    console.log(`✅ window.dataLayerが存在します (${window.dataLayer.length}個の要素)`);
    console.log('dataLayer内容:', window.dataLayer);
} else {
    console.warn('❌ window.dataLayerが見つかりません');
}

// 3. Google Tag Manager スクリプトの確認
const gtagScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
if (gtagScripts.length > 0) {
    console.log(`✅ Google Tag Managerスクリプトを${gtagScripts.length}個発見`);
    gtagScripts.forEach((script, index) => {
        console.log(`  ${index + 1}. ${script.src}`);
    });
} else {
    console.warn('❌ Google Tag Managerスクリプトが見つかりません');
}

// 4. 測定IDの確認
const allScripts = document.querySelectorAll('script');
let measurementIdFound = false;
allScripts.forEach(script => {
    if (script.innerHTML.includes('G-5VS8BF91VH')) {
        measurementIdFound = true;
        console.log('✅ 測定ID G-5VS8BF91VH を確認しました');
    }
});
if (!measurementIdFound) {
    console.warn('❌ 測定ID G-5VS8BF91VH が見つかりません');
}

// 5. ネットワークリクエストの確認
console.log('\n📡 ネットワークリクエスト確認:');
const performanceEntries = performance.getEntriesByType('resource');
const analyticsRequests = performanceEntries.filter(entry => 
    entry.name.includes('googletagmanager.com') || 
    entry.name.includes('google-analytics.com') ||
    entry.name.includes('collect')
);

if (analyticsRequests.length > 0) {
    console.log(`✅ Analytics関連リクエストを${analyticsRequests.length}件発見:`);
    analyticsRequests.forEach((request, index) => {
        console.log(`  ${index + 1}. ${request.name}`);
    });
} else {
    console.warn('❌ Analytics関連のリクエストが見つかりません');
}

// 6. pageview送信テスト
console.log('\n🔥 pageview送信テスト:');
if (typeof window.gtag === 'function') {
    console.log('手動でpageviewを送信します...');
    window.gtag('config', 'G-5VS8BF91VH', {
        page_path: '/test-pageview-from-console',
        page_title: 'DevTools Test Page'
    });
    console.log('✅ pageviewを送信しました。Networkタブで"collect"リクエストを確認してください');
} else {
    console.warn('❌ gtag関数が利用できないため、pageviewテストをスキップしました');
}

// 7. リアルタイム監視用の関数を定義
window.watchGA4Requests = function() {
    console.log('🔍 GA4リクエストの監視を開始...');
    console.log('ページ遷移を行ってください。リクエストが検出されます。');
    
    // MutationObserverでDOM変更を監視
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'SCRIPT' && node.src && node.src.includes('collect')) {
                        console.log('🚀 新しいAnalyticsリクエストを検出:', node.src);
                    }
                });
            }
        });
    });
    
    observer.observe(document.head, { childList: true, subtree: true });
    
    // Performance APIで新しいリクエストを監視
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && (url.includes('collect') || url.includes('analytics'))) {
            console.log('🎯 GA4リクエスト検出:', url);
        }
        return originalFetch.apply(this, args);
    };
    
    console.log('✅ 監視を開始しました。ページ遷移してください。');
};

console.log('\n📋 確認完了！');
console.log('💡 追加の監視を開始するには: watchGA4Requests()');
console.log('💡 ページ遷移テストのため別のページに移動してください');
console.log('==========================================');

// 自動でページビューテストを実行
setTimeout(() => {
    if (typeof window.gtag === 'function') {
        console.log('\n🚀 自動pageviewテスト実行中...');
        window.gtag('event', 'page_view', {
            page_location: window.location.href,
            page_title: document.title,
            custom_parameter: 'devtools_test'
        });
        console.log('✅ イベント送信完了');
    }
}, 1000);