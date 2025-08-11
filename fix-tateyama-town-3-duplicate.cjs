const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixTateyamaTownDuplicate() {
  try {
    console.log('🔧 tateyama-town-3記事の重複修正を開始...\n');
    
    // 1. 重複記事を取得
    const duplicateArticles = await client.fetch(`
      *[_type == "post" && slug.current == "tateyama-town-3"] | order(_createdAt asc) {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        category,
        youtubeUrl,
        publishedAt,
        excerpt,
        tags,
        body
      }
    `);
    
    console.log(`📊 見つかった重複記事: ${duplicateArticles.length}件\n`);
    
    if (duplicateArticles.length <= 1) {
      console.log('✅ 重複は既に修正されています。');
      return { success: true, action: 'no_action_needed' };
    }

    // 分析: どちらを残すべきか判断
    duplicateArticles.forEach((article, index) => {
      console.log(`📝 記事 ${index + 1}:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   作成日: ${article._createdAt}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   YouTube URL: ${article.youtubeUrl || '未設定'}`);
      console.log(`   Excerpt: ${article.excerpt ? 'あり' : '未設定'}`);
      console.log(`   タグ数: ${article.tags?.length || 0}`);
      console.log(`   本文ブロック数: ${article.body?.length || 0}\n`);
    });

    // 修正方針の決定
    // 新しい記事（YouTube URL付き、詳細な内容）を残し、古い記事を削除
    const articlesToKeep = duplicateArticles.filter(article => 
      article.youtubeUrl && article.youtubeUrl.includes('HHwdGY71Vds')
    );
    
    const articlesToDelete = duplicateArticles.filter(article => 
      !article.youtubeUrl || !article.youtubeUrl.includes('HHwdGY71Vds')
    );

    console.log('🎯 修正方針:');
    console.log(`保持する記事: ${articlesToKeep.length}件 (YouTube URL付き、詳細内容)`);
    console.log(`削除する記事: ${articlesToDelete.length}件 (古いバージョン)\n`);

    if (articlesToKeep.length !== 1) {
      console.log('⚠️  想定外の状況です。手動確認が必要です。');
      return { success: false, error: '保持すべき記事が1件ではありません' };
    }

    // 2. 古い記事の削除（一つずつ慎重に）
    for (const article of articlesToDelete) {
      console.log(`🗑️  削除対象記事:`);
      console.log(`   ID: ${article._id}`);
      console.log(`   タイトル: ${article.title}`);
      console.log(`   作成日: ${article._createdAt}`);
      
      // バックアップ情報を保存
      const backupInfo = {
        deletedAt: new Date().toISOString(),
        originalId: article._id,
        title: article.title,
        slug: article.slug.current,
        reason: 'slug重複により削除 (tateyama-town-3)'
      };
      
      console.log(`   バックアップ情報: ${JSON.stringify(backupInfo)}`);
      
      // 実際に削除を実行
      const deleteResult = await client.delete(article._id);
      console.log(`   ✅ 削除完了: ${deleteResult._id}\n`);
    }

    // 3. 残った記事の確認
    const remainingArticles = await client.fetch(`
      *[_type == "post" && slug.current == "tateyama-town-3"] {
        _id,
        title,
        slug,
        youtubeUrl,
        publishedAt,
        excerpt
      }
    `);

    console.log('📋 修正後の状態:');
    console.log(`残存記事数: ${remainingArticles.length}件`);
    
    if (remainingArticles.length === 1) {
      const remaining = remainingArticles[0];
      console.log(`✅ 正常に修正されました:`);
      console.log(`   ID: ${remaining._id}`);
      console.log(`   タイトル: ${remaining.title}`);
      console.log(`   スラッグ: ${remaining.slug.current}`);
      console.log(`   YouTube URL: ${remaining.youtubeUrl}`);
      console.log(`   公開日: ${remaining.publishedAt}`);
    }

    // 4. キャッシュクリア（必要に応じて）
    console.log('\n🔄 キャッシュクリアをトリガー...');
    
    // Vercelのrevalidateエンドポイントを呼び出し（実際のURLに合わせて調整）
    try {
      const revalidateUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/revalidate?secret=${process.env.REVALIDATE_SECRET}&path=/`
        : 'http://localhost:3000/api/revalidate';
        
      console.log(`   revalidate URL: ${revalidateUrl}`);
      // 本番環境でのみ実行
      if (process.env.VERCEL_URL) {
        // fetch(revalidateUrl).catch(e => console.log('Revalidate failed:', e));
        console.log('   💡 本番環境でのキャッシュクリアは手動で行ってください');
      }
    } catch (e) {
      console.log('   ⚠️  キャッシュクリアは手動で行ってください');
    }

    return {
      success: true,
      action: 'duplicate_resolved',
      deletedIds: articlesToDelete.map(a => a._id),
      keepId: articlesToKeep[0]._id,
      remainingCount: remainingArticles.length
    };

  } catch (error) {
    console.error('❌ 修正エラー:', error);
    return { success: false, error: error.message };
  }
}

// 実行前確認
async function confirmAction() {
  console.log('⚠️  この操作は Sanity データベースから記事を永続的に削除します。');
  console.log('📋 実行内容:');
  console.log('   1. tateyama-town-3 スラッグの重複記事を確認');
  console.log('   2. YouTube URL付きの新しい記事を保持');
  console.log('   3. 古い記事（YouTube URL無し）を削除');
  console.log('   4. 修正結果を確認');
  console.log('\n');
  
  // 環境変数チェック
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN 環境変数が設定されていません');
    process.exit(1);
  }
  
  console.log('🚀 実行を開始します...\n');
  return true;
}

// 実行
confirmAction()
  .then(() => fixTateyamaTownDuplicate())
  .then(result => {
    console.log('\n🎯 修正作業完了！');
    console.log('📊 結果:', result);
    
    if (result.success) {
      console.log('\n✅ tateyama-town-3 の重複問題が解決されました！');
      console.log('💡 ブラウザで確認して、記事が正しく表示されることを確認してください。');
    }
  })
  .catch(error => {
    console.error('❌ 実行エラー:', error);
  });