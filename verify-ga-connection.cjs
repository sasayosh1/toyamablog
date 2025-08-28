const { readFileSync } = require('fs');
const path = require('path');

console.log('🔍 Google Analytics設定を検証中...');

try {
  // .env.localファイルを読み取り
  const envPath = path.join(__dirname, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  // 測定IDを抽出
  const gaIdMatch = envContent.match(/NEXT_PUBLIC_GA_ID=(.+)/);
  if (gaIdMatch) {
    const gaId = gaIdMatch[1].trim();
    console.log('✅ 測定ID:', gaId);
    
    if (gaId === 'G-SVS8BF91VH') {
      console.log('✅ 測定IDは正しい値に設定されています');
    } else if (gaId === 'G-5VS8BF91VH') {
      console.log('❌ 測定IDが古い値です。G-SVS8BF91VHに修正が必要');
    } else {
      console.log('⚠️ 測定IDが期待値と異なります:', gaId);
    }
  } else {
    console.log('❌ 測定IDが見つかりません');
  }

  // gtagライブラリを確認
  const gtagPath = path.join(__dirname, 'src/lib/gtag.ts');
  if (require('fs').existsSync(gtagPath)) {
    console.log('✅ gtagライブラリファイル存在確認済み');
  } else {
    console.log('❌ gtagライブラリファイルが見つかりません');
  }

  // GAProviderを確認
  const gaProviderPath = path.join(__dirname, 'src/app/ga-provider.tsx');
  if (require('fs').existsSync(gaProviderPath)) {
    console.log('✅ GAProviderファイル存在確認済み');
  } else {
    console.log('❌ GAProviderファイルが見つかりません');
  }

  console.log('\n📋 次のステップ:');
  console.log('1. Vercelの環境変数を更新: NEXT_PUBLIC_GA_ID=G-SVS8BF91VH');
  console.log('2. 変更をコミット・プッシュしてデプロイ');
  console.log('3. Google Analytics Real-timeレポートで確認');
  console.log('4. Google Search Consoleでリンクを再設定');

} catch (error) {
  console.error('❌ 検証エラー:', error.message);
}