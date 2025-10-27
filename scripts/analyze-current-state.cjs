const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

/**
 * 全記事の現状分析スクリプト
 * - カテゴリ分布
 * - 必須フィールドのチェック
 * - SEO最適化状況
 * - 文字数統計
 */

async function analyzeCurrentState() {
  console.log('\n📊 toyamablog 現状分析レポート\n');
  console.log('='.repeat(80));

  try {
    // 全記事を取得
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

    console.log(`総記事数: ${posts.length}件\n`);

    // カテゴリ分布分析
    console.log('【カテゴリ分布】\n');
    const categoryCount = {};
    const noCategoryPosts = [];

    posts.forEach(post => {
      if (!post.categories || post.categories.length === 0) {
        noCategoryPosts.push(post);
      } else {
        post.categories.forEach(cat => {
          if (cat && cat.title) {
            categoryCount[cat.title] = (categoryCount[cat.title] || 0) + 1;
          }
        });
      }
    });

    const sortedCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1]);

    sortedCategories.forEach(([category, count]) => {
      const percentage = ((count / posts.length) * 100).toFixed(1);
      console.log(`  ${category}: ${count}件 (${percentage}%)`);
    });

    if (noCategoryPosts.length > 0) {
      console.log(`  ⚠️ カテゴリなし: ${noCategoryPosts.length}件`);
    }

    // 必須フィールドチェック
    console.log('\n【必須フィールドチェック】\n');

    const noExcerpt = posts.filter(p => !p.excerpt || p.excerpt.trim() === '');
    const noMetaDescription = posts.filter(p => !p.metaDescription || p.metaDescription.trim() === '');
    const noTags = posts.filter(p => !p.tags || p.tags.length === 0);
    const fewTags = posts.filter(p => p.tags && p.tags.length < 5);
    const tooManyTags = posts.filter(p => p.tags && p.tags.length > 15);
    const noYouTube = posts.filter(p => !p.youtubeUrl);

    console.log(`  excerpt未設定: ${noExcerpt.length}件 (${((noExcerpt.length/posts.length)*100).toFixed(1)}%)`);
    console.log(`  metaDescription未設定: ${noMetaDescription.length}件 (${((noMetaDescription.length/posts.length)*100).toFixed(1)}%)`);
    console.log(`  タグなし: ${noTags.length}件 (${((noTags.length/posts.length)*100).toFixed(1)}%)`);
    console.log(`  タグ少なすぎ(<5個): ${fewTags.length}件 (${((fewTags.length/posts.length)*100).toFixed(1)}%)`);
    console.log(`  タグ多すぎ(>15個): ${tooManyTags.length}件 (${((tooManyTags.length/posts.length)*100).toFixed(1)}%)`);
    console.log(`  YouTube動画なし: ${noYouTube.length}件 (${((noYouTube.length/posts.length)*100).toFixed(1)}%)`);

    // 文字数統計
    console.log('\n【文字数統計】\n');

    const charCounts = posts.map(post => {
      if (!post.body) return 0;
      return post.body.reduce((total, block) => {
        if (block._type === 'block' && block.children) {
          return total + block.children.reduce((sum, child) => {
            return sum + (child.text ? child.text.length : 0);
          }, 0);
        }
        return total;
      }, 0);
    });

    const avgChars = Math.round(charCounts.reduce((a, b) => a + b, 0) / charCounts.length);
    const minChars = Math.min(...charCounts);
    const maxChars = Math.max(...charCounts);

    const shortArticles = charCounts.filter(c => c < 1000).length;
    const mediumArticles = charCounts.filter(c => c >= 1000 && c < 2000).length;
    const longArticles = charCounts.filter(c => c >= 2000).length;

    console.log(`  平均文字数: ${avgChars}文字`);
    console.log(`  最小文字数: ${minChars}文字`);
    console.log(`  最大文字数: ${maxChars}文字`);
    console.log(`  短い記事(<1000文字): ${shortArticles}件 (${((shortArticles/posts.length)*100).toFixed(1)}%)`);
    console.log(`  適切な記事(1000-2000文字): ${mediumArticles}件 (${((mediumArticles/posts.length)*100).toFixed(1)}%)`);
    console.log(`  長い記事(>2000文字): ${longArticles}件 (${((longArticles/posts.length)*100).toFixed(1)}%)`);

    // YouTube動画統計
    console.log('\n【YouTube動画統計】\n');
    const withYouTube = posts.filter(p => p.youtubeUrl).length;
    console.log(`  YouTube動画付き記事: ${withYouTube}件 (${((withYouTube/posts.length)*100).toFixed(1)}%)`);

    // CLAUDE.mdルール違反チェック
    console.log('\n【CLAUDE.mdルール違反チェック】\n');

    const titleIssues = posts.filter(post => {
      // 【地域名】形式でない記事
      return !post.title.match(/^【.+】/);
    });

    console.log(`  タイトル形式違反（【地域名】なし）: ${titleIssues.length}件`);
    if (titleIssues.length > 0) {
      console.log('    違反例（最初の5件）:');
      titleIssues.slice(0, 5).forEach(post => {
        console.log(`    - ${post.title}`);
      });
    }

    // カテゴリ不適切チェック（汎用カテゴリ使用）
    const genericCategories = ['グルメ', '観光', '観光スポット', 'イベント', '自然'];
    const genericCategoryPosts = posts.filter(post => {
      if (!post.categories || post.categories.length === 0) return false;
      return post.categories.some(cat =>
        cat && cat.title && genericCategories.includes(cat.title)
      );
    });

    console.log(`  汎用カテゴリ使用（地域名カテゴリ推奨）: ${genericCategoryPosts.length}件`);
    if (genericCategoryPosts.length > 0) {
      console.log('    汎用カテゴリ例（最初の5件）:');
      genericCategoryPosts.slice(0, 5).forEach(post => {
        const catNames = post.categories.map(c => c.title).join(', ');
        console.log(`    - ${post.title} (${catNames})`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ 分析完了\n');

    return {
      total: posts.length,
      categoryDistribution: sortedCategories,
      issues: {
        noExcerpt: noExcerpt.length,
        noMetaDescription: noMetaDescription.length,
        noTags: noTags.length,
        fewTags: fewTags.length,
        tooManyTags: tooManyTags.length,
        noCategory: noCategoryPosts.length,
        titleFormat: titleIssues.length,
        genericCategory: genericCategoryPosts.length,
        shortArticles: shortArticles
      }
    };

  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

analyzeCurrentState().catch(console.error);

module.exports = { analyzeCurrentState };
