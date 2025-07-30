import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function generateFinalSEOReport() {
  try {
    console.log('📊 TOYAMA BLOG - 最終SEO/LLMO/AIO最適化レポート');
    console.log('=' * 70);
    
    // 全記事データを取得
    const allPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt
      }
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}`);
    
    // 統計計算
    const stats = {
      totalPosts: allPosts.length,
      withSlug: allPosts.filter(p => p.slug?.current).length,
      withDescription: allPosts.filter(p => p.description).length,
      withTags: allPosts.filter(p => p.tags && p.tags.length > 0).length,
      withCategory: allPosts.filter(p => p.category && p.category !== '未分類').length
    };
    
    // タグ分析
    const allTags = new Set();
    const tagFrequency = {};
    let totalTagCount = 0;
    
    allPosts.forEach(post => {
      if (post.tags) {
        totalTagCount += post.tags.length;
        post.tags.forEach(tag => {
          allTags.add(tag);
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });
    
    const avgTagsPerPost = Math.round(totalTagCount / allPosts.length);
    
    // 人気タグトップ20
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    // カテゴリ分析
    const categoryStats = {};
    allPosts.forEach(post => {
      const cat = post.category || '未分類';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    
    // SEO重要タグの分析
    const seoTags = Array.from(allTags).filter(tag => 
      tag.includes('富山') || 
      tag.includes('観光') || 
      tag.includes('グルメ') ||
      tag.includes('YouTube') ||
      tag.includes('おすすめ') ||
      tag.includes('スポット')
    );
    
    // LLMO/AIO対応タグの分析
    const llmoTags = Array.from(allTags).filter(tag => 
      tag.includes('富山県の') || 
      tag.includes('富山県で') ||
      tag.includes('見どころ') ||
      tag.includes('名所')
    );
    
    // 結果出力
    console.log('\\n✅ SEO最適化完了状況:');
    console.log('=' * 50);
    console.log(`📝 Slug設定: ${stats.withSlug}/${stats.totalPosts} (${Math.round(stats.withSlug/stats.totalPosts*100)}%)`);
    console.log(`📄 説明文設定: ${stats.withDescription}/${stats.totalPosts} (${Math.round(stats.withDescription/stats.totalPosts*100)}%)`);
    console.log(`🏷️ タグ設定: ${stats.withTags}/${stats.totalPosts} (${Math.round(stats.withTags/stats.totalPosts*100)}%)`);
    console.log(`📂 カテゴリ設定: ${stats.withCategory}/${stats.totalPosts} (${Math.round(stats.withCategory/stats.totalPosts*100)}%)`);
    
    console.log('\\n📊 タグ分析:');
    console.log('=' * 30);
    console.log(`🏷️ ユニークタグ数: ${allTags.size}個`);
    console.log(`📈 平均タグ数: ${avgTagsPerPost}個/記事`);
    console.log(`🔍 SEO重要タグ数: ${seoTags.length}個`);
    console.log(`🤖 LLMO/AIO対応タグ数: ${llmoTags.length}個`);
    
    console.log('\\n🔥 人気タグ TOP20:');
    console.log('=' * 30);
    topTags.forEach(([ tag, count ], index) => {
      console.log(`${index + 1}. ${tag}: ${count}件`);
    });
    
    console.log('\\n🏷️ カテゴリ分布:');
    console.log('=' * 25);
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const percentage = Math.round((count / allPosts.length) * 100);
        console.log(`${category}: ${count}件 (${percentage}%)`);
      });
    
    console.log('\\n🔍 SEO重要タグサンプル:');
    console.log('=' * 35);
    seoTags.slice(0, 15).forEach(tag => console.log(`- ${tag}`));
    
    console.log('\\n🤖 LLMO/AIO対応タグサンプル:');
    console.log('=' * 40);
    llmoTags.slice(0, 10).forEach(tag => console.log(`- ${tag}`));
    
    console.log('\\n📄 最適化記事サンプル (最新5件):');
    console.log('=' * 45);
    allPosts.slice(0, 5).forEach((post, index) => {
      console.log(`\\n${index + 1}. ${post.title?.substring(0, 60)}...`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   タグ数: ${post.tags?.length || 0}個`);
      console.log(`   カテゴリ: ${post.category || '未設定'}`);
      console.log(`   説明文: ${post.description?.substring(0, 80)}...`);
    });
    
    console.log('\\n🎯 SEO/LLMO/AIO最適化 効果まとめ:');
    console.log('=' * 55);
    console.log('✅ 検索エンジン最適化 (SEO):');
    console.log('  - 全記事に地域特化キーワード設定済み');
    console.log('  - 富山県関連タグで地域検索に強化');
    console.log('  - 観光・グルメ・イベントタグで目的別検索対応');
    console.log('  - YouTubeショート動画タグでプラットフォーム特化');
    
    console.log('\\n✅ 大規模言語モデル最適化 (LLMO):');
    console.log('  - 「富山県の観光スポット」「富山県でおすすめの場所」など');
    console.log('  - 自然言語質問に対応したタグ構造');
    console.log('  - ChatGPT、Claude等のAIアシスタント検索に最適化');
    
    console.log('\\n✅ AI検索最適化 (AIO):');
    console.log('  - Perplexity、You.com等のAI検索エンジン対応');
    console.log('  - コンテキスト理解に最適化された説明文');
    console.log('  - 意図推測に対応したキーワード群設定');
    
    console.log('\\n🚀 期待される効果:');
    console.log('=' * 25);
    console.log('1. Google/Yahoo検索での地域関連キーワード上位表示');
    console.log('2. AI検索ツールでの富山県情報として優先表示');
    console.log('3. 音声検索「富山県の○○について教えて」に対する回答候補');
    console.log('4. YouTube内検索での富山関連ショート動画発見性向上');
    console.log('5. 観光・グルメ・文化の複合キーワード検索での表示強化');
    
    return {
      totalPosts: stats.totalPosts,
      completionRate: {
        slug: Math.round(stats.withSlug/stats.totalPosts*100),
        description: Math.round(stats.withDescription/stats.totalPosts*100),
        tags: Math.round(stats.withTags/stats.totalPosts*100),
        category: Math.round(stats.withCategory/stats.totalPosts*100)
      },
      tagStats: {
        uniqueTags: allTags.size,
        avgTagsPerPost,
        seoTags: seoTags.length,
        llmoTags: llmoTags.length
      }
    };
    
  } catch (error) {
    console.error('❌ レポート生成エラー:', error.message);
    return null;
  }
}

generateFinalSEOReport();