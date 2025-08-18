# 🔍 GA4ネットワーク確認ガイド

## 📊 目的
Google Analytics 4 (GA4) の実装が正しく動作し、適切にページビューとイベントを送信していることをネットワークレベルで確認する

## 🎯 確認対象
- **測定ID**: G-5VS8BF91VH  
- **対象サイト**: https://sasakiyoshimasa.com
- **実装方式**: Next.js 15.4.3 App Router + GAProvider

---

## 📈 Step 1: 基本的なスクリプト読み込み確認

### 手順
1. https://sasakiyoshimasa.com にアクセス
2. **F12** でDevToolsを開く
3. **Network** タブを選択
4. フィルター欄に **`gtag`** と入力
5. **Ctrl+R** (Windows) / **Cmd+R** (Mac) でページリロード

### ✅ 期待される結果
```
📡 リクエスト:
- https://www.googletagmanager.com/gtag/js?id=G-5VS8BF91VH
- ステータス: 200 OK
- タイプ: script
- サイズ: 約20-30KB
```

### ❌ 問題の場合
- リクエストが表示されない → GA4スクリプトが読み込まれていない
- 404エラー → 測定IDの設定に問題
- CORS エラー → Next.js設定に問題

---

## 🔄 Step 2: ページビュー送信確認

### 手順
1. Networkタブのフィルターを **`collect`** に変更
2. サイト内の任意の記事リンクをクリック
3. ページ遷移後、ネットワークタブを確認

### ✅ 期待される結果
```
📡 リクエスト:
- https://www.google-analytics.com/collect?v=2&tid=G-5VS8BF91VH&...
- または
- https://analytics.google.com/g/collect?v=2&tid=G-5VS8BF91VH&...
- ステータス: 200 OK
- メソッド: GET または POST
- タイプ: fetch/xhr
```

### 📝 リクエストパラメータ確認
```
v=2              # GA4プロトコルバージョン
tid=G-5VS8BF91VH # 測定ID
en=page_view     # イベント名
dl=<URL>         # ページURL
dt=<TITLE>       # ページタイトル
```

### ❌ 問題の場合
- collectリクエストなし → pageview送信が動作していない
- 複数のリクエスト → 重複送信問題
- 400/500エラー → パラメータ設定に問題

---

## 🚀 Step 3: 手動送信テスト

### Console実行コード
```javascript
// DevTools Consoleで実行
if (typeof window.gtag === 'function') {
    console.log('🎯 手動pageviewテスト開始');
    
    // 手動でpageviewを送信
    window.gtag('config', 'G-5VS8BF91VH', {
        page_path: '/manual-test-' + Date.now(),
        page_title: 'Manual Test Page',
        custom_parameter: 'network_test'
    });
    
    console.log('✅ pageview送信完了');
    console.log('💡 Networkタブでcollectリクエストを確認してください');
} else {
    console.log('❌ gtag関数が利用できません');
}
```

### ✅ 期待される結果
- Console実行後1-2秒以内にcollectリクエストが発生
- NetworkタブでGETまたはPOSTリクエストを確認
- レスポンス200 OK

---

## 📊 Step 4: イベント送信確認

### カスタムイベントテスト
```javascript
// カスタムイベント送信テスト
if (typeof window.gtag === 'function') {
    window.gtag('event', 'test_button_click', {
        event_category: 'engagement',
        event_label: 'network_test',
        value: 1
    });
    console.log('✅ カスタムイベント送信完了');
}
```

### ✅ 期待される結果
```
📡 リクエスト:
- en=test_button_click (イベント名)
- ec=engagement (カテゴリー)
- el=network_test (ラベル)
- ev=1 (値)
```

---

## 🔧 Step 5: リアルタイム監視設定

### Performance Observer設定
```javascript
// リアルタイムGA4監視
const ga4Monitor = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name.includes('collect') || 
            entry.name.includes('analytics') || 
            entry.name.includes('gtag')) {
            console.log('🔥 GA4リクエスト検出:', {
                url: entry.name,
                time: new Date().toLocaleTimeString(),
                duration: entry.duration.toFixed(2) + 'ms'
            });
        }
    }
});

ga4Monitor.observe({ entryTypes: ['resource'] });
console.log('✅ GA4ネットワーク監視を開始しました');
```

---

## 📈 トラブルシューティング

### 問題1: gtagスクリプト読み込み失敗
```
原因: 環境変数設定エラー
解決: .env.local の NEXT_PUBLIC_GA_ID=G-5VS8BF91VH を確認
```

### 問題2: collectリクエストが送信されない
```
原因: クライアントサイドレンダリング問題
解決: ページ完全読み込み後に再テスト
```

### 問題3: 重複したリクエスト送信
```
原因: send_page_view: false 設定不備
解決: GAProvider実装を確認
```

### 問題4: CORS エラー
```
原因: 開発環境での制限
解決: 本番環境https://sasakiyoshimasa.com で確認
```

---

## 🎉 成功基準

### ✅ 全項目クリア条件
1. **gtagスクリプト読み込み** - 200 OK
2. **自動pageview送信** - ページ遷移時に1回のみ
3. **手動pageview送信** - Console実行で正常送信
4. **カスタムイベント送信** - 正常送信確認
5. **リアルタイム監視** - 継続的な動作確認

### 📊 期待されるリクエスト頻度
- **初回ページ読み込み**: gtagスクリプト + config送信
- **ページ遷移**: collectリクエスト (1回のみ)
- **イベント発生**: イベント送信リクエスト

---

## 📞 サポート情報

### 報告すべき情報
- DevToolsのNetworkタブスクリーンショット
- Consoleエラーメッセージ
- リクエストのResponseヘッダー
- テスト実行時刻

### 次のステップ
全てのネットワーク確認が完了したら、GA4リアルタイムレポートでの最終確認を実行してください。