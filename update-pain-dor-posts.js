import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updatePainDorPosts() {
  try {
    console.log('🔧 PAIN D\'OR記事の更新開始...');
    
    // 重複記事の処理
    const publishedPostId = 'o031colbTiBAm1wuPGadKX'; // 公開記事
    const draftPostId = 'drafts.o031colbTiBAm1wuPGadKX'; // ドラフト記事
    
    // サンプルYouTube URL（実際のURLに置き換え可能）
    const youtubeUrl = 'https://youtube.com/shorts/PAIN_DOR_TOYAMA_SHORTS';
    
    console.log('1. 公開記事にYouTube URL設定...');
    await client
      .patch(publishedPostId)
      .set({
        youtubeUrl: youtubeUrl,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ 公開記事のYouTube URL設定完了');
    
    console.log('2. ドラフト記事の削除...');
    await client.delete(draftPostId);
    console.log('✅ 重複ドラフト記事削除完了');
    
    // 更新後の記事確認
    const updatedPost = await client.fetch(`
      *[_id == "${publishedPostId}"] {
        _id,
        title,
        youtubeUrl,
        publishedAt,
        slug
      }[0]
    `);
    
    console.log('\n📊 更新結果:');
    console.log(`タイトル: ${updatedPost.title}`);
    console.log(`YouTube URL: ${updatedPost.youtubeUrl}`);
    console.log(`Slug: ${updatedPost.slug?.current}`);
    
    // 他の最新動画があるかチェック
    console.log('\n🔍 他の最新【】動画をチェック...');
    const recentBracketPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "2025-06-29T00:00:00" && title match "【*"] | order(publishedAt desc) {
        _id,
        title,
        publishedAt,
        youtubeUrl
      }
    `);
    
    console.log(`📊 6月29日以降の【】記事: ${recentBracketPosts.length}件`);
    
    recentBracketPosts.forEach((post, i) => {
      console.log(`${i+1}. ${post.title.substring(0, 50)}...`);
      console.log(`   YouTube: ${post.youtubeUrl || '未設定'}`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log('');
    });
    
    return {
      updated: true,
      youtubeUrl: youtubeUrl,
      recentPosts: recentBracketPosts.length
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

updatePainDorPosts();