# YouTube API設定ガイド

## 1. YouTube Data API v3 キーの取得手順

### Google Cloud Consoleでの設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択または新規作成
3. 「APIとサービス」→「ライブラリ」に移動
4. "YouTube Data API v3" を検索して有効化
5. 「認証情報」→「認証情報を作成」→「APIキー」をクリック
6. 生成されたAPIキーをコピー

### APIキー制限の設定（推奨）
- 「APIキーを制限」をクリック
- 「HTTPリファラー（ウェブサイト）」を選択
- ドメインを追加: `*.vercel.app/*`, `localhost:*`
- API制限で「YouTube Data API v3」のみを選択

## 2. YouTube Channel IDの確認方法

### 方法1: YouTubeチャンネルページから
1. チャンネルページ（https://www.youtube.com/@sasayoshi1）にアクセス
2. ページのソースを表示
3. `"channelId":"UC..."` を検索

### 方法2: YouTube Creator Studioから
1. YouTube Studio にログイン
2. 設定 → チャンネル → 基本情報
3. チャンネルIDが表示される

## 3. Google Maps API Keyの取得

### Google Cloud Consoleでの設定
1. 同じプロジェクトで「Maps Embed API」を有効化
2. 新しいAPIキーを作成（YouTube APIと別にすることを推奨）
3. API制限で「Maps Embed API」のみを選択

## 4. 環境変数への追加

`.env.local` ファイルに以下を追加：

```bash
# YouTube API設定
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=UC_your_channel_id_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 5. 設定確認コマンド

```bash
export YOUTUBE_API_KEY="your_key"
export YOUTUBE_CHANNEL_ID="UC_your_id"  
export GOOGLE_MAPS_API_KEY="your_maps_key"
node scripts/test-youtube-system.cjs
```

## 注意事項

- APIキーは絶対に公開リポジトリにコミットしない
- APIキーには適切な制限を設定する
- 使用量制限に注意（YouTube API: 1日10,000ユニット）
- 料金が発生する場合があるため、使用量を監視する