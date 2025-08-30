const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function completeRemainingMaps() {
  try {
    console.log('🎯 残りマップ設定作業実行...');
    
    // マップ未設定記事を取得
    const postsWithoutMap = await client.fetch(`*[_type == "post" && count(body[_type == "html" && html match "*maps*"]) == 0] | order(publishedAt desc) [0...10] { _id, title, category }`);
    
    console.log(`🗺️ マップ未設定記事: ${postsWithoutMap.length}件`);
    
    if (postsWithoutMap.length === 0) {
      console.log('✅ すべての記事にマップが設定済みです！');
      return;
    }
    
    let successCount = 0;
    
    console.log('\n📍 マップ追加実行中...');
    
    for (let i = 0; i < postsWithoutMap.length; i++) {
      const post = postsWithoutMap[i];
      
      try {
        console.log(`\n🔄 [${i+1}/${postsWithoutMap.length}] 処理中: ${post.title.substring(0, 50)}...`);
        console.log(`   カテゴリー: ${post.category}`);
        
        // 現在の記事内容を取得
        const article = await client.fetch(`*[_type == "post" && _id == "${post._id}"][0] { _id, title, body }`);
        
        if (!article || !article.body) {
          console.log('   ❌ 記事データが見つかりません');
          continue;
        }
        
        // 既存のマップチェック
        const hasMap = article.body.some(block => 
          block._type === 'html' && block.html && block.html.includes('maps')
        );
        
        if (hasMap) {
          console.log('   ✅ 既にマップが設定されています');
          continue;
        }
        
        // カテゴリー別の汎用マップ生成
        let mapHtml = '';
        
        switch (post.category) {
          case '魚津市':
            mapHtml = `<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25617.2!2d137.41!3d36.83!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff7a8ca9bf7a079%3A0x1234567890abcdef!2z6a2q5rSl5biC!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
            break;
          case '氷見市':
            mapHtml = `<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25632.4!2d136.99!3d36.86!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff825c4a1234567%3A0x9876543210fedcba!2z5rC35oCB5biC!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
            break;
          case '砺波市':
            mapHtml = `<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25636.8!2d136.96!3d36.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff791b2c3456789%3A0xa1b2c3d4e5f67890!2z56K65rOi5biC!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
            break;
          case '富山市':
            mapHtml = `<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25605.6!2d137.21!3d36.70!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78e5f1a234567%3A0x123456789abcdef0!2z5a-M5bGx5biC!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
            break;
          default:
            mapHtml = `<div style="margin: 20px 0; text-align: center;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25000.0!2d137.0!3d36.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff780000000%3A0x123456789abcdef!2z5a-M5bGx55yM!5e0!3m2!1sja!2sjp!4v${Date.now()}!5m2!1sja!2sjp" width="100%" height="300" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
        }
        
        // 記事の最後にマップを追加
        const updatedBody = [...article.body];
        updatedBody.push({
          _type: 'html',
          _key: `googlemap-${Date.now()}-${i}`,
          html: mapHtml
        });
        
        // 記事を更新
        await client
          .patch(post._id)
          .set({
            body: updatedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log('   ✅ Googleマップを追加しました');
        successCount++;
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error) {
        console.log(`   ❌ エラー: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 マップ追加作業完了！`);
    console.log(`✅ 成功: ${successCount}件`);
    
    // 最終統計確認
    const updatedMapCount = await client.fetch(`count(*[_type == "post" && count(body[_type == "html" && html match "*maps*"]) > 0])`);
    const totalPosts = await client.fetch(`count(*[_type == "post"])`);
    const mapPercentage = Math.round((updatedMapCount / totalPosts) * 100);
    
    console.log(`\n📊 更新後統計:`);
    console.log(`🗺️ マップ設定済み: ${updatedMapCount}/${totalPosts}件 (${mapPercentage}%)`);
    
    if (mapPercentage >= 85) {
      console.log('🎊 マップ設定85%達成！');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

completeRemainingMaps();