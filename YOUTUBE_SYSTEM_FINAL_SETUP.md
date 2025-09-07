# YouTube動画記事自動作成システム 最終設定ガイド

## ✅ 完了済み項目

### 1. YouTube Channel ID 取得完了
- **ささよしチャンネルID**: `UCxX3Eq8_KMl3AeYdhb5MklA`
- **チャンネル確認URL**: https://www.youtube.com/channel/UCxX3Eq8_KMl3AeYdhb5MklA
- **動作テスト**: 正常

### 2. システム準備完了
- 記事自動作成スクリプト: `scripts/check-youtube-and-create-articles.cjs`
- テストスクリプト: `scripts/test-youtube-system.cjs`
- チャンネルID取得スクリプト: `scripts/get-youtube-channel-id.cjs`

## 🔧 残り設定項目（要実行）

### YouTube Data API v3 Key
```bash
# Google Cloud Consoleで取得
# 1. https://console.cloud.google.com/
# 2. APIライブラリ → YouTube Data API v3 → 有効化
# 3. 認証情報 → APIキー作成
YOUTUBE_API_KEY=AIza...（24-39文字）
```

### Google Maps API Key  
```bash
# 同じプロジェクトで取得
# 1. APIライブラリ → Maps Embed API → 有効化
# 2. 認証情報 → APIキー作成（YouTube APIとは別推奨）
GOOGLE_MAPS_API_KEY=AIza...（24-39文字）
```

## 📝 .env.local への追加内容

既存の`.env.local`ファイルに以下を追加：

```bash
# YouTube API設定（新規追加）
YOUTUBE_API_KEY=your_youtube_data_api_key_here
YOUTUBE_CHANNEL_ID=UCxX3Eq8_KMl3AeYdhb5MklA
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 🚀 システム起動手順

### APIキー設定後の実行
```bash
# 環境変数を明示的に設定
export YOUTUBE_API_KEY="your_key"
export YOUTUBE_CHANNEL_ID="UCxX3Eq8_KMl3AeYdhb5MklA"
export GOOGLE_MAPS_API_KEY="your_maps_key"
export SANITY_API_TOKEN="skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ"

# システムテスト実行
node scripts/test-youtube-system.cjs

# 最新動画取得・記事作成実行
node scripts/check-youtube-and-create-articles.cjs
```

## 🎯 システム動作内容

### 自動実行される処理
1. **最新動画取得**: ささよしチャンネルから過去1週間の動画取得
2. **重複チェック**: 既存記事との重複確認
3. **地域・カテゴリ抽出**: 動画タイトル・説明から富山県内の地域を特定
4. **記事自動作成**: 
   - 【地域名】形式のタイトル生成
   - YouTube動画埋め込み
   - Googleマップ追加
   - SEO最適化タグ設定
5. **Sanity CMS保存**: 記事をCMSに自動保存

### 対象地域
富山市、高岡市、射水市、氷見市、砺波市、小矢部市、南砺市、魚津市、黒部市、滑川市、上市町、立山町、入善町、朝日町、舟橋村

## ⚠️ 重要な注意事項

### APIキーのセキュリティ
- 公開リポジトリにコミット禁止
- ドメイン制限の設定必須
- 定期的なキーローテーション

### 料金・使用量
- YouTube API: 1日10,000ユニット無料
- Google Maps API: 月額$200クレジット
- 使用量アラート設定推奨

## 📞 サポート

設定完了後、以下で動作確認：
- システムテスト: `node scripts/test-youtube-system.cjs`
- 手動実行: `node scripts/check-youtube-and-create-articles.cjs`
- 記事確認: https://sasakiyoshimasa.com/

設定ガイド:
- YouTube API: `YOUTUBE_API_SETUP_GUIDE.md`
- Google Maps: `setup-google-maps-api.md`