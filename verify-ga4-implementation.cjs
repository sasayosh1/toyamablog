// Node.js用 GA4実装確認スクリプト
const https = require('https');
const { URL } = require('url');

console.log('🎯 GA4実装確認スクリプト');
console.log('測定ID: G-5VS8BF91VH');
console.log('対象サイト: https://sasakiyoshimasa.com');
console.log('==========================================\n');

// 1. 本番サイトのHTMLを取得してGA4関連を検索
function checkProductionSite() {
    return new Promise((resolve, reject) => {
        const url = new URL('https://sasakiyoshimasa.com');
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// 2. HTMLを解析してGA4実装を確認
async function analyzeGA4Implementation() {
    try {
        console.log('📡 本番サイトのHTMLを取得中...');
        const html = await checkProductionSite();
        
        console.log(`✅ HTMLを取得しました (${html.length} 文字)\n`);

        // GA4関連の要素を検索
        const checks = {
            'GAProvider': html.includes('GAProvider') || html.includes('ga-provider'),
            'gtag関数': html.includes('gtag'),
            '測定ID': html.includes('G-5VS8BF91VH'),
            'Google Tag Manager': html.includes('googletagmanager.com'),
            'dataLayer': html.includes('dataLayer'),
            'Next.js App': html.includes('next/script') || html.includes('_next/'),
            'React Hydration': html.includes('__NEXT_DATA__') || html.includes('React')
        };

        console.log('🔍 GA4実装要素の確認結果:');
        console.log('==========================================');
        
        Object.entries(checks).forEach(([key, found]) => {
            const status = found ? '✅' : '❌';
            console.log(`${status} ${key}: ${found ? '発見' : '未検出'}`);
        });

        console.log('\n📋 分析結果:');
        
        if (checks['Next.js App'] && checks['React Hydration']) {
            console.log('✅ Next.js App Routerアプリケーションを確認');
            console.log('💡 GA4実装はクライアントサイドで動的に読み込まれる設計です');
            
            if (!checks['gtag関数'] && !checks['Google Tag Manager']) {
                console.log('⚠️  サーバーサイドHTMLにGA4スクリプトが含まれていません');
                console.log('🔧 原因候補:');
                console.log('   - GAProviderが正しく読み込まれていない');
                console.log('   - 環境変数NEXT_PUBLIC_GA_IDが設定されていない');
                console.log('   - ビルド時にクライアントコンポーネントが除外されている');
            } else {
                console.log('✅ GA4スクリプトを確認。正常に実装されています');
            }
        } else {
            console.log('❌ Next.jsアプリケーションの構造が確認できません');
        }

        return checks;

    } catch (error) {
        console.error('❌ エラー:', error.message);
        return null;
    }
}

// 3. GA4リクエストをシミュレート
function simulateGA4Request() {
    console.log('\n🚀 GA4リクエストのシミュレーション:');
    console.log('==========================================');
    
    const collectUrl = `https://www.google-analytics.com/g/collect?v=2&tid=G-5VS8BF91VH&t=pageview&dl=${encodeURIComponent('https://sasakiyoshimasa.com')}&dt=${encodeURIComponent('TOYAMA BLOG')}`;
    
    console.log('予期されるGA4リクエストURL:');
    console.log(collectUrl);
    console.log('\n💡 実際のブラウザでは以下の手順で確認できます:');
    console.log('1. Chrome DevTools → Network タブ');
    console.log('2. フィルター: "collect"');
    console.log('3. サイトにアクセスしてページ遷移');
    console.log('4. 上記のようなリクエストが送信されることを確認');
}

// 4. 環境変数の確認
function checkEnvironmentVariables() {
    console.log('\n🔧 環境変数の確認:');
    console.log('==========================================');
    
    // .env.localファイルの内容を確認
    const fs = require('fs');
    const path = require('path');
    
    try {
        const envLocalPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envLocalPath)) {
            const envContent = fs.readFileSync(envLocalPath, 'utf8');
            
            if (envContent.includes('NEXT_PUBLIC_GA_ID=G-5VS8BF91VH')) {
                console.log('✅ .env.localにNEXT_PUBLIC_GA_ID=G-5VS8BF91VHが設定されています');
            } else {
                console.log('❌ .env.localにGA_IDが正しく設定されていません');
            }
            
            // 他のGA関連の設定もチェック
            const lines = envContent.split('\n');
            const gaLines = lines.filter(line => line.includes('GA') || line.includes('ANALYTICS'));
            
            if (gaLines.length > 0) {
                console.log('\nGA/Analytics関連の設定:');
                gaLines.forEach(line => console.log(`  ${line}`));
            }
        } else {
            console.log('❌ .env.localファイルが見つかりません');
        }
    } catch (error) {
        console.log(`⚠️  環境変数ファイルの確認でエラー: ${error.message}`);
    }
}

// 5. 実装ファイルの確認
function checkImplementationFiles() {
    console.log('\n📁 実装ファイルの確認:');
    console.log('==========================================');
    
    const fs = require('fs');
    const path = require('path');
    
    const filesToCheck = [
        'src/app/ga-provider.tsx',
        'src/lib/gtag.ts',
        'types/global.d.ts',
        'src/app/layout.tsx'
    ];
    
    filesToCheck.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} - 存在`);
            
            // ファイル内容の一部をチェック
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('G-5VS8BF91VH') || content.includes('GA_ID') || content.includes('gtag')) {
                console.log(`    💡 GA4関連のコードを確認`);
            }
        } else {
            console.log(`❌ ${file} - 存在しない`);
        }
    });
}

// メイン実行
async function main() {
    const results = await analyzeGA4Implementation();
    simulateGA4Request();
    checkEnvironmentVariables();
    checkImplementationFiles();
    
    console.log('\n🎯 確認完了!');
    console.log('==========================================');
    console.log('👆 ブラウザでの確認方法:');
    console.log('1. Chrome で https://sasakiyoshimasa.com を開く');
    console.log('2. F12 でDevToolsを開く');
    console.log('3. Networkタブで "gtag" をフィルタ');
    console.log('4. ページリロードしてスクリプト読み込みを確認');
    console.log('5. "collect" をフィルタしてページビュー送信を確認');
    console.log('\n📊 GA4リアルタイムレポート:');
    console.log('https://analytics.google.com/analytics/web/#/p498053318/realtime/overview');
}

main().catch(console.error);