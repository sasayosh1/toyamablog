const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkThumbnailIssues() {
  try {
    console.log('サムネイル表示問題のある記事を調査中...');
    
    // スクリーンショットに見える記事タイトルから推測される記事を検索
    const articles = await client.fetch(`*[_type == "post" && (
      title match "*和倉*" ||
      title match "*入館無料*" ||
      title match "*歴史的建造物*" ||
      title match "*運河*" ||
      title match "*朝日の湯*" ||
      title match "*氷見*" ||
      title match "*雷鳥の里*" ||
      title match "*4号線*" ||
      title match "*イルミネーション*"
    )] | order(_createdAt desc) [0...20] {
      _id,
      title,
      slug,
      youtubeUrl,
      category
    }`);
    
    console.log(`見つかった記事数: ${articles.length}`);
    
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   スラッグ: ${article.slug?.current || 'なし'}`);
      console.log(`   YouTube URL: ${article.youtubeUrl || '❌ 未設定'}`);
      console.log(`   カテゴリー: ${article.category || 'なし'}`);
    });
    
    // YouTube URLが設定されていない記事をフィルタ
    const missingVideos = articles.filter(article => !article.youtubeUrl);
    console.log(`\n❌ YouTube URLが未設定の記事: ${missingVideos.length}件`);
    
    if (missingVideos.length > 0) {
      console.log('\n詳細:');
      missingVideos.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   ID: ${article._id}`);
        console.log(`   スラッグ: ${article.slug?.current}`);
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkThumbnailIssues();