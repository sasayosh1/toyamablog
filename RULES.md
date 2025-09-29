# 運用ルール（Google / アフィリエイト監視）

## チェック頻度
- **毎日（営業日ベース）** : Google Search Console / Google Analytics / Google AdSense / アフィリエイト管理画面
- **随時** : 重大な通知メールを受け取った際は即確認

## 1. Google Search Console
1. `https://search.google.com/search-console` にログイン
2. プロパティ `sasakiyoshimasa.com` を確認
3. チェック項目
   - カバレッジ（エラー URL がないか）
   - ステータス通知（手動対策・セキュリティ問題）
   - URL 検査で最新記事のインデックス状況
4. 異常時対応
   - エラー URL を修正し再クロールをリクエスト
   - 手動対策 → 原因を修正後「審査をリクエスト」
   - セキュリティ問題 → 原因除去後、再審査依頼

## 2. Google Analytics（GA4）
1. `https://analytics.google.com/analytics/web/`
2. プロパティ `sasakiyoshimasa.com` を確認
3. 主要指標
   - リアルタイムユーザー数
   - 日次セッション数 / イベント計測状況
   - 「データストリーム > 過去48時間に受信したイベント」
4. 異常時対応
   - GA タグが `<head>` 内にあるか確認
   - ブラウザの Network タブで `collect` が送信されているか
   - measurement_id が環境変数と一致しているか

## 3. Google AdSense
1. `https://www.google.com/adsense/`
2. ホームの警告（ads.txt / ポリシー）が出ていないか
3. 収益の急変がないか
4. 異常時対応
   - ads.txt 警告 → ルートに正しい `ca-pub-` ID を記載
   - ポリシー違反 → 該当ページ修正後、再審査
   - 広告停止 → 自動広告設定 / 広告ユニットのコード入れ直し

## 4. アフィリエイトリンク
- ASP 管理画面でクリック／成果を確認（例：A8.net、もしもアフィリエイト）
- 成果ゼロが続く場合はリンク切れや LP 変更を疑う
- ブラウザで実際にリンクをクリックして確認
- 期限切れ広告は差し替え

## 5. 共通ログ・監視
- Vercel のデプロイ状況を確認（失敗や警告がないか）
- `npm run lint` / `npm run build` でローカルのビルドエラーをチェック
- 重大な変更は GitHub issue / ドキュメントで管理

## 6. 緊急時フロー
1. 発見時に Slack / メールで共有（サイト・事象・影響範囲）
2. 応急処置 → 再発防止策 → RULES.md 更新

## 7. ドキュメント更新
- ルール変更時は日時・変更者・内容を追記し、チームへ共有
