import { getAllPostsForAnalysis, type Post } from '../src/lib/sanity';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ContentAnalysis {
  post: Post;
  contentScore: number;
  issues: string[];
  recommendations: string[];
  hasContent: boolean;
  textLength: number;
  blockCount: number;
}

interface AnalysisReport {
  totalPosts: number;
  emptyContentPosts: ContentAnalysis[];
  lowContentPosts: ContentAnalysis[];
  mediumContentPosts: ContentAnalysis[];
  richContentPosts: ContentAnalysis[];
  summary: {
    emptyCount: number;
    lowCount: number;
    mediumCount: number;
    richCount: number;
    needsMaintenanceCount: number;
  };
}

function analyzeTextContent(text: string | undefined | null): {
  length: number;
  words: number;
  meaningfulContent: boolean;
} {
  if (!text) {
    return { length: 0, words: 0, meaningfulContent: false };
  }
  
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const meaningfulContent = cleanText.length > 50 && words.length > 10;
  
  return {
    length: cleanText.length,
    words: words.length,
    meaningfulContent
  };
}

function analyzeBody(body: any): {
  blockCount: number;
  textContent: string;
  hasImages: boolean;
  hasYoutube: boolean;
  hasHtml: boolean;
  textLength: number;
} {
  if (!body || !Array.isArray(body)) {
    return {
      blockCount: 0,
      textContent: '',
      hasImages: false,
      hasYoutube: false,
      hasHtml: false,
      textLength: 0
    };
  }

  let textContent = '';
  let hasImages = false;
  let hasYoutube = false;
  let hasHtml = false;

  for (const block of body) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child._type === 'span' && child.text) {
          textContent += child.text + ' ';
        }
      }
    } else if (block._type === 'image') {
      hasImages = true;
    } else if (block._type === 'youtube') {
      hasYoutube = true;
    } else if (block._type === 'html' || block._type === 'googleMaps') {
      hasHtml = true;
    }
  }

  return {
    blockCount: body.length,
    textContent: textContent.trim(),
    hasImages,
    hasYoutube,
    hasHtml,
    textLength: textContent.trim().length
  };
}

function calculateContentScore(post: Post): ContentAnalysis {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // bodyの分析
  const bodyAnalysis = analyzeBody(post.body);
  const hasContent = bodyAnalysis.textLength > 0 || bodyAnalysis.hasImages || bodyAnalysis.hasYoutube || bodyAnalysis.hasHtml;
  
  // タイトルの評価
  if (!post.title || post.title.trim().length === 0) {
    issues.push('タイトルが空です');
    score -= 20;
  } else if (post.title.trim().length < 10) {
    issues.push('タイトルが短すぎます（10文字未満）');
    score -= 5;
  } else {
    score += 10;
  }

  // 本文の評価
  if (bodyAnalysis.textLength === 0) {
    if (!bodyAnalysis.hasImages && !bodyAnalysis.hasYoutube && !bodyAnalysis.hasHtml) {
      issues.push('本文が完全に空です');
      score -= 50;
      recommendations.push('本文コンテンツを追加してください');
    } else {
      issues.push('テキスト内容がありませんが、メディアコンテンツがあります');
      score -= 20;
      recommendations.push('テキストでの説明を追加することをお勧めします');
    }
  } else if (bodyAnalysis.textLength < 100) {
    issues.push(`本文が非常に短いです（${bodyAnalysis.textLength}文字）`);
    score -= 30;
    recommendations.push('最低200文字以上の内容を追加してください');
  } else if (bodyAnalysis.textLength < 300) {
    issues.push(`本文が短いです（${bodyAnalysis.textLength}文字）`);
    score -= 10;
    recommendations.push('より詳細な内容を追加してください（500文字以上推奨）');
  } else if (bodyAnalysis.textLength < 500) {
    score += 20;
  } else if (bodyAnalysis.textLength < 1000) {
    score += 40;
  } else {
    score += 50;
  }

  // メディアコンテンツの評価
  if (bodyAnalysis.hasImages) score += 10;
  if (bodyAnalysis.hasYoutube) score += 15;
  if (bodyAnalysis.hasHtml) score += 5;

  // 説明文の評価
  const descriptionAnalysis = analyzeTextContent(post.description);
  if (!descriptionAnalysis.meaningfulContent) {
    issues.push('説明文が不十分または空です');
    score -= 10;
    recommendations.push('SEO効果を高めるため、適切な説明文を追加してください');
  } else {
    score += 10;
  }

  // excerpt（抜粋）の評価
  const excerptAnalysis = analyzeTextContent(post.excerpt);
  if (!excerptAnalysis.meaningfulContent && !descriptionAnalysis.meaningfulContent) {
    issues.push('抜粋と説明の両方が不十分です');
    recommendations.push('記事の概要を分かりやすく記述してください');
  }

  // カテゴリの評価
  if (!post.category || post.category.trim().length === 0) {
    issues.push('カテゴリが設定されていません');
    score -= 5;
    recommendations.push('適切なカテゴリを設定してください');
  }

  // タグの評価
  if (!post.tags || post.tags.length === 0) {
    issues.push('タグが設定されていません');
    recommendations.push('検索性向上のためタグを設定してください');
  }

  // 公開日の評価
  if (!post.publishedAt) {
    issues.push('公開日が設定されていません');
    score -= 5;
  }

  // 最終スコアの正規化（0-100）
  score = Math.max(0, Math.min(100, score + 50));

  return {
    post,
    contentScore: score,
    issues,
    recommendations,
    hasContent,
    textLength: bodyAnalysis.textLength,
    blockCount: bodyAnalysis.blockCount
  };
}

function categorizeByContentLevel(analyses: ContentAnalysis[]): AnalysisReport {
  const emptyContentPosts: ContentAnalysis[] = [];
  const lowContentPosts: ContentAnalysis[] = [];
  const mediumContentPosts: ContentAnalysis[] = [];
  const richContentPosts: ContentAnalysis[] = [];

  for (const analysis of analyses) {
    if (analysis.contentScore < 20 || !analysis.hasContent) {
      emptyContentPosts.push(analysis);
    } else if (analysis.contentScore < 40) {
      lowContentPosts.push(analysis);
    } else if (analysis.contentScore < 70) {
      mediumContentPosts.push(analysis);
    } else {
      richContentPosts.push(analysis);
    }
  }

  const needsMaintenanceCount = emptyContentPosts.length + lowContentPosts.length;

  return {
    totalPosts: analyses.length,
    emptyContentPosts: emptyContentPosts.sort((a, b) => a.contentScore - b.contentScore),
    lowContentPosts: lowContentPosts.sort((a, b) => a.contentScore - b.contentScore),
    mediumContentPosts: mediumContentPosts.sort((a, b) => a.contentScore - b.contentScore),
    richContentPosts: richContentPosts.sort((a, b) => b.contentScore - a.contentScore),
    summary: {
      emptyCount: emptyContentPosts.length,
      lowCount: lowContentPosts.length,
      mediumCount: mediumContentPosts.length,
      richCount: richContentPosts.length,
      needsMaintenanceCount
    }
  };
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('ja-JP');
  } catch {
    return dateString || '不明';
  }
}

function generateReport(report: AnalysisReport): string {
  const { summary } = report;
  const maintenanceRate = ((summary.needsMaintenanceCount / report.totalPosts) * 100).toFixed(1);

  let output = '';
  
  output += '# Sanity CMS 記事コンテンツ分析レポート\n\n';
  output += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
  
  output += '## 📊 分析結果サマリー\n\n';
  output += `- **総記事数**: ${report.totalPosts}件\n`;
  output += `- **メンテナンス要記事**: ${summary.needsMaintenanceCount}件 (${maintenanceRate}%)\n`;
  output += `- **空または極少記事**: ${summary.emptyCount}件\n`;
  output += `- **コンテンツ不足記事**: ${summary.lowCount}件\n`;
  output += `- **標準的記事**: ${summary.mediumCount}件\n`;
  output += `- **充実記事**: ${summary.richCount}件\n\n`;
  
  // 優先度の高い問題記事を表示
  output += '## ⚠️ 緊急対応が必要な記事（空または極少コンテンツ）\n\n';
  if (report.emptyContentPosts.length === 0) {
    output += '該当する記事はありません。\n\n';
  } else {
    output += `${report.emptyContentPosts.length}件の記事が緊急対応を必要としています。\n\n`;
    report.emptyContentPosts.slice(0, 10).forEach((analysis, index) => {
      output += `### ${index + 1}. ${analysis.post.title}\n`;
      output += `- **スラッグ**: ${analysis.post.slug?.current || 'なし'}\n`;
      output += `- **カテゴリ**: ${analysis.post.category || 'なし'}\n`;
      output += `- **公開日**: ${analysis.post.publishedAt ? formatDate(analysis.post.publishedAt) : '未設定'}\n`;
      output += `- **コンテンツスコア**: ${analysis.contentScore}/100\n`;
      output += `- **本文文字数**: ${analysis.textLength}文字\n`;
      output += `- **ブロック数**: ${analysis.blockCount}\n`;
      
      if (analysis.issues.length > 0) {
        output += '- **問題点**:\n';
        analysis.issues.forEach(issue => {
          output += `  - ${issue}\n`;
        });
      }
      
      if (analysis.recommendations.length > 0) {
        output += '- **推奨対応**:\n';
        analysis.recommendations.forEach(rec => {
          output += `  - ${rec}\n`;
        });
      }
      output += '\n';
    });
    
    if (report.emptyContentPosts.length > 10) {
      output += `... 他${report.emptyContentPosts.length - 10}件\n\n`;
    }
  }
  
  // コンテンツ不足記事
  output += '## 🔧 改善推奨記事（コンテンツ不足）\n\n';
  if (report.lowContentPosts.length === 0) {
    output += '該当する記事はありません。\n\n';
  } else {
    output += `${report.lowContentPosts.length}件の記事が改善を推奨されています。\n\n`;
    report.lowContentPosts.slice(0, 10).forEach((analysis, index) => {
      output += `### ${index + 1}. ${analysis.post.title}\n`;
      output += `- **スラッグ**: ${analysis.post.slug?.current || 'なし'}\n`;
      output += `- **カテゴリ**: ${analysis.post.category || 'なし'}\n`;
      output += `- **公開日**: ${analysis.post.publishedAt ? formatDate(analysis.post.publishedAt) : '未設定'}\n`;
      output += `- **コンテンツスコア**: ${analysis.contentScore}/100\n`;
      output += `- **本文文字数**: ${analysis.textLength}文字\n`;
      
      if (analysis.issues.length > 0) {
        output += '- **主な問題点**: ' + analysis.issues.slice(0, 2).join('、') + '\n';
      }
      
      if (analysis.recommendations.length > 0) {
        output += '- **推奨対応**: ' + analysis.recommendations.slice(0, 2).join('、') + '\n';
      }
      output += '\n';
    });
    
    if (report.lowContentPosts.length > 10) {
      output += `... 他${report.lowContentPosts.length - 10}件\n\n`;
    }
  }
  
  // 統計情報
  output += '## 📈 詳細統計\n\n';
  output += '### コンテンツスコア分布\n';
  const scoreDistribution = [
    { range: '0-19 (緊急)', count: report.emptyContentPosts.length },
    { range: '20-39 (要改善)', count: report.lowContentPosts.length },
    { range: '40-69 (標準)', count: report.mediumContentPosts.length },
    { range: '70-100 (優良)', count: report.richContentPosts.length }
  ];
  
  scoreDistribution.forEach(dist => {
    const percentage = ((dist.count / report.totalPosts) * 100).toFixed(1);
    output += `- **${dist.range}**: ${dist.count}件 (${percentage}%)\n`;
  });
  
  output += '\n### カテゴリ別問題記事数\n';
  const categoryProblems: { [key: string]: number } = {};
  [...report.emptyContentPosts, ...report.lowContentPosts].forEach(analysis => {
    const category = analysis.post.category || '未設定';
    categoryProblems[category] = (categoryProblems[category] || 0) + 1;
  });
  
  Object.entries(categoryProblems)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      output += `- **${category}**: ${count}件\n`;
    });
  
  output += '\n## 💡 総合的な推奨事項\n\n';
  
  if (summary.needsMaintenanceCount > 0) {
    output += `1. **優先対応**: ${summary.emptyCount}件の空コンテンツ記事の対応を最優先で行ってください。\n`;
    output += `2. **段階的改善**: ${summary.lowCount}件のコンテンツ不足記事を段階的に改善してください。\n`;
  }
  
  output += '3. **コンテンツ品質基準**:\n';
  output += '   - 本文は最低200文字、推奨500文字以上\n';
  output += '   - 適切なカテゴリ設定\n';
  output += '   - SEO効果を考慮した説明文\n';
  output += '   - 関連するタグの設定\n';
  output += '4. **メディア活用**: 画像やYouTube動画の追加でユーザーエンゲージメントを向上\n';
  output += '5. **定期的な見直し**: 月次でコンテンツ品質の見直しを実施\n\n';
  
  output += '---\n';
  output += '*このレポートは自動生成されました。詳細な確認は各記事の編集画面で行ってください。*\n';
  
  return output;
}

async function main() {
  console.log('🔍 記事コンテンツの分析を開始します...');
  
  try {
    // 全記事を取得
    const posts = await getAllPostsForAnalysis();
    
    if (posts.length === 0) {
      console.log('❌ 記事が見つかりませんでした。');
      return;
    }
    
    console.log(`✅ ${posts.length}件の記事を取得しました。`);
    
    // デバッグ情報：最初の5件の記事のデータ構造を確認
    console.log('\n📋 デバッグ: 最初の5件の記事サンプル');
    posts.slice(0, 5).forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   - body: ${post.body ? 'あり' : 'なし'} (タイプ: ${typeof post.body})`);
      console.log(`   - bodyLength: ${(post as any).bodyLength || 'N/A'}`);
      console.log(`   - bodyPlainText: ${((post as any).bodyPlainText || '').substring(0, 100)}...`);
      console.log(`   - description: ${post.description || 'なし'}`);
      console.log(`   - excerpt: ${post.excerpt || 'なし'}`);
    });
    
    console.log('\n📊 内容の分析中...');
    
    // 各記事を分析
    const analyses = posts.map(calculateContentScore);
    
    // 詳細な分析結果のデバッグ出力
    console.log('\n📊 スコア分布:');
    const scoreDistribution: { [key: string]: number } = {};
    analyses.forEach(analysis => {
      const scoreRange = Math.floor(analysis.contentScore / 10) * 10;
      const key = `${scoreRange}-${scoreRange + 9}`;
      scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
    });
    
    Object.entries(scoreDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([range, count]) => {
        console.log(`   ${range}: ${count}件`);
      });
    
    // レポートの生成
    const report = categorizeByContentLevel(analyses);
    const reportText = generateReport(report);
    
    console.log('\n' + '='.repeat(60));
    console.log(reportText);
    console.log('='.repeat(60));
    
    // ファイルに出力（オプション）
    const outputDir = join(__dirname, '../reports');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = join(outputDir, `content-analysis-${timestamp}.md`);
    
    writeFileSync(outputPath, reportText, 'utf8');
    console.log(`\n📄 レポートが保存されました: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}