#!/usr/bin/env node

import { createClient } from '@sanity/client';
import fs from 'fs';

// Sanity client configuration
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // 書き込み時はCDNを無効化
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN
});

// 分析結果を読み込み
let analysisResults = [];
try {
  const reportData = JSON.parse(fs.readFileSync('/Users/user/toyamablog/affiliate-analysis-report.json', 'utf8'));
  analysisResults = reportData.analysisResults;
} catch (error) {
  console.error('❌ 分析結果ファイルが見つかりません。先にanalyze-articles-for-affiliate.jsを実行してください。');
  process.exit(1);
}

// アフィリエイトブロックを作成する関数
function createAffiliateBlock(programId, programLabel, contextText = '') {
  return {
    _type: 'block',
    _key: `affiliate-${programId}-${Date.now()}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${Date.now()}`,
        text: '',
        marks: []
      }
    ]
  };
}

// カスタムアフィリエイトブロック（MDXコンポーネント用）
function createCustomAffiliateBlock(programId, contextText = '') {
  return {
    _type: 'affiliateLink',
    _key: `affil-${programId}-${Date.now()}`,
    programId: programId,
    contextText: contextText,
    style: 'contextual' // コンテクスト型のスタイル
  };
}

// 記事にアフィリエイトリンクを挿入する関数
async function injectAffiliateLinks(postId, insertionPositions, affiliateMatches) {
  try {
    console.log(`📝 記事 ${postId} にアフィリエイトリンクを挿入中...`);

    // 現在の記事データを取得
    const post = await client.fetch(`
      *[_type == "post" && _id == $postId][0] {
        _id,
        title,
        body,
        _rev
      }
    `, { postId });

    if (!post) {
      console.log(`❌ 記事が見つかりません: ${postId}`);
      return false;
    }

    if (!post.body || !Array.isArray(post.body)) {
      console.log(`⚠️ 記事のbodyが空または無効です: ${postId}`);
      return false;
    }

    let updatedBody = [...post.body];
    let insertCount = 0;
    const maxInsertions = Math.min(3, insertionPositions.length); // 最大3個まで挿入

    // 適合度の高い挿入位置から順に処理
    const sortedPositions = insertionPositions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxInsertions);

    for (const position of sortedPositions) {
      const insertIndex = position.blockIndex + insertCount + 1; // 挿入分を考慮してインデックス調整

      if (insertIndex < updatedBody.length) {
        const recommendedProgram = position.recommendedPrograms[0];

        if (recommendedProgram) {
          // コンテキストに応じたアフィリエイトブロックを作成
          const contextText = position.blockText.substring(0, 50) + '...';

          // HTMLコメント形式でアフィリエイト情報を埋め込み
          const affiliateComment = {
            _type: 'block',
            _key: `affiliate-marker-${Date.now()}-${insertCount}`,
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: `affil-span-${Date.now()}-${insertCount}`,
                text: `<!-- AFFILIATE_INJECTION: ${recommendedProgram.id} | CONTEXT: ${contextText} | SCORE: ${position.score} -->`,
                marks: []
              }
            ]
          };

          updatedBody.splice(insertIndex, 0, affiliateComment);
          insertCount++;

          console.log(`   ✅ 挿入位置 ${insertIndex}: ${recommendedProgram.label} (スコア: ${position.score})`);
        }
      }
    }

    // ドライラン：実際の更新は行わず、結果のみ表示
    console.log(`   📊 挿入予定数: ${insertCount}/${maxInsertions}`);
    console.log(`   📄 更新後のブロック数: ${updatedBody.length} (元: ${post.body.length})`);

    return true;

  } catch (error) {
    console.error(`❌ 記事 ${postId} の処理中にエラー:`, error);
    return false;
  }
}

// 実際のSanity更新を行う関数（オプション）
async function updatePostInSanity(postId, updatedBody) {
  try {
    const result = await client
      .patch(postId)
      .set({ body: updatedBody })
      .commit();

    console.log(`✅ Sanityの記事を更新しました: ${postId}`);
    return result;
  } catch (error) {
    console.error(`❌ Sanity更新エラー:`, error);
    throw error;
  }
}

// メイン実行関数
async function implementAffiliateLinks(dryRun = true) {
  console.log('🚀 アフィリエイトリンク実装プロセスを開始します...\n');

  if (dryRun) {
    console.log('⚠️ DRY RUNモード: 実際の更新は行いません\n');
  }

  if (!process.env.SANITY_API_TOKEN && !process.env.SANITY_WRITE_TOKEN) {
    console.log('⚠️ SANITY_API_TOKENが設定されていません。読み取り専用で動作します。\n');
  }

  let successCount = 0;
  let totalProcessed = 0;

  // 適合度の高い記事から順に処理
  const sortedResults = analysisResults
    .filter(result => result.affiliateMatches.length > 0 && result.insertionPositions.length > 0)
    .sort((a, b) => {
      const aMaxScore = Math.max(...a.affiliateMatches.map(m => m.score));
      const bMaxScore = Math.max(...b.affiliateMatches.map(m => m.score));
      return bMaxScore - aMaxScore;
    });

  console.log(`📋 処理対象記事: ${sortedResults.length}件\n`);

  for (const result of sortedResults) {
    console.log(`${'='.repeat(80)}`);
    console.log(`📰 【${result.post.title}】`);
    console.log(`   URL: ${result.post.url}`);
    console.log(`   適合スコア: ${result.affiliateMatches[0].score}`);
    console.log(`   挿入位置数: ${result.insertionPositions.length}`);

    totalProcessed++;

    const success = await injectAffiliateLinks(
      result.post.id,
      result.insertionPositions,
      result.affiliateMatches
    );

    if (success) {
      successCount++;
    }

    console.log(''); // 空行
  }

  console.log(`${'='.repeat(80)}`);
  console.log('📊 実装結果サマリー:');
  console.log(`   処理済み記事: ${totalProcessed}件`);
  console.log(`   成功: ${successCount}件`);
  console.log(`   失敗: ${totalProcessed - successCount}件`);

  if (dryRun) {
    console.log('\n💡 実際に更新するには、このスクリプトをdryRun=falseで実行してください。');
    console.log('💡 また、SANITY_API_TOKENまたはSANITY_WRITE_TOKENを設定してください。');
  }

  // 実装レポートを生成
  const implementationReport = {
    generatedAt: new Date().toISOString(),
    dryRun: dryRun,
    totalProcessed: totalProcessed,
    successCount: successCount,
    failureCount: totalProcessed - successCount,
    processedArticles: sortedResults.slice(0, successCount).map(result => ({
      title: result.post.title,
      url: result.post.url,
      topAffiliateProgram: result.affiliateMatches[0].programLabel,
      score: result.affiliateMatches[0].score,
      insertionsPlanned: result.insertionPositions.length
    }))
  };

  fs.writeFileSync(
    '/Users/user/toyamablog/affiliate-implementation-report.json',
    JSON.stringify(implementationReport, null, 2)
  );

  console.log('\n📄 実装レポートを保存しました: affiliate-implementation-report.json');
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

// スクリプト実行
implementAffiliateLinks(dryRun);