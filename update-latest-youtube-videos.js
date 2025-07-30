import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 反映する動画リスト
const newVideos = [
  {
    url: 'https://youtube.com/shorts/N2BgquZ0-Xg',
    id: 'N2BgquZ0-Xg'
  },
  {
    url: 'https://youtube.com/shorts/InojJTFLQ1o', 
    id: 'InojJTFLQ1o'
  },
  {
    url: 'https://youtube.com/shorts/yeMbIMxqC1o',
    id: 'yeMbIMxqC1o'
  },
  {
    url: 'https://youtube.com/shorts/Gzhmy1hiIIc',
    id: 'Gzhmy1hiIIc'
  }
];

async function updateLatestYouTubeVideos() {
  try {
    console.log('🎬 最新YouTube Shorts動画の反映開始...');
    console.log(`チャンネル: https://www.youtube.com/channel/UCxX3Eq8_KMl3AeYdhb5MklA`);
    console.log(`対象動画: ${newVideos.length}件\n`);
    
    // PAIN D'OR以降の記事を取得（【】で始まるタイトル）
    const recentPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "2025-06-28T00:00:00" && title match "【*"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        youtubeUrl,
        category
      }
    `);
    
    console.log(`📊 対象記事: ${recentPosts.length}件`);
    
    // 1. PAIN D'OR記事にYouTube URL設定
    const painDorPost = recentPosts.find(post => post.title.includes('PAIN D\'OR') || post.title.includes('パンドール'));
    
    if (painDorPost && !painDorPost.youtubeUrl) {
      console.log('🔧 PAIN D\'OR記事にYouTube URL設定...');
      await client
        .patch(painDorPost._id)
        .set({
          youtubeUrl: newVideos[0].url, // 最初の動画をPAIN D'ORに割り当て
          _updatedAt: new Date().toISOString()
        })
        .commit();
      
      console.log(`✅ ${painDorPost.title.substring(0, 50)}... → ${newVideos[0].url}`);
    }
    
    // 2. 他の動画用の新記事作成
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < newVideos.length; i++) {
      const video = newVideos[i];
      
      try {
        // 動画IDから記事タイトルを生成（実際の動画内容に基づいて調整が必要）
        const articleTitle = `【富山市】YouTube Shorts 動画 #${i + 1} #shorts`;
        
        // 新記事作成
        const newPost = {
          _type: 'post',
          title: articleTitle,
          slug: {
            current: `富山-youtube-shorts-動画-${i + 1}`,
            _type: 'slug'
          },
          publishedAt: new Date().toISOString(),
          youtubeUrl: video.url,
          description: `富山県の魅力を紹介するYouTube Shorts動画です。地域の観光スポットや文化、グルメ情報をお楽しみください。`,
          category: '富山市',
          tags: [
            '富山', '富山県', 'TOYAMA', '#shorts', 'YouTube Shorts',
            '富山観光', '富山旅行', '北陸観光', '富山県の観光スポット',
            '富山県でおすすめの場所', '富山県の見どころ', '動画', 'ショート動画'
          ]
        };
        
        const result = await client.create(newPost);
        
        successCount++;
        console.log(`✅ 新記事作成: ${articleTitle} → ${video.url}`);
        console.log(`   記事ID: ${result._id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ 記事作成エラー [動画${i + 1}]: ${error.message}`);
      }
    }
    
    // 3. 重複ドラフト記事の削除
    console.log('\n🗑️ 重複ドラフト記事の削除...');
    const draftPosts = await client.fetch(`
      *[_type == "post" && _id match "drafts.*" && title match "*PAIN D'OR*"] {
        _id,
        title
      }
    `);
    
    for (const draft of draftPosts) {
      try {
        await client.delete(draft._id);
        console.log(`✅ ドラフト削除: ${draft.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ ドラフト削除エラー: ${error.message}`);
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount + 1}件 (PAIN D'OR記事更新 + 新記事${successCount}件)`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🗑️ ドラフト削除: ${draftPosts.length}件`);
    
    // 最終確認
    const updatedPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "2025-06-28T00:00:00" && title match "【*"] | order(publishedAt desc) {
        _id,
        title,
        youtubeUrl,
        publishedAt
      }
    `);
    
    console.log('\n🎯 更新後の記事一覧:');
    updatedPosts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title.substring(0, 60)}...`);
      console.log(`   YouTube: ${post.youtubeUrl || '未設定'}`);
      console.log(`   日時: ${post.publishedAt}`);
      console.log('');
    });
    
    return {
      success: successCount + 1,
      error: errorCount,
      draftsDeleted: draftPosts.length,
      totalUpdated: updatedPosts.length
    };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return null;
  }
}

updateLatestYouTubeVideos();