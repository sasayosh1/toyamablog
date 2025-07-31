# TOYAMA BLOG

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

## Sanity Studio

ローカル環境: http://localhost:3000/studio