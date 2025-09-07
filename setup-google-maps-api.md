# Google Maps API設定ガイド

## Google Maps API Key取得手順

### 1. Google Cloud Consoleでの設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（YouTube APIと同じプロジェクト推奨）
3. 「APIとサービス」→「ライブラリ」に移動
4. 以下のAPIを検索して有効化：
   - **Maps Embed API**
   - Maps JavaScript API（必要に応じて）
   - Places API（必要に応じて）

### 2. APIキーの作成
1. 「認証情報」→「認証情報を作成」→「APIキー」
2. 生成されたAPIキーをコピー
3. 「キーを制限」をクリック

### 3. APIキーの制限設定（重要）
**アプリケーションの制限:**
- HTTPリファラー（ウェブサイト）を選択
- 以下のドメインを追加：
  - `https://sasakiyoshimasa.com/*`
  - `https://*.vercel.app/*`
  - `http://localhost:*/*`

**API の制限:**
- 「キーを制限」を選択
- 以下のAPIのみ有効化：
  - Maps Embed API
  - Maps JavaScript API
  - Places API

### 4. 課金の設定
⚠️ **重要**: Google Maps APIは有料サービスです
- 課金アカウントの設定が必要
- 無料利用枠：月額$200クレジット
- Maps Embed API: 1,000回/月まで無料
- 使用量アラートの設定を推奨

### 5. 環境変数への追加

`.env.local`ファイルに追加：
```bash
GOOGLE_MAPS_API_KEY=AIza...your_google_maps_api_key_here
```

### 6. APIキーのテスト

```bash
# テスト用URL（ブラウザでアクセス）
https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=富山市役所
```

## セキュリティ注意事項

1. **APIキーの保護**
   - 公開リポジトリにコミットしない
   - 適切なドメイン制限を設定
   - 定期的にキーをローテーション

2. **使用量の監視**
   - Google Cloud Consoleで使用量を定期確認
   - アラートを設定して予期しない使用量を検出
   - 月額予算制限を設定

3. **最小権限の原則**
   - 必要最小限のAPIのみ有効化
   - 不要なAPIは無効化