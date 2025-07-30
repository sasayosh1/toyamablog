# TOYAMA BLOG 移行ガイド

## 概要
Sanity CMSからAstro + Markdownへの移行ツールキット

## 生成されたファイル

### 1. Markdownファイル (203件)
`./markdown-posts/` - 全記事のMarkdown形式

### 2. カテゴリ別構造
`./posts-by-category/` - カテゴリごとの整理済みデータ

### 3. Astro設定
`./astro-content-config.ts` - Astro Content Collection設定

### 4. 移行スクリプト
`./migration-script.sh` - 自動移行スクリプト

## 手動移行手順

### 1. 新しいAstroプロジェクト作成
```bash
npm create astro@latest toyama-blog-new
cd toyama-blog-new
```

### 2. 記事ファイル移動
```bash
mkdir -p src/content/blog
cp ../markdown-posts/*.md src/content/blog/
```

### 3. 設定ファイル配置
```bash
cp ../astro-content-config.ts src/content/config.ts
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 自動移行

```bash
chmod +x migration-script.sh
./migration-script.sh
```

## データ統計

- 総記事数: 203
- Markdownファイル: 203件
- カテゴリ数: 7

### カテゴリ分布
- 富山市: 65件
- 高岡市: 13件
- 射水市: 12件
- 県東部: 52件
- 県西部: 35件
- 砺波市: 22件
- その他: 4件

## 注意事項

1. **YouTube Shorts**: 各記事にYouTubeリンクが含まれています
2. **画像**: Sanityの画像は手動で移行が必要です
3. **Portable Text**: 複雑な構造は手動調整が必要な場合があります
4. **SEO**: メタデータ（title, description, tags）は全て移行済みです

## トラブルシューティング

### よくある問題
1. ファイル名の文字化け → スラグが正しく設定されているか確認
2. フロントマターエラー → YAML形式が正しいか確認
3. 重複ファイル → 同じスラグの記事がないか確認

### サポート
移行に関する質問や問題があれば、このファイルを参照してください。
