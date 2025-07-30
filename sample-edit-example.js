import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function showSampleEditExample() {
  try {
    console.log('🎬 既存記事編集の具体例');
    
    // 実際の記事を1つ取得
    const samplePost = await client.fetch(`*[_type == "post"] | order(_updatedAt desc) [0] {
      _id,
      title,
      slug,
      body,
      tags,
      publishedAt
    }`);
    
    if (!samplePost) {
      console.log('❌ 記事が見つかりません');
      return;
    }
    
    console.log('\n📝 編集例: 既存記事にYouTube Shorts追加');
    console.log('=' * 50);
    
    console.log(`記事タイトル: ${samplePost.title}`);
    console.log(`記事ID: ${samplePost._id}`);
    console.log(`スラッグ: ${samplePost.slug?.current || '未設定'}`);
    
    console.log('\n🔍 現在の記事構成:');
    if (samplePost.body && Array.isArray(samplePost.body)) {
      samplePost.body.forEach((block, index) => {
        console.log(`  ${index + 1}. [${block._type}] ${block._type === 'block' ? '文章ブロック' : 'その他'}`);
      });
    }
    
    console.log('\n✨ YouTube Shorts追加後のイメージ:');
    console.log('  1. [block] 既存の文章ブロック');
    console.log('  2. [block] 既存の文章ブロック');
    console.log('  3. [youtubeShorts] ★新規追加★ YouTube Shorts動画');
    console.log('  4. [block] 既存の文章ブロック（続き）');
    
    console.log('\n🎯 編集手順:');
    console.log('1. Sanity Studio: http://localhost:4321/studio');
    console.log('2. この記事を検索: "' + samplePost.title + '"');
    console.log('3. 「記事内容」セクションで「+ Add item」');
    console.log('4. 「YouTube Shorts」を選択');
    console.log('5. YouTube URLを入力');
    console.log('6. 保存');
    
    console.log('\n📱 推奨YouTube URL例:');
    console.log('- https://www.youtube.com/shorts/jNQXAC9IVRw');
    console.log('- https://youtu.be/dQw4w9WgXcQ');
    console.log('- https://www.youtube.com/watch?v=ScMzIvxBSi4');
    
    console.log('\n🎨 動画タイトル例:');
    if (samplePost.title.includes('富山')) {
      console.log('- "実際の富山の様子をショート動画で"');
      console.log('- "この記事で紹介したスポットの映像"');
    }
    console.log('- "記事の内容を動画で確認"');
    console.log('- "現地の雰囲気をお楽しみください"');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

showSampleEditExample();