import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function analyzePainDorPosts() {
  try {
    console.log('🔍 PAIN D\'OR記事詳細調査...');
    
    // PAIN D'OR関連記事を詳細取得
    const painDorPosts = await client.fetch(`
      *[_type == "post" && title match "*PAIN D'OR*"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        youtubeUrl,
        description,
        tags,
        category,
        body
      }
    `);
    
    console.log(`📊 PAIN D\'OR記事数: ${painDorPosts.length}件\n`);
    
    painDorPosts.forEach((post, i) => {
      console.log(`${i+1}. 記事詳細:`);
      console.log(`   ID: ${post._id}`);
      console.log(`   タイトル: ${post.title}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log(`   YouTube: ${post.youtubeUrl || '未設定'}`);
      console.log(`   説明: ${post.description?.substring(0, 100)}...`);
      console.log(`   タグ数: ${post.tags?.length || 0}個`);
      console.log(`   カテゴリ: ${post.category || '未設定'}`);
      console.log('');
    });
    
    // YouTube動画URLの推測候補を生成
    console.log('🎬 推測されるYouTube Shorts URL候補:');
    console.log('1. https://youtube.com/shorts/[VIDEO_ID] - PAIN D\'OR富山市店舗紹介');
    console.log('2. https://youtube.com/shorts/[VIDEO_ID] - パンドール商品紹介');
    console.log('3. https://youtube.com/shorts/[VIDEO_ID] - 創業1946年老舗パン屋');
    
    console.log('\n💡 次のアクション:');
    console.log('- YouTubeチャンネルから該当動画を特定');
    console.log('- 動画URLを記事に設定');
    console.log('- 重複記事の統合検討');
    
    return painDorPosts;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

analyzePainDorPosts();