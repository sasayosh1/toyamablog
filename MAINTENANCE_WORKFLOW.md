# メンテナンスワークフロー（ビュー優先度対応）

## 1. ビューランキングファイルの準備
- GA4 などから記事ごとの閲覧数をエクスポートし、リポジトリ内に保存します（例: `data/view-ranking.json`）。
- **JSON 形式の例**
  ```json
  [
    { "slug": "toyama-toyamashi-pain-dor-bakery", "views": 3521 },
    { "slug": "toyama-toyamashi-family-park-anniversary", "views": 2140 },
    { "videoId": "UpArlPM15AQ", "views": 1980 }
  ]
  ```
- **CSV 形式の例 (`slug,views` もしくは `videoId,views`)**
  ```csv
  slug,views
  toyama-toyamashi-pain-dor-bakery,3521
  toyama-toyamashi-family-park-anniversary,2140
  ```
- `slug` と `views` が最低限必要です。動画IDで管理している場合は `videoId` 列でも可。どちらもある場合は両方記載してください。

## 2. スクリプト実行
- ドライラン（Sanity は更新せず、対象記事の確認のみ）:
  ```bash
  node scripts/regenerate-priority-articles.cjs --limit 10 --views data/view-ranking.json
  ```
- 更新実行（対象記事のみ Gemini に再生成させ、Sanity を自動更新）:
  ```bash
  node scripts/regenerate-priority-articles.cjs --limit 10 --views data/view-ranking.json --apply
  ```
- デフォルトの待機時間は 2 秒。API コストを抑えたい場合は `--delay 4000` のように調整できます。

## 3. 設定の自動化
- 環境変数でファイルを固定したい場合は `.env.local` 等に以下を追加:
  ```
  VIEW_RANKING_FILE=data/view-ranking.json
  ```
  これで `--views` オプションなしでビュー優先度を利用できます。
- 一度に処理する候補プールの件数は `REGEN_POOL_SIZE` で調整可能（既定 150 件）。大量の記事を評価する場合は増やしてください。

## 4. 実行ログの読み方
- `👀 推定ビュー: 3521 (view-ranking.json #1)` のように表示され、ファイル名と順位が確認できます。
- 不足キーワードが検出された場合は `⚠️ 不足キーワード:` が表示され、自動挿入後も残れば警告が出ます。

## 5. 推奨運用
1. 最新ビュー実績をエクスポートし、JSON/CSV を更新。
2. `--limit 10` などでドライランを実行して対象記事を確認。
3. 問題なければ `--apply` を付けて再生成（必要に応じて `--force` で強制実行）。
4. 実行後は Sanity で最終表示を spot-check し、公開済みの品質を担保します。

Supabase や外部DBを使わなくても、ローカルのビューランキングファイルを渡すだけで高ビュー記事からメンテナンスを優先できます。ビュー情報の更新さえ続ければ、運用コストを抑えながら品質改善を継続可能です。
