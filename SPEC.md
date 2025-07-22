# TOYAMA BLOG 仕様書

## プロジェクト概要
- **プロジェクト名**: TOYAMA BLOG
- **技術スタック**: Next.js 15, TypeScript, Tailwind CSS, Sanity CMS
- **環境**: Node.js 20+
- **デプロイ**: Vercel

## 完了済み設定

### 1. 基本環境構築 ✅
- Next.js プロジェクト作成済み
- TypeScript 設定済み
- Tailwind CSS 設定済み
- ESLint 設定済み

### 2. Sanity CMS 設定 ✅
- プロジェクトID: `aoxze287`
- データセット: `production`
- 設定ファイル: `sanity.config.ts`
- 環境変数: `.env.local` (API キー設定済み)
- 開発サーバー: `http://localhost:3333/`

### 3. スキーマ定義 ✅
- Post (ブログ記事)
- Author (著者)
- Category (カテゴリー)
- BlockContent (リッチテキスト)

## API使用最小限の代替手段

### コンテンツ管理
**推奨**: Sanity Studio での手動管理
- **理由**: GUIベースで直感的、API呼び出し不要
- **操作**: ブラウザから直接コンテンツ作成・編集

### 静的サイト生成
**推奨**: Next.js Static Site Generation (SSG)
```typescript
// pages/blog/[slug].tsx
export async function getStaticProps() {
  // ビルド時にデータを取得（API呼び出し最小限）
}

export async function getStaticPaths() {
  // 静的パス生成
}
```

### 画像最適化
**推奨**: Next.js Image Optimization
```typescript
import Image from 'next/image'
// 自動最適化、API不要
```

### 検索機能（API代替）
**推奨**: クライアントサイド検索
```typescript
// 静的JSONファイル + フィルタリング
const searchResults = posts.filter(post => 
  post.title.includes(searchTerm)
)
```

## 今後の実装予定

### 1. フロントエンド実装
- [ ] ホームページ作成
- [ ] ブログ一覧ページ
- [ ] 個別記事ページ
- [ ] カテゴリーページ
- [ ] 著者ページ

### 2. Sanity連携
- [ ] データ取得関数作成
- [ ] 型定義作成
- [ ] 画像URL生成関数

### 3. スタイリング
- [ ] レスポンシブデザイン
- [ ] ダークモード対応
- [ ] アニメーション実装

### 4. SEO対応
- [ ] メタタグ設定
- [ ] サイトマップ生成
- [ ] 構造化データ

### 5. パフォーマンス最適化
- [ ] 画像最適化
- [ ] コード分割
- [ ] キャッシュ戦略

### 6. デプロイ設定 ✅
- [x] Vercel設定 (vercel.json)
- [x] Next.js最適化 (next.config.ts)
- [x] 環境変数設定 (.env.example)
- [x] セキュリティヘッダー設定
- [x] Sanity CDN画像最適化設定

## 重複排除項目

以下の作業は既に完了しているため、重複実装を避ける：

1. ❌ **削除**: 新規 Next.js プロジェクト作成
2. ❌ **削除**: TypeScript 初期設定
3. ❌ **削除**: Tailwind CSS インストール
4. ❌ **削除**: Sanity プロジェクト初期化
5. ❌ **削除**: 基本スキーマ作成
6. ❌ **削除**: 環境変数設定

## 次のアクション

1. フロントエンド実装開始
2. Sanity データ取得関数作成
3. 静的サイト生成設定