const { readFileSync } = require('fs');
const path = require('path');

console.log('🔄 Google Analytics測定IDを正しい値に戻します...');

try {
  // .env.localファイルを確認
  const envPath = path.join(__dirname, '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  // 測定IDを確認
  const gaIdMatch = envContent.match(/NEXT_PUBLIC_GA_ID=(.+)/);
  if (gaIdMatch) {
    const gaId = gaIdMatch[1].trim();
    console.log('✅ 現在の測定ID:', gaId);
    
    if (gaId === 'G-5VS8BF91VH') {
      console.log('✅ 測定IDは正しい値（G-5VS8BF91VH）になっています');
    } else {
      console.log('❌ 測定IDが正しくありません。正しい値: G-5VS8BF91VH');
    }
  }

  console.log('\n📋 今後の注意事項:');
  console.log('• 正しい測定ID: G-5VS8BF91VH');
  console.log('• この値は絶対に変更しない');
  console.log('• CLAUDE.mdに記録済み');

} catch (error) {
  console.error('❌ エラー:', error.message);
}