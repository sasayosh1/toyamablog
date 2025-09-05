import { getAllPostsForAnalysis, type Post } from '../src/lib/sanity';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ImprovementCandidate {
  post: Post;
  issues: string[];
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  details: {
    textLength: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasExcerpt: boolean;
    excerptLength: number;
    hasCategory: boolean;
    hasTags: boolean;
    tagCount: number;
    hasYoutubeUrl: boolean;
  };
}

function analyzePostForImprovement(post: Post): ImprovementCandidate | null {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let priority: 'high' | 'medium' | 'low' = 'low';

  // 本文の分析
  let textContent = '';
  let textLength = 0;
  
  if (post.body && Array.isArray(post.body)) {
    for (const block of post.body) {
      if (block._type === 'block' && block.children) {
        for (const child of block.children) {
          if (child._type === 'span' && child.text) {
            textContent += child.text + ' ';
          }
        }
      }
    }
    textLength = textContent.trim().length;
  }

  // 説明文の分析
  const hasDescription = !!(post.description && post.description.trim().length > 0);
  const descriptionLength = post.description ? post.description.trim().length : 0;
  
  if (!hasDescription) {
    issues.push('説明文が設定されていません');
    recommendations.push('SEO効果向上のため、50文字以上の説明文を追加してください');
    if (priority === 'low') priority = 'medium';
  } else if (descriptionLength < 30) {
    issues.push(`説明文が短すぎます（${descriptionLength}文字）`);
    recommendations.push('説明文を50文字以上に拡充してください');
    if (priority === 'low') priority = 'medium';
  }

  // 抜粋の分析
  const hasExcerpt = !!(post.excerpt && post.excerpt.trim().length > 0);
  const excerptLength = post.excerpt ? post.excerpt.trim().length : 0;
  
  if (!hasExcerpt) {
    issues.push('抜粋（excerpt）が設定されていません');
    recommendations.push('記事の概要を示す抜粋を追加してください');
  } else if (excerptLength < 50) {
    issues.push(`抜粋が短すぎます（${excerptLength}文字）`);
    recommendations.push('抜粋をより詳細に記述してください（100文字以上推奨）');
  }

  // カテゴリの分析
  const hasCategory = !!(post.category && post.category.trim().length > 0);
  if (!hasCategory) {
    issues.push('カテゴリが設定されていません');
    recommendations.push('適切なカテゴリを設定してください');
    if (priority === 'low') priority = 'medium';
  }

  // タグの分析
  const hasTags = !!(post.tags && post.tags.length > 0);
  const tagCount = post.tags ? post.tags.length : 0;
  
  if (!hasTags) {
    issues.push('タグが設定されていません');
    recommendations.push('検索性向上のため、関連するタグを3個以上設定してください');
  } else if (tagCount < 3) {
    issues.push(`タグが少なすぎます（${tagCount}個）`);
    recommendations.push('タグを3個以上に増やしてください');
  }

  // YouTubeURLの分析
  const hasYoutubeUrl = !!(post.youtubeUrl && post.youtubeUrl.trim().length > 0);

  // 本文長の分析
  if (textLength < 500) {
    issues.push(`本文が短めです（${textLength}文字）`);
    recommendations.push('より詳細な内容を追加して500文字以上にすることを推奨します');
  }

  // 優先度の最終判定
  if (issues.length === 0) {
    return null; // 問題がない場合は候補に含めない
  }

  if (!hasDescription || !hasCategory) {
    priority = 'high';
  } else if (issues.length >= 3) {
    priority = 'medium';
  }

  return {
    post,
    issues,
    priority,
    recommendations,
    details: {
      textLength,
      hasDescription,
      descriptionLength,
      hasExcerpt,
      excerptLength,
      hasCategory,
      hasTags,
      tagCount,
      hasYoutubeUrl
    }
  };
}

function generateImprovementReport(candidates: ImprovementCandidate[]): string {
  const highPriority = candidates.filter(c => c.priority === 'high');
  const mediumPriority = candidates.filter(c => c.priority === 'medium');
  const lowPriority = candidates.filter(c => c.priority === 'low');

  let report = '';
  
  report += '# Sanity記事改善候補リスト\n\n';
  report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
  
  report += '## 📊 改善候補サマリー\n\n';
  report += `- **総改善候補数**: ${candidates.length}件\n`;
  report += `- **高優先度**: ${highPriority.length}件\n`;
  report += `- **中優先度**: ${mediumPriority.length}件\n`;
  report += `- **低優先度**: ${lowPriority.length}件\n\n`;

  // 問題タイプ別統計
  const issueTypes: { [key: string]: number } = {};
  candidates.forEach(candidate => {
    candidate.issues.forEach(issue => {
      const issueType = issue.split('（')[0]; // 文字数情報を除いたタイプ
      issueTypes[issueType] = (issueTypes[issueType] || 0) + 1;
    });
  });

  report += '### 問題タイプ別統計\n';
  Object.entries(issueTypes)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      report += `- **${type}**: ${count}件\n`;
    });
  report += '\n';

  // 高優先度記事
  if (highPriority.length > 0) {
    report += '## 🚨 高優先度改善記事\n\n';
    report += '以下の記事は基本的なメタデータが不足しており、優先的な対応が必要です：\n\n';
    
    highPriority.forEach((candidate, index) => {
      report += `### ${index + 1}. ${candidate.post.title}\n`;
      report += `- **スラッグ**: ${candidate.post.slug?.current || 'なし'}\n`;
      report += `- **カテゴリ**: ${candidate.post.category || '未設定'}\n`;
      report += `- **公開日**: ${candidate.post.publishedAt ? new Date(candidate.post.publishedAt).toLocaleDateString('ja-JP') : '未設定'}\n`;
      report += `- **本文文字数**: ${candidate.details.textLength}文字\n`;
      report += `- **YouTube URL**: ${candidate.details.hasYoutubeUrl ? 'あり' : 'なし'}\n`;
      
      report += '- **問題点**:\n';
      candidate.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
      
      report += '- **推奨対応**:\n';
      candidate.recommendations.forEach(rec => {
        report += `  - ${rec}\n`;
      });
      
      report += `- **編集URL**: \`/studio/intent/edit/id=${candidate.post._id};type=post\`\n\n`;
    });
  }

  // 中優先度記事
  if (mediumPriority.length > 0) {
    report += '## ⚠️ 中優先度改善記事\n\n';
    report += '以下の記事は複数の改善点があり、品質向上のため対応を推奨します：\n\n';
    
    mediumPriority.slice(0, 10).forEach((candidate, index) => {
      report += `### ${index + 1}. ${candidate.post.title}\n`;
      report += `- **カテゴリ**: ${candidate.post.category || '未設定'}\n`;
      report += `- **本文文字数**: ${candidate.details.textLength}文字\n`;
      report += `- **説明文**: ${candidate.details.hasDescription ? `${candidate.details.descriptionLength}文字` : 'なし'}\n`;
      report += `- **タグ数**: ${candidate.details.tagCount}個\n`;
      
      report += `- **主要問題**: ${candidate.issues.slice(0, 3).join('、')}\n`;
      report += `- **編集URL**: \`/studio/intent/edit/id=${candidate.post._id};type=post\`\n\n`;
    });

    if (mediumPriority.length > 10) {
      report += `... 他${mediumPriority.length - 10}件の中優先度記事があります\n\n`;
    }
  }

  // 低優先度記事（概要のみ）
  if (lowPriority.length > 0) {
    report += '## 📝 低優先度改善記事\n\n';
    report += `${lowPriority.length}件の記事で軽微な改善余地があります。主な改善点：\n\n`;
    
    const lowPriorityIssues: { [key: string]: number } = {};
    lowPriority.forEach(candidate => {
      candidate.issues.forEach(issue => {
        const issueType = issue.split('（')[0];
        lowPriorityIssues[issueType] = (lowPriorityIssues[issueType] || 0) + 1;
      });
    });

    Object.entries(lowPriorityIssues)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        report += `- **${type}**: ${count}件\n`;
      });
    report += '\n';
  }

  // カテゴリ別改善状況
  report += '## 📈 カテゴリ別改善状況\n\n';
  const categoryImprovement: { [key: string]: { total: number; needsImprovement: number; highPriority: number } } = {};
  
  candidates.forEach(candidate => {
    const category = candidate.post.category || '未分類';
    if (!categoryImprovement[category]) {
      categoryImprovement[category] = { total: 0, needsImprovement: 0, highPriority: 0 };
    }
    categoryImprovement[category].needsImprovement++;
    if (candidate.priority === 'high') {
      categoryImprovement[category].highPriority++;
    }
  });

  // 全記事数をカテゴリ別に取得（簡易計算）
  const allCategoryTotals: { [key: string]: number } = {};
  candidates.forEach(candidate => {
    const category = candidate.post.category || '未分類';
    allCategoryTotals[category] = (allCategoryTotals[category] || 0) + 1;
  });

  Object.entries(categoryImprovement)
    .sort(([, a], [, b]) => b.needsImprovement - a.needsImprovement)
    .forEach(([category, data]) => {
      const improvementRate = ((data.needsImprovement / (allCategoryTotals[category] || data.needsImprovement)) * 100).toFixed(1);
      report += `- **${category}**: 改善候補${data.needsImprovement}件（高優先度${data.highPriority}件）\n`;
    });

  // アクションプラン
  report += '\n## 🎯 具体的アクションプラン\n\n';
  report += '### Phase 1: 高優先度対応（1-2週間）\n';
  if (highPriority.length > 0) {
    report += '1. 説明文が未設定の記事に50文字以上の説明文を追加\n';
    report += '2. カテゴリが未設定の記事に適切なカテゴリを設定\n';
    report += '3. 基本的なメタデータの整備\n\n';
  } else {
    report += '高優先度の問題はありません。\n\n';
  }

  report += '### Phase 2: 中優先度対応（2-4週間）\n';
  if (mediumPriority.length > 0) {
    report += '1. タグ数を3個以上に増加\n';
    report += '2. 抜粋内容の充実化\n';
    report += '3. 短い説明文の拡充\n\n';
  } else {
    report += '中優先度の問題は限定的です。\n\n';
  }

  report += '### Phase 3: 継続的改善（月次メンテナンス）\n';
  report += '1. 本文が短い記事の内容拡充\n';
  report += '2. 画像やメディアコンテンツの追加\n';
  report += '3. SEO効果の測定と改善\n\n';

  report += '---\n';
  report += '*このレポートは改善候補の特定を目的として自動生成されました。実際の改善作業はSanity Studioの編集画面で行ってください。*\n';

  return report;
}

async function main() {
  console.log('🔍 記事改善候補の特定を開始します...');
  
  try {
    const posts = await getAllPostsForAnalysis();
    
    if (posts.length === 0) {
      console.log('❌ 記事が見つかりませんでした。');
      return;
    }
    
    console.log(`✅ ${posts.length}件の記事を分析します。`);
    
    // 改善候補の特定
    const candidates: ImprovementCandidate[] = [];
    
    for (const post of posts) {
      const candidate = analyzePostForImprovement(post);
      if (candidate) {
        candidates.push(candidate);
      }
    }
    
    console.log(`\n📊 改善候補の分析結果:`);
    
    const highPriority = candidates.filter(c => c.priority === 'high');
    const mediumPriority = candidates.filter(c => c.priority === 'medium');
    const lowPriority = candidates.filter(c => c.priority === 'low');
    
    console.log(`   🚨 高優先度: ${highPriority.length}件`);
    console.log(`   ⚠️ 中優先度: ${mediumPriority.length}件`);
    console.log(`   📝 低優先度: ${lowPriority.length}件`);
    console.log(`   ✅ 問題なし: ${posts.length - candidates.length}件`);
    
    if (candidates.length === 0) {
      console.log('\n🎉 すべての記事が良好な状態です！');
      return;
    }
    
    // 最も問題のある記事を表示
    if (highPriority.length > 0) {
      console.log('\n🚨 最も改善が必要な記事:');
      highPriority.slice(0, 5).forEach((candidate, index) => {
        console.log(`   ${index + 1}. "${candidate.post.title}"`);
        console.log(`      主要問題: ${candidate.issues.slice(0, 2).join('、')}`);
      });
    }
    
    const report = generateImprovementReport(candidates);
    
    console.log('\n' + '='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    
    // レポートをファイルに保存
    const outputDir = join(__dirname, '../reports');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = join(outputDir, `improvement-candidates-${timestamp}.md`);
    
    writeFileSync(outputPath, report, 'utf8');
    console.log(`\n📄 改善候補リストが保存されました: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}