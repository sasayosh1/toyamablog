import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 動画情報を改善（実際の動画内容に基づいて調整）
const videoUpdates = [
  {
    id: '95vBmVlXBxlHRIj7vD7ZMv',
    url: 'https://youtube.com/shorts/InojJTFLQ1o',
    title: '【富山市】まるごとりんごのパリパリ食感！りんご飴専門店「代官山candy apple 富山市 MAROOT店」 #shorts',
    description: '富山市のりんご飴専門店「代官山candy apple MAROOT店」をYouTube Shortsでご紹介！まるごとりんごのパリパリ食感が楽しめる人気スイーツ店です。',
    slug: '富山-まるごとりんごのパリパリ食感りんご飴専門店代官山candy-apple-富山市-maroot店'
  },
  {
    id: '95vBmVlXBxlHRIj7vD7ZQD', 
    url: 'https://youtube.com/shorts/yeMbIMxqC1o',
    title: '【富山市】午前中に完売！？50個限定の極上ふわふわ食感のどら焼き「ふわどら」が美味しすぎた｜和の心 ぷちろーる #shorts',
    description: '富山市の「和の心 ぷちろーる」の50個限定どら焼き「ふわどら」をYouTube Shortsでご紹介！午前中に完売してしまう人気の極上ふわふわ食感をお楽しみください。',
    slug: '富山-午前中に完売50個限定の極上ふわふわ食感のどら焼きふわどらが美味しすぎた和の心-ぷちろーる'
  },
  {
    id: 'qszvaZusvE4KvujKB63yBo',
    url: 'https://youtube.com/shorts/Gzhmy1hiIIc', 
    title: '【富山市】富山駅前の隠れ家ケーキ店で至福のひととき｜シャルロッテ パティオさくら富山駅前店 #shorts',
    description: '富山駅前の隠れ家ケーキ店「シャルロッテ パティオさくら富山駅前店」をYouTube Shortsでご紹介！至福のひとときを過ごせる素敵なケーキ店です。',
    slug: '富山-富山駅前の隠れ家ケーキ店で至福のひとときシャルロッテ-パティオさくら富山駅前店'
  }
];

async function improveVideoArticles() {
  try {
    console.log('🎬 動画記事の改善開始...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const video of videoUpdates) {
      try {
        console.log(`\n🔧 記事更新: ${video.title.substring(0, 50)}...`);
        
        await client
          .patch(video.id)
          .set({
            title: video.title,
            description: video.description,
            slug: {
              current: video.slug,
              _type: 'slug'
            },
            tags: [
              '富山', '富山県', 'TOYAMA', '#shorts', 'YouTube Shorts',
              '富山観光', '富山旅行', '北陸観光', '富山市', '富山市観光',
              '富山市グルメ', 'グルメ', '富山グルメ', 'スイーツ', 'カフェ',
              '富山県の観光スポット', '富山県でおすすめの場所', '富山県の見どころ',
              '富山県のグルメ', '動画', 'ショート動画', '富山駅'
            ]
          })
          .commit();
        
        successCount++;
        console.log(`✅ 更新完了: ${video.url}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ 更新エラー [${video.id}]: ${error.message}`);
      }
    }
    
    console.log('\n📊 記事改善結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 最終確認
    const updatedPosts = await client.fetch(`
      *[_type == "post" && publishedAt >= "2025-07-30T21:00:00"] | order(publishedAt desc) {
        _id,
        title,
        youtubeUrl,
        slug,
        tags
      }
    `);
    
    console.log('\n🎯 改善後の記事一覧:');
    updatedPosts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   YouTube: ${post.youtubeUrl}`);
      console.log(`   Slug: ${post.slug?.current}`);
      console.log(`   タグ数: ${post.tags?.length || 0}個`);
      console.log('');
    });
    
    return {
      success: successCount,
      error: errorCount,
      total: updatedPosts.length
    };
    
  } catch (error) {
    console.error('❌ 致命的エラー:', error.message);
    return null;
  }
}

improveVideoArticles();