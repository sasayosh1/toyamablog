import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// タグ生成ルール
function generateTags(title, category) {
  const tags = [];
  
  // 基本タグ
  tags.push('富山');
  tags.push('#shorts');
  
  // カテゴリベースタグ
  if (category) {
    tags.push(category);
  }
  
  // 地域タグ
  const regionMatch = title.match(/【([^】]+)】/);
  if (regionMatch) {
    tags.push(regionMatch[1]);
  }
  
  // 内容ベースタグ
  if (title.includes('花火')) tags.push('花火');
  if (title.includes('桜')) tags.push('桜');
  if (title.includes('温泉')) tags.push('温泉');
  if (title.includes('神社') || title.includes('寺')) tags.push('神社仏閣');
  if (title.includes('パン') || title.includes('ケーキ')) tags.push('グルメ');
  if (title.includes('公園')) tags.push('観光');
  if (title.includes('まつり') || title.includes('祭り')) tags.push('イベント');
  if (title.includes('ダム')) tags.push('ダム');
  if (title.includes('博物館') || title.includes('美術館')) tags.push('文化施設');
  
  return [...new Set(tags)]; // 重複除去
}

// 説明文生成
function generateDescription(title, category) {
  const regionMatch = title.match(/【([^】]+)】/);
  const region = regionMatch ? regionMatch[1] : '富山';
  
  const descriptions = [
    `${region}の魅力をお届けする動画です。`,
    `${region}を訪れた際の様子をショート動画でご紹介。`,
    `${region}の素敵なスポットを短時間でお楽しみください。`,
    `${region}の見どころを動画でご案内します。`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

async function completeRemainingMetadata() {
  try {
    console.log('📝 残りメタデータ完成作業');
    console.log('=' * 50);
    
    // 説明文またはタグが不足している記事を取得
    const postsNeedingMetadata = await client.fetch(`
      *[_type == "post" && (description == null || description == "" || tags == null || length(tags) < 3)] {
        _id,
        title,
        category,
        description,
        tags
      }
    `);
    
    console.log(`📊 メタデータ不足記事: ${postsNeedingMetadata.length}件`);
    
    if (postsNeedingMetadata.length === 0) {
      console.log('✅ 全記事のメタデータが完成しています');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('🚀 メタデータ完成作業開始...');
    
    // 少量ずつ処理
    for (let i = 0; i < postsNeedingMetadata.length; i++) {
      const post = postsNeedingMetadata[i];
      
      try {
        const title = post.title || '';
        const category = post.category || '';
        
        // 新しい説明文とタグを生成
        const newDescription = post.description || generateDescription(title, category);
        const newTags = post.tags && post.tags.length >= 3 ? post.tags : generateTags(title, category);
        
        // メタデータを更新
        await client
          .patch(post._id)
          .set({ 
            description: newDescription,
            tags: newTags
          })
          .commit();
        
        successCount++;
        console.log(`✅ ${i + 1}/${postsNeedingMetadata.length}: ${title.substring(0, 40)}...`);
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 メタデータ完成作業終了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 最終確認
    const finalCheck = await client.fetch(`
      *[_type == "post"] {
        "hasDescription": description != null && description != "",
        "hasTags": tags != null && length(tags) >= 3
      }
    `);
    
    const completed = finalCheck.filter(p => p.hasDescription && p.hasTags).length;
    console.log(`\n📈 最終完了率: ${completed}/${finalCheck.length} (${Math.round(completed/finalCheck.length*100)}%)`);
    
    return { success: successCount, error: errorCount, completionRate: Math.round(completed/finalCheck.length*100) };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1, completionRate: 0 };
  }
}

completeRemainingMetadata();