import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function simulateEditProcess() {
  try {
    console.log('🎬 Sanity Studio編集プロセスシミュレーション');
    console.log('=' * 60);
    
    // 編集対象記事の詳細情報を取得
    const targetPost = await client.fetch(`*[_type == "post" && title match "*ブラジル食材*"] [0] {
      _id,
      title,
      slug,
      body,
      publishedAt,
      tags,
      category
    }`);
    
    if (!targetPost) {
      console.log('❌ ブラジル食材の記事が見つかりません');
      return;
    }
    
    console.log('\n📝 現在編集中の記事情報:');
    console.log(`📰 タイトル: ${targetPost.title}`);
    console.log(`🔗 スラッグ: ${targetPost.slug?.current || '未設定'}`);
    console.log(`📅 公開日: ${targetPost.publishedAt ? new Date(targetPost.publishedAt).toLocaleDateString('ja-JP') : '未設定'}`);
    console.log(`🏷️ カテゴリ: ${targetPost.category || '未設定'}`);
    console.log(`📊 現在のブロック数: ${targetPost.body ? targetPost.body.length : 0}`);
    
    console.log('\n🔍 現在の記事構成:');
    if (targetPost.body && Array.isArray(targetPost.body)) {
      targetPost.body.forEach((block, index) => {
        const blockType = block._type;
        let description = '';
        
        if (blockType === 'block') {
          const text = block.children && block.children[0] ? 
            (block.children[0].text || '').substring(0, 50) + '...' : 
            '文章ブロック';
          description = `「${text}」`;
        } else {
          description = `${blockType}タイプ`;
        }
        
        console.log(`  ${index + 1}. [${blockType}] ${description}`);
      });
    }
    
    console.log('\n✨ YouTube Shorts追加後の予想構成:');
    if (targetPost.body && Array.isArray(targetPost.body)) {
      targetPost.body.forEach((block, index) => {
        const blockType = block._type;
        let description = '';
        
        if (blockType === 'block') {
          const text = block.children && block.children[0] ? 
            (block.children[0].text || '').substring(0, 30) + '...' : 
            '既存の文章';
          description = `「${text}」`;
        }
        
        console.log(`  ${index + 1}. [${blockType}] ${description}`);
      });
      
      // 新しいYouTube Shortsブロックを追加
      console.log(`  ${targetPost.body.length + 1}. [youtubeShorts] ★NEW★ 「高岡市のブラジル食材店の様子」`);
    }
    
    console.log('\n🎯 Sanity Studio での操作手順:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ 1. http://localhost:4321/studio を開く    │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 2. 左サイドバー「記事」をクリック         │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 3. 検索: "ブラジル食材"                 │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 4. 該当記事をクリック                     │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 5. 「記事内容」セクションを探す           │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 6. 最下部「+ Add item」をクリック        │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 7. 「YouTube Shorts」を選択             │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 8. URL入力: youtube.com/shorts/jNQXAC9IVRw │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 9. タイトル: 高岡市のブラジル食材店      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 10. 「Save」で保存                       │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n📱 入力する具体的な値:');
    console.log('┌──────────────────────────────────────────────────────┐');
    console.log('│ YouTube Shorts URL:                                  │');
    console.log('│ https://www.youtube.com/shorts/jNQXAC9IVRw          │');
    console.log('├──────────────────────────────────────────────────────┤');
    console.log('│ 動画タイトル:                                       │');
    console.log('│ 高岡市のブラジル食材店の実際の様子                   │');
    console.log('├──────────────────────────────────────────────────────┤');
    console.log('│ 自動再生: ☐ (チェックなし)                         │');
    console.log('├──────────────────────────────────────────────────────┤');
    console.log('│ コントロール表示: ☑ (チェックあり)                  │');
    console.log('└──────────────────────────────────────────────────────┘');
    
    console.log('\n🌐 編集後の確認先:');
    console.log('• Sanity Studio: http://localhost:4321/studio');
    console.log('• 本番サイト: https://sasakiyoshimasa.com');
    console.log('• ローカル開発: http://localhost:4321/blog/' + (targetPost.slug?.current || ''));
    
    console.log('\n🚀 今すぐ実行してください！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

simulateEditProcess();