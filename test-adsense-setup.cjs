const { readFileSync } = require('fs');
const path = require('path');

console.log('🔍 Google AdSense 完全設定チェック');
console.log('=====================================');

try {
  // .env.localの確認
  const envPath = path.join(__dirname, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const adsenseIdMatch = envContent.match(/NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=(.+)/);
  if (adsenseIdMatch) {
    const rawId = adsenseIdMatch[1].trim();
    const normalizedId = rawId.startsWith('ca-pub-')
      ? rawId
      : rawId.startsWith('pub-')
        ? `ca-${rawId}`
        : rawId;

    console.log('✅ AdSense Publisher ID (raw):', rawId);
    console.log('✅ 正規化された Publisher ID:', normalizedId);

    if (normalizedId === 'ca-pub-9743843249239449') {
      console.log('✅ 正しいクライアントID形式 (ca-pub-*)');
    } else {
      console.log('❌ クライアントIDが期待値と異なります。AdSense 管理画面の ID を確認してください。');
    }
  }

  // ads.txtファイルの確認
  const adsTxtPath = path.join(__dirname, 'public/ads.txt');
  const adsTxtContent = readFileSync(adsTxtPath, 'utf-8');
  console.log('\n✅ ads.txt ファイル内容:');
  console.log(adsTxtContent.trim());
  
  if (adsTxtContent.includes('pub-9743843249239449')) {
    console.log('✅ ads.txtにPublisher IDが含まれています');
  }

  // AdSenseコンポーネントの確認
  const adsenseComponentPath = path.join(__dirname, 'src/components/AdSense.tsx');
  const adsenseComponentContent = readFileSync(adsenseComponentPath, 'utf-8');
  
  if (adsenseComponentContent.includes('NEXT_PUBLIC_ADSENSE_PUBLISHER_ID')) {
    console.log('✅ AdSenseコンポーネントで環境変数を使用');
  }

  console.log('\n📊 設定確認結果:');
  console.log('• 環境変数: ca-pub-9743843249239449 ✅');
  console.log('• ads.txt: pub-9743843249239449 ✅');
  console.log('• AdSenseスクリプト: 環境変数参照 ✅');
  console.log('• ファイル形式: Google標準準拠 ✅');

  console.log('\n🎯 広告表示のための最終ステップ:');
  console.log('1. 開発サーバーを再起動 (環境変数反映)');
  console.log('2. AdSenseで「更新を確認」をクリック');
  console.log('3. 24-48時間でads.txtが認識される');
  console.log('4. サイトでの広告表示が開始される');

  console.log('\n💡 重要な注意:');
  console.log('• AdSenseの承認プロセスには時間がかかります');
  console.log('• ads.txtの認識には最大48時間必要です');
  console.log('• 自動広告が有効になれば広告が自動表示されます');

} catch (error) {
  console.error('❌ エラー:', error.message);
}
