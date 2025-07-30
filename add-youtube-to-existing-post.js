import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function addYouTubeShortsToPost() {
  try {
    console.log('🎬 既存記事にYouTube Shorts追加を実行中...');
    
    // 最新の記事を1つ取得
    const targetPost = await client.fetch(`*[_type == "post"] | order(_updatedAt desc) [0] {
      _id,
      _rev,
      title,
      slug,
      body,
      publishedAt,
      tags
    }`);
    
    if (!targetPost) {
      console.log('❌ 編集対象の記事が見つかりません');
      return;
    }
    
    console.log('\n📝 編集対象記事:');
    console.log(`タイトル: ${targetPost.title}`);
    console.log(`ID: ${targetPost._id}`);
    console.log(`現在のbodyブロック数: ${targetPost.body ? targetPost.body.length : 0}`);
    
    if (!process.env.SANITY_API_TOKEN) {
      console.log('\n🔑 APIトークンが設定されていません');
      console.log('手動でSanity Studioから編集してください：');
      console.log('1. http://localhost:4321/studio にアクセス');
      console.log(`2. 記事「${targetPost.title}」を検索`);
      console.log('3. 記事をクリックして編集画面を開く');
      console.log('4. 「記事内容」セクションで「+ Add item」をクリック');
      console.log('5. 「YouTube Shorts」を選択');
      console.log('6. 以下の情報を入力:');
      console.log('   - URL: https://www.youtube.com/shorts/jNQXAC9IVRw');
      console.log('   - タイトル: 高岡市のブラジル食材店の様子');
      console.log('   - 自動再生: オフ');
      console.log('   - コントロール表示: オン');
      console.log('7. 「Save」で保存');
      
      // サンプルのbody構造を表示
      console.log('\n📋 追加するYouTube Shortsブロックの構造:');
      const youtubeBlock = {
        _type: 'youtubeShorts',
        _key: 'youtube-shorts-' + Date.now(),
        url: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
        title: '高岡市のブラジル食材店の実際の様子',
        autoplay: false,
        showControls: true
      };
      console.log(JSON.stringify(youtubeBlock, null, 2));
      
      return;
    }
    
    // APIトークンがある場合の自動編集
    console.log('\n🚀 APIを使用して自動編集中...');
    
    // 現在のbodyに新しいYouTube Shortsブロックを追加
    const currentBody = targetPost.body || [];
    const newYouTubeBlock = {
      _type: 'youtubeShorts',
      _key: 'youtube-shorts-' + Date.now(),
      url: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
      title: '記事で紹介した場所の動画',
      autoplay: false,
      showControls: true
    };
    
    // 最後に追加
    const updatedBody = [...currentBody, newYouTubeBlock];
    
    // 記事を更新
    const result = await client
      .patch(targetPost._id)
      .set({ body: updatedBody })
      .commit();
    
    console.log('✅ YouTube Shorts追加成功！');
    console.log('更新された記事ID:', result._id);
    console.log('新しいリビジョン:', result._rev);
    console.log('追加されたブロック数:', updatedBody.length - currentBody.length);
    
    console.log('\n🌐 確認方法:');
    console.log('1. Sanity Studio: http://localhost:4321/studio');
    console.log('2. 本番サイト: https://sasakiyoshimasa.com');
    console.log('3. ローカル: http://localhost:4321/blog/' + (targetPost.slug?.current || ''));
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    
    if (error.message.includes('permission') || error.message.includes('Insufficient')) {
      console.log('\n🔑 APIトークンの権限が不足しています');
      console.log('手動でSanity Studioから編集してください：');
      console.log('http://localhost:4321/studio');
    }
  }
}

addYouTubeShortsToPost();