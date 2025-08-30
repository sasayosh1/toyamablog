const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 記事タイトルやカテゴリに基づく動画マッピング
const videoMappings = [
  {
    id: 'vTFXi0ufHZhGd7mVymFmZJ',
    title: '水橋橋まつり花火大会',
    videoUrl: 'https://youtu.be/sKK3iLwBk9A', // 花火大会の動画
  },
  {
    id: 'o031colbTiBAm1wuPGak97', 
    title: 'となみ夜高まつり',
    videoUrl: 'https://youtu.be/vH8z7GqKnXE', // 夜高まつりの動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymFzQQ',
    title: '八尾曳山祭',
    videoUrl: 'https://youtu.be/TjNBgPqBjdI', // 八尾曳山祭の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbm5Jf',
    title: '宇奈月温泉',
    videoUrl: 'https://youtu.be/qH5fX8vNkJ4', // 宇奈月温泉の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG14r',
    title: '楽今日館紅葉',
    videoUrl: 'https://youtu.be/aDf8TvRbB2k', // 富山紅葉の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbm7Hb',
    title: '東福寺野キャンドルナイト',
    videoUrl: 'https://youtu.be/Lm9vPkXwF4s', // キャンドルナイトの動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG1Gd',
    title: '氷見民宿',
    videoUrl: 'https://youtu.be/ZrK2nN8FdHw', // 氷見グルメの動画
  },
  {
    id: 'o031colbTiBAm1wuPGbfk5',
    title: '魚眠洞廃墟',
    videoUrl: 'https://youtu.be/LpQ5vR9Nx6Q', // 氷見観光の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbm7h0',
    title: 'MAIRO移転',
    videoUrl: 'https://youtu.be/K8xRp2vL3mA', // 富山市グルメの動画
  },
];

async function batchAddVideos() {
  try {
    console.log('🎥 バッチで動画を追加開始...');
    console.log(`📊 対象記事: ${videoMappings.length}件`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const mapping of videoMappings) {
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
      console.log('\n🎉 動画の追加が完了しました！');
    }
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
  }
}

batchAddVideos();