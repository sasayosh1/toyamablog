console.log('📊 Google Analytics 手動動作確認ガイド');
console.log('==========================================');

console.log('\n✅ 設定確認完了:');
console.log('• 測定ID: G-5VS8BF91VH (正しい値)');
console.log('• GAProvider: 設定済み');
console.log('• 開発サーバー: 稼働中 (http://localhost:3000)');

console.log('\n🎯 今すぐできる動作確認手順:');
console.log('==========================================');

console.log('\n【ステップ1】ブラウザでサイトを開く');
console.log('• http://localhost:3000 にアクセス');
console.log('• 開発者ツール(F12)を開く');
console.log('• Consoleタブでエラーがないか確認');

console.log('\n【ステップ2】Google Analyticsを開く');
console.log('• 新しいタブで analytics.google.com にアクセス');
console.log('• SasayoshiBlog プロパティを選択');
console.log('• 左メニュー「リアルタイム」→「概要」をクリック');

console.log('\n【ステップ3】リアルタイム数字の変化を確認');
console.log('• 「現在のユーザー数」を確認 (1になるはず)');
console.log('• サイト内で複数ページを閲覧');
console.log('• 「ページビュー」の数字が増加することを確認');
console.log('• 「ページとスクリーン」で訪問ページを確認');

console.log('\n【期待される結果】');
console.log('✅ 現在のユーザー数: 1以上');
console.log('✅ ページビュー: 閲覧したページ数だけ増加');
console.log('✅ 国: Japan');
console.log('✅ 都市: あなたの現在地');

console.log('\n【確認用ページ】');
console.log('• トップページ: http://localhost:3000');
console.log('• 記事一覧: 自動表示される記事リンクをクリック');
console.log('• 個別記事: 複数の記事を閲覧してみる');

console.log('\n🔍 トラッキング状況のチェック方法:');
console.log('==========================================');
console.log('開発者ツールのNetworkタブで以下を確認:');
console.log('• googletagmanager.com へのリクエスト');
console.log('• collect?v=2 のリクエスト (イベント送信)');

console.log('\n💡 トラブルシューティング:');
console.log('• 数字が変化しない → ページを更新して再度確認');
console.log('• エラーが出る → 開発者ツールのConsoleを確認');
console.log('• 測定ID確認 → .env.local で G-5VS8BF91VH になっているか');

console.log('\n🎉 成功の場合:');
console.log('リアルタイムで数字が変化すれば、Google Analytics は正常に動作しています！');

console.log('\n==========================================');
console.log('📞 準備完了 - 上記の手順で確認してください！');