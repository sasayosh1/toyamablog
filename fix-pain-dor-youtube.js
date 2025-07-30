import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixPainDorYoutube() {
  try {
    console.log('🔧 PAIN D\'OR記事のYouTube URL修正...');
    
    const painDorId = 'o031colbTiBAm1wuPGadKX';
    const youtubeUrl = 'https://youtube.com/shorts/N2BgquZ0-Xg';
    
    // 確実にYouTube URLを設定
    const result = await client
      .patch(painDorId)
      .set({
        youtubeUrl: youtubeUrl
      })
      .commit();
    
    console.log('✅ YouTube URL設定完了');
    console.log(`記事ID: ${painDorId}`);
    console.log(`YouTube URL: ${youtubeUrl}`);
    
    // 設定確認
    const updatedPost = await client.fetch(`
      *[_id == "${painDorId}"] {
        _id,
        title,
        youtubeUrl,
        publishedAt
      }[0]
    `);
    
    console.log('\n📊 設定確認:');
    console.log(`タイトル: ${updatedPost.title}`);
    console.log(`YouTube URL: ${updatedPost.youtubeUrl}`);
    console.log(`更新日時: ${updatedPost.publishedAt}`);
    
    return updatedPost;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

fixPainDorYoutube();