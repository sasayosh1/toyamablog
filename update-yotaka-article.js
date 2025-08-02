import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function updateYotakaArticle() {
  try {
    // 夜高祭の記事を検索
    const yotakaPost = await client.fetch(`
      *[_type == "post" && title match "*富山が全国に誇る勇猛な喧嘩祭り*夜高祭*"][0]{ 
        _id,
        title, 
        "slug": slug.current,
        youtubeUrl
      }
    `);
    
    if (!yotakaPost) {
      console.log('夜高祭の記事が見つかりませんでした');
      return;
    }
    
    console.log('更新前の記事情報:');
    console.log(`ID: ${yotakaPost._id}`);
    console.log(`タイトル: ${yotakaPost.title}`);
    console.log(`スラッグ: ${yotakaPost.slug}`);
    console.log(`現在のYouTube URL: ${yotakaPost.youtubeUrl || 'なし'}`);
    console.log('');
    
    // YouTube URLを更新
    const youtubeUrl = 'https://youtube.com/shorts/Q2vjPW8zsHg';
    
    const result = await client
      .patch(yotakaPost._id)
      .set({ youtubeUrl: youtubeUrl })
      .commit();
    
    console.log('✅ 記事の更新が完了しました！');
    console.log(`追加されたYouTube URL: ${youtubeUrl}`);
    console.log('更新結果:', result);
    
    // 更新後の確認
    const updatedPost = await client.fetch(`
      *[_id == "${yotakaPost._id}"][0]{ 
        title, 
        youtubeUrl
      }
    `);
    
    console.log('\n更新後の確認:');
    console.log(`YouTube URL: ${updatedPost.youtubeUrl}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    console.error('詳細:', error);
  }
}

updateYotakaArticle();