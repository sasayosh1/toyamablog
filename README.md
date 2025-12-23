# 富山、お好きですか？

富山の魅力をもっと好きになるヒントを発信するブログサイト

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

## Sanity Studio

ローカル環境: http://localhost:3000/studio

## 🐦 X Mailer（X投稿文のメール送信）

GitHub Actions の `X Mailer (semi-auto)` が、Sanity の記事を1件選んで「Xに貼るための本文」を Gmail で `MAIL_TO` に送ります。

### 最短の直し方（送信元を `ptb875pmj49@gmail.com` に統一する運用）

この運用に切り替える場合は、`toyamablog` リポジトリの Secrets を下記で統一します。

設定場所: `Settings → Secrets and variables → Actions → Secrets`
- `GMAIL_USER`: `ptb875pmj49@gmail.com`
- `GMAIL_APP_PASSWORD`: 上記アカウントで発行した App Password（16文字、空白は入れない）
- `MAIL_TO`: 受信先メールアドレス

チェック項目（535対策）:
- `GMAIL_USER` と **同じアカウント**で App Password を発行していること
- 2段階認証が有効になっていること（App Password 発行に必須）
- `GMAIL_APP_PASSWORD` の長さが 16 文字であること（空白含めてコピペした場合は削除）

### Secrets/Vars の「どれが実際に使われたか」を特定する手順

この workflow は `.github/workflows/x-mailer.yml` で `secrets.*` を参照しています。
そのため「どの値が使われたか」は、下記で切り分けできます。

1. `Actions → X Mailer (semi-auto) → 失敗した Run → Run mailer` のログを見る
2. ログに `Account: x***y@gmail.com` のような **マスク表示**が出るので、その値が「実際に読まれた `GMAIL_USER`」です（秘密は出しません）
3. 想定と違う場合は、当該リポジトリの `Actions secrets` で同名キーが残っていないか確認し、更新する

補足（優先順位の前提）:
- `Environment secrets` は、job に `environment:` を指定したときだけ適用されます（この workflow では未使用）。
- `Organization secrets` は、リポジトリに同名 secret を設定すると **リポジトリ側が優先**されます。

### 恒久対策（App Password を使わない）

App Password が使えない/弾かれる場合は、Gmail API (OAuth2 / XOAUTH2) に移行できます。

#### OAuth2 セットアップ手順（Gmail API）

1. Google Cloud Console でプロジェクトを用意し、**Gmail API** を有効化
2. `API とサービス → 認証情報` で **OAuth クライアント ID** を作成（種類は「ウェブアプリ」でOK）
   - 承認済みのリダイレクトURI（例）: `http://localhost`
3. 下記の3点を GitHub Secrets に登録（`Settings → Secrets and variables → Actions → Secrets`）
   - `GMAIL_OAUTH_CLIENT_ID`
   - `GMAIL_OAUTH_CLIENT_SECRET`
   - `GMAIL_OAUTH_REFRESH_TOKEN`
   - （任意）`GMAIL_OAUTH_REDIRECT_URI`（上で設定したURI。未設定ならスクリプト側は省略可能）
4. 送信元メールとして `GMAIL_USER` も必ず設定（例: `ptb875pmj49@gmail.com`）

補足:
- Refresh Token は `https://mail.google.com/`（または Gmail送信に必要な scope）を許可した同意フローから取得してください。
- このリポジトリの `scripts/x_mailer.mjs` は、OAuth2 secrets が揃っている場合は **App Password より OAuth2 を優先**します。

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

## 💸 コストガード & 📉 監視（自動運用）

- `YouTube記事自動生成` workflow は Gemini 実行前に `scripts/budget-guard.cjs` を実行し、月額目安（既定 `100円`）を超える場合は **Gemini をスキップ**して Issue を作成します。
- `Analytics Health Check (GA4/GSC)` workflow は GA4/GSC のゼロ・急落・認証失敗を検知した場合に Issue を作成し、異常時は最適化系の自動更新をスキップする前提で運用します。

### 追加で必要な GitHub Secrets

- `GOOGLE_SERVICE_ACCOUNT_JSON`: GA4 Data API + Search Console API 参照権限のあるサービスアカウントJSON（文字列）
- `GA4_PROPERTY_ID`: GA4 のプロパティID（数値）
- `GSC_SITE_URL`: Search Console のサイトURL（例: `https://sasakiyoshimasa.com/`）

### 自動実行スケジュール
- **実行タイミング**: 毎週土曜日 21:00 JST
- **処理対象**: 過去1週間以内の新着動画
- **対象地域**: 富山県内の15市町村

### 地域判定ロジック
動画タイトルと説明から以下の地域を自動識別：
- 富山市、高岡市、射水市、氷見市、砺波市
- 小矢部市、南砺市、魚津市、黒部市、滑川市
- 上市町、立山町、入善町、朝日町、舟橋村
