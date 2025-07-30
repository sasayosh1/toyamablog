import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function forceCacheBust() {
  try {
    console.log('🚨 強制キャッシュクリア実行...');
    
    // 全記事を取得
    const allPosts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        author
      }
    `);
    
    console.log(`📊 対象記事: ${allPosts.length}件`);
    
    // Author情報を確認
    const author = await client.fetch(`
      *[_type == "author" && name == "ささよし"] {
        _id,
        name,
        slug,
        bio
      }[0]
    `);
    
    console.log('👤 Author情報:');
    console.log(`   ID: ${author._id}`);
    console.log(`   名前: ${author.name}`);
    console.log(`   Slug: ${author.slug?.current}`);
    
    // Authorが設定されていない記事をチェック
    const postsWithoutAuthor = allPosts.filter(p => !p.author);
    console.log(`❌ Author未設定: ${postsWithoutAuthor.length}件`);
    
    if (postsWithoutAuthor.length > 0) {
      console.log('\n🔧 Author未設定記事に設定中...');
      
      for (const post of postsWithoutAuthor.slice(0, 5)) {
        await client
          .patch(post._id)
          .set({
            author: {
              _ref: author._id,
              _type: 'reference'
            }
          })
          .commit();
        
        console.log(`✅ ${post.title.substring(0, 50)}...`);
      }
    }
    
    // 全記事に強制更新タイムスタンプを追加
    console.log('\n⚡ 全記事キャッシュバスター実行...');
    
    const cacheBusterTimestamp = new Date().toISOString();
    
    for (let i = 0; i < Math.min(allPosts.length, 10); i++) {
      const post = allPosts[i];
      
      try {
        await client
          .patch(post._id)
          .set({
            _cacheBuster: cacheBusterTimestamp,
            _forceUpdate: Math.random().toString(36)
          })
          .commit();
        
        console.log(`🔄 ${i + 1}/10: ${post.title.substring(0, 40)}...`);
        
      } catch (error) {
        console.error(`❌ ${post.title.substring(0, 30)}...: ${error.message}`);
      }
    }
    
    console.log('\n🎯 キャッシュクリア完了！');
    console.log('📱 確認手順:');
    console.log('1. ブラウザを完全終了');
    console.log('2. ブラウザを再起動');
    console.log('3. Ctrl+Shift+R でスーパーリロード');
    console.log('4. 開発者ツール→Network→"Disable cache"をチェック');
    console.log('5. プライベート/シークレットモードで確認');
    console.log('6. 10-15分後に再確認（完全CDN更新）');
    
    return {
      totalPosts: allPosts.length,
      postsWithoutAuthor: postsWithoutAuthor.length,
      authorId: author._id,
      cacheBusterTimestamp
    };
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return null;
  }
}

forceCacheBust();