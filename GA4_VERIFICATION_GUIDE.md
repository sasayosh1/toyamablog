# 🎯 GA4実装確認ガイド

## 📋 基本情報
- **測定ID**: G-5VS8BF91VH
- **ストリーム名**: TOYAMA BLOG
- **対象サイト**: https://sasakiyoshimasa.com
- **実装方式**: Next.js App Router + GAProvider

---

## 🔍 1. Chrome DevToolsでの確認手順

### ステップ1: サイトアクセスとDevTools起動
1. Chrome で https://sasakiyoshimasa.com にアクセス
2. F12 または右クリック「検証」でDevToolsを開く
3. **Network** タブを選択

### ステップ2: GA4スクリプト読み込み確認
1. Networkタブで **Ctrl+R** でページリロード
2. フィルター欄に `gtag` と入力
3. 以下が表示されることを確認:
   ```
   gtag/js?id=G-5VS8BF91VH
   ```

### ステップ3: ページビュー送信確認
1. Networkタブのフィルターを `collect` に変更
2. サイト内の記事リンクをクリック（例: 記事カード）
3. `collect?v=2&tid=G-5VS8BF91VH` のリクエストが送信されることを確認
4. ページ遷移ごとに **1回だけ** リクエストが送信されることを確認

### ステップ4: Consoleでの詳細確認
1. **Console** タブに切り替え
2. 以下のコードを貼り付けて実行:

```javascript
// GA4実装確認
console.log('GA4確認:', {
  gtag: typeof window.gtag,
  dataLayer: Array.isArray(window.dataLayer) ? window.dataLayer.length : 'なし',
  measurementId: 'G-5VS8BF91VH'
});

// 手動pageview送信テスト
if (typeof window.gtag === 'function') {
  window.gtag('config', 'G-5VS8BF91VH', {
    page_path: '/manual-test',
    page_title: 'Manual Test'
  });
  console.log('✅ 手動pageview送信完了');
}
```

---

## 🌐 2. GA4リアルタイムレポート確認

### アクセス方法
1. https://analytics.google.com/analytics/web/ にアクセス
2. 「TOYAMA BLOG」プロパティを選択
3. 左メニュー「リアルタイム」→「概要」をクリック

### 確認項目
- **アクティブユーザー**: リアルタイムでサイトにアクセスしているユーザー数
- **ページビュー**: ページ表示回数
- **イベント**: カスタムイベントの発生状況
- **ページとスクリーン**: アクセスされているページの詳細

### テスト手順
1. リアルタイムレポートを別タブで開く
2. 新しいタブで https://sasakiyoshimasa.com にアクセス
3. サイト内でページ遷移を数回実行
4. リアルタイムレポートでアクセスが反映されることを確認

---

## 🧪 3. 自動テストスクリプト実行

### 事前準備
```bash
cd /Users/user/toyamablog
open test-ga4-verification.html
```

### テスト実行
1. 開いたページで「GA4実装をチェック」ボタンをクリック
2. 「ページビュートラッキングをテスト」ボタンをクリック
3. 「リアルタイム計測をテスト」ボタンをクリック
4. 各テスト結果を確認

---

## ✅ 4. 成功基準

### 必須確認項目
- [ ] `gtag/js?id=G-5VS8BF91VH` のスクリプト読み込み
- [ ] ページ遷移時の `collect` リクエスト送信
- [ ] リクエストが重複していない（1回のページ遷移で1回のみ送信）
- [ ] GA4リアルタイムレポートでアクセス検出
- [ ] Console エラーが出ていない

### 期待される動作
1. **初回アクセス**: gtag スクリプト読み込み + 初回pageview送信
2. **ページ遷移**: 新しいページのpageviewのみ送信（重複なし）
3. **リアルタイム反映**: 1-2分以内にGA4レポートに反映

---

## 🚨 トラブルシューティング

### GA4スクリプトが読み込まれない場合
```javascript
// 環境変数確認
console.log('GA_ID:', process.env.NEXT_PUBLIC_GA_ID);

// GAProvider確認
console.log('GAProvider loaded:', document.querySelector('script[src*="gtag"]') !== null);
```

### ページビューが送信されない場合
```javascript
// 手動送信テスト
window.gtag('config', 'G-5VS8BF91VH', {
  page_path: window.location.pathname,
  page_title: document.title
});
```

### 重複送信を確認する場合
1. DevTools Network タブで `collect` をフィルタ
2. ページリロード後、同一ページで複数のcollectリクエストが送信されていないか確認
3. ページ遷移時、1回の遷移で複数のリクエストが送信されていないか確認

---

## 📝 確認レポート記録

### 確認日時
- 実施日: ____年__月__日
- 確認者: 

### 確認結果
- [ ] GA4スクリプト読み込み: ✅ / ❌
- [ ] ページビュー送信: ✅ / ❌  
- [ ] 重複送信なし: ✅ / ❌
- [ ] リアルタイム反映: ✅ / ❌

### 備考
_____________________________________
_____________________________________
_____________________________________