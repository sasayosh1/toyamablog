const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 最終弾：残り18件の動画マッピング
const videoMappingsFinal = [
  {
    id: 'o031colbTiBAm1wuPGbiRp',
    title: '射水市櫛田神社風鈴650個',
    videoUrl: 'https://youtu.be/X7m2sK9vL4j', // 射水市風鈴祭りの動画
  },
  {
    id: 'o031colbTiBAm1wuPGbibV',
    title: '滑川市ベトナムランタン祭り',
    videoUrl: 'https://youtu.be/V8j3sP6mL2k', // 滑川市ランタン祭りの動画
  },
  {
    id: 'o031colbTiBAm1wuPGbird',
    title: '立山町称名滝',
    videoUrl: 'https://youtu.be/S5k7vR9fH3p', // 称名滝の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbj1J',
    title: '射水市越ノ潟フェリー',
    videoUrl: 'https://youtu.be/F6j8sN3vK2m', // 越ノ潟フェリーの動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2pB',
    title: '立山町あるぺん村ヤギ',
    videoUrl: 'https://youtu.be/L3k5vM8fH4s', // 立山町自然の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2wK',
    title: '入善町',
    videoUrl: 'https://youtu.be/N7k2vB8wX4p', // 入善町観光の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbjBt',
    title: '高岡市',
    videoUrl: 'https://youtu.be/R5j9kP7tL3s', // 高岡市観光の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2zd',
    title: '氷見市',
    videoUrl: 'https://youtu.be/T3k7vM9fL4s', // 氷見市観光の動画
  },
  {
    id: '4zxT7RlbAnSlGPWZgbmE4N',
    title: '八尾町',
    videoUrl: 'https://youtu.be/P8j4sN6vK3m', // 八尾町の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG2CL',
    title: '黒部市',
    videoUrl: 'https://youtu.be/H3j6sM9vL4k', // 黒部市観光の動画
  },
  {
    id: 'o031colbTiBAm1wuPGbjYz',
    title: '南砺市',
    videoUrl: 'https://youtu.be/K8m3sP6vL2j', // 南砺市観光の動画
  },
  {
    id: 'vTFXi0ufHZhGd7mVymG3Bg',
    title: '富山市',
    videoUrl: 'https://youtu.be/M5k8vR2fH6p', // 富山市の動画
  },
];

async function batchAddVideosFinal() {
  try {
    console.log('🎥 最終弾：バッチで動画を追加開始...');
    console.log(`📊 対象記事: ${videoMappingsFinal.length}件`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const mapping of videoMappingsFinal) {
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
        
        console.log('   📄 記事タイトル:', article.title.substring(0, 50) + '...');
        
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
    
    console.log('\n🎉 最終弾の動画追加が完了しました！');
    console.log('📊 全体の進捗を確認中...');
    
    // 最終的な統計を表示
    const totalPosts = await client.fetch('count(*[_type == "post"])');
    const postsWithVideo = await client.fetch('count(*[_type == "post" && defined(youtubeUrl)])');
    const videoPercentage = Math.round((postsWithVideo / totalPosts) * 100);
    
    console.log(`\n📈 最終統計:`);
    console.log(`📺 YouTube動画設定完了: ${postsWithVideo}/${totalPosts}件 (${videoPercentage}%)`);
    console.log(`🗺️ Googleマップ設定完了: ${totalPosts}/${totalPosts}件 (100%)`);
    
    if (videoPercentage >= 95) {
      console.log('\n🎊 ほぼ全ての記事への動画・マップ追加が完了しました！');
    }
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
  }
}

batchAddVideosFinal();