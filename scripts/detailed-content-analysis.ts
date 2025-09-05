import { getAllPostsForAnalysis, type Post } from '../src/lib/sanity';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DetailedAnalysis {
  post: Post;
  textLength: number;
  wordCount: number;
  blockCount: number;
  hasDescription: boolean;
  hasExcerpt: boolean;
  hasCategory: boolean;
  hasTags: boolean;
  hasImages: boolean;
  hasYoutube: boolean;
  publishedDate: string | null;
  issues: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  detailedScore: {
    content: number;
    metadata: number;
    structure: number;
    total: number;
  };
}

function analyzeBodyContent(body: any): {
  textLength: number;
  wordCount: number;
  blockCount: number;
  hasImages: boolean;
  hasYoutube: boolean;
  textBlocks: number;
  mediaBlocks: number;
  fullTextContent: string;
} {
  if (!body || !Array.isArray(body)) {
    return {
      textLength: 0,
      wordCount: 0,
      blockCount: 0,
      hasImages: false,
      hasYoutube: false,
      textBlocks: 0,
      mediaBlocks: 0,
      fullTextContent: ''
    };
  }

  let fullTextContent = '';
  let textBlocks = 0;
  let mediaBlocks = 0;
  let hasImages = false;
  let hasYoutube = false;

  for (const block of body) {
    if (block._type === 'block' && block.children) {
      textBlocks++;
      for (const child of block.children) {
        if (child._type === 'span' && child.text) {
          fullTextContent += child.text + ' ';
        }
      }
    } else if (block._type === 'image') {
      hasImages = true;
      mediaBlocks++;
    } else if (block._type === 'youtube') {
      hasYoutube = true;
      mediaBlocks++;
    } else if (block._type === 'html' || block._type === 'googleMaps') {
      mediaBlocks++;
    }
  }

  const cleanText = fullTextContent.trim();
  const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;

  return {
    textLength: cleanText.length,
    wordCount,
    blockCount: body.length,
    hasImages,
    hasYoutube,
    textBlocks,
    mediaBlocks,
    fullTextContent: cleanText
  };
}

function performDetailedAnalysis(post: Post): DetailedAnalysis {
  const bodyAnalysis = analyzeBodyContent(post.body);
  const issues: string[] = [];
  
  // コンテンツスコア（0-40点）
  let contentScore = 0;
  
  // テキスト長による評価
  if (bodyAnalysis.textLength === 0) {
    issues.push('本文テキストが空です');
    contentScore = 0;
  } else if (bodyAnalysis.textLength < 100) {
    issues.push(`本文が非常に短いです（${bodyAnalysis.textLength}文字）`);
    contentScore = 5;
  } else if (bodyAnalysis.textLength < 200) {
    issues.push(`本文が短いです（${bodyAnalysis.textLength}文字）`);
    contentScore = 15;
  } else if (bodyAnalysis.textLength < 500) {
    contentScore = 25;
  } else if (bodyAnalysis.textLength < 1000) {
    contentScore = 30;
  } else {
    contentScore = 40;
  }

  // 語数による追加評価
  if (bodyAnalysis.wordCount < 20) {
    issues.push(`語数が少なすぎます（${bodyAnalysis.wordCount}語）`);
  }

  // メディアコンテンツの評価
  if (bodyAnalysis.hasImages) contentScore += 5;
  if (bodyAnalysis.hasYoutube) contentScore += 5;

  // メタデータスコア（0-30点）
  let metadataScore = 0;
  
  const hasDescription = !!(post.description && post.description.trim().length > 10);
  const hasExcerpt = !!(post.excerpt && post.excerpt.trim().length > 10);
  const hasCategory = !!(post.category && post.category.trim().length > 0);
  const hasTags = !!(post.tags && post.tags.length > 0);

  if (!hasDescription) issues.push('説明文がありません');
  else metadataScore += 10;

  if (!hasExcerpt) issues.push('抜粋がありません');
  else metadataScore += 8;

  if (!hasCategory) issues.push('カテゴリが設定されていません');
  else metadataScore += 7;

  if (!hasTags) issues.push('タグが設定されていません');
  else metadataScore += 5;

  // 構造スコア（0-30点）
  let structureScore = 0;
  
  // タイトルの評価
  if (!post.title || post.title.trim().length === 0) {
    issues.push('タイトルがありません');
    structureScore = 0;
  } else if (post.title.trim().length < 10) {
    issues.push('タイトルが短すぎます');
    structureScore = 5;
  } else {
    structureScore = 15;
  }

  // 公開日の評価
  const publishedDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ja-JP') : null;
  if (!post.publishedAt) {
    issues.push('公開日が設定されていません');
  } else {
    structureScore += 10;
  }

  // ブロック構造の評価
  if (bodyAnalysis.textBlocks > 0) {
    structureScore += 5;
  }

  const totalScore = Math.min(100, contentScore + metadataScore + structureScore);

  // 重大度の判定
  let severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  if (bodyAnalysis.textLength === 0 || !post.title) {
    severity = 'critical';
  } else if (bodyAnalysis.textLength < 100 || totalScore < 40) {
    severity = 'high';
  } else if (bodyAnalysis.textLength < 200 || totalScore < 60) {
    severity = 'medium';
  } else if (totalScore < 80) {
    severity = 'low';
  } else {
    severity = 'good';
  }

  return {
    post,
    textLength: bodyAnalysis.textLength,
    wordCount: bodyAnalysis.wordCount,
    blockCount: bodyAnalysis.blockCount,
    hasDescription,
    hasExcerpt,
    hasCategory,
    hasTags,
    hasImages: bodyAnalysis.hasImages,
    hasYoutube: bodyAnalysis.hasYoutube,
    publishedDate,
    issues,
    severity,
    detailedScore: {
      content: contentScore,
      metadata: metadataScore,
      structure: structureScore,
      total: totalScore
    }
  };
}

function generateDetailedReport(analyses: DetailedAnalysis[]): string {
  const criticalIssues = analyses.filter(a => a.severity === 'critical');
  const highIssues = analyses.filter(a => a.severity === 'high');
  const mediumIssues = analyses.filter(a => a.severity === 'medium');
  const lowIssues = analyses.filter(a => a.severity === 'low');
  const goodPosts = analyses.filter(a => a.severity === 'good');

  // 統計情報
  const stats = {
    totalPosts: analyses.length,
    averageTextLength: Math.round(analyses.reduce((sum, a) => sum + a.textLength, 0) / analyses.length),
    averageWordCount: Math.round(analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length),
    averageScore: Math.round(analyses.reduce((sum, a) => sum + a.detailedScore.total, 0) / analyses.length),
    postsWithoutDescription: analyses.filter(a => !a.hasDescription).length,
    postsWithoutExcerpt: analyses.filter(a => !a.hasExcerpt).length,
    postsWithoutCategory: analyses.filter(a => !a.hasCategory).length,
    postsWithoutTags: analyses.filter(a => !a.hasTags).length,
  };

  let report = '';
  
  report += '# 詳細なSanity記事コンテンツ分析レポート\n\n';
  report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
  
  report += '## 📊 総合統計\n\n';
  report += `- **総記事数**: ${stats.totalPosts}件\n`;
  report += `- **平均文字数**: ${stats.averageTextLength}文字\n`;
  report += `- **平均語数**: ${stats.averageWordCount}語\n`;
  report += `- **平均スコア**: ${stats.averageScore}/100点\n\n`;
  
  report += '### 重要度別記事数\n';
  report += `- **🚨 緊急対応要（Critical）**: ${criticalIssues.length}件\n`;
  report += `- **⚠️ 高優先度（High）**: ${highIssues.length}件\n`;
  report += `- **🔧 中優先度（Medium）**: ${mediumIssues.length}件\n`;
  report += `- **📝 低優先度（Low）**: ${lowIssues.length}件\n`;
  report += `- **✅ 良好（Good）**: ${goodPosts.length}件\n\n`;

  report += '### メタデータの欠如状況\n';
  report += `- **説明文なし**: ${stats.postsWithoutDescription}件\n`;
  report += `- **抜粋なし**: ${stats.postsWithoutExcerpt}件\n`;
  report += `- **カテゴリなし**: ${stats.postsWithoutCategory}件\n`;
  report += `- **タグなし**: ${stats.postsWithoutTags}件\n\n`;

  // 緊急対応が必要な記事
  if (criticalIssues.length > 0) {
    report += '## 🚨 緊急対応が必要な記事\n\n';
    report += `以下の${criticalIssues.length}件は基本的なコンテンツが欠如しており、即座の対応が必要です：\n\n`;
    
    criticalIssues.forEach((analysis, index) => {
      report += `### ${index + 1}. ${analysis.post.title || '[タイトルなし]'}\n`;
      report += `- **スラッグ**: ${analysis.post.slug?.current || 'なし'}\n`;
      report += `- **文字数**: ${analysis.textLength}文字\n`;
      report += `- **スコア**: ${analysis.detailedScore.total}/100点\n`;
      report += `- **問題点**:\n`;
      analysis.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
      report += '\n';
    });
  }

  // 高優先度の記事
  if (highIssues.length > 0) {
    report += '## ⚠️ 高優先度で改善が必要な記事\n\n';
    report += `以下の${highIssues.length}件は早急な改善が推奨されます：\n\n`;
    
    highIssues.slice(0, 15).forEach((analysis, index) => {
      report += `### ${index + 1}. ${analysis.post.title}\n`;
      report += `- **スラッグ**: ${analysis.post.slug?.current || 'なし'}\n`;
      report += `- **カテゴリ**: ${analysis.post.category || 'なし'}\n`;
      report += `- **公開日**: ${analysis.publishedDate || '未設定'}\n`;
      report += `- **文字数**: ${analysis.textLength}文字（${analysis.wordCount}語）\n`;
      report += `- **スコア**: ${analysis.detailedScore.total}/100点（コンテンツ:${analysis.detailedScore.content}/50、メタデータ:${analysis.detailedScore.metadata}/30、構造:${analysis.detailedScore.structure}/30）\n`;
      
      if (analysis.issues.length > 0) {
        report += `- **主要問題**: ${analysis.issues.slice(0, 3).join('、')}\n`;
      }
      report += '\n';
    });
    
    if (highIssues.length > 15) {
      report += `... 他${highIssues.length - 15}件\n\n`;
    }
  }

  // 中優先度の記事（上位10件のみ表示）
  if (mediumIssues.length > 0) {
    report += '## 🔧 中優先度で改善が推奨される記事（上位10件）\n\n';
    
    mediumIssues
      .sort((a, b) => a.detailedScore.total - b.detailedScore.total)
      .slice(0, 10)
      .forEach((analysis, index) => {
        report += `### ${index + 1}. ${analysis.post.title}\n`;
        report += `- **文字数**: ${analysis.textLength}文字\n`;
        report += `- **スコア**: ${analysis.detailedScore.total}/100点\n`;
        report += `- **主要問題**: ${analysis.issues.slice(0, 2).join('、')}\n\n`;
      });
    
    if (mediumIssues.length > 10) {
      report += `... 中優先度記事は他に${mediumIssues.length - 10}件あります\n\n`;
    }
  }

  // カテゴリ別分析
  report += '## 📈 カテゴリ別分析\n\n';
  const categoryAnalysis: { [key: string]: { total: number; avgScore: number; issues: number } } = {};
  
  analyses.forEach(analysis => {
    const category = analysis.post.category || '未分類';
    if (!categoryAnalysis[category]) {
      categoryAnalysis[category] = { total: 0, avgScore: 0, issues: 0 };
    }
    categoryAnalysis[category].total++;
    categoryAnalysis[category].avgScore += analysis.detailedScore.total;
    if (analysis.severity === 'critical' || analysis.severity === 'high') {
      categoryAnalysis[category].issues++;
    }
  });

  Object.entries(categoryAnalysis)
    .map(([category, data]) => ({
      category,
      ...data,
      avgScore: Math.round(data.avgScore / data.total),
      issueRate: ((data.issues / data.total) * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(b.issueRate) - parseFloat(a.issueRate))
    .forEach(({ category, total, avgScore, issues, issueRate }) => {
      report += `- **${category}**: ${total}件（平均${avgScore}点、問題記事${issues}件 ${issueRate}%）\n`;
    });

  // 推奨事項
  report += '\n## 💡 改善推奨事項\n\n';
  
  if (criticalIssues.length > 0) {
    report += `### 🚨 最優先事項\n`;
    report += `${criticalIssues.length}件の緊急対応要記事について、以下を実施してください：\n`;
    report += '- タイトルが未設定の記事にタイトルを追加\n';
    report += '- 本文が空の記事にコンテンツを追加\n';
    report += '- 公開日を設定\n\n';
  }

  if (highIssues.length > 0) {
    report += `### ⚠️ 高優先度事項\n`;
    report += `${highIssues.length}件の高優先度記事について：\n`;
    report += '- 100文字未満の本文を200文字以上に拡充\n';
    report += '- 説明文とexcerptを追加\n';
    report += '- 適切なカテゴリとタグを設定\n\n';
  }

  report += '### 📝 品質向上のためのガイドライン\n';
  report += '1. **最低品質基準**:\n';
  report += '   - 本文: 200文字以上（推奨500文字以上）\n';
  report += '   - 説明文: 50文字以上の具体的な内容\n';
  report += '   - カテゴリ: 必須設定\n';
  report += '   - タグ: 3個以上推奨\n\n';
  report += '2. **コンテンツ充実化**:\n';
  report += '   - 画像の追加でビジュアル向上\n';
  report += '   - YouTube動画の埋め込みでエンゲージメント向上\n';
  report += '   - 構造化された見出しの使用\n\n';
  report += '3. **SEO最適化**:\n';
  report += '   - 適切な説明文でSearch Console対策\n';
  report += '   - 関連性の高いタグ設定\n';
  report += '   - カテゴリの統一性確保\n\n';

  // 文字数分布
  report += '## 📊 文字数分布詳細\n\n';
  const lengthDistribution = {
    '0文字': analyses.filter(a => a.textLength === 0).length,
    '1-99文字': analyses.filter(a => a.textLength > 0 && a.textLength < 100).length,
    '100-199文字': analyses.filter(a => a.textLength >= 100 && a.textLength < 200).length,
    '200-499文字': analyses.filter(a => a.textLength >= 200 && a.textLength < 500).length,
    '500-999文字': analyses.filter(a => a.textLength >= 500 && a.textLength < 1000).length,
    '1000文字以上': analyses.filter(a => a.textLength >= 1000).length
  };

  Object.entries(lengthDistribution).forEach(([range, count]) => {
    const percentage = ((count / analyses.length) * 100).toFixed(1);
    report += `- **${range}**: ${count}件 (${percentage}%)\n`;
  });

  report += '\n---\n';
  report += '*このレポートは詳細分析により自動生成されました。具体的な改善は各記事の編集画面で行ってください。*\n';

  return report;
}

async function main() {
  console.log('🔍 詳細な記事コンテンツ分析を開始します...');
  
  try {
    const posts = await getAllPostsForAnalysis();
    
    if (posts.length === 0) {
      console.log('❌ 記事が見つかりませんでした。');
      return;
    }
    
    console.log(`✅ ${posts.length}件の記事を取得しました。`);
    console.log('🔍 詳細分析を実行中...');
    
    const analyses = posts.map(performDetailedAnalysis);
    
    // 分析結果のサマリー表示
    const critical = analyses.filter(a => a.severity === 'critical').length;
    const high = analyses.filter(a => a.severity === 'high').length;
    const medium = analyses.filter(a => a.severity === 'medium').length;
    const low = analyses.filter(a => a.severity === 'low').length;
    const good = analyses.filter(a => a.severity === 'good').length;
    
    console.log('\n📊 分析結果サマリー:');
    console.log(`   🚨 緊急対応要: ${critical}件`);
    console.log(`   ⚠️ 高優先度: ${high}件`);
    console.log(`   🔧 中優先度: ${medium}件`);
    console.log(`   📝 低優先度: ${low}件`);
    console.log(`   ✅ 良好: ${good}件`);
    
    // 最も問題のある記事の表示
    const worstPosts = analyses
      .filter(a => a.severity === 'critical' || a.severity === 'high')
      .sort((a, b) => a.detailedScore.total - b.detailedScore.total)
      .slice(0, 5);
    
    if (worstPosts.length > 0) {
      console.log('\n🚨 最も改善が必要な記事（上位5件）:');
      worstPosts.forEach((analysis, index) => {
        console.log(`   ${index + 1}. "${analysis.post.title}" (${analysis.textLength}文字, ${analysis.detailedScore.total}点)`);
        console.log(`      主要問題: ${analysis.issues.slice(0, 2).join('、')}`);
      });
    }
    
    const report = generateDetailedReport(analyses);
    
    console.log('\n' + '='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    
    // レポートをファイルに保存
    const outputDir = join(__dirname, '../reports');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = join(outputDir, `detailed-content-analysis-${timestamp}.md`);
    
    writeFileSync(outputPath, report, 'utf8');
    console.log(`\n📄 詳細レポートが保存されました: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}