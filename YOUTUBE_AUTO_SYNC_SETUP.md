# YouTube自動同期セットアップガイド

## 概要
YouTubeチャンネルに新しい動画が追加された際、自動的にSanityブログ記事を作成するシステムです。

## システム構成

### 1. 環境変数設定
`.env.local`に以下の変数が設定済み:
```bash
YOUTUBE_CHANNEL_ID=UCxX3Eq8_KMl3AeYdhb5MklA
YOUTUBE_API_KEY=AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY
GOOGLE_MAPS_API_KEY=AIzaSyAH5oKyGm1EnibGH6JxlrEwMyRUIpzvEgI
SANITY_API_TOKEN=skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ
```

### 2. スクリプトファイル

#### メインスクリプト
- **ファイル**: `scripts/check-youtube-and-create-articles.cjs`
- **機能**: YouTube Data APIから最新動画を取得し、Sanity記事を作成

#### 自動実行スクリプト
- **ファイル**: `scripts/auto-youtube-sync.sh`
- **機能**: 環境変数読み込み、ログ管理、エラーハンドリング

## 使用方法

### 手動実行
```bash
cd /Users/user/toyamablog
npm run youtube:create
```

または

```bash
cd /Users/user/toyamablog
./scripts/auto-youtube-sync.sh
```

### 自動実行（cronジョブ）

#### 1日1回実行（毎日午前9時）
```bash
# crontabを編集
crontab -e

# 以下を追加
0 9 * * * cd /Users/user/toyamablog && ./scripts/auto-youtube-sync.sh
```

#### 1日2回実行（午前9時と午後6時）
```bash
0 9,18 * * * cd /Users/user/toyamablog && ./scripts/auto-youtube-sync.sh
```

#### 1週間に1回実行（毎週月曜日午前9時）
```bash
0 9 * * 1 cd /Users/user/toyamablog && ./scripts/auto-youtube-sync.sh
```

## 処理フロー

1. **YouTube API呼び出し**
   - チャンネルの最新10件の動画を取得
   - 1週間以内の動画のみを処理対象とする

2. **既存記事チェック**
   - Sanity内に同じ動画IDの記事が存在するかチェック
   - 既存記事がある場合はスキップ

3. **地域とカテゴリの自動抽出**
   - 動画タイトルと説明から富山県の市町村を検出
   - カテゴリ（グルメ、自然・公園、神社・寺院等）を自動判定

4. **記事コンテンツ生成**
   - CLAUDE.mdルールに準拠した1,500-2,000文字の記事を生成
   - H2見出し構成: 地域について → スポットの魅力 → 楽しみ方 → アクセス情報 → まとめ

5. **Sanity記事作成**
   - カテゴリの自動作成（存在しない場合）
   - 記事の公開とタグ設定

## ログ管理

- **ログディレクトリ**: `logs/`
- **ログファイル**: `youtube-sync-YYYYMMDD-HHMMSS.log`
- **自動削除**: 30日以上前のログは自動削除

## 対象動画の条件

- **チャンネル**: ささよしチャンネル (UCxX3Eq8_KMl3AeYdhb5MklA)
- **期間**: 1週間以内に公開された動画
- **地域**: 富山県の市町村が特定できる動画
- **除外**: 既にSanity記事が存在する動画

## 富山県市町村マッピング

| 市町村名 | スラッグ |
|---------|----------|
| 富山市 | toyama-city |
| 高岡市 | takaoka-city |
| 射水市 | imizu-city |
| 氷見市 | himi-city |
| 砺波市 | tonami-city |
| 小矢部市 | oyabe-city |
| 南砺市 | nanto-city |
| 魚津市 | uozu-city |
| 黒部市 | kurobe-city |
| 滑川市 | namerikawa-city |
| 上市町 | kamiichi-town |
| 立山町 | tateyama-town |
| 入善町 | nyuzen-town |
| 朝日町 | asahi-town |
| 舟橋村 | funahashi-village |

## カテゴリ自動判定ルール

### ⚠️ 重要: カテゴリ設定違反防止
**【最重要】必ず地域名をカテゴリとする**
- タイトル【富山市】→ カテゴリ: "富山市"
- タイトル【高岡市】→ カテゴリ: "高岡市"
- **絶対禁止**: 「グルメ」「自然・公園」「観光」等の汎用カテゴリは使用禁止

### 記事作成時の厳格チェック
`scripts/check-youtube-and-create-articles.cjs`の410-436行目でカテゴリ設定を実行:
```javascript
// カテゴリ参照の作成（クラウドルール厳格準拠）
let categoryRef = null;
try {
  // 地域名カテゴリを取得または作成
  let regionCategory = await sanityClient.fetch(`*[_type == "category" && title == "${location}"][0]`);

  if (!regionCategory) {
    console.log(`⚠️  「${location}」カテゴリが存在しません。作成中...`);

    regionCategory = await sanityClient.create({
      _type: 'category',
      title: location,  // 地域名のみ使用
      slug: {
        _type: 'slug',
        current: locationSlug
      },
      description: `${location}に関する記事`
    });
  }

  categoryRef = {
    _type: 'reference',
    _ref: regionCategory._id
  };
} catch (error) {
  console.error(`❌ カテゴリ作成エラー（${location}）:`, error);
}
```

## トラブルシューティング

### YouTube API エラー
- APIキーの有効性を確認: https://console.cloud.google.com/
- 1日のクォータ制限を確認
- チャンネルIDが正しいか確認

### Sanity API エラー
- トークンの権限を確認（Editor以上）
- プロジェクトIDとデータセット名を確認
- 環境変数が正しく設定されているか確認

### 環境変数エラー
```bash
# 環境変数の明示的設定
export SANITY_API_TOKEN="skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ"
export YOUTUBE_CHANNEL_ID="UCxX3Eq8_KMl3AeYdhb5MklA"
export YOUTUBE_API_KEY="AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY"
export GOOGLE_MAPS_API_KEY="AIzaSyAH5oKyGm1EnibGH6JxlrEwMyRUIpzvEgI"
```

### 地域が特定できない
- 動画タイトルまたは説明に市町村名を含める
- 市町村マッピングに追加が必要か確認

## 成功確認

### ログ確認
```bash
# 最新のログファイル確認
ls -lt /Users/user/toyamablog/logs/youtube-sync-*.log | head -1

# ログ内容表示
cat /Users/user/toyamablog/logs/youtube-sync-*.log
```

### Sanity確認
- Sanity Studioで新規記事を確認
- カテゴリが正しく設定されているか確認
- 動画URLが正しく埋め込まれているか確認

### サイト確認
- https://sasakiyoshimasa.com で記事を確認
- レイアウトが正しいか確認
- 動画が正しく再生されるか確認

## 最終確認日
2025年10月4日 - システムセットアップ完了

## 関連ドキュメント
- `YOUTUBE_SYSTEM_FINAL_SETUP.md` - YouTube API初期設定ガイド
- `CLAUDE.md` - ブログ記事作成ガイドライン
- `SANITY_API_GUIDE.md` - Sanity API使用ガイド
