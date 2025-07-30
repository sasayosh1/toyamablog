import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function finalMetadataCheck() {
  try {
    console.log('📝 最終メタデータ確認');
    console.log('=' * 50);
    
    // 全記事のメタデータ状況を確認
    const allPosts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        description,
        tags,
        category
      }
    `);
    
    console.log(`📊 総記事数: ${allPosts.length}`);
    
    // 不足しているメタデータをカウント
    let missingDescription = 0;
    let missingTags = 0;
    let missingCategory = 0;
    
    allPosts.forEach(post => {
      if (!post.description || post.description === '') missingDescription++;
      if (!post.tags || post.tags.length < 3) missingTags++;
      if (!post.category || post.category === '' || post.category === '未分類') missingCategory++;
    });
    
    console.log('\n📋 メタデータ完了状況:');
    console.log(`✅ 説明文あり: ${allPosts.length - missingDescription}件`);
    console.log(`⏳ 説明文不足: ${missingDescription}件`);
    console.log(`✅ タグ充実: ${allPosts.length - missingTags}件`);
    console.log(`⏳ タグ不足: ${missingTags}件`);
    console.log(`✅ カテゴリ設定済み: ${allPosts.length - missingCategory}件`);
    console.log(`⏳ カテゴリ未設定: ${missingCategory}件`);
    
    // 完了率
    const completionRate = Math.round((allPosts.length - Math.max(missingDescription, missingTags, missingCategory)) / allPosts.length * 100);
    console.log(`\n📈 メタデータ完了率: ${completionRate}%`);
    
    // サンプル記事を複数表示
    const samplePosts = await client.fetch(`
      *[_type == "post" && description != null && tags != null && category != null] [0...3] {
        title,
        description,
        tags,
        category
      }
    `);
    
    console.log('\n📄 サンプル記事:');
    samplePosts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   説明: ${post.description}`);
      console.log(`   カテゴリ: ${post.category}`);
      console.log(`   タグ: ${post.tags?.join(', ')}`);
    });
    
    return {
      total: allPosts.length,
      missingDescription,
      missingTags,
      missingCategory,
      completionRate
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

finalMetadataCheck();