# Sanity CMS セットアップ手順

## 1. Sanityプロジェクトの作成

以下のコマンドでSanityプロジェクトを作成してください：

```bash
npx sanity@latest init
```

選択内容：
- **Create new project** を選択
- プロジェクト名: `sasakiyoshimasa-blog`
- データセット: `production`
- テンプレート: **Clean project with no predefined schemas** を選択
- TypeScript: **Yes** を選択

## 2. 環境変数の設定

Sanityプロジェクト作成後、`.env.local` ファイルを更新してください：

```bash
# Sanity設定
PUBLIC_SANITY_PROJECT_ID=your-actual-project-id  # ← Sanity管理画面で確認したプロジェクトIDに変更
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2024-01-01

# 本番用のAPI token（読み取り専用）
SANITY_API_TOKEN=your-token  # ← 後で設定
```

## 3. Sanity Studioの起動

```bash
npm run dev
```

ブラウザで以下にアクセス：
- **メインサイト**: http://localhost:4321/
- **Sanity Studio**: http://localhost:4321/studio

## 4. YouTube Shorts記事の作成方法

1. Sanity Studioにアクセス: http://localhost:4321/studio
2. 「ブログ記事」を新規作成
3. 基本情報を入力：
   - タイトル
   - スラッグ（自動生成）
   - 説明
   - 公開日
   - タグ（オプション）

4. 記事内容で **YouTube Shorts** を追加：
   - 「+ 追加」ボタンをクリック
   - 「YouTube Shorts」を選択
   - YouTube URL を入力（対応形式）：
     - `https://www.youtube.com/watch?v=VIDEO_ID`
     - `https://www.youtube.com/shorts/VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`
   - 動画タイトル（オプション）
   - 自動再生設定
   - コントロール表示設定

5. 「Publish」をクリックして公開

## 5. 対応している機能

✅ **YouTube Shorts埋め込み**
- 縦長レスポンシブ表示
- 自動再生設定
- コントロール表示/非表示
- 無効なURL検証

✅ **リッチテキスト編集**
- 見出し（H1-H6）
- 太字、斜体、アンダーライン
- コードブロック
- 引用

✅ **画像アップロード**
- ドラッグ&ドロップ対応
- キャプション設定
- レスポンシブ表示

✅ **SEO対応**
- メタタグ自動生成
- Open Graph対応
- 構造化データ

## トラブルシューティング

### YouTube URLが認識されない場合
以下の形式で入力してください：
- ✅ `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ `https://www.youtube.com/shorts/dQw4w9WgXcQ`
- ✅ `https://youtu.be/dQw4w9WgXcQ`
- ❌ `youtube.com/watch?v=dQw4w9WgXcQ` (httpsなし)

### Sanity Studioにアクセスできない場合
1. 開発サーバーが起動していることを確認
2. `.env.local` の `PUBLIC_SANITY_PROJECT_ID` が正しく設定されているか確認
3. ブラウザのキャッシュをクリア

### 記事が表示されない場合
1. Sanity Studioで記事を「Publish」したか確認
2. ブラウザのページを再読み込み
3. 開発サーバーを再起動: `npm run dev`