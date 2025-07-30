import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 高速SEOタグ生成
function generateQuickSEOTags(title, category) {
  const tags = [];
  
  // 基本SEOタグ
  tags.push('富山', '富山県', 'TOYAMA', '#shorts', 'YouTube Shorts', '富山観光', '富山旅行', '北陸観光');
  
  // 地域タグ
  const regionMatch = title.match(/【([^】]+)】/);
  if (regionMatch) {
    const region = regionMatch[1];
    tags.push(region);
    
    // 主要都市タグ
    if (region.includes('富山市')) tags.push('富山市', '富山市観光', '富山駅');
    else if (region.includes('高岡市')) tags.push('高岡市', '高岡観光', '雨晴海岸');
    else if (region.includes('射水市')) tags.push('射水市', '新湊', '海王丸');
    else if (region.includes('砺波市')) tags.push('砺波市', 'チューリップ', '夜高祭');
    else if (region.includes('黒部市')) tags.push('黒部市', '宇奈月温泉');
    else if (region.includes('魚津市')) tags.push('魚津市', 'ほたるいか');
  }
  
  // カテゴリタグ
  if (category) tags.push(category);
  
  // コンテンツタグ
  const content = title.toLowerCase();
  if (content.includes('神社') || content.includes('寺')) tags.push('神社仏閣', 'パワースポット');
  if (content.includes('温泉')) tags.push('温泉', '癒し');
  if (content.includes('公園')) tags.push('公園', '自然');
  if (content.includes('桜')) tags.push('桜', '花見', '春');
  if (content.includes('花火')) tags.push('花火', 'イベント', '夏');
  if (content.includes('パン') || content.includes('ケーキ')) tags.push('グルメ', 'スイーツ');
  if (content.includes('祭り') || content.includes('まつり')) tags.push('祭り', 'イベント', '伝統');
  
  // LLMO/AIO対応
  tags.push('富山県の観光スポット', '富山県でおすすめの場所', '富山県の見どころ');
  
  return [...new Set(tags)]; // 重複除去
}

// 高速説明文生成
function generateQuickDescription(title, category) {
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1] : '富山県';
  const content = title.replace(/【[^】]+】/g, '').replace(/#shorts?/gi, '').trim();
  
  return `${region}の${content}をYouTube Shortsでご紹介！富山県の魅力的な観光スポットや地域情報を短時間でお楽しみいただけます。`;
}

async function quickSEOUpdate() {
  try {
    console.log('⚡ TOYAMA BLOG - 高速SEO最適化');
    console.log('=' * 50);
    
    // 残りの記事を取得（進行状況から推定）
    const remainingPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [70...203] {
        _id,
        title,
        category
      }
    `);
    
    console.log(`🔧 残り対象: ${remainingPosts.length}件`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 20件ずつバッチ処理
    for (let i = 0; i < remainingPosts.length; i += 20) {
      const batch = remainingPosts.slice(i, i + 20);
      const promises = [];
      
      for (const post of batch) {
        const tags = generateQuickSEOTags(post.title, post.category);
        const description = generateQuickDescription(post.title, post.category);
        
        const promise = client
          .patch(post._id)
          .set({ tags, description })
          .commit()
          .then(() => {
            successCount++;
            console.log(`✅ ${successCount}: ${post.title?.substring(0, 40)}... (${tags.length}タグ)`);
          })
          .catch(error => {
            errorCount++;
            console.error(`❌ ${post.title?.substring(0, 30)}...: ${error.message}`);
          });
        
        promises.push(promise);
      }
      
      await Promise.all(promises);
      
      if (i + 20 < remainingPosts.length) {
        console.log(`⏳ ${i + 20}/${remainingPosts.length} 完了、1秒待機...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n🎉 SEO最適化完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 最終統計
    const finalPosts = await client.fetch(`
      *[_type == "post"] {
        tags,
        description
      }
    `);
    
    const allTags = new Set();
    finalPosts.forEach(post => {
      if (post.tags) post.tags.forEach(tag => allTags.add(tag));
    });
    
    const avgTags = Math.round(finalPosts.reduce((sum, post) => sum + (post.tags?.length || 0), 0) / finalPosts.length);
    const withDescription = finalPosts.filter(p => p.description).length;
    
    console.log('\n📊 最終統計:');
    console.log(`🏷️ ユニークタグ数: ${allTags.size}個`);
    console.log(`📝 平均タグ数: ${avgTags}個/記事`);
    console.log(`📄 説明文完成: ${withDescription}/${finalPosts.length}件 (${Math.round(withDescription/finalPosts.length*100)}%)`);
    
    return { success: successCount, error: errorCount, totalTags: allTags.size };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

quickSEOUpdate();