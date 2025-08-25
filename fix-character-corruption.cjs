const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixCharacterCorruption() {
  try {
    console.log('🔧 文字化けタイトルを修正中...');
    
    // 文字化け記事を特定して修正
    const corruptionFixes = [
      {
        id: 'vTFXi0ufHZhGd7mVymG2Mv',
        currentTitle: '【富山市】音と光のイルミネーション「環水公園サマーファウンテン」が凄すぎた！！富岩運河環水公園&#x2728;（明るいときver.）',
        newTitle: '【富山市】音と光のイルミネーション「環水公園サマーファウンテン」が凄すぎた！！富岩運河環水公園✨（明るいときver.）'
      },
      {
        id: 'vTFXi0ufHZhGd7mVymG2QS',
        currentTitle: '【富山市】音と光のイルミネーション「環水公園サマーファウンテン」が凄すぎた！！富岩運河環水公園&#x2728;',
        newTitle: '【富山市】音と光のイルミネーション「環水公園サマーファウンテン」が凄すぎた！！富岩運河環水公園✨'
      },
      {
        id: 'vTFXi0ufHZhGd7mVymG2b3',
        currentTitle: '【射水市】櫛田神社の風鈴トンネル&#x1f390;音色に癒されました！',
        newTitle: '【射水市】櫛田神社の風鈴トンネル🎐音色に癒されました！'
      }
    ];
    
    console.log(`📝 修正対象: ${corruptionFixes.length}件のタイトル`);
    
    for (const fix of corruptionFixes) {
      console.log(`\n🔄 修正中: ID ${fix.id}`);
      console.log(`   修正前: ${fix.currentTitle}`);
      console.log(`   修正後: ${fix.newTitle}`);
      
      await client
        .patch(fix.id)
        .set({
          title: fix.newTitle,
          _updatedAt: new Date().toISOString()
        })
        .commit();
      
      console.log('   ✅ 修正完了');
    }
    
    // 修正後の検証
    console.log('\n🔍 修正結果を検証中...');
    
    const remainingCorruption = await client.fetch(`*[_type == "post" && (title match "*&#x*" || title match "*&amp;*")] {
      _id, title
    }`);
    
    if (remainingCorruption.length === 0) {
      console.log('✅ 全ての文字化けが修正されました！');
      
      // 修正済みタイトルの確認
      const fixedTitles = await client.fetch(`*[_type == "post" && _id in ["vTFXi0ufHZhGd7mVymG2Mv", "vTFXi0ufHZhGd7mVymG2QS", "vTFXi0ufHZhGd7mVymG2b3"]] {
        _id, title
      }`);
      
      console.log('\n📊 修正済みタイトル確認:');
      fixedTitles.forEach((post, idx) => {
        console.log(`${idx + 1}. ${post.title}`);
      });
      
    } else {
      console.log(`⚠️ まだ${remainingCorruption.length}件の文字化けが残っています`);
      remainingCorruption.forEach(post => {
        console.log(`   - ${post.title} (ID: ${post._id})`);
      });
    }
    
    // キャッシュクリア実行
    console.log('\n🔄 記事キャッシュをクリア中...');
    await Promise.all(corruptionFixes.map(fix => 
      client.patch(fix.id).set({ _updatedAt: new Date().toISOString() }).commit()
    ));
    
    console.log('✅ キャッシュクリア完了');
    console.log('\n🎉 文字化け修正作業完了！');
    
    return true;
    
  } catch (error) {
    console.error('❌ 文字化け修正エラー:', error.message);
    return false;
  }
}

fixCharacterCorruption().then(result => {
  process.exit(result ? 0 : 1);
});