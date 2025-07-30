#!/bin/bash

# TOYAMA BLOG 移行スクリプト
echo "🚀 TOYAMA BLOG移行開始"

# 1. プロジェクト作成
echo "📁 新しいAstroプロジェクトを作成"
npm create astro@latest toyama-blog-new

cd toyama-blog-new

# 2. 必要な依存関係インストール
echo "📦 依存関係インストール"
npm install @astrojs/tailwind tailwindcss

# 3. コンテンツディレクトリ作成
echo "📝 コンテンツ構造作成"
mkdir -p src/content/blog

# 4. Markdownファイルコピー
echo "📄 記事ファイルコピー"
cp ../markdown-posts/*.md src/content/blog/

# 5. 設定ファイルコピー
echo "⚙️ 設定ファイルコピー"
cp ../astro-content-config.ts src/content/config.ts

echo "✅ 移行完了！"
echo "次のステップ:"
echo "1. cd toyama-blog-new"
echo "2. npm run dev"
echo "3. http://localhost:3000 で確認"
