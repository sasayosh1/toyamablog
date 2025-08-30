const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function automatedExcerptGenerator() {
  try {
    console.log('📝 概要文自動生成システム開始...');
    console.log('================================');
    
    // 概要文が不十分な記事を取得
    const postsWithPoorExcerpts = await client.fetch('*[_type == "post" && (!defined(excerpt) || length(excerpt) < 50)] { _id, title, body, category }');
    
    console.log(`📊 概要文改善対象記事: ${postsWithPoorExcerpts.length}件`);
    
    if (postsWithPoorExcerpts.length === 0) {
      console.log('✅ 全ての記事に十分な概要文が設定済みです！');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 概要文生成関数
    function generateExcerpt(post) {
      const title = post.title;
      const category = post.category;
      
      // 記事本文から最初の文を抽出
      let firstText = '';
      if (post.body && post.body.length > 0) {
        for (const block of post.body) {
          if (block._type === 'block' && block.children) {
            const text = block.children.map(child => child.text).join('');
            if (text.trim() && text.length > 20) {
              firstText = text.trim();
              break;
            }
          }
        }
      }
      
      // タイトルから施設名を抽出
      const facilityMatch = title.match(/【.*?】(.*?)(?:｜|【|$)/);
      const facilityName = facilityMatch ? facilityMatch[1].trim() : '';
      
      // 概要文のパターン生成
      if (firstText.length > 100) {
        // 本文の最初の120文字 + '...'
        return firstText.substring(0, 120) + '...';
      } else if (facilityName) {
        // 施設名ベースの概要文生成
        return `${category}の「${facilityName}」をご紹介。地域の魅力と特色ある体験を通じて、${category}の新たな一面を発見できるスポットです。動画と詳細情報でその魅力をお伝えします。`;
      } else {
        // デフォルトの概要文
        return `${category}で発見した魅力的なスポットをご紹介。地域ならではの特色ある体験や見どころを、動画と詳細な情報でお届けします。観光やお出かけの参考にぜひご覧ください。`;
      }
    }
    
    // 全件処理
    for (let i = 0; i < postsWithPoorExcerpts.length; i++) {
      const post = postsWithPoorExcerpts[i];
      
      try {
        console.log(`\\n🔄 [${i+1}/${postsWithPoorExcerpts.length}] 処理中: ${post.title.substring(0, 50)}...`);
        
        // 概要文生成
        const newExcerpt = generateExcerpt(post);
        
        console.log(`   📝 生成概要文: ${newExcerpt.substring(0, 60)}...`);
        
        // 記事を更新
        await client
          .patch(post._id)
          .set({
            excerpt: newExcerpt,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log(`   ✅ 完了: ${post.title.substring(0, 40)}...`);
        successCount++;
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${post.title.substring(0, 40)}... - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\\n📊 概要文生成結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    if (successCount > 0) {
      console.log('\\n🌟 概要文自動生成完了！');
      console.log('記事カードの魅力度が向上しました！');
      
      // 完了後の統計
      const updatedStats = await client.fetch('count(*[_type == "post" && defined(excerpt) && length(excerpt) >= 50])');
      const totalPosts = await client.fetch('count(*[_type == "post"])');
      const excerptPercentage = Math.round((updatedStats / totalPosts) * 100);
      
      console.log(`📊 概要文完了率: ${updatedStats}/${totalPosts}件 (${excerptPercentage}%)`);
    }
    
  } catch (error) {
    console.error('❌ 概要文生成エラー:', error.message);
  }
}

automatedExcerptGenerator();