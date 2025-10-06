# YouTube APIキー制限設定ガイド（必須）

## なぜAPIキー制限が必要か

### リスク例
❌ **制限なしの場合**:
- APIキーが漏洩すると、誰でも無制限に使用可能
- 1日10,000クォータを他人に消費される
- 将来的に課金プランに移行した場合、高額請求のリスク
- セキュリティベストプラクティス違反

✅ **制限ありの場合**:
- 漏洩しても指定したAPIしか使えない
- 不正利用されても被害は限定的
- Google推奨のセキュリティ設定

## 今すぐ設定すべき最低限の制限

### ステップ1: Google Cloud Consoleにアクセス
https://console.cloud.google.com/apis/credentials

### ステップ2: APIキーを選択
1. 「認証情報」タブを開く
2. APIキー一覧から該当のキーをクリック
   - キーの値が `AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY` のもの

### ステップ3: API制限を設定（必須）

#### 現在の推奨設定
```
アプリケーション制限: なし
　└ 理由: 開発環境で柔軟に使用するため

API制限: キーを制限 ✅
　└ YouTube Data API v3 のみ選択
```

#### 設定手順
1. 「APIの制限」セクションまでスクロール
2. 「キーを制限」を選択
3. 検索ボックスに「YouTube」と入力
4. 「YouTube Data API v3」にチェック
5. **他のAPIのチェックは全て外す**
6. 画面下部の「保存」ボタンをクリック

### ステップ4: 設定の確認
保存後、以下が表示されていることを確認:
```
API制限
キーを制限
  - YouTube Data API v3
```

## 本番環境での追加設定（将来）

サイトが本番稼働したら、さらに厳格な制限を追加:

### オプション1: IPアドレス制限（推奨）
```
アプリケーション制限: IPアドレス
　└ サーバーのIPアドレスを追加
　　 例: 203.0.113.0/32

API制限: YouTube Data API v3
```

**メリット**:
- 最も安全
- サーバーからのみアクセス可能

**デメリット**:
- サーバーIP変更時に再設定が必要

### オプション2: HTTPリファラー制限
```
アプリケーション制限: HTTPリファラー
　└ https://sasakiyoshimasa.com/*

API制限: YouTube Data API v3
```

**メリット**:
- サイトからのみアクセス可能
- IP変更の影響なし

**デメリット**:
- サーバーサイドスクリプトには不向き（本システムは該当）

### 本システムの推奨: IPアドレス制限

cronジョブやサーバースクリプトで実行するため、将来的には**IPアドレス制限**が最適です。

## 段階的な制限設定プラン

### フェーズ1: 現在（開発中）✅
```
✅ API制限: YouTube Data API v3 のみ
⚠️  アプリケーション制限: なし
```
**今すぐ設定**: API制限のみ

### フェーズ2: 本番稼働後
```
✅ API制限: YouTube Data API v3 のみ
✅ アプリケーション制限: IPアドレス（サーバーIP）
```

### フェーズ3: 高度なセキュリティ
```
✅ API制限: YouTube Data API v3 のみ
✅ アプリケーション制限: IPアドレス
✅ クォータアラート設定
✅ APIキーローテーション（3-6ヶ月ごと）
```

## 設定後のテスト

### テスト1: 正常動作確認
```bash
cd /Users/user/toyamablog
npm run youtube:sync
```

**期待結果**:
- エラーなく実行される
- または、新しい動画が見つからない旨のメッセージ

### テスト2: API制限の確認
```bash
# YouTube APIは成功するはず
curl "https://www.googleapis.com/youtube/v3/search?key=AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY&channelId=UCxX3Eq8_KMl3AeYdhb5MklA&part=snippet&maxResults=1"

# 他のAPI（例: Google Maps Geocoding）は失敗するはず
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Tokyo&key=AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY"
```

**期待結果**:
- YouTube API: 成功（動画データが返る）
- Maps API: 失敗（"This API project is not authorized to use this API" エラー）

## よくある質問

### Q1: API制限したら既存の機能が動かなくなりませんか？
A: いいえ。YouTube Data API v3のみを使用しているため、それだけを許可すれば問題ありません。

### Q2: 複数のAPIキーを作成すべきですか？
A: 推奨します。
- **開発用キー**: 制限なし、開発環境のみ
- **本番用キー**: IP制限あり、本番環境のみ

### Q3: IPアドレス制限を設定するタイミングは？
A: cronジョブを本番サーバーで設定する時です。現在はローカル開発なので「なし」で問題ありません。

### Q4: 制限設定後、すぐに反映されますか？
A: 通常1-2分で反映されます。最大5分程度かかる場合があります。

## セキュリティチェックリスト

今すぐ確認すべき項目:

- [ ] Google Cloud Consoleにログイン
- [ ] 認証情報ページでAPIキーを確認
- [ ] API制限で「YouTube Data API v3」のみ選択
- [ ] 保存ボタンをクリック
- [ ] `npm run youtube:sync`でテスト実行
- [ ] エラーが出ないことを確認

将来（本番環境）で設定すべき項目:

- [ ] サーバーのIPアドレスを確認
- [ ] アプリケーション制限にIPアドレスを追加
- [ ] 本番用の別のAPIキーを作成
- [ ] `.env.local`と`.env.production`で使い分け
- [ ] クォータ監視アラートの設定

## まとめ

### 今すぐやるべきこと（5分）
**Google Cloud Consoleで「API制限」を設定**:
1. 認証情報ページを開く
2. APIキーをクリック
3. 「キーを制限」を選択
4. 「YouTube Data API v3」のみチェック
5. 保存

これだけで、セキュリティが大幅に向上します。

### 設定完了の確認
設定後、このコマンドでテスト:
```bash
npm run youtube:sync
```

エラーが出なければ成功です！

## 参考リンク
- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [YouTube Data API Quota](https://developers.google.com/youtube/v3/getting-started#quota)

## 最終更新日
2025年10月4日
