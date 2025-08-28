console.log('🔄 AdSense ads.txt 問題の強制解決を試行...');

const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

try {
  // 現在のads.txtを読み取り
  const adsTxtPath = path.join(__dirname, 'public/ads.txt');
  const currentContent = readFileSync(adsTxtPath, 'utf-8').trim();
  
  console.log('現在のads.txt内容:', currentContent);
  
  // タイムスタンプコメントを追加してファイルを更新
  const timestamp = new Date().toISOString();
  const updatedContent = currentContent + `\n# Last updated: ${timestamp}`;
  
  writeFileSync(adsTxtPath, updatedContent, 'utf-8');
  console.log('✅ ads.txtファイルにタイムスタンプを追加しました');
  
  // 更新された内容を表示
  const newContent = readFileSync(adsTxtPath, 'utf-8');
  console.log('\n更新後のads.txt内容:');
  console.log(newContent);
  
  console.log('\n📋 次のステップ:');
  console.log('1. 変更をコミット・プッシュしてVercelに反映');
  console.log('2. AdSenseで「今すぐ修正」ボタンをクリック');
  console.log('3. 数分後にads.txtが再クロールされることを確認');
  console.log('4. 必要に応じてタイムスタンプコメントを削除');
  
} catch (error) {
  console.error('❌ エラー:', error.message);
}