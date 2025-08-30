const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createStaticThumbnails() {
  try {
    console.log('🖼️ 静的サムネイル生成システム実装...');
    
    // カテゴリ別の分析
    const postsWithoutThumbnail = await client.fetch('*[_type == "post" && !defined(thumbnail) && defined(youtubeUrl)] { _id, title, category, youtubeUrl }');
    
    console.log(`📊 サムネイル未設定記事: ${postsWithoutThumbnail.length}件`);
    
    // Canvas APIを使用してシンプルなサムネイル画像を生成
    const generateSimpleThumbnail = async (category, title) => {
      // Node.js環境でのCanvas実装の代替として、
      // SVGテキストを使用した画像生成
      
      const categoryColors = {
        '富山市': { bg: '#4A90E2', text: '#FFFFFF' },
        '高岡市': { bg: '#7ED321', text: '#FFFFFF' },
        '氷見市': { bg: '#F5A623', text: '#FFFFFF' },
        '魚津市': { bg: '#50E3C2', text: '#FFFFFF' },
        '砺波市': { bg: '#BD10E0', text: '#FFFFFF' },
        '小矢部市': { bg: '#B8E986', text: '#000000' },
        '南砺市': { bg: '#F8E71C', text: '#000000' },
        '射水市': { bg: '#9013FE', text: '#FFFFFF' },
        '滑川市': { bg: '#D0021B', text: '#FFFFFF' },
        '黒部市': { bg: '#FF6D00', text: '#FFFFFF' },
        '上市町': { bg: '#8B572A', text: '#FFFFFF' },
        '立山町': { bg: '#417505', text: '#FFFFFF' },
        '入善町': { bg: '#142A5C', text: '#FFFFFF' },
        '朝日町': { bg: '#FF69B4', text: '#FFFFFF' },
        '舟橋村': { bg: '#20B2AA', text: '#FFFFFF' },
        '八尾町': { bg: '#8B4513', text: '#FFFFFF' },
        'グルメ': { bg: '#FF4500', text: '#FFFFFF' },
        '自然・公園': { bg: '#32CD32', text: '#FFFFFF' },
        'その他': { bg: '#9B9B9B', text: '#FFFFFF' }
      };
      
      const colors = categoryColors[category] || categoryColors['その他'];
      const shortTitle = title.length > 20 ? title.substring(0, 17) + '...' : title;
      
      // SVG画像を生成
      const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="${colors.bg}"/>
          <text x="200" y="120" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
            ${category}
          </text>
          <text x="200" y="180" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="16">
            ${shortTitle}
          </text>
          <circle cx="200" cy="220" r="30" fill="none" stroke="${colors.text}" stroke-width="2" opacity="0.7"/>
          <polygon points="190,220 210,210 210,230" fill="${colors.text}" opacity="0.7"/>
        </svg>
      `;
      
      return Buffer.from(svg);
    };
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 静的サムネイル生成開始...');
    
    // 最初の15件を処理
    for (let i = 0; i < Math.min(15, postsWithoutThumbnail.length); i++) {
      const post = postsWithoutThumbnail[i];
      
      try {
        console.log(`\n📝 [${i+1}/15] 処理中: ${post.title.substring(0, 50)}...`);
        console.log(`   📂 カテゴリ: ${post.category}`);
        
        // SVGサムネイル生成
        const svgBuffer = await generateSimpleThumbnail(post.category, post.title);
        
        console.log('   📤 Sanityに画像アップロード中...');
        
        // Sanityに画像をアップロード
        const asset = await client.assets.upload('image', svgBuffer, {
          filename: `thumbnail-${post.category}-${Date.now()}.svg`,
          contentType: 'image/svg+xml'
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`   ❌ エラー: ${post.title.substring(0, 40)}... - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 静的サムネイル生成結果:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🎯 残り: ${postsWithoutThumbnail.length - successCount}件`);
    
    if (successCount > 0) {
      console.log('\n🌟 静的サムネイル生成完了！');
      console.log('記事カードの視覚的品質が向上しました！');
      
      // 進捗確認
      const updatedStats = await client.fetch('count(*[_type == "post" && defined(thumbnail)])');
      const totalPosts = await client.fetch('count(*[_type == "post" && defined(youtubeUrl)])');
      const thumbnailPercentage = Math.round((updatedStats / totalPosts) * 100);
      
      console.log(`📊 サムネイル完了率: ${updatedStats}/${totalPosts}件 (${thumbnailPercentage}%)`);
      
      if (thumbnailPercentage >= 80) {
        console.log('🎊 サムネイル生成80%達成！');
      }
    }
    
  } catch (error) {
    console.error('❌ 静的サムネイル生成エラー:', error.message);
  }
}

createStaticThumbnails();