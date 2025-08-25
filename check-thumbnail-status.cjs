const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkThumbnailStatus() {
  try {
    console.log('🔍 kamiichi-town-temple-2記事のサムネイル状況を確認中...');
    
    const article = await client.fetch(`*[_type == "post" && slug.current == "kamiichi-town-temple-2"][0] {
      _id,
      title,
      slug,
      youtubeUrl,
      thumbnail,
      _updatedAt
    }`);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('📄 記事タイトル:', article.title);
    console.log('🔑 記事ID:', article._id);
    console.log('📂 スラッグ:', article.slug.current);
    console.log('🎥 YouTube URL:', article.youtubeUrl || 'なし');
    console.log('📅 最終更新:', new Date(article._updatedAt).toLocaleString());
    
    if (article.thumbnail) {
      console.log('✅ サムネイルが設定されています:');
      console.log('   タイプ:', article.thumbnail._type);
      console.log('   アセットID:', article.thumbnail.asset._ref);
      console.log('   Alt テキスト:', article.thumbnail.alt);
      
      // アセット情報も取得
      const asset = await client.fetch(`*[_type == "sanity.imageAsset" && _id == "${article.thumbnail.asset._ref}"][0] {
        _id,
        url,
        originalFilename,
        size,
        metadata
      }`);
      
      if (asset) {
        console.log('🖼️ 画像アセット情報:');
        console.log('   URL:', asset.url);
        console.log('   ファイル名:', asset.originalFilename);
        console.log('   サイズ:', asset.size, 'bytes');
        if (asset.metadata?.dimensions) {
          console.log('   寸法:', `${asset.metadata.dimensions.width}x${asset.metadata.dimensions.height}`);
        }
      }
      
    } else {
      console.log('❌ サムネイルが設定されていません');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkThumbnailStatus();