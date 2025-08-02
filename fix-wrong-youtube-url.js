import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function fixWrongYouTubeUrl() {
  try {
    console.log('🔧 間違ったYouTube URLを修正します\n');
    
    const targetSlug = 'toyama-city-1946-bread-1946-pain-d-or';
    const correctYouTubeUrl = 'https://youtube.com/shorts/0fBH7G9dEmM';
    
    // 対象記事を取得
    console.log(`📝 対象記事を検索中: ${targetSlug}`);
    const post = await client.fetch(`
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        youtubeUrl
      }
    `, { slug: targetSlug });
    
    if (!post) {
      console.error('❌ 指定したslugの記事が見つかりません');
      return;
    }
    
    console.log('✅ 記事を発見しました:');
    console.log(`   ID: ${post._id}`);
    console.log(`   タイトル: ${post.title}`);
    console.log(`   現在のYouTube URL: ${post.youtubeUrl || 'なし'}`);
    console.log(`   新しいYouTube URL: ${correctYouTubeUrl}\n`);
    
    // YouTube URLを更新
    console.log('🔧 YouTube URLを更新中...');
    const result = await client
      .patch(post._id)
      .set({ youtubeUrl: correctYouTubeUrl })
      .commit();
    
    console.log('✅ 更新成功！');
    console.log(`📊 更新結果:`);
    console.log(`   記事ID: ${result._id}`);
    console.log(`   更新時刻: ${new Date().toLocaleString('ja-JP')}`);
    console.log(`   新しいURL: ${correctYouTubeUrl}`);
    
    // 更新後の確認
    console.log('\n🔍 更新結果を確認中...');
    const updatedPost = await client.fetch(`
      *[_type == "post" && _id == $id][0] {
        _id,
        title,
        "slug": slug.current,
        youtubeUrl
      }
    `, { id: post._id });
    
    if (updatedPost.youtubeUrl === correctYouTubeUrl) {
      console.log('✅ 確認完了: YouTube URLが正しく更新されました');
      console.log(`   記事URL: https://sasakiyoshimasa.com/blog/${updatedPost.slug}`);
      console.log(`   YouTube URL: ${updatedPost.youtubeUrl}`);
    } else {
      console.error('❌ 更新確認失敗: URLが正しく設定されていません');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

fixWrongYouTubeUrl();