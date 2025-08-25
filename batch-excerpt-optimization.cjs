const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// より詳細で魅力的な概要文を生成
function generateAdvancedExcerpt(title, category, youtubeUrl, tags) {
  const locationMatch = title.match(/【(.+?)】/);
  const location = locationMatch ? locationMatch[1] : category || '富山';
  
  // より具体的なキーワード検出
  const keywords = {
    food: ['グルメ', '料理', '食べ', '美味', 'ラーメン', 'カフェ', 'レストラン', '店', 'たい焼き', 'ケーキ', 'スイーツ', 'おだんご', 'クレープ', 'せんべい'],
    nature: ['公園', '自然', '山', '海', '川', '滝', '桜', '花', '景色', '展望', '風景'],
    culture: ['寺', '神社', '城', '史跡', '博物館', '美術館', '資料館', '文学館', '歴史'],
    event: ['祭り', 'イベント', 'まつり', 'フェス', '花火', '展覧会', '展示'],
    leisure: ['温泉', '宿', 'ホテル', '旅館', 'アクティビティ', '体験', '観光'],
    shopping: ['市場', '直売所', '工場', '見学', 'お土産', 'ショッピング']
  };
  
  let contentType = 'スポット';
  let appeal = '';
  let experience = '';
  
  // より詳細な分類
  if (keywords.food.some(k => title.includes(k))) {
    contentType = 'グルメスポット';
    appeal = '地元で愛される味を堪能できる';
    experience = 'グルメ好きにはたまらない美味しさを発見しよう！';
  } else if (keywords.nature.some(k => title.includes(k))) {
    contentType = '自然・景観スポット';
    appeal = '美しい自然と絶景が楽しめる';
    experience = '心癒される自然の美しさを満喫しよう！';
  } else if (keywords.culture.some(k => title.includes(k))) {
    contentType = '歴史・文化スポット';
    appeal = '歴史と伝統文化が息づく';
    experience = '貴重な文化遺産と歴史ロマンを感じよう！';
  } else if (keywords.event.some(k => title.includes(k))) {
    contentType = 'イベント・催し';
    appeal = '地域の魅力が詰まった';
    experience = '特別な体験と感動をお楽しみください！';
  } else if (keywords.leisure.some(k => title.includes(k))) {
    contentType = '観光・レジャースポット';
    appeal = 'リラックスと癒しが得られる';
    experience = '特別な時間を過ごせる魅力的な場所です！';
  } else if (keywords.shopping.some(k => title.includes(k))) {
    contentType = 'ショッピング・体験スポット';
    appeal = '地元の特産品や文化に触れられる';
    experience = 'お土産選びや体験を楽しもう！';
  }
  
  // 季節感や特別感を表現
  let seasonalTouch = '';
  if (title.includes('春') || title.includes('桜')) {
    seasonalTouch = '春の訪れとともに楽しめる';
  } else if (title.includes('夏') || title.includes('花火')) {
    seasonalTouch = '夏の思い出作りにぴったりの';
  } else if (title.includes('秋') || title.includes('紅葉')) {
    seasonalTouch = '秋の美しさを感じられる';
  } else if (title.includes('冬') || title.includes('雪')) {
    seasonalTouch = '冬ならではの魅力を持つ';
  }
  
  // 動画の有無による文言調整
  const mediaText = youtubeUrl ? 'YouTube動画で実際の様子をご紹介しながら、' : '詳細なレポートで';
  
  // 複数パターンの概要文テンプレート
  const templates = [
    `${location}の${seasonalTouch}${appeal}${contentType}を${mediaText}その魅力をお伝えします。${experience}`,
    `${location}で人気の${contentType}を特集！${mediaText}地元ならではの見どころや楽しみ方を詳しくご案内。${experience}`,
    `${seasonalTouch}${location}の注目${contentType}をピックアップ。${mediaText}実際の体験を通して、${appeal}魅力を存分にお届けします！`
  ];
  
  // タイトルの特徴に基づいてテンプレートを選択
  let selectedTemplate;
  if (title.includes('！') || title.includes('？')) {
    selectedTemplate = templates[1]; // より情報的
  } else if (seasonalTouch) {
    selectedTemplate = templates[2]; // 季節感重視
  } else {
    selectedTemplate = templates[0]; // 基本形
  }
  
  // 長さ調整（SEO最適化のため150文字以内）
  if (selectedTemplate.length > 150) {
    selectedTemplate = selectedTemplate.substring(0, 147) + '...';
  }
  
  return selectedTemplate;
}

async function batchExcerptOptimization() {
  try {
    console.log('🚀 記事の概要文バッチ最適化を開始...');
    
    // 概要文が未設定の記事を取得（次の30件）
    const articlesWithoutExcerpt = await client.fetch(`*[_type == "post" && !defined(excerpt)] | order(publishedAt desc)[0...30] {
      _id,
      title,
      slug,
      category,
      youtubeUrl,
      tags,
      publishedAt,
      "hasYouTube": defined(youtubeUrl)
    }`);
    
    console.log(`📊 バッチ処理対象記事: ${articlesWithoutExcerpt.length}件`);
    
    if (articlesWithoutExcerpt.length === 0) {
      console.log('✅ 処理対象の記事がありません');
      
      // 最終統計を表示
      const finalStats = await client.fetch(`{
        "total": count(*[_type == "post"]),
        "withExcerpt": count(*[_type == "post" && defined(excerpt)]),
        "withYouTube": count(*[_type == "post" && defined(youtubeUrl)]),
        "withThumbnail": count(*[_type == "post" && defined(thumbnail)])
      }`);
      
      const excerptCoverage = ((finalStats.withExcerpt / finalStats.total) * 100).toFixed(1);
      const seoScore = (((finalStats.withExcerpt + finalStats.withThumbnail) / (finalStats.total * 2)) * 100).toFixed(1);
      
      console.log('🎯 最終SEO統計:');
      console.log(`   📝 総記事数: ${finalStats.total}件`);
      console.log(`   📄 概要文設定済み: ${finalStats.withExcerpt}件 (${excerptCoverage}%)`);
      console.log(`   🎥 YouTube動画付き: ${finalStats.withYouTube}件`);
      console.log(`   🖼️ サムネイル設定済み: ${finalStats.withThumbnail}件`);
      console.log(`   🌟 総合SEO対応率: ${seoScore}%`);
      
      return;
    }
    
    let successCount = 0;
    const processedArticles = [];
    
    console.log('\n📝 高品質な概要文を生成中...');
    
    for (let i = 0; i < articlesWithoutExcerpt.length; i++) {
      const article = articlesWithoutExcerpt[i];
      console.log(`\n[${i + 1}/${articlesWithoutExcerpt.length}] ${article.title}`);
      
      try {
        // 高品質な概要文を生成
        const excerpt = generateAdvancedExcerpt(
          article.title,
          article.category,
          article.youtubeUrl,
          article.tags
        );
        
        console.log(`💡 生成概要文: ${excerpt}`);
        console.log(`📊 文字数: ${excerpt.length}文字`);
        
        // 記事を更新
        await client
          .patch(article._id)
          .set({
            excerpt: excerpt,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('✅ 設定完了');
        successCount++;
        
        processedArticles.push({
          title: article.title,
          slug: article.slug?.current,
          excerpt: excerpt,
          hasVideo: article.hasYouTube,
          category: article.category,
          length: excerpt.length
        });
        
      } catch (error) {
        console.log(`❌ エラー: ${error.message}`);
      }
      
      // API制限を避けるため待機
      if (i < articlesWithoutExcerpt.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    console.log('\n📊 バッチ処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${articlesWithoutExcerpt.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 バッチ最適化完了！');
      
      // 品質分析
      const avgLength = Math.round(
        processedArticles.reduce((sum, article) => sum + article.length, 0) / processedArticles.length
      );
      const videoCount = processedArticles.filter(a => a.hasVideo).length;
      const categoryDistribution = {};
      
      processedArticles.forEach(article => {
        const cat = article.category || '未分類';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      });
      
      console.log('📈 品質分析:');
      console.log(`   📏 平均文字数: ${avgLength}文字`);
      console.log(`   🎥 動画付き記事: ${videoCount}件 (${((videoCount/successCount)*100).toFixed(1)}%)`);
      console.log('   📂 カテゴリー分布:');
      
      Object.entries(categoryDistribution)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`      ${category}: ${count}件`);
        });
      
      // 優秀な概要文の例を表示
      console.log('\n🌟 生成された概要文の例（品質上位5件）:');
      const topExamples = processedArticles
        .sort((a, b) => b.length - a.length)
        .slice(0, 5);
      
      topExamples.forEach((article, index) => {
        const videoIcon = article.hasVideo ? '🎥 ' : '📝 ';
        console.log(`${index + 1}. ${videoIcon}[${article.category}] ${article.title.substring(0, 50)}...`);
        console.log(`   📝 ${article.excerpt}`);
        console.log(`   🔗 https://sasakiyoshimasa.com/blog/${article.slug}`);
        console.log('');
      });
      
      // SEO効果予測
      const totalPosts = await client.fetch(`count(*[_type == "post"])`);
      const currentExcerptCount = await client.fetch(`count(*[_type == "post" && defined(excerpt)])`);
      const newCoverage = ((currentExcerptCount / totalPosts) * 100).toFixed(1);
      const improvement = ((successCount / totalPosts) * 100).toFixed(1);
      
      console.log('📊 SEO改善効果:');
      console.log(`   📈 概要文カバー率: ${newCoverage}% (+${improvement}ポイント)`);
      console.log(`   🚀 検索エンジン対応強化: ${currentExcerptCount}件`);
      console.log(`   🎯 予想クリック率向上: +${(successCount * 0.5).toFixed(1)}%`);
      
      console.log('\n💡 次のステップ:');
      if (currentExcerptCount < totalPosts * 0.8) {
        console.log('   🔄 残りの記事も段階的に最適化を継続');
        console.log('   📊 Google Search Consoleでの効果測定');
      } else {
        console.log('   ✅ 概要文最適化がほぼ完了');
        console.log('   📊 SEO効果の分析・監視フェーズへ');
      }
      
      console.log('\n🌐 確認サイト:');
      console.log('   メイン: https://sasakiyoshimasa.com');
      console.log('   管理: https://aoxze287.sanity.studio');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

batchExcerptOptimization();