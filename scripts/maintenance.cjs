const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

/**
 * toyamablog メンテナンススクリプト
 * prorenataの包括的メンテナンスシステムを参考に実装
 *
 * コマンド:
 * - report: 全記事の品質問題を検出・レポート
 * - autofix: 自動修正可能な問題を修正
 * - all: report + autofix を順次実行
 */

// ========================================
// ユーティリティ関数
// ========================================

/**
 * PortableText body を plain text に変換
 */
function blocksToPlainText(blocks) {
  if (!Array.isArray(blocks)) return '';

  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return '';
      return block.children
        .map(child => child.text || '')
        .join('');
    })
    .join('\n');
}

/**
 * 本文から #shorts ハッシュタグを除去
 */
function removeShortsHashtags(blocks) {
  if (!Array.isArray(blocks)) {
    return { body: blocks, removed: false };
  }

  let removed = false;
  const cleaned = [];

  blocks.forEach(block => {
    if (!block || block._type !== 'block' || !Array.isArray(block.children)) {
      cleaned.push(block);
      return;
    }

    const newChildren = block.children
      .map(child => {
        if (!child || typeof child.text !== 'string') {
          return child;
        }
        const newText = child.text.replace(/#shorts/gi, '').replace(/\s{2,}/g, ' ');
        if (newText !== child.text) {
          removed = true;
          return { ...child, text: newText.trim() };
        }
        return child;
      })
      .filter(child => child && typeof child.text === 'string' && child.text.trim().length > 0)
      .map(child => ({ ...child, text: child.text.trim() }));

    if (newChildren.length === 0) {
      if (block.children.length > 0) {
        removed = true;
      }
      return;
    }

    cleaned.push({ ...block, children: newChildren });
  });

  return { body: cleaned, removed };
}

/**
 * タイトルから地域名を抽出（【】内）
 */
function extractLocationFromTitle(title) {
  const match = title.match(/^【(.+?)】/);
  return match ? match[1] : null;
}

/**
 * 地域名からカテゴリを検索または作成
 */
async function getCategoryByLocation(location) {
  try {
    // 地域名カテゴリを検索
    let category = await client.fetch(`*[_type == "category" && title == "${location}"][0]`);

    if (!category) {
      console.log(`  ⚠️  「${location}」カテゴリが存在しません。作成をスキップします。`);
      return null;
    }

    return category;
  } catch (error) {
    console.error(`  ❌ カテゴリ取得エラー（${location}）:`, error.message);
    return null;
  }
}

/**
 * excerpt を生成（記事の魅力的な要約）
 *
 * 【重要】Excerptルール:
 * - 50-160文字程度
 * - 訪問者が興味を持つ具体的な内容
 * - SEOキーワードを自然に含める
 * - タイトルをそのまま載せない
 * - 「富山のくせに」「魅力を全力で」などの定型表現を使わない
 * - 記事の内容から具体的な魅力を抽出する
 */
function generateExcerpt(title, bodyText) {
  const location = extractLocationFromTitle(title);

  // 定型表現リスト（除外対象）
  const badPhrases = [
    '富山のくせに',
    '魅力を全力で',
    '富山の魅力を全力でお届けする',
    '富山、お好きですか？',
    '#shorts'
  ];

  // 本文から文を抽出
  const sentences = bodyText.split('。').filter(s => {
    const trimmed = s.trim();
    // 短すぎる文や定型表現を含む文を除外
    if (trimmed.length < 10) return false;
    return !badPhrases.some(phrase => trimmed.includes(phrase));
  });

  // タイトルの内容（地域名を除く）
  const titleWithoutLocation = title.replace(/【.+?】/, '').replace(/#shorts/gi, '').trim();

  // タイトルと重複しない文を優先的に選択
  const uniqueSentences = sentences.filter(s => {
    if (titleWithoutLocation.length > 10) {
      return !s.includes(titleWithoutLocation.substring(0, 20));
    }
    return true;
  });

  // Excerptを生成
  let excerpt = '';

  if (uniqueSentences.length > 0) {
    // 良質な文がある場合は、最初の1-2文を使用
    excerpt = uniqueSentences.slice(0, 2).join('。') + '。';
  } else if (sentences.length > 0) {
    // 定型表現を含まない文がある場合
    excerpt = sentences.slice(0, 2).join('。') + '。';
  } else {
    // 適切な文がない場合は、シンプルな説明を生成
    excerpt = `${location}で注目のスポットをご紹介。動画でその魅力をお伝えします。`;
  }

  // 50-160文字に調整
  if (excerpt.length < 50) {
    excerpt = `${location}の魅力をご紹介。${excerpt}`;
  }
  if (excerpt.length > 160) {
    excerpt = excerpt.slice(0, 157) + '...';
  }

  return excerpt;
}

/**
 * metaDescription を生成（SEO用の説明文）
 */
function generateMetaDescription(title, bodyText) {
  const location = extractLocationFromTitle(title);

  // SEO重視の簡潔な説明文（100-160文字推奨）
  const descriptions = [
    `富山県${location}の観光情報をお届けします。地域の魅力をYouTube動画でご紹介。アクセス情報や楽しみ方も詳しく解説します。`,
    `${location}の見どころを動画で紹介。富山県の自然・文化・グルメなど、地域の魅力を存分にお伝えします。`,
    `${location}のおすすめスポットをご案内。YouTube動画で臨場感あふれる観光体験をお届けします。`,
  ];

  return descriptions[0].slice(0, 160);
}

/**
 * タグを最適化（10個程度、記事内容に基づく）
 */
function optimizeTags(title, bodyText, existingTags = []) {
  const location = extractLocationFromTitle(title);
  const text = `${title} ${bodyText}`.toLowerCase();

  // 基本タグ
  const baseTags = ['富山', '富山県', 'TOYAMA'];

  // 地域タグ
  const locationTags = location ? [location] : [];

  // カテゴリタグ（本文から推定）
  const categoryTags = [];
  if (text.includes('神社') || text.includes('寺') || text.includes('お寺')) {
    categoryTags.push('神社・寺院');
  }
  if (text.includes('グルメ') || text.includes('レストラン') || text.includes('カフェ') || text.includes('ラーメン')) {
    categoryTags.push('グルメ');
  }
  if (text.includes('公園') || text.includes('桜') || text.includes('自然') || text.includes('海') || text.includes('山')) {
    categoryTags.push('自然・公園');
  }
  if (text.includes('温泉') || text.includes('宿泊')) {
    categoryTags.push('温泉・宿泊');
  }
  if (text.includes('イベント') || text.includes('祭り') || text.includes('花火')) {
    categoryTags.push('イベント・祭り');
  }

  // YouTube関連タグ
  const youtubeTags = ['YouTube', '動画'];

  // おすすめタグ
  const recommendTags = ['おすすめ', '観光'];

  // 全タグを結合して重複削除
  const allTags = [...new Set([
    ...baseTags,
    ...locationTags,
    ...categoryTags,
    ...youtubeTags,
    ...recommendTags
  ])];

  // 10個程度に制限
  return allTags.slice(0, 12);
}

// ========================================
// レポート生成機能
// ========================================

async function generateReport() {
  console.log('\n📊 === toyamablog 品質レポート ===\n');
  console.log('全記事の品質問題を検出しています...\n');
  console.log('='.repeat(80));

  try {
    const posts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        metaDescription,
        tags,
        body,
        "categories": categories[]->{ _id, title },
        youtubeUrl,
        _createdAt
      } | order(_createdAt desc)
    `);

    console.log(`\n総記事数: ${posts.length}件\n`);

    const issues = {
      noExcerpt: [],
      noMetaDescription: [],
      noTags: [],
      fewTags: [],
      tooManyTags: [],
      noCategory: [],
      wrongCategoryFormat: [],
      noYouTube: [],
      shortArticle: [],
      titleFormatIssue: [],
      badExcerptFormat: [],  // 定型表現・タイトル重複などの品質問題
      shortExcerpt: []  // 50文字未満
    };

    // 各記事をチェック
    posts.forEach(post => {
      // excerpt チェック
      if (!post.excerpt || post.excerpt.trim() === '') {
        issues.noExcerpt.push(post);
      } else {
        // excerpt品質チェック
        const excerpt = post.excerpt.trim();
        const titleWithoutLocation = post.title.replace(/【.+?】/, '').trim();

        // 定型表現チェック
        const badPhrases = ['富山のくせに', '魅力を全力で', '富山の魅力を全力でお届けする'];
        const hasBadPhrase = badPhrases.some(phrase => excerpt.includes(phrase));

        // タイトル重複チェック（タイトルと完全一致または大部分一致）
        const titleDuplication = excerpt.includes(titleWithoutLocation) && titleWithoutLocation.length > 10;

        // 文字数チェック（50文字未満）
        const tooShort = excerpt.length < 50;

        if (hasBadPhrase || titleDuplication) {
          issues.badExcerptFormat.push({
            ...post,
            reason: hasBadPhrase ? '定型表現使用' : 'タイトル重複'
          });
        }

        if (tooShort) {
          issues.shortExcerpt.push(post);
        }
      }

      // metaDescription チェック
      if (!post.metaDescription || post.metaDescription.trim() === '') {
        issues.noMetaDescription.push(post);
      }

      // タグチェック
      if (!post.tags || post.tags.length === 0) {
        issues.noTags.push(post);
      } else if (post.tags.length < 5) {
        issues.fewTags.push(post);
      } else if (post.tags.length > 15) {
        issues.tooManyTags.push(post);
      }

      // カテゴリチェック
      if (!post.categories || post.categories.length === 0) {
        issues.noCategory.push(post);
      } else {
        // 汎用カテゴリチェック（CLAUDE.mdルール違反）
        const genericCategories = ['グルメ', '観光', '観光スポット', 'イベント', '自然', 'その他'];
        const hasGenericCategory = post.categories.some(cat =>
          cat && cat.title && genericCategories.includes(cat.title)
        );
        if (hasGenericCategory) {
          issues.wrongCategoryFormat.push(post);
        }
      }

      // YouTube動画チェック
      if (!post.youtubeUrl) {
        issues.noYouTube.push(post);
      }

      // 文字数チェック
      const bodyText = blocksToPlainText(post.body);
      if (bodyText.length < 1000) {
        issues.shortArticle.push(post);
      }

      // タイトル形式チェック（【地域名】形式）
      if (!post.title.match(/^【.+】/)) {
        issues.titleFormatIssue.push(post);
      }
    });

    // レポート出力
    console.log('\n【検出された問題】\n');

    const problemCounts = [
      ['excerpt未設定', issues.noExcerpt.length],
      ['excerpt品質問題（定型表現・タイトル重複）', issues.badExcerptFormat.length],
      ['excerpt短すぎ(<50文字)', issues.shortExcerpt.length],
      ['metaDescription未設定', issues.noMetaDescription.length],
      ['タグなし', issues.noTags.length],
      ['タグ少なすぎ(<5個)', issues.fewTags.length],
      ['タグ多すぎ(>15個)', issues.tooManyTags.length],
      ['カテゴリなし', issues.noCategory.length],
      ['汎用カテゴリ使用（地域名推奨）', issues.wrongCategoryFormat.length],
      ['YouTube動画なし', issues.noYouTube.length],
      ['短すぎる記事(<1000文字)', issues.shortArticle.length],
      ['タイトル形式違反（【地域名】なし）', issues.titleFormatIssue.length]
    ];

    problemCounts.forEach(([problem, count]) => {
      const percentage = posts.length > 0 ? ((count / posts.length) * 100).toFixed(1) : '0.0';
      const icon = count === 0 ? '✅' : count < posts.length * 0.1 ? '⚠️ ' : '🔴';
      console.log(`  ${icon} ${problem}: ${count}件 (${percentage}%)`);
    });

    console.log('\n' + '='.repeat(80));

    // サンプル表示（最初の3件）
    if (issues.noExcerpt.length > 0) {
      console.log('\n【excerpt未設定の記事例】\n');
      issues.noExcerpt.slice(0, 3).forEach(post => {
        console.log(`  - ${post.title}`);
      });
    }

    if (issues.badExcerptFormat.length > 0) {
      console.log('\n【excerpt品質問題の記事例（定型表現・タイトル重複）】\n');
      issues.badExcerptFormat.slice(0, 5).forEach(post => {
        console.log(`  - ${post.title}`);
        console.log(`    理由: ${post.reason}`);
        console.log(`    現在: ${post.excerpt?.substring(0, 80)}...`);
      });
    }

    if (issues.shortExcerpt.length > 0) {
      console.log('\n【excerpt短すぎる記事例（<50文字）】\n');
      issues.shortExcerpt.slice(0, 5).forEach(post => {
        console.log(`  - ${post.title}`);
        console.log(`    現在: ${post.excerpt} (${post.excerpt?.length || 0}文字)`);
      });
    }

    if (issues.wrongCategoryFormat.length > 0) {
      console.log('\n【汎用カテゴリ使用の記事例（地域名カテゴリ推奨）】\n');
      issues.wrongCategoryFormat.slice(0, 3).forEach(post => {
        const catNames = post.categories.map(c => c.title).join(', ');
        console.log(`  - ${post.title} (現在: ${catNames})`);
      });
    }

    if (issues.titleFormatIssue.length > 0) {
      console.log('\n【タイトル形式違反の記事例（【地域名】形式推奨）】\n');
      issues.titleFormatIssue.slice(0, 3).forEach(post => {
        console.log(`  - ${post.title}`);
      });
    }

    console.log('\n='.repeat(80));
    console.log('\n✅ レポート生成完了\n');

    return issues;

  } catch (error) {
    console.error('❌ レポート生成エラー:', error.message);
    if (error.message.includes('Unauthorized')) {
      console.error('\n⚠️  Sanity APIトークンが期限切れまたは無効です。');
      console.error('   新しいトークンを生成して .env.local と GitHub Secrets を更新してください。\n');
    }
    return null;
  }
}

// ========================================
// 自動修正機能
// ========================================

async function autoFixMetadata() {
  console.log('\n🔧 === 自動修正開始 ===\n');
  console.log('修正可能な問題を自動的に修正します...\n');
  console.log('='.repeat(80));

  try {
    const posts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        metaDescription,
        tags,
        body,
        "categories": categories[]->{ _id, title }
      }
    `);

    console.log(`\n対象記事: ${posts.length}件\n`);

    let fixed = {
      excerpt: 0,
      metaDescription: 0,
      tags: 0,
      category: 0,
      shortsRemoved: 0
    };

    for (const post of posts) {
      const updates = {};
      const bodyText = blocksToPlainText(post.body);
      let needsUpdate = false;

      // excerpt 生成・修正
      const needsExcerptFix = () => {
        if (!post.excerpt || post.excerpt.trim() === '') return true;

        const excerpt = post.excerpt.trim();
        const titleWithoutLocation = post.title.replace(/【.+?】/, '').trim();

        // 定型表現チェック
        const badPhrases = ['富山のくせに', '魅力を全力で', '富山の魅力を全力でお届けする'];
        const hasBadPhrase = badPhrases.some(phrase => excerpt.includes(phrase));

        // タイトル重複チェック
        const titleDuplication = excerpt.includes(titleWithoutLocation) && titleWithoutLocation.length > 10;

        // 短すぎる
        const tooShort = excerpt.length < 50;

        return hasBadPhrase || titleDuplication || tooShort;
      };

      if (needsExcerptFix()) {
        updates.excerpt = generateExcerpt(post.title, bodyText);
        needsUpdate = true;
        fixed.excerpt++;
      }

      // metaDescription 生成
      if (!post.metaDescription || post.metaDescription.trim() === '') {
        updates.metaDescription = generateMetaDescription(post.title, bodyText);
        needsUpdate = true;
        fixed.metaDescription++;
      }

      // タグ最適化
      if (!post.tags || post.tags.length === 0 || post.tags.length < 5 || post.tags.length > 15) {
        updates.tags = optimizeTags(post.title, bodyText, post.tags);
        needsUpdate = true;
        fixed.tags++;
      }

      // カテゴリ修正（地域名カテゴリへの変更）
      if (!post.categories || post.categories.length === 0) {
        const location = extractLocationFromTitle(post.title);
        if (location) {
          const category = await getCategoryByLocation(location);
          if (category) {
            updates.categories = [{
              _type: 'reference',
              _ref: category._id
            }];
            needsUpdate = true;
            fixed.category++;
          }
        }
      }

      const shortsCleanup = removeShortsHashtags(post.body);
      if (shortsCleanup.removed) {
        updates.body = shortsCleanup.body;
        needsUpdate = true;
        fixed.shortsRemoved++;
      }

      // 更新実行
      if (needsUpdate) {
        await client
          .patch(post._id)
          .set(updates)
          .commit();

        // draft版も更新
        const publishedId = post._id.startsWith('drafts.') ? post._id.replace(/^drafts\./, '') : post._id;
        if (post._id !== publishedId) {
          await client
            .patch(publishedId)
            .set(updates)
            .commit()
            .catch(() => null); // draft版がない場合はエラーを無視
        }

        console.log(`✅ 修正完了: ${post.title}`);

        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n【修正サマリー】\n');
    console.log(`  excerpt生成: ${fixed.excerpt}件`);
    console.log(`  metaDescription生成: ${fixed.metaDescription}件`);
    console.log(`  タグ最適化: ${fixed.tags}件`);
    console.log(`  カテゴリ修正: ${fixed.category}件`);
    console.log(`  本文から#shorts除去: ${fixed.shortsRemoved}件`);
    console.log(`\n  合計: ${fixed.excerpt + fixed.metaDescription + fixed.tags + fixed.category + fixed.shortsRemoved}件の修正を実行\n`);
    console.log('='.repeat(80));
    console.log('\n✅ 自動修正完了\n');

    return fixed;

  } catch (error) {
    console.error('❌ 自動修正エラー:', error.message);
    if (error.message.includes('Unauthorized')) {
      console.error('\n⚠️  Sanity APIトークンが期限切れまたは無効です。');
      console.error('   新しいトークンを生成して .env.local と GitHub Secrets を更新してください。\n');
    }
    return null;
  }
}

// ========================================
// コマンドライン処理
// ========================================

const command = process.argv[2];

switch (command) {
  case 'report':
    console.log('📊 品質レポートを生成します...\n');
    generateReport()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('エラー:', error);
        process.exit(1);
      });
    break;

  case 'autofix':
    console.log('🔧 自動修正を開始します...\n');
    autoFixMetadata()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('エラー:', error);
        process.exit(1);
      });
    break;

  case 'all':
    (async () => {
      try {
        console.log('\n📊 === 総合メンテナンス開始 ===\n');
        console.log('ステップ1: 品質レポート生成（問題検出）\n');
        await generateReport();
        console.log('\n' + '='.repeat(60));
        console.log('\nステップ2: 自動修復実行\n');
        await autoFixMetadata();
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ === 総合メンテナンス完了 ===\n');
      } catch (error) {
        console.error('❌ 総合メンテナンス中にエラーが発生:', error.message);
        process.exit(1);
      }
    })();
    break;

  default:
    console.log(`
📋 toyamablog メンテナンススクリプト

使い方:
  node scripts/maintenance.cjs <command>

コマンド:
  report   - 全記事の品質問題を検出・レポート
  autofix  - 自動修正可能な問題を修正
  all      - report + autofix を順次実行

例:
  node scripts/maintenance.cjs report
  node scripts/maintenance.cjs autofix
  node scripts/maintenance.cjs all

注意:
  - SANITY_API_TOKEN 環境変数が必要です
  - autofix コマンドは書き込み権限が必要です
`);
    break;
}

module.exports = {
  generateReport,
  autoFixMetadata,
  blocksToPlainText,
  extractLocationFromTitle,
  generateExcerpt,
  generateMetaDescription,
  optimizeTags
};
