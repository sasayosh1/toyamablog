import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'published'
});

// 品質チェック関数群
const qualityChecks = {
  // YouTube動画関連チェック
  checkYouTubeUrl: (article) => {
    const issues = [];
    const youtubeUrl = article.youtubeUrl;
    const title = article.title || '';
    
    // YouTubeが設定されていない
    if (!youtubeUrl) {
      // #shortsやその他動画を示唆するタイトルがある場合
      if (title.includes('#shorts') || title.includes('動画') || title.includes('ビデオ')) {
        issues.push('タイトルに動画要素があるがyoutubeUrlが未設定');
      } else {
        issues.push('youtubeUrl未設定');
      }
    } else {
      // 無効なURL形式チェック
      const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      if (!youtubeRegex.test(youtubeUrl)) {
        issues.push('無効なYouTube URL形式');
      }
    }
    
    return issues;
  },

  // サムネイル・画像関連チェック
  checkImages: (article) => {
    const issues = [];
    const mainImage = article.mainImage;
    const youtubeUrl = article.youtubeUrl;
    
    // mainImageが設定されていない
    if (!mainImage || !mainImage.asset) {
      issues.push('mainImage未設定');
    }
    
    // YouTubeがあるのにサムネイル表示されない可能性
    if (youtubeUrl && !mainImage) {
      issues.push('YouTube動画があるがサムネイル未設定');
    }
    
    return issues;
  },

  // 記事内容品質チェック
  checkContent: (article) => {
    const issues = [];
    const body = article.body || [];
    const excerpt = article.excerpt;
    const categories = article.categories || [];
    const tags = article.tags || [];
    
    // body内容の文字数をカウント
    let totalChars = 0;
    let hasH2 = false;
    let hasH3 = false;
    
    body.forEach(block => {
      if (block._type === 'block' && block.children) {
        block.children.forEach(child => {
          if (child.text) {
            totalChars += child.text.length;
          }
        });
        
        // 見出しチェック
        if (block.style === 'h2') hasH2 = true;
        if (block.style === 'h3') hasH3 = true;
      }
    });
    
    // 文字数チェック（500文字以下）
    if (totalChars < 500) {
      issues.push(`内容が極端に少ない（${totalChars}文字）`);
    }
    
    // 見出しチェック
    if (!hasH2) {
      issues.push('H2見出しなし');
    }
    if (!hasH3) {
      issues.push('H3見出しなし');
    }
    
    // excerpt未設定
    if (!excerpt) {
      issues.push('概要文（excerpt）未設定');
    }
    
    // タグが少ない（5個以下）
    if (tags.length <= 5) {
      issues.push(`タグが少ない（${tags.length}個）`);
    }
    
    // カテゴリ未設定
    if (categories.length === 0) {
      issues.push('カテゴリ未設定');
    }
    
    return { issues, totalChars, hasH2, hasH3, tagCount: tags.length, categoryCount: categories.length };
  },

  // 優先度判定
  calculatePriority: (article, youtubeIssues, imageIssues, contentAnalysis) => {
    let score = 0;
    const createdAt = new Date(article._createdAt);
    const isRecent = (Date.now() - createdAt.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30日以内
    
    // 最近作成された記事は優先度高
    if (isRecent) score += 3;
    
    // YouTube関連問題は優先度高
    if (youtubeIssues.length > 0) score += 2;
    
    // 内容が極端に少ない
    if (contentAnalysis.totalChars < 500) score += 3;
    
    // 見出し構造の問題
    if (!contentAnalysis.hasH2 || !contentAnalysis.hasH3) score += 2;
    
    // SEO関連問題
    if (contentAnalysis.issues.includes('概要文（excerpt）未設定')) score += 2;
    if (contentAnalysis.tagCount <= 3) score += 2;
    
    return score;
  }
};

async function analyzeAllArticles() {
  try {
    console.log('🔍 全記事データを取得中...');
    
    const articles = await client.fetch(`
      *[_type == "post"] | order(_createdAt desc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        youtubeUrl,
        mainImage {
          asset->,
          alt
        },
        body,
        excerpt,
        categories[]->{
          title
        },
        tags,
        "wordCount": length(body[].children[].text)
      }
    `);

    console.log(`📊 取得完了: ${articles.length}記事`);

    // 分析結果を格納する配列
    const analysisResults = [];
    
    // 各記事を分析
    articles.forEach((article, index) => {
      console.log(`📝 分析中: ${index + 1}/${articles.length} - ${article.title}`);
      
      const youtubeIssues = qualityChecks.checkYouTubeUrl(article);
      const imageIssues = qualityChecks.checkImages(article);
      const contentAnalysis = qualityChecks.checkContent(article);
      const priority = qualityChecks.calculatePriority(article, youtubeIssues, imageIssues, contentAnalysis);
      
      const allIssues = [...youtubeIssues, ...imageIssues, ...contentAnalysis.issues];
      
      if (allIssues.length > 0) {
        analysisResults.push({
          id: article._id,
          title: article.title,
          slug: article.slug?.current || 'no-slug',
          createdAt: article._createdAt,
          updatedAt: article._updatedAt,
          youtubeIssues,
          imageIssues,
          contentIssues: contentAnalysis.issues,
          totalChars: contentAnalysis.totalChars,
          hasH2: contentAnalysis.hasH2,
          hasH3: contentAnalysis.hasH3,
          tagCount: contentAnalysis.tagCount,
          categoryCount: contentAnalysis.categoryCount,
          priority,
          allIssues
        });
      }
    });

    // 優先度順にソート
    analysisResults.sort((a, b) => b.priority - a.priority);

    console.log('\n🎯 品質調査結果サマリー');
    console.log('='.repeat(50));
    console.log(`📈 総記事数: ${articles.length}`);
    console.log(`⚠️  問題のある記事数: ${analysisResults.length}`);
    console.log(`🔥 高優先度記事（スコア7以上）: ${analysisResults.filter(a => a.priority >= 7).length}`);

    // カテゴリ別集計
    console.log('\n📊 問題カテゴリ別集計:');
    const issueStats = {
      youtubeUrl未設定: 0,
      無効YouTube_URL: 0,
      mainImage未設定: 0,
      内容が少ない: 0,
      見出しなし: 0,
      excerpt未設定: 0,
      タグが少ない: 0,
      カテゴリ未設定: 0
    };

    analysisResults.forEach(result => {
      result.allIssues.forEach(issue => {
        if (issue.includes('youtubeUrl未設定')) issueStats.youtubeUrl未設定++;
        if (issue.includes('無効なYouTube URL')) issueStats.無効YouTube_URL++;
        if (issue.includes('mainImage未設定')) issueStats.mainImage未設定++;
        if (issue.includes('内容が極端に少ない')) issueStats.内容が少ない++;
        if (issue.includes('見出しなし')) issueStats.見出しなし++;
        if (issue.includes('excerpt未設定')) issueStats.excerpt未設定++;
        if (issue.includes('タグが少ない')) issueStats.タグが少ない++;
        if (issue.includes('カテゴリ未設定')) issueStats.カテゴリ未設定++;
      });
    });

    Object.entries(issueStats).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}件`);
    });

    // 高優先度記事の詳細表示
    console.log('\n🚨 優先的に改善すべき記事（上位20件）:');
    console.log('-'.repeat(80));
    analysisResults.slice(0, 20).forEach((result, index) => {
      console.log(`${index + 1}. 【優先度: ${result.priority}】${result.title}`);
      console.log(`   スラッグ: ${result.slug}`);
      console.log(`   作成日: ${result.createdAt.split('T')[0]}`);
      console.log(`   文字数: ${result.totalChars}文字`);
      console.log(`   タグ数: ${result.tagCount}個`);
      console.log(`   問題点: ${result.allIssues.join(', ')}`);
      console.log('');
    });

    // JSON形式で詳細データを出力
    const detailedReport = {
      summary: {
        totalArticles: articles.length,
        problemArticles: analysisResults.length,
        highPriorityArticles: analysisResults.filter(a => a.priority >= 7).length,
        issueStats
      },
      problemArticles: analysisResults,
      analyzedAt: new Date().toISOString()
    };

    console.log('\n📋 詳細分析データをJSONで保存中...');
    const fs = await import('fs');
    await fs.promises.writeFile(
      '/Users/user/toyamablog/quality-analysis-report.json', 
      JSON.stringify(detailedReport, null, 2),
      'utf8'
    );

    console.log('✅ 分析完了！詳細レポートが quality-analysis-report.json に保存されました。');
    
    return detailedReport;

  } catch (error) {
    console.error('❌ 分析エラー:', error);
    throw error;
  }
}

// スクリプト実行
analyzeAllArticles().catch(console.error);