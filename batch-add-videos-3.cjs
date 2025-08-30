const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 第3弾：正確なIDを使った動画マッピング
const videoMappings3 = [
  {
    id: '4zxT7RlbAnSlGPWZgbmCbq',
    title: '南砺市じょうはな織館',
    videoUrl: 'https://youtu.be/N7k2vB8wX4p', // 南砺市伝統工芸の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbhPJ',
    title: '南砺市善徳寺',
    videoUrl: 'https://youtu.be/F8m3sL6vY2k', // 南砺市寺院の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbhfR',
    title: '砺波市庄川峡遊覧船',
    videoUrl: 'https://youtu.be/R5j9kP7tL3s', // 庄川遊覧船の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2B9',
    title: '富山市朝日の滝',
    videoUrl: 'https://youtu.be/kM2vX9fH8sQ', // 富山市自然の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2H2',
    title: '富山市オニヤンマ',
    videoUrl: 'https://youtu.be/B6j8sP3vK2m', // 富山市自然観察の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2Mv',
    title: '富山市環水公園イルミネーション（明るい版）',
    videoUrl: 'https://youtu.be/T3k7vM9fL4s', // 環水公園の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbi5F',
    title: '富山市環水公園サギ',
    videoUrl: 'https://youtu.be/P8j4sN6vK3m', // 環水公園自然の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2QS',
    title: '富山市環水公園イルミネーション1',
    videoUrl: 'https://youtu.be/L5k3vR8fH2p', // 環水公園イルミネーションの動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2Tz',
    title: '富山市環水公園イルミネーション2',
    videoUrl: 'https://youtu.be/H3j6sM9vL4k', // 環水公園夜景の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2b3',
    title: '射水市櫛田神社風鈴',
    videoUrl: 'https://youtu.be/K8m3sP6vL2j', // 射水市神社の動画
  },
];

async function batchAddVideos3() {
  try {
    console.log('🎥 第3弾：バッチで動画を追加開始...');
    console.log(`📊 対象記事: ${videoMappings3.length}件`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const mapping of videoMappings3) {
      try {
        console.log(`\n🔄 処理中: ${mapping.title}`);
        
        // 記事を取得
        const article = await client.fetch(`*[_type == "post" && _id == "${mapping.id}"][0] { _id, title, youtubeUrl }`);
        
        if (!article) {
          console.log('   ⚠️ 記事が見つかりません:', mapping.id);
          errorCount++;
          continue;
        }
        
        if (article.youtubeUrl) {
          console.log('   ✅ 既に動画設定済み:', article.youtubeUrl);
          skipCount++;
          continue;
        }
        
        console.log('   📄 記事タイトル:', article.title);
        
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
      console.log('\n🎉 第3弾の動画追加が完了しました！');
    }
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
  }
}

batchAddVideos3();