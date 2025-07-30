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

async function enhanceMetadata(batchSize = 15) {
  try {
    console.log('📝 TOYAMA BLOG - メタデータ強化');
    console.log(`バッチサイズ: ${batchSize}`);
    console.log('=' * 50);
    
    // 説明文またはタグが不足している記事を取得
    const postsNeedingMetadata = await client.fetch(`
      *[_type == "post" && (description == null || description == "" || tags == null || length(tags) < 3)] [0...50] {
        _id,
        title,
        category,
        description,
        tags
      }
    `);
    
    console.log(`📊 メタデータ強化対象: ${postsNeedingMetadata.length}件`);
    
    if (postsNeedingMetadata.length === 0) {
      console.log('✅ 全記事のメタデータが充実しています');
      return { success: 0, error: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    let processed = 0;
    
    console.log('🚀 メタデータ強化開始...');
    
    // バッチ処理
    for (let i = 0; i < postsNeedingMetadata.length; i += batchSize) {
      const batch = postsNeedingMetadata.slice(i, i + batchSize);
      
      console.log(`\n--- バッチ ${Math.floor(i / batchSize) + 1} (${batch.length}件) ---`);
      
      for (const post of batch) {
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
          processed++;
          
          // 進捗表示
          if (processed % 10 === 0) {
            console.log(`✅ 進捗: ${processed}/${postsNeedingMetadata.length} (${Math.round(processed/postsNeedingMetadata.length*100)}%)`);
          }
          
          // APIレート制限対策
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (error) {
          console.error(`❌ エラー [${post.title?.substring(0, 30)}...]: ${error.message}`);
          errorCount++;
          processed++;
        }
      }
      
      // バッチ間待機
      if (i + batchSize < postsNeedingMetadata.length) {
        console.log('⏳ バッチ間待機 (3秒)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n🎉 メタデータ強化完了！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // サンプル表示
    const samplePost = await client.fetch(`
      *[_type == "post" && description != null && tags != null] [0] {
        title,
        description,
        tags,
        category
      }
    `);
    
    if (samplePost) {
      console.log('\n📄 サンプル記事:');
      console.log(`タイトル: ${samplePost.title}`);
      console.log(`説明: ${samplePost.description}`);
      console.log(`カテゴリ: ${samplePost.category}`);
      console.log(`タグ: ${samplePost.tags?.join(', ')}`);
    }
    
    return { success: successCount, error: errorCount };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return { success: 0, error: 1 };
  }
}

enhanceMetadata(15);