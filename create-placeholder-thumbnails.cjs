const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createCategoryDefaultThumbnails() {
  try {
    console.log('🎨 カテゴリ別デフォルトサムネイル生成システム実装...');
    
    // カテゴリ別の分析
    const postsWithoutThumbnail = await client.fetch('*[_type == "post" && !defined(thumbnail) && defined(youtubeUrl)] { _id, title, category, youtubeUrl }');
    
    // カテゴリ別集計
    const categoryStats = {};
    postsWithoutThumbnail.forEach(post => {
      const category = post.category || 'その他';
      if (!categoryStats[category]) {
        categoryStats[category] = [];
      }
      categoryStats[category].push(post);
    });
    
    console.log('📊 カテゴリ別サムネイル未設定記事:');
    Object.entries(categoryStats).forEach(([category, posts]) => {
      console.log(`  ${category}: ${posts.length}件`);
    });
    
    console.log('\n🎯 代替サムネイル戦略:');
    
    // Canvas APIを使用した動的サムネイル生成の代替として
    // プレースホルダー画像URLを生成
    const generatePlaceholderThumbnail = (category, title) => {
      // カテゴリ別の色設定
      const categoryColors = {
        '富山市': { bg: '4A90E2', text: 'FFFFFF' },
        '高岡市': { bg: '7ED321', text: 'FFFFFF' },
        '氷見市': { bg: 'F5A623', text: 'FFFFFF' },
        '魚津市': { bg: '50E3C2', text: 'FFFFFF' },
        '砺波市': { bg: 'BD10E0', text: 'FFFFFF' },
        '小矢部市': { bg: 'B8E986', text: '000000' },
        '南砺市': { bg: 'F8E71C', text: '000000' },
        '射水市': { bg: '9013FE', text: 'FFFFFF' },
        '滑川市': { bg: 'D0021B', text: 'FFFFFF' },
        '黒部市': { bg: 'FF6D00', text: 'FFFFFF' },
        '上市町': { bg: '8B572A', text: 'FFFFFF' },
        '立山町': { bg: '417505', text: 'FFFFFF' },
        '入善町': { bg: '142A5C', text: 'FFFFFF' },
        '朝日町': { bg: 'FF69B4', text: 'FFFFFF' },
        '舟橋村': { bg: '20B2AA', text: 'FFFFFF' },
        'その他': { bg: '9B9B9B', text: 'FFFFFF' }
      };
      
      const colors = categoryColors[category] || categoryColors['その他'];
      const encodedTitle = encodeURIComponent(title.substring(0, 30));
      const encodedCategory = encodeURIComponent(category);
      
      // PlaceholderサービスのURL（複数の代替案）
      const placeholderServices = [
        `https://via.placeholder.com/400x300/${colors.bg}/${colors.text}?text=${encodedCategory}%0A${encodedTitle}`,
        `https://dummyimage.com/400x300/${colors.bg}/${colors.text}&text=${encodedCategory}+${encodedTitle}`,
        `https://placehold.co/400x300/${colors.bg}/${colors.text}?text=${encodedCategory}%0A${encodedTitle}`
      ];
      
      return placeholderServices[0]; // 最初のサービスを使用
    };
    
    let successCount = 0;
    
    console.log('\n🔄 プレースホルダーサムネイル生成開始...');
    
    // 最初の10件を処理
    for (let i = 0; i < Math.min(10, postsWithoutThumbnail.length); i++) {
      const post = postsWithoutThumbnail[i];
      
      try {
        console.log(`\n📝 [${i+1}/10] 処理中: ${post.title.substring(0, 50)}...`);
        console.log(`   📂 カテゴリ: ${post.category}`);
        
        const placeholderUrl = generatePlaceholderThumbnail(post.category, post.title);
        console.log(`   🎨 プレースホルダーURL生成: ${placeholderUrl.substring(0, 80)}...`);
        
        // プレースホルダー画像を取得
        const response = await fetch(placeholderUrl);
        if (!response.ok) {
          throw new Error(`プレースホルダー取得失敗: ${response.status}`);
        }
        
        const buffer = Buffer.from(await response.arrayBuffer());
        
        console.log('   📤 Sanityに画像アップロード中...');
        
        // Sanityに画像をアップロード
        const asset = await client.assets.upload('image', buffer, {
          filename: `placeholder-${post.category}-${Date.now()}.png`,
          contentType: 'image/png'
        });
        
        console.log(`   ✅ 画像アセット作成: ${asset._id}`);
        
        // 記事にサムネイルを設定
        await client
          .patch(post._id)
          .set({
            thumbnail: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id
              },
              alt: `${post.title} サムネイル`
            },
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log(`   🎉 完了: ${post.title.substring(0, 40)}...`);
        successCount++;
        
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${post.title.substring(0, 40)}... - ${error.message}`);
      }
    }
    
    console.log(`\n📊 プレースホルダーサムネイル生成結果:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`🎯 残り: ${postsWithoutThumbnail.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🌟 プレースホルダーサムネイル生成完了！');
      console.log('記事カードの視覚的品質が向上しました！');
      
      // 進捗確認
      const updatedStats = await client.fetch('count(*[_type == "post" && defined(thumbnail)])');
      const totalPosts = await client.fetch('count(*[_type == "post" && defined(youtubeUrl)])');
      const thumbnailPercentage = Math.round((updatedStats / totalPosts) * 100);
      
      console.log(`📊 サムネイル完了率: ${updatedStats}/${totalPosts}件 (${thumbnailPercentage}%)`);
    }
    
  } catch (error) {
    console.error('❌ プレースホルダーサムネイル生成エラー:', error.message);
  }
}

createCategoryDefaultThumbnails();