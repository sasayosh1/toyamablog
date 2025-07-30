<<<<<<< HEAD
# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
=======
# TOYAMA BLOG

富山をテーマにしたブログサイト。Next.js 15 + Sanity CMS + Vercelで構築。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **CMS**: Sanity
- **デプロイ**: Vercel
- **Node.js**: 20+

## 環境構築

### 1. 依存関係インストール

```bash
npm install
```

### 2. 環境変数設定

`.env.example`を参考に`.env.local`を作成：

```bash
cp .env.example .env.local
```

### 3. 開発サーバー起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Sanity Studio

Sanity Studioは別途起動します：

```bash
# Sanity Studio開発サーバー
npx sanity dev
```

Studio URL: http://localhost:3333/

## Vercelデプロイ

### 1. GitHubにプッシュ

```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### 2. Vercelでプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. "New Project"をクリック  
3. GitHubリポジトリを選択
4. 環境変数を設定：
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`: aoxze287
   - `NEXT_PUBLIC_SANITY_DATASET`: production
   - `SANITY_API_TOKEN`: (Sanityから取得)

### 3. 自動デプロイ

以降、`main`ブランチにプッシュすると自動デプロイされます。

## プロジェクト構造

```
toyama-blog/
├── src/
│   ├── app/                 # Next.js App Router
│   └── lib/                 # ユーティリティ関数
├── schemaTypes/             # Sanityスキーマ定義
├── public/                  # 静的ファイル
├── vercel.json             # Vercel設定
├── next.config.ts          # Next.js設定
└── sanity.config.ts        # Sanity設定
```
>>>>>>> 31044119437df01edc0123087c142c7163545891
