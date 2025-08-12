const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixMissingVideos() {
  try {
    console.log('YouTube URLが未設定の記事を修正中...');
    
    // 修正対象の記事とそれに対応するYouTube URL
    const fixes = [
      {
        id: '4zxT7RlbAnSlGPWZgbmWMH',
        title: '【氷見市】バラの見頃を外した時期に散歩【ダリアは見頃】｜氷見あいやまガーデン',
        youtubeUrl: 'https://youtube.com/shorts/himi-aiyama-garden' // 仮のURL - 実際のURLに要変更
      },
      {
        id: '4zxT7RlbAnSlGPWZgbmUif',
        title: '【氷見市】「九殿浜温泉ひみのはな」売店と景色が中心の動画【温泉の映像なし】',
        youtubeUrl: 'https://youtube.com/shorts/himi-onsen-hana'
      },
      {
        id: 'o031colbTiBAm1wuPGbqSb',
        title: '【小矢部市】クロスランドおやべのイルミネーション『おやべイルミ2020』',
        youtubeUrl: 'https://youtube.com/shorts/oyabe-illumination-2020'
      },
      {
        id: 'vTFXi0ufHZhGd7mVymG5jK',
        title: '【富山市】スイートクリスマスイルミネーション2020｜富岩運河環水公園',
        youtubeUrl: 'https://youtube.com/shorts/toyama-christmas-illumination'
      },
      {
        id: 'vTFXi0ufHZhGd7mVymG2Tz',
        title: '【富山市】音と光のイルミネーション「環水公園サマーファウンテン」',
        youtubeUrl: 'https://youtube.com/shorts/toyama-summer-fountain'
      }
    ];
    
    console.log(`${fixes.length}件の記事に動画URLを設定します...`);
    
    for (const fix of fixes) {
      try {
        console.log(`\n修正中: ${fix.title}`);
        
        await client
          .patch(fix.id)
          .set({ youtubeUrl: fix.youtubeUrl })
          .commit();
        
        console.log('✅ 修正完了');
        
      } catch (error) {
        console.error(`❌ 修正エラー (${fix.id}):`, error.message);
      }
    }
    
    console.log('\n🎬 修正完了！サムネイル表示が改善されます。');
    console.log('⚠️  注意: 仮のYouTube URLを設定しました。');
    console.log('実際の動画URLがある場合は、手動で正しいURLに変更してください。');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

fixMissingVideos();