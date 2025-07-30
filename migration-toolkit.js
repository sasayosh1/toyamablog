import { createClient } from '@sanity/client';
import fs from 'fs';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Astro/Markdownに変換するための移行ツールキット
async function createMigrationToolkit() {
  try {
    console.log('🚀 TOYAMA BLOG 移行ツールキット作成');
    console.log('=' * 60);
    
    // 全データ取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        description,
        tags,
        category,
        body,
        "youtubeShorts": body[_type == "youtubeShorts"][0].url
      }
    `);
    
    console.log(`📊 移行対象記事数: ${allPosts.length}`);
    
    // 1. Markdown形式の個別ファイル生成
    console.log('\n📝 Markdownファイル生成中...');
    
    const markdownDir = './markdown-posts';
    if (!fs.existsSync(markdownDir)) {
      fs.mkdirSync(markdownDir, { recursive: true });
    }
    
    let markdownCount = 0;
    
    allPosts.forEach((post, index) => {
      try {
        // スラグからファイル名作成
        const fileName = post.slug?.current || `post-${post._id}`;
        const safeFileName = fileName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
        
        // フロントマター作成
        const frontMatter = `---
title: "${post.title?.replace(/"/g, '\\"') || 'Untitled'}"
slug: "${post.slug?.current || safeFileName}"
publishedAt: "${post.publishedAt || new Date().toISOString()}"
description: "${post.description?.replace(/"/g, '\\"') || ''}"
category: "${post.category || 'その他'}"
tags: 
${post.tags?.map(tag => `  - "${tag}"`).join('\n') || '  - "富山"'}
youtubeShorts: "${post.youtubeShorts || ''}"
---

`;
        
        // 本文作成（Portable Textを簡易的にMarkdownに変換）
        let content = '';
        if (post.body && Array.isArray(post.body)) {
          post.body.forEach(block => {
            if (block._type === 'block' && block.children) {
              const text = block.children.map(child => child.text || '').join('');
              if (text.trim()) {
                content += `${text}\n\n`;
              }
            } else if (block._type === 'youtubeShorts' && block.url) {
              content += `## YouTube Shorts\n\n${block.url}\n\n`;
            }
          });
        }
        
        // 説明文を本文に追加（本文が空の場合）
        if (!content.trim() && post.description) {
          content = `${post.description}\n\n`;
        }
        
        // YouTubeショーツを本文に追加
        if (post.youtubeShorts) {
          content += `## 動画\n\n[YouTube Shorts で見る](${post.youtubeShorts})\n\n`;
        }
        
        const fullMarkdown = frontMatter + content;
        
        fs.writeFileSync(`${markdownDir}/${safeFileName}.md`, fullMarkdown, 'utf8');
        markdownCount++;
        
        if ((index + 1) % 50 === 0) {
          console.log(`📝 進捗: ${index + 1}/${allPosts.length} (${Math.round((index + 1)/allPosts.length*100)}%)`);
        }
        
      } catch (error) {
        console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
      }
    });
    
    // 2. カテゴリ別フォルダ構造作成
    console.log('\n📁 カテゴリ別フォルダ構造作成中...');
    
    const categoryDir = './posts-by-category';
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    const categoryGroups = {};
    allPosts.forEach(post => {
      const category = post.category || 'その他';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(post);
    });
    
    Object.entries(categoryGroups).forEach(([category, posts]) => {
      const categoryPath = `${categoryDir}/${category.replace(/[^a-zA-Z0-9-]/g, '-')}`;
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
      }
      
      // カテゴリ情報ファイル
      const categoryInfo = {
        name: category,
        count: posts.length,
        posts: posts.map(post => ({
          title: post.title,
          slug: post.slug?.current,
          publishedAt: post.publishedAt,
          youtubeShorts: post.youtubeShorts
        }))
      };
      
      fs.writeFileSync(
        `${categoryPath}/category-info.json`, 
        JSON.stringify(categoryInfo, null, 2), 
        'utf8'
      );
    });
    
    // 3. Astro Content Collection設定ファイル生成
    console.log('\n⚙️ Astro設定ファイル生成中...');
    
    const astroConfig = `import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishedAt: z.string().transform((str) => new Date(str)),
    description: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default(['富山']),
    youtubeShorts: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
`;
    
    fs.writeFileSync('./astro-content-config.ts', astroConfig, 'utf8');
    
    // 4. 移行スクリプト生成
    const migrationScript = `#!/bin/bash

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
`;
    
    fs.writeFileSync('./migration-script.sh', migrationScript, 'utf8');
    fs.chmodSync('./migration-script.sh', 0o755);
    
    // 5. 移行ガイド作成
    const migrationGuide = `# TOYAMA BLOG 移行ガイド

## 概要
Sanity CMSからAstro + Markdownへの移行ツールキット

## 生成されたファイル

### 1. Markdownファイル (${markdownCount}件)
\`./markdown-posts/\` - 全記事のMarkdown形式

### 2. カテゴリ別構造
\`./posts-by-category/\` - カテゴリごとの整理済みデータ

### 3. Astro設定
\`./astro-content-config.ts\` - Astro Content Collection設定

### 4. 移行スクリプト
\`./migration-script.sh\` - 自動移行スクリプト

## 手動移行手順

### 1. 新しいAstroプロジェクト作成
\`\`\`bash
npm create astro@latest toyama-blog-new
cd toyama-blog-new
\`\`\`

### 2. 記事ファイル移動
\`\`\`bash
mkdir -p src/content/blog
cp ../markdown-posts/*.md src/content/blog/
\`\`\`

### 3. 設定ファイル配置
\`\`\`bash
cp ../astro-content-config.ts src/content/config.ts
\`\`\`

### 4. 開発サーバー起動
\`\`\`bash
npm run dev
\`\`\`

## 自動移行

\`\`\`bash
chmod +x migration-script.sh
./migration-script.sh
\`\`\`

## データ統計

- 総記事数: ${allPosts.length}
- Markdownファイル: ${markdownCount}件
- カテゴリ数: ${Object.keys(categoryGroups).length}

### カテゴリ分布
${Object.entries(categoryGroups).map(([cat, posts]) => `- ${cat}: ${posts.length}件`).join('\n')}

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
`;
    
    fs.writeFileSync('./MIGRATION_GUIDE.md', migrationGuide, 'utf8');
    
    console.log('\n🎉 移行ツールキット作成完了！');
    console.log('=' * 40);
    console.log(`📝 Markdownファイル: ${markdownCount}件`);
    console.log(`📁 カテゴリ: ${Object.keys(categoryGroups).length}件`);
    console.log(`⚙️ Astro設定ファイル: 作成済み`);
    console.log(`📋 移行ガイド: MIGRATION_GUIDE.md`);
    console.log(`🔧 移行スクリプト: migration-script.sh`);
    
    console.log('\n🚀 次のステップ:');
    console.log('1. ./migration-script.sh を実行');
    console.log('2. または MIGRATION_GUIDE.md に従って手動移行');
    
    return {
      markdownCount,
      categories: Object.keys(categoryGroups).length,
      totalPosts: allPosts.length
    };
    
  } catch (error) {
    console.error('❌ 移行ツールキット作成エラー:', error.message);
    return null;
  }
}

createMigrationToolkit();