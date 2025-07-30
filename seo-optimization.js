import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// SEO/LLMO/AIO最適化のためのタグ生成
function generateOptimizedTags(title, category) {
  const tags = new Set();
  
  // 基本タグ（必須）
  tags.add('富山');
  tags.add('富山県');
  tags.add('TOYAMA');
  tags.add('#shorts');
  tags.add('YouTube Shorts');
  
  // 地域タグ
  const regionMatch = title.match(/【([^】]+)】/);
  if (regionMatch) {
    const region = regionMatch[1];
    tags.add(region);
    
    // 市町村別の地域タグ
    if (region.includes('富山市')) {
      tags.add('富山市');
      tags.add('富山市観光');
      tags.add('富山市グルメ');
      tags.add('富山駅');
    } else if (region.includes('高岡市')) {
      tags.add('高岡市');
      tags.add('高岡観光');
      tags.add('雨晴海岸');
      tags.add('国宝瑞龍寺');
    } else if (region.includes('射水市')) {
      tags.add('射水市');
      tags.add('新湊');
      tags.add('海王丸');
      tags.add('太閤山ランド');
    } else if (region.includes('砺波市')) {
      tags.add('砺波市');
      tags.add('チューリップ');
      tags.add('夜高祭');
      tags.add('庄川');
    } else if (region.includes('黒部市')) {
      tags.add('黒部市');
      tags.add('宇奈月温泉');
      tags.add('黒部峡谷');
      tags.add('トロッコ電車');
    } else if (region.includes('魚津市')) {
      tags.add('魚津市');
      tags.add('ほたるいか');
      tags.add('魚津水族館');
      tags.add('蜃気楼');
    }
  }
  
  // カテゴリベースタグ
  if (category) {
    tags.add(category);
    if (category === '県東部') {
      tags.add('富山県東部');
      tags.add('立山連峰');
      tags.add('アルペンルート');
    } else if (category === '県西部') {
      tags.add('富山県西部');
      tags.add('氷見市');
      tags.add('南砺市');
      tags.add('世界遺産');
    }
  }
  
  // コンテンツベースタグ（AI検索最適化）
  const content = title.toLowerCase();
  
  // 観光・スポット関連
  if (content.includes('神社') || content.includes('寺') || content.includes('お寺')) {
    tags.add('神社仏閣');
    tags.add('パワースポット');
    tags.add('歴史');
    tags.add('文化財');
  }
  
  if (content.includes('温泉')) {
    tags.add('温泉');
    tags.add('リラクゼーション');
    tags.add('癒し');
    tags.add('宿泊');
  }
  
  if (content.includes('公園') || content.includes('庭園')) {
    tags.add('公園');
    tags.add('自然');
    tags.add('散歩');
    tags.add('レジャー');
  }
  
  if (content.includes('桜') || content.includes('花見')) {
    tags.add('桜');
    tags.add('花見');
    tags.add('春');
    tags.add('絶景');
  }
  
  if (content.includes('花火')) {
    tags.add('花火');
    tags.add('花火大会');
    tags.add('夏');
    tags.add('イベント');
  }
  
  if (content.includes('紅葉')) {
    tags.add('紅葉');
    tags.add('秋');
    tags.add('もみじ');
    tags.add('絶景');
  }
  
  if (content.includes('雪') || content.includes('冬')) {
    tags.add('雪');
    tags.add('冬');
    tags.add('雪景色');
    tags.add('ウィンタースポーツ');
  }
  
  // グルメ関連
  if (content.includes('パン') || content.includes('ケーキ') || content.includes('スイーツ')) {
    tags.add('グルメ');
    tags.add('スイーツ');
    tags.add('カフェ');
    tags.add('パン屋');
    tags.add('富山グルメ');
  }
  
  if (content.includes('寿司') || content.includes('海鮮') || content.includes('魚')) {
    tags.add('海鮮');
    tags.add('寿司');
    tags.add('富山湾');
    tags.add('新鮮');
    tags.add('グルメ');
  }
  
  if (content.includes('ラーメン') || content.includes('麺')) {
    tags.add('ラーメン');
    tags.add('麺類');
    tags.add('富山ラーメン');
    tags.add('グルメ');
  }
  
  // 文化・イベント関連
  if (content.includes('祭り') || content.includes('まつり') || content.includes('フェス')) {
    tags.add('祭り');
    tags.add('イベント');
    tags.add('伝統');
    tags.add('文化');
    tags.add('地域行事');
  }
  
  if (content.includes('博物館') || content.includes('美術館') || content.includes('資料館')) {
    tags.add('博物館');
    tags.add('美術館');
    tags.add('文化施設');
    tags.add('学習');
    tags.add('展示');
  }
  
  // 体験・アクティビティ関連
  if (content.includes('キャンプ') || content.includes('アウトドア')) {
    tags.add('キャンプ');
    tags.add('アウトドア');
    tags.add('自然体験');
    tags.add('家族連れ');
  }
  
  if (content.includes('工場見学') || content.includes('見学')) {
    tags.add('工場見学');
    tags.add('体験');
    tags.add('学習');
    tags.add('産業観光');
  }
  
  // SEO強化タグ
  tags.add('富山観光');
  tags.add('富山旅行');
  tags.add('北陸観光');
  tags.add('日本海');
  tags.add('立山黒部');
  tags.add('動画');
  tags.add('ショート動画');
  
  // LLMO/AIO対応タグ
  tags.add('富山県の観光スポット');
  tags.add('富山県でおすすめの場所');
  tags.add('富山県の名所');
  tags.add('富山県の見どころ');
  tags.add('富山県のグルメ');
  tags.add('富山県の文化');
  tags.add('富山県の自然');
  tags.add('富山県のイベント');
  
  return Array.from(tags);
}

// SEO最適化説明文生成
function generateSEODescription(title, category) {
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1] : '富山県';
  
  // タイトルから主要キーワードを抽出
  const content = title.replace(/【[^】]+】/g, '').replace(/#shorts?/gi, '').trim();
  
  const seoDescriptions = [
    `${region}の${content}をYouTube Shortsでご紹介！富山県の魅力的な観光スポットや地域情報を短時間でお楽しみいただけます。`,
    `${region}で撮影した${content}の動画です。富山県の美しい風景や文化、グルメを通じて地域の魅力をお伝えします。`,
    `${content}｜${region}の見どころを動画で紹介。富山県観光の参考にぜひご覧ください。北陸の自然と文化が楽しめます。`,
    `富山県${region}の${content}を動画でレポート。地域の魅力や観光情報、季節の見どころをYouTube Shortsでお届けします。`
  ];
  
  return seoDescriptions[Math.floor(Math.random() * seoDescriptions.length)];
}

async function optimizeAllSEO(batchSize = 15) {
  try {
    console.log('🔍 TOYAMA BLOG - SEO/LLMO/AIO最適化');
    console.log('=' * 60);
    
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
    
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    console.log('🚀 SEO最適化開始...');
    
    // バッチ処理
    for (let i = 0; i < allPosts.length; i += batchSize) {
      const batch = allPosts.slice(i, i + batchSize);
      
      console.log(`\\n--- バッチ ${Math.floor(i / batchSize) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
        try {
          const title = post.title || '';
          const category = post.category || '';
          
          // SEO最適化タグ生成
          const optimizedTags = generateOptimizedTags(title, category);
          
          // SEO最適化説明文生成
          const seoDescription = generateSEODescription(title, category);
          
          // 更新データ準備
          const updateData = {
            tags: optimizedTags,
            description: seoDescription
          };
          
          // Sanityで更新
          await client
            .patch(post._id)
            .set(updateData)
            .commit();
          
          successCount++;
          processed++;
          
          console.log(`✅ ${processed}/${allPosts.length}: ${title.substring(0, 40)}...`);
          console.log(`   タグ数: ${optimizedTags.length}個`);
          console.log(`   説明文: ${seoDescription.substring(0, 60)}...`);
          
          // APIレート制限対策
          await new Promise(resolve => setTimeout(resolve, 400));
          
        } catch (error) {
          console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
          errorCount++;
          processed++;
        }
      }
      
      // バッチ間待機
      if (i + batchSize < allPosts.length) {
        console.log('⏳ バッチ間待機 (2秒)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\\n🎉 SEO最適化完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 最適化後の統計
    const optimizedPosts = await client.fetch(`
      *[_type == "post"] {
        tags,
        description,
        category
      }
    `);
    
    // タグ統計
    const allTags = new Set();
    optimizedPosts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    console.log('\\n📊 最適化後統計:');
    console.log(`🏷️ ユニークタグ数: ${allTags.size}個`);
    console.log(`📝 平均タグ数: ${Math.round(optimizedPosts.reduce((sum, post) => sum + (post.tags?.length || 0), 0) / optimizedPosts.length)}個/記事`);
    console.log(`📄 説明文完成: ${optimizedPosts.filter(p => p.description).length}/${optimizedPosts.length}件`);
    
    // SEO要素の確認
    const seoTags = Array.from(allTags).filter(tag => 
      tag.includes('富山') || 
      tag.includes('観光') || 
      tag.includes('グルメ') ||
      tag.includes('YouTube') ||
      tag.includes('おすすめ')
    );
    
    console.log('\\n🔍 SEO重要タグサンプル:');
    seoTags.slice(0, 10).forEach(tag => console.log(`  - ${tag}`));
    
    console.log('\\n📄 最適化記事サンプル:');
    optimizedPosts.slice(0, 3).forEach((post, index) => {
      console.log(`\\n${index + 1}. タグ: ${post.tags?.slice(0, 5).join(', ')}...`);
      console.log(`   説明: ${post.description?.substring(0, 80)}...`);
    });
    
    return {
      success: successCount,
      error: errorCount,
      totalTags: allTags.size,
      avgTagsPerPost: Math.round(optimizedPosts.reduce((sum, post) => sum + (post.tags?.length || 0), 0) / optimizedPosts.length)
    };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

optimizeAllSEO(15);