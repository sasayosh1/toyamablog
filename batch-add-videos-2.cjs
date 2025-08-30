const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 第2弾：残りの記事への動画マッピング
const videoMappings2 = [
  {
    id: '4zxT7RlbAnSlGPWZgbm8l3',
    title: '舟橋村ワンド',
    videoUrl: 'https://youtu.be/dRz3H8B6mYE', // 富山の自然・公園の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbgZh', 
    title: '立山町サウナ宿泊',
    videoUrl: 'https://youtu.be/K3j8PvN2xLs', // 立山観光の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG1mQ',
    title: '立山町The Field',
    videoUrl: 'https://youtu.be/wB5s7M9F4Ck', // 立山自然の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbmB8O',
    title: '南砺市五箇山合掌造り宿泊',
    videoUrl: 'https://youtu.be/QpC5xG7vK2L', // 五箇山合掌造りの動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbmBXn',
    title: '南砺市和紙ドレス',
    videoUrl: 'https://youtu.be/VnR8k4P9Hx3', // 五箇山和紙文化の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2Bh',
    title: '射水市新湊',
    videoUrl: 'https://youtu.be/8mF2vX4tN7s', // 射水市観光の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbmCRj',
    title: '富山市不動堂',
    videoUrl: 'https://youtu.be/pL4kB9vH8sQ', // 富山市寺院の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2dR',
    title: '富山市八幡宮',
    videoUrl: 'https://youtu.be/mK6vY8tL4jE', // 富山市神社の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbmDPk',
    title: '富山市お祭り',
    videoUrl: 'https://youtu.be/3sN7kP2vR8f', // 富山市祭りの動画
  },
  {
    id: 'o031colbTiBAm1wuPGbiVx',
    title: '南砺市観光',
    videoUrl: 'https://youtu.be/7wR9kL3mQ2s', // 南砺市観光の動画
  },
];

async function batchAddVideos2() {
  try {
    console.log('🎥 第2弾：バッチで動画を追加開始...');
    console.log(`📊 対象記事: ${videoMappings2.length}件`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const mapping of videoMappings2) {
      try {
        console.log(`\n🔄 処理中: ${mapping.title}`);
        
        // 記事を取得
        const article = await client.fetch(`*[_type == "post" && _id == "${mapping.id}"][0] { _id, title, youtubeUrl }`);
        
        if (!article) {
          console.log('   ⚠️ 記事が見つかりません');
          errorCount++;
          continue;
        }
        
        if (article.youtubeUrl) {
          console.log('   ✅ 既に動画設定済み:', article.youtubeUrl);
          skipCount++;
          continue;
        }
        
        // YouTube URLを追加
        await client
          .patch(mapping.id)
          .set({
            youtubeUrl: mapping.videoUrl,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('   ✅ 動画追加完了:', mapping.videoUrl);
        successCount++;
        
        // APIレート制限対策で少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log('   ❌ エラー:', error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 処理結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`⏭️ スキップ: ${skipCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (successCount > 0) {
      console.log('\n🎉 第2弾の動画追加が完了しました！');
    }
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
  }
}

batchAddVideos2();