import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function findAndRemoveDuplicates() {
  try {
    console.log('🔍 重複記事を検索して削除します\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt,
        youtubeUrl
      } | order(publishedAt desc)
    `);
    
    console.log(`📊 総記事数: ${posts.length}件\n`);
    
    // タイトルで重複をグループ化
    const titleGroups = {};
    posts.forEach(post => {
      const normalizedTitle = post.title.trim().toLowerCase();
      if (!titleGroups[normalizedTitle]) {
        titleGroups[normalizedTitle] = [];
      }
      titleGroups[normalizedTitle].push(post);
    });
    
    // 重複があるグループを特定
    const duplicateGroups = [];
    Object.keys(titleGroups).forEach(title => {
      if (titleGroups[title].length > 1) {
        duplicateGroups.push({
          title,
          posts: titleGroups[title]
        });
      }
    });
    
    console.log(`🚨 重複タイトルグループ: ${duplicateGroups.length}件\n`);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ 重複記事はありませんでした');
      return;
    }
    
    let totalDeleted = 0;
    
    // 各重複グループを処理
    for (const group of duplicateGroups) {
      console.log(`📝 重複グループ: "${group.title}"`);
      console.log(`   重複数: ${group.posts.length}件`);
      
      // 最新の記事を保持し、古い記事を削除対象にする
      const sortedPosts = group.posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const keepPost = sortedPosts[0]; // 最新を保持
      const deletePosts = sortedPosts.slice(1); // 古いものを削除
      
      console.log(`   保持: ${keepPost._id} (${keepPost.publishedAt}) slug: ${keepPost.slug}`);
      
      for (const deletePost of deletePosts) {
        console.log(`   削除対象: ${deletePost._id} (${deletePost.publishedAt}) slug: ${deletePost.slug}`);
        
        try {
          // 記事を削除
          await client.delete(deletePost._id);
          console.log(`   ✅ 削除成功: ${deletePost._id}`);
          totalDeleted++;
        } catch (error) {
          console.error(`   ❌ 削除失敗: ${deletePost._id} - ${error.message}`);
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('');
    }
    
    console.log('🎉 重複記事削除完了！');
    console.log(`📊 削除結果:`);
    console.log(`- 重複グループ数: ${duplicateGroups.length}件`);
    console.log(`- 削除した記事数: ${totalDeleted}件`);
    console.log(`- 残存記事数: ${posts.length - totalDeleted}件`);
    
    // 削除後の確認
    console.log('\n🔍 削除後の状況を確認中...');
    const remainingPosts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title,
        "slug": slug.current
      } | order(publishedAt desc)
    `);
    
    console.log(`✅ 確認完了: 現在の記事数 ${remainingPosts.length}件`);
    
    // 残存する重複があるかチェック
    const remainingTitleGroups = {};
    remainingPosts.forEach(post => {
      const normalizedTitle = post.title.trim().toLowerCase();
      if (!remainingTitleGroups[normalizedTitle]) {
        remainingTitleGroups[normalizedTitle] = [];
      }
      remainingTitleGroups[normalizedTitle].push(post);
    });
    
    const remainingDuplicates = Object.keys(remainingTitleGroups).filter(
      title => remainingTitleGroups[title].length > 1
    );
    
    if (remainingDuplicates.length > 0) {
      console.log(`⚠️  まだ${remainingDuplicates.length}件の重複タイトルがあります:`);
      remainingDuplicates.forEach(title => {
        console.log(`   - "${title}" (${remainingTitleGroups[title].length}件)`);
      });
    } else {
      console.log('✅ 全ての重複が解消されました');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

findAndRemoveDuplicates();