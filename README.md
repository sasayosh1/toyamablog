# 富山のくせに

富山の魅力を発信するブログサイト

## 開発環境セットアップ

```bash
npm install
npm run dev
```

## ヒーロー画像の設定

### 📸 画像アップロード手順

1. 富山の風景画像（立山連峰を背景にした橋と川の景色）を準備
2. ファイル名を `toyama-hero.jpg` に変更
3. `/public/images/toyama-hero.jpg` に配置
4. `/src/app/page.tsx` のコメントアウトされたImage コンポーネントを有効化

**推奨画像仕様:**
- 解像度: 1920x1080 以上
- 形式: JPG, PNG, WebP
- ファイルサイズ: 1MB以下（Next.jsが自動最適化します）
- アスペクト比: 16:9 推奨

**現在の状態:**
- 一時的にグラデーション背景を使用
- 実際の画像アップロード後にコードを更新予定

## プロジェクト構成

- `src/app/` - Next.js App Router
- `src/components/` - Reactコンポーネント
- `src/lib/` - Sanity CMS連携
- `schemaTypes/` - Sanity CMSスキーマ定義
- `public/` - 静的ファイル

## 環境変数

`.env.local` ファイルを作成して以下を設定：

```
NEXT_PUBLIC_SANITY_PROJECT_ID=aoxze287
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
REVALIDATE_SECRET=your_secret_here
```

## デプロイ

Vercel経由でデプロイ済み: https://sasakiyoshimasa.com

## 開発を速く保つための手順

開発サーバーの起動と HMR を高速に保つため、以下の運用を推奨します。

1. **Sanity フェッチの制限**  
   `NEXT_PUBLIC_DEV_POST_LIMIT=30` を `.env.local` に設定すると、開発時の取得件数を 30 件に制限します。必要な場合のみ `getAllPosts({ fetchAll: true })` を使用してください。

2. **キャッシュ設定の活用**  
   ページは `revalidate` による ISR を標準としています。頻繁に更新するデータのみ `no-store` を使い、通常は `npm run dev` → `Ctrl + R` で即座に反映されます。

3. **Turbopack の併用**  
   起動コマンドは `npm run dev`。必要に応じて `npm run dev -- --turbo` で Turbopack を試し、より速い構成を選択してください。

4. **Codex のインデックス最適化**  
   ルートに `.codexignore` を用意しています。インデックスの再構築は以下を順に実行します。
   ```bash
   codex cache clear
   codex index --rebuild
   ```
   Codex を利用するときは `apps/web` など最小ディレクトリを対象にすると検索がさらに高速化します。

5. **破損キャッシュの復旧**  
   `.next/cache` は `.gitignore` 済みです。挙動が不安定な場合は `rm -rf .next` で一度削除してから `npm run dev` を実行してください。

## Sanity Studio

ローカル環境: http://localhost:3000/studio

## 🤖 自動記事作成システム

### 概要
毎週土曜日夜9:00（JST）に自動でYouTubeチャンネルをチェックし、新しい動画があった場合にブログ記事を自動作成します。

### 機能
- 📺 YouTubeチャンネルの新着動画を自動検知
- 🗺️ 動画タイトルから富山県内の地域を自動識別
- 📝 動画の内容に基づいて記事コンテンツを自動生成
- 🗾 Google Mapsの埋め込みを自動追加
- 🏷️ カテゴリとタグの自動設定

### セットアップ

1. **環境変数の設定**
   `.env.local`に以下を追加：
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   SANITY_API_TOKEN=your_sanity_token_here
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

2. **GitHub Secrets設定**
   GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：
   - `YOUTUBE_API_KEY`
   - `SANITY_API_TOKEN` 
   - `GOOGLE_MAPS_API_KEY`

3. **手動実行**
   ```bash
   node scripts/manual-youtube-check.js
   ```

### APIキーの取得方法

**YouTube Data API Key:**
1. [Google Cloud Console](https://console.developers.google.com) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. YouTube Data API v3を有効化
4. 認証情報 > APIキーを作成

**Google Maps API Key:**
1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. Maps Embed APIを有効化
3. 認証情報 > APIキーを作成

### 自動実行スケジュール
- **実行タイミング**: 毎週土曜日 21:00 JST
- **処理対象**: 過去1週間以内の新着動画
- **対象地域**: 富山県内の15市町村

### 地域判定ロジック
動画タイトルと説明から以下の地域を自動識別：
- 富山市、高岡市、射水市、氷見市、砺波市
- 小矢部市、南砺市、魚津市、黒部市、滑川市
- 上市町、立山町、入善町、朝日町、舟橋村
