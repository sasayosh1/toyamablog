#!/usr/bin/env node

import { createClient } from '@sanity/client';
import fs from 'fs';

// Sanity client configuration
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published'
});

// Load affiliate programs
const AFFILIATE_PROGRAMS = [
  {
    id: 'jtb_hotel',
    label: '宿探しなら「ＪＴＢ旅館・ホテル予約」',
    keywords: ['宿泊', 'ホテル', '旅館', '温泉宿', '宿', '宿泊施設', 'リゾート', '民宿', 'ペンション'],
    priority: 1,
    category: '宿泊・ホテル関連'
  },
  {
    id: 'nippontabi_akafu',
    label: '日本旅行「赤い風船」',
    keywords: ['旅行', 'ツアー', '観光旅行', '旅', '団体旅行', 'パッケージツアー'],
    priority: 2,
    category: '旅行・ツアー関連'
  },
  {
    id: 'airtrip_plus_toyama',
    label: '富山へ行くなら【エアトリプラス】',
    keywords: ['富山', '立山', '黒部', '氷見', '高岡', '砺波', '南砺', '射水', '魚津', '滑川', '小矢部'],
    priority: 3,
    category: '富山県への旅行関連'
  },
  {
    id: 'tripadvisor',
    label: 'トリップアドバイザー',
    keywords: ['観光', '口コミ', 'レビュー', '評価', 'おすすめ', 'ランキング'],
    priority: 4,
    category: '観光・口コミ関連'
  },
  {
    id: 'sorahapi_flight',
    label: '格安航空券予約はソラハピ',
    keywords: ['航空券', '飛行機', 'フライト', '空港', 'ANA', 'JAL', 'LCC', '格安航空券'],
    priority: 5,
    category: '航空券関連'
  },
  {
    id: 'veltra_popular',
    label: 'ベルトラで人気のオプショナルツアーを探す',
    keywords: ['オプショナルツアー', '体験', 'アクティビティ', '現地ツアー', '日帰りツアー', 'ガイドツアー'],
    priority: 6,
    category: 'オプショナルツアー・体験関連'
  }
];

// 記事のbodyからテキストを抽出する関数
function extractTextFromBody(body) {
  if (!body || !Array.isArray(body)) return '';

  let text = '';

  body.forEach(block => {
    if (block._type === 'block' && block.children) {
      block.children.forEach(child => {
        if (child._type === 'span' && child.text) {
          text += child.text + ' ';
        }
      });
      text += '\n';
    }
  });

  return text;
}

// アフィリエイト適合度を分析する関数
function analyzeAffiliateFit(post) {
  const title = post.title || '';
  const description = post.description || '';
  const bodyText = extractTextFromBody(post.body);
  const category = post.category || '';

  const fullText = `${title} ${description} ${bodyText} ${category}`.toLowerCase();

  const matches = [];

  AFFILIATE_PROGRAMS.forEach(program => {
    let totalScore = 0;
    const foundKeywords = [];

    program.keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = fullText.match(regex);
      if (matches) {
        const count = matches.length;
        totalScore += count * (7 - program.priority); // 優先度が高いほどスコアを高く
        foundKeywords.push({ keyword, count });
      }
    });

    if (totalScore > 0) {
      matches.push({
        programId: program.id,
        programLabel: program.label,
        category: program.category,
        score: totalScore,
        priority: program.priority,
        foundKeywords
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}

// 挿入位置を提案する関数
function suggestInsertionPositions(body, matches) {
  if (!body || !Array.isArray(body)) return [];

  const positions = [];
  let blockIndex = 0;
  let cumulativeScore = 0;

  body.forEach((block, index) => {
    if (block._type === 'block' && block.children) {
      const blockText = block.children
        .filter(child => child._type === 'span' && child.text)
        .map(child => child.text)
        .join(' ')
        .toLowerCase();

      // このブロックでのキーワードマッチ度を計算
      let blockScore = 0;
      matches.forEach(match => {
        match.foundKeywords.forEach(({ keyword, count }) => {
          const regex = new RegExp(keyword.toLowerCase(), 'g');
          const blockMatches = blockText.match(regex);
          if (blockMatches) {
            blockScore += blockMatches.length * (7 - match.priority);
          }
        });
      });

      if (blockScore > 0 && blockText.length > 50) {
        positions.push({
          blockIndex: index,
          blockText: blockText.substring(0, 100) + '...',
          score: blockScore,
          recommendedPrograms: matches.slice(0, 2).map(m => ({
            id: m.programId,
            label: m.programLabel,
            category: m.category
          }))
        });
      }

      blockIndex++;
    }
  });

  return positions.sort((a, b) => b.score - a.score).slice(0, 5);
}

// メイン分析関数
async function analyzeArticles() {
  try {
    console.log('📊 富山県観光・グルメ記事のアフィリエイトリンク分析を開始します...\n');

    // 富山県関連の記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && (
        title match "*富山*" ||
        title match "*立山*" ||
        title match "*黒部*" ||
        title match "*氷見*" ||
        title match "*高岡*" ||
        category match "*富山*" ||
        category match "*観光*" ||
        category match "*グルメ*" ||
        category match "*旅行*"
      )] | order(publishedAt desc) [0...10] {
        _id,
        title,
        slug,
        description,
        category,
        tags,
        publishedAt,
        body,
        excerpt,
        "bodyLength": length(body),
        "bodyPlainText": array::join(body[_type == "block"].children[_type == "span"].text, " ")
      }
    `);

    console.log(`✅ ${posts.length}件の関連記事を取得しました\n`);

    const analysisResults = [];

    posts.forEach((post, index) => {
      console.log(`📝 記事 ${index + 1}: ${post.title}`);
      console.log(`   URL: /blog/${post.slug?.current || 'unknown'}`);
      console.log(`   カテゴリ: ${post.category || '未分類'}`);
      console.log(`   公開日: ${new Date(post.publishedAt).toLocaleDateString('ja-JP')}`);
      console.log(`   本文長: ${post.bodyLength || 0} ブロック\n`);

      // アフィリエイト適合度分析
      const affiliateMatches = analyzeAffiliateFit(post);

      if (affiliateMatches.length > 0) {
        console.log('   🎯 推奨アフィリエイトプログラム:');
        affiliateMatches.slice(0, 3).forEach((match, idx) => {
          console.log(`   ${idx + 1}. ${match.programLabel}`);
          console.log(`      カテゴリ: ${match.category}`);
          console.log(`      適合スコア: ${match.score}`);
          console.log(`      関連キーワード: ${match.foundKeywords.map(k => `${k.keyword}(${k.count}回)`).join(', ')}`);
        });

        // 挿入位置の提案
        const insertionPositions = suggestInsertionPositions(post.body, affiliateMatches);
        if (insertionPositions.length > 0) {
          console.log('\n   📍 推奨挿入位置:');
          insertionPositions.slice(0, 3).forEach((pos, idx) => {
            console.log(`   位置 ${idx + 1}: ブロック${pos.blockIndex} (スコア: ${pos.score})`);
            console.log(`      テキスト: ${pos.blockText}`);
            console.log(`      推奨プログラム: ${pos.recommendedPrograms.map(p => p.label).join(', ')}`);
          });
        }
      } else {
        console.log('   ❌ 適合するアフィリエイトプログラムが見つかりませんでした');
      }

      analysisResults.push({
        post: {
          id: post._id,
          title: post.title,
          slug: post.slug?.current,
          category: post.category,
          publishedAt: post.publishedAt,
          url: `/blog/${post.slug?.current || 'unknown'}`
        },
        affiliateMatches,
        insertionPositions: suggestInsertionPositions(post.body, affiliateMatches)
      });

      console.log('\n' + '='.repeat(80) + '\n');
    });

    // 結果をJSONファイルに保存
    const report = {
      generatedAt: new Date().toISOString(),
      totalArticles: posts.length,
      articlesWithAffiliateOpportunities: analysisResults.filter(r => r.affiliateMatches.length > 0).length,
      analysisResults
    };

    fs.writeFileSync('/Users/user/toyamablog/affiliate-analysis-report.json', JSON.stringify(report, null, 2));

    console.log('📋 分析結果サマリー:');
    console.log(`   総記事数: ${posts.length}`);
    console.log(`   アフィリエイト機会あり: ${report.articlesWithAffiliateOpportunities}`);
    console.log('   分析結果は affiliate-analysis-report.json に保存されました\n');

    // トップ推奨記事を表示
    const topRecommendations = analysisResults
      .filter(r => r.affiliateMatches.length > 0)
      .sort((a, b) => {
        const aMaxScore = Math.max(...a.affiliateMatches.map(m => m.score));
        const bMaxScore = Math.max(...b.affiliateMatches.map(m => m.score));
        return bMaxScore - aMaxScore;
      })
      .slice(0, 5);

    if (topRecommendations.length > 0) {
      console.log('🏆 最も有望な記事 TOP 5:');
      topRecommendations.forEach((rec, index) => {
        const topMatch = rec.affiliateMatches[0];
        console.log(`${index + 1}. ${rec.post.title}`);
        console.log(`   最適プログラム: ${topMatch.programLabel} (スコア: ${topMatch.score})`);
        console.log(`   URL: ${rec.post.url}\n`);
      });
    }

  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
  }
}

// スクリプト実行
analyzeArticles();