import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  // APIトークンがない場合でも実行できるよう調整
  token: process.env.SANITY_API_TOKEN || undefined
});

async function executeYouTubeShortsEdit() {
  try {
    console.log('🎬 YouTube Shorts機能追加の最終実行');
    console.log('=' * 50);
    
    // 編集対象記事の確認
    const targetPost = await client.fetch(`*[_type == "post" && title match "*ブラジル食材*"] [0] {
      _id,
      _rev,
      title,
      slug,
      body,
      publishedAt
    }`);
    
    if (!targetPost) {
      console.log('❌ 対象記事が見つかりません');
      return;
    }
    
    console.log('📝 編集対象記事確認:');
    console.log(`タイトル: ${targetPost.title}`);
    console.log(`スラッグ: ${targetPost.slug?.current || '未設定'}`);
    console.log(`現在のbodyブロック数: ${targetPost.body ? targetPost.body.length : 0}`);
    
    // YouTube Shortsブロックが既に存在するかチェック
    const hasYouTubeShorts = targetPost.body && targetPost.body.some(block => block._type === 'youtubeShorts');
    
    if (hasYouTubeShorts) {
      console.log('✅ この記事には既にYouTube Shortsが追加されています！');
      
      // 既存のYouTube Shortsブロックを表示
      const youtubeBlocks = targetPost.body.filter(block => block._type === 'youtubeShorts');
      console.log(`🎬 YouTube Shortsブロック数: ${youtubeBlocks.length}`);
      youtubeBlocks.forEach((block, index) => {
        console.log(`  ${index + 1}. ${block.title || 'タイトルなし'} - ${block.url}`);
      });
      
      console.log('\n🌐 確認先:');
      console.log('• Sanity Studio: http://localhost:4321/studio');
      console.log('• ローカル: http://localhost:4321/blog/' + (targetPost.slug?.current || ''));
      console.log('• 本番: https://sasakiyoshimasa.com');
      
      return;
    }
    
    if (!process.env.SANITY_API_TOKEN) {
      console.log('\n🔑 APIトークンが設定されていません');
      console.log('以下の2つの方法で編集できます：');
      console.log('\n【方法1】手動編集（推奨）:');
      console.log('1. http://localhost:4321/studio にアクセス');
      console.log('2. 記事「ブラジル食材」を検索');
      console.log('3. 記事を開いて編集');
      console.log('4. 「記事内容」で「+ Add item」→「YouTube Shorts」');
      console.log('5. URL: https://www.youtube.com/shorts/jNQXAC9IVRw');
      console.log('6. タイトル: 高岡市のブラジル食材店の様子');
      console.log('7. 保存');
      
      console.log('\n【方法2】APIトークン設定後の自動編集:');
      console.log('1. https://www.sanity.io/manage/project/aoxze287 でAPIトークン取得');
      console.log('2. .env.local に SANITY_API_TOKEN=your-token を追加');
      console.log('3. このスクリプトを再実行');
      
      return;
    }
    
    // APIトークンがある場合の自動編集
    console.log('\n🚀 自動編集を実行中...');
    
    const currentBody = targetPost.body || [];
    const newYouTubeBlock = {
      _type: 'youtubeShorts',
      _key: 'youtube-shorts-' + Date.now(),
      url: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
      title: '高岡市のブラジル食材店の実際の様子',
      autoplay: false,
      showControls: true
    };
    
    const updatedBody = [...currentBody, newYouTubeBlock];
    
    const result = await client
      .patch(targetPost._id)
      .set({ body: updatedBody })
      .commit();
    
    console.log('✅ YouTube Shorts追加成功！');
    console.log(`記事ID: ${result._id}`);
    console.log(`ブロック数: ${currentBody.length} → ${updatedBody.length}`);
    
    console.log('\n🎉 編集完了！確認してください:');
    console.log('• Sanity Studio: http://localhost:4321/studio');
    console.log('• ローカル: http://localhost:4321/blog/' + (targetPost.slug?.current || ''));
    console.log('• 本番: https://sasakiyoshimasa.com');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n🔑 手動編集をお試しください:');
      console.log('http://localhost:4321/studio');
    }
  }
}

executeYouTubeShortsEdit();