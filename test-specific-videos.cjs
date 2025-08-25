async function testSpecificVideos() {
  try {
    console.log('🔬 成功している動画 vs 失敗している動画の詳細比較');
    
    const workingVideos = [
      { id: 'yeMbIMxqC1o', title: '魚津市ゴマフアザラシ', status: '成功' },
      { id: 'qnRZHR3HHMw', title: '環水公園サマーファウンテン', status: '成功' },
      { id: 'JhGMbTOeK88', title: '鬼滅の刃ポスター展', status: '成功' }
    ];
    
    const failingVideos = [
      { id: 'kX8yH9vM2nA', title: '安田城月見の宴YOSAKOI', status: '失敗' },
      { id: 'pL7mN4qR8kE', title: '水橋橋まつり花火大会', status: '失敗' },
      { id: 'Qz5wX3nG9pM', title: 'となみ夜高まつり', status: '失敗' }
    ];
    
    console.log('\\n✅ 成功している動画のテスト:');
    for (const video of workingVideos) {
      console.log(`\\n📹 ${video.title} (${video.id})`);
      
      // YouTube動画ページ
      try {
        const pageResponse = await fetch(`https://www.youtube.com/watch?v=${video.id}`);
        console.log(`  🌐 動画ページ: ${pageResponse.ok ? '✅ アクセス可能' : '❌ アクセス不可'} (${pageResponse.status})`);
      } catch (error) {
        console.log(`  🌐 動画ページ: ❌ エラー`);
      }
      
      // サムネイルURL
      const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
      try {
        const thumbResponse = await fetch(thumbnailUrl);
        console.log(`  📸 サムネイル: ${thumbResponse.ok ? '✅ 利用可能' : '❌ 利用不可'} (${thumbResponse.status})`);
        if (thumbResponse.ok) {
          console.log(`    📏 サイズ: ${thumbResponse.headers.get('content-length')} bytes`);
          console.log(`    📝 タイプ: ${thumbResponse.headers.get('content-type')}`);
        }
      } catch (error) {
        console.log(`  📸 サムネイル: ❌ エラー`);
      }
    }
    
    console.log('\\n❌ 失敗している動画のテスト:');
    for (const video of failingVideos) {
      console.log(`\\n📹 ${video.title} (${video.id})`);
      
      // YouTube動画ページ
      try {
        const pageResponse = await fetch(`https://www.youtube.com/watch?v=${video.id}`);
        console.log(`  🌐 動画ページ: ${pageResponse.ok ? '✅ アクセス可能' : '❌ アクセス不可'} (${pageResponse.status})`);
      } catch (error) {
        console.log(`  🌐 動画ページ: ❌ エラー`);
      }
      
      // サムネイルURL
      const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
      try {
        const thumbResponse = await fetch(thumbnailUrl);
        console.log(`  📸 サムネイル: ${thumbResponse.ok ? '✅ 利用可能' : '❌ 利用不可'} (${thumbResponse.status})`);
        if (thumbResponse.ok) {
          console.log(`    📏 サイズ: ${thumbResponse.headers.get('content-length')} bytes`);
          console.log(`    📝 タイプ: ${thumbResponse.headers.get('content-type')}`);
        }
      } catch (error) {
        console.log(`  📸 サムネイル: ❌ エラー`);
      }
    }
    
    console.log('\\n🔍 結論:');
    console.log('- 一部のYouTube Shorts動画では正常にサムネイル取得が可能');
    console.log('- 問題は特定の動画に限定されている可能性');
    console.log('- 動画の公開日時や設定に違いがある可能性');
    
  } catch (error) {
    console.error('テストエラー:', error);
  }
}

testSpecificVideos();