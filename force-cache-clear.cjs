const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheClear() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('キャッシュクリアのため記事を軽微更新中:', post.title);
    
    // 現在時刻でupdatedAtを更新してキャッシュを無効化
    await client
      .patch(post._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();
    
    console.log('キャッシュクリア完了 - 更新時刻:', new Date().toISOString());
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

forceCacheClear();