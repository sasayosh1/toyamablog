# APIキー設定修正ガイド（緊急）

## 現在のエラー
```
Requests from referer <empty> are blocked.
```

## 原因
新しく作成したAPIキーに**HTTPリファラー制限**が設定されています。
サーバーサイドスクリプト（cronジョブやNode.jsスクリプト）からの実行では、HTTPリファラーが存在しないため、ブロックされています。

## 解決方法

### Google Cloud Consoleで設定変更

1. **認証情報ページを開く**
   https://console.cloud.google.com/apis/credentials

2. **新しいAPIキーをクリック**
   - キーの値: `AIzaSyAMWFYGFOzXqUic0agFSgXqWecywK9__zg`

3. **「アプリケーションの制限」セクション**
   - 現在: 「HTTPリファラー」が選択されている状態
   - **変更: 「なし」を選択** ← これが重要！

4. **「APIの制限」セクション**（そのまま維持）
   - 「キーを制限」を選択
   - 「YouTube Data API v3」のみチェック

5. **「保存」をクリック**

## 正しい設定

### 開発環境・サーバースクリプト用（現在の用途）
```
アプリケーションの制限: なし ✅
　└ サーバーサイドスクリプトで使用するため

APIの制限: キーを制限 ✅
　└ YouTube Data API v3 のみ
```

### Webサイトから直接呼び出す場合（将来）
```
アプリケーションの制限: HTTPリファラー
　└ https://sasakiyoshimasa.com/*

APIの制限: YouTube Data API v3
```

## アプリケーション制限の種類と用途

### 1. なし（現在の推奨設定）
- **用途**: サーバーサイドスクリプト、cronジョブ、Node.js
- **セキュリティ**: API制限で保護
- **本システム**: ✅ これを選択

### 2. HTTPリファラー
- **用途**: ブラウザからの直接APIコール
- **セキュリティ**: 特定ドメインのみ許可
- **本システム**: ❌ サーバースクリプトでは使用不可

### 3. IPアドレス
- **用途**: 特定サーバーからのみアクセス
- **セキュリティ**: 最も厳格
- **本システム**: 🔄 将来の本番環境で検討

### 4. Android/iOSアプリ
- **用途**: モバイルアプリ専用
- **本システム**: ❌ 関係なし

## セキュリティについて

### Q: 「なし」は安全ですか？
A: はい。以下の理由で安全です:

1. **API制限がある**: YouTube Data API v3のみ使用可能
2. **クォータ制限**: 1日10,000リクエストまで（無料枠）
3. **サーバー環境**: `.env.local`はサーバー内のみで、ブラウザに公開されない
4. **監視可能**: Google Cloud Consoleでクォータ使用状況を監視

### Q: より安全にするには？
A: 将来的にIPアドレス制限を追加:
```
アプリケーションの制限: IPアドレス
　└ サーバーのIPアドレスを指定
```

## 設定変更後のテスト

### 1. 設定変更（Google Cloud Console）
- アプリケーションの制限: 「なし」に変更
- 保存

### 2. 反映待ち（1-2分）
設定変更後、1-2分待ちます。

### 3. テスト実行
```bash
cd /Users/user/toyamablog
npm run youtube:sync
```

### 4. 期待される結果
```
🔍 YouTubeチャンネルの最新動画をチェック中...
📺 10件の動画を確認中...
⏭️ 既に記事が存在します: [動画タイトル]
...
🎉 処理完了: 0件の新しい記事を作成しました
```

または

```
🔍 YouTubeチャンネルの最新動画をチェック中...
📺 10件の動画を確認中...
📍 検出した地域: 富山市 (カテゴリ: グルメ)
✅ 記事作成完了: 【富山市】...
🎉 処理完了: 1件の新しい記事を作成しました
```

### 5. エラーが出る場合
```bash
# APIキーを直接テスト
curl "https://www.googleapis.com/youtube/v3/search?key=AIzaSyAMWFYGFOzXqUic0agFSgXqWecywK9__zg&channelId=UCxX3Eq8_KMl3AeYdhb5MklA&part=snippet&maxResults=1"
```

成功すれば、動画データのJSONが返ってきます。

## トラブルシューティング

### エラー: "Requests from referer <empty> are blocked"
- **原因**: HTTPリファラー制限が残っている
- **対処**: アプリケーションの制限を「なし」に変更

### エラー: "API Key not found"
- **原因**: APIキーが無効
- **対処**: 新しいAPIキーを作成

### エラー: "Daily Limit Exceeded"
- **原因**: 1日のクォータ上限に達した
- **対処**: 翌日まで待つ

### エラー: "YouTube Data API v3 has not been used"
- **原因**: APIが有効になっていない
- **対処**: APIライブラリでYouTube Data API v3を有効化

## まとめ

### 今すぐ変更すべき設定
```
Google Cloud Console → 認証情報 → APIキー編集

変更前:
  アプリケーションの制限: HTTPリファラー ❌

変更後:
  アプリケーションの制限: なし ✅
  APIの制限: YouTube Data API v3 のみ ✅
```

### 設定完了後
```bash
npm run youtube:sync
```

これでYouTube動画の自動同期が正常に動作します！

## 最終更新日
2025年10月4日
