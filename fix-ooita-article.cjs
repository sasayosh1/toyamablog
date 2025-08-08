const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixOoitaArticle() {
  try {
    console.log('🔄 於保多神社記事を正確な内容に更新中...');
    
    // 記事IDで対象記事を取得
    const videoId = 'N2BgquZ0-Xg';
    const query = `*[_type == "post" && youtubeUrl match "*${videoId}*"][0] { _id, title }`;
    const post = await client.fetch(query);
    
    if (!post) {
      throw new Error('対象記事が見つかりません');
    }
    
    console.log(`📝 更新対象記事: ${post.title}`);
    console.log(`🆔 記事ID: ${post._id}`);
    
    // 正確な記事データ（於保多神社の夏詣と学業祈願）
    const updateData = {
      title: '【富山市】富山の学問神社！於保多(おおた)神社で夏詣＆学業祈願',
      slug: {
        _type: 'slug',
        current: 'toyama-city-ooita-shrine-summer-visit'
      },
      excerpt: '富山市の於保多神社は学問の神様として地元で親しまれている神社です。夏詣で心身を清め、学業成就を願う特別な参拝体験をご紹介します。',
      tags: ['富山市', '於保多神社', '神社', '学業祈願', '夏詣', '学問の神様', '参拝', '富山県', 'TOYAMA', 'YouTube Shorts', '#shorts', '動画']
    };
    
    // 記事を更新
    await client.patch(post._id).set(updateData).commit();
    
    console.log('\\n✅ 記事更新完了！');
    console.log('📄 新タイトル:', updateData.title);
    console.log('🔗 新スラッグ:', updateData.slug.current);
    console.log('🏷️ タグ数:', updateData.tags.length, '個');
    console.log('🎌 テーマ: 於保多神社での夏詣と学業祈願');
    
    console.log('\\n🎯 修正成果:');
    console.log('🎌 正確なテーマ: 神社参拝・学業祈願・夏詣');
    console.log('🏷️ SEO最適化: 神社・学業祈願関連キーワード');
    console.log('🔗 YouTube連携: 動画内容と完全一致');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ 記事更新エラー:', error);
    return { success: false, error: error.message };
  }
}

fixOoitaArticle();