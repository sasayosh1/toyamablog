# YouTube API Key 確認・設定ガイド

## Google Cloud ConsoleでのAPIキー確認手順

### 1. Google Cloud Consoleにアクセス
https://console.cloud.google.com/

### 2. プロジェクトを選択
- 画面上部のプロジェクト選択ドロップダウンをクリック
- YouTube APIを使用しているプロジェクトを選択

### 3. APIキーの確認
**方法A: 認証情報ページから確認**
1. 左側メニュー → 「APIとサービス」 → 「認証情報」
2. 「認証情報」タブを選択
3. 「APIキー」セクションに表示されているキーのリストを確認
4. 各キーの名前とキーの値（最初の数文字）が表示されます

**方法B: 検索から直接アクセス**
1. 画面上部の検索バーに「認証情報」と入力
2. 「APIとサービス > 認証情報」を選択

### 4. APIキーの詳細確認
1. 確認したいAPIキーの名前をクリック
2. 以下の情報が表示されます:
   - **名前**: APIキーの名前
   - **キー**: 実際のAPIキー文字列
   - **作成日**: キーの作成日時
   - **最終使用日**: 最後に使用された日時
   - **制限**: アプリケーション制限、APIの制限

### 5. APIキーの制限確認

#### API制限（重要）
「APIの制限」セクションで以下を確認:
- ✅ **推奨**: 「キーを制限」が選択されている
- ✅ **必須**: 「YouTube Data API v3」が選択されている

もし「YouTube Data API v3」が選択されていない場合:
1. 「キーを制限」を選択
2. 「YouTube Data API v3」にチェックを入れる
3. 「保存」をクリック

#### アプリケーション制限
- **なし**: どこからでも使用可能（開発中は便利）
- **HTTPリファラー**: 特定のWebサイトからのみ使用可能
- **IPアドレス**: 特定のサーバーからのみ使用可能
- **Android/iOSアプリ**: モバイルアプリ専用

**本番環境推奨設定**:
- アプリケーション制限: 「HTTPリファラー」または「IPアドレス」
- API制限: 「YouTube Data API v3」のみ

**開発環境設定**:
- アプリケーション制限: 「なし」
- API制限: 「YouTube Data API v3」のみ

### 6. APIキーの有効性テスト

#### ターミナルでのテスト
```bash
# APIキーを環境変数に設定
export TEST_API_KEY="YOUR_API_KEY_HERE"
export TEST_CHANNEL_ID="UCxX3Eq8_KMl3AeYdhb5MklA"

# curlでYouTube APIをテスト
curl "https://www.googleapis.com/youtube/v3/search?key=${TEST_API_KEY}&channelId=${TEST_CHANNEL_ID}&part=snippet,id&order=date&maxResults=1&type=video"
```

#### 成功時のレスポンス例
```json
{
  "kind": "youtube#searchListResponse",
  "etag": "...",
  "items": [
    {
      "kind": "youtube#searchResult",
      "id": {
        "kind": "youtube#video",
        "videoId": "..."
      },
      "snippet": {
        "title": "動画タイトル",
        ...
      }
    }
  ]
}
```

#### エラー時のレスポンス例
```json
{
  "error": {
    "code": 400,
    "message": "API Key not found. Please pass a valid API key.",
    "errors": [...]
  }
}
```

### 7. よくあるエラーと対処法

#### エラー1: "API Key not found"
**原因**:
- APIキーが無効または削除されている
- APIキーに制限がかかっている

**対処法**:
1. Google Cloud Consoleで認証情報ページを開く
2. APIキーが存在するか確認
3. APIキーの制限設定を確認
4. 必要に応じて新しいAPIキーを作成

#### エラー2: "YouTube Data API v3 has not been used in project"
**原因**:
- YouTube Data API v3が有効になっていない

**対処法**:
1. 「APIとサービス」 → 「ライブラリ」
2. 「YouTube Data API v3」を検索
3. 「有効にする」をクリック

#### エラー3: "The request is missing a valid API key"
**原因**:
- APIキーがリクエストに含まれていない
- 環境変数が正しく設定されていない

**対処法**:
1. `.env.local`の`YOUTUBE_API_KEY`を確認
2. 環境変数が正しく読み込まれているか確認

#### エラー4: "Daily Limit Exceeded"
**原因**:
- 1日のクォータ制限に達した

**対処法**:
1. 「APIとサービス」 → 「ダッシュボード」
2. YouTube Data API v3のクォータ使用状況を確認
3. 翌日まで待つか、クォータの増加リクエストを送る

### 8. 新しいAPIキーの作成（必要な場合）

1. 「APIとサービス」 → 「認証情報」
2. 「認証情報を作成」 → 「APIキー」をクリック
3. APIキーが作成されます
4. 「キーを制限」をクリック
5. 名前を設定（例: "YouTube Blog Automation"）
6. API制限で「YouTube Data API v3」を選択
7. 「保存」をクリック
8. 新しいAPIキーを`.env.local`に設定

### 9. 現在のAPIキー情報

**設定済みAPIキー（.env.local）**:
```
YOUTUBE_API_KEY=AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY
```

**確認事項**:
- [ ] Google Cloud Consoleでこのキーが存在するか
- [ ] キーが有効になっているか
- [ ] YouTube Data API v3が制限に含まれているか
- [ ] アプリケーション制限が適切か

### 10. セキュリティのベストプラクティス

1. **本番環境では必ず制限を設定**
   - HTTPリファラー制限: `https://sasakiyoshimasa.com/*`
   - または、サーバーIPアドレス制限

2. **APIキーを公開リポジトリにコミットしない**
   - `.env.local`は`.gitignore`に含める
   - 環境変数で管理する

3. **定期的にキーをローテーション**
   - 3-6ヶ月ごとに新しいキーを作成
   - 古いキーを削除

4. **クォータ監視**
   - 異常な使用パターンを検出
   - アラート設定を検討

### 11. トラブルシューティングコマンド

```bash
# 環境変数確認
echo $YOUTUBE_API_KEY

# .env.localから読み込みテスト
node -e "require('dotenv').config({ path: '/Users/user/toyamablog/.env.local' }); console.log('API Key:', process.env.YOUTUBE_API_KEY?.substring(0, 10) + '...')"

# YouTube API直接テスト
curl "https://www.googleapis.com/youtube/v3/search?key=YOUR_API_KEY&channelId=UCxX3Eq8_KMl3AeYdhb5MklA&part=snippet&maxResults=1"
```

## 次のステップ

1. Google Cloud ConsoleでプロジェクトとAPIキーを確認
2. APIキーの制限設定を確認
3. テストコマンドでAPIキーの有効性を確認
4. 問題があれば新しいAPIキーを作成
5. `.env.local`のAPIキーを更新
6. `npm run youtube:sync`で動作確認

## 最終更新日
2025年10月4日
