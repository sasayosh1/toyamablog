import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheClear() {
  try {
    // キャッシュクリア用のダミー更新
    const posts = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-cake-station"][0]`);
    
    if (posts) {
      console.log('記事を更新してキャッシュをクリア中...');
      await client
        .patch(posts._id)
        .set({ _updatedAt: new Date().toISOString() })
        .commit();
      console.log('キャッシュクリア完了');
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

forceCacheClear();