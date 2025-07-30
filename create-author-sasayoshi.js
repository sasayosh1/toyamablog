import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createAuthorSasayoshi() {
  try {
    console.log('👤 Author「ささよし」の作成...');
    
    // 既存のAuthorをチェック
    const existingAuthor = await client.fetch(`
      *[_type == "author" && name == "ささよし"] {
        _id,
        name,
        slug,
        bio,
        image
      }[0]
    `);
    
    if (existingAuthor) {
      console.log('✅ Author「ささよし」は既に存在します');
      console.log(`ID: ${existingAuthor._id}`);
      console.log(`名前: ${existingAuthor.name}`);
      console.log(`Slug: ${existingAuthor.slug?.current}`);
      return existingAuthor;
    }
    
    // 新しいAuthorを作成
    const newAuthor = {
      _type: 'author',
      name: 'ささよし',
      slug: {
        current: 'sasayoshi',
        _type: 'slug'
      },
      bio: '富山県の魅力を発信するTOYAMA BLOGの管理人。富山の観光スポット、グルメ、文化、イベント情報をYouTube Shortsと連携してお届けしています。地域の隠れた名所から有名スポットまで、富山県の素晴らしさを多くの人に知ってもらいたいと思っています。',
      // アイコン画像は後で設定可能にする
      image: null
    };
    
    const result = await client.create(newAuthor);
    
    console.log('✅ Author「ささよし」作成完了');
    console.log(`ID: ${result._id}`);
    console.log(`名前: ${result.name}`);
    console.log(`Slug: ${result.slug.current}`);
    console.log(`Bio: ${result.bio}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Author作成エラー:', error.message);
    return null;
  }
}

async function updateAllPostsWithAuthor() {
  try {
    console.log('\n📝 全記事にAuthor情報を適用...');
    
    // Authorを取得
    const author = await client.fetch(`
      *[_type == "author" && name == "ささよし"] {
        _id
      }[0]
    `);
    
    if (!author) {
      console.error('❌ Author「ささよし」が見つかりません');
      return;
    }
    
    // Authorが設定されていない記事を取得
    const postsWithoutAuthor = await client.fetch(`
      *[_type == "post" && !defined(author)] {
        _id,
        title
      }
    `);
    
    console.log(`📊 Author未設定記事: ${postsWithoutAuthor.length}件`);
    
    if (postsWithoutAuthor.length === 0) {
      console.log('✅ 全記事にAuthorが設定済みです');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // 20件ずつバッチ処理
    for (let i = 0; i < postsWithoutAuthor.length; i += 20) {
      const batch = postsWithoutAuthor.slice(i, i + 20);
      const promises = [];
      
      for (const post of batch) {
        const promise = client
          .patch(post._id)
          .set({
            author: {
              _ref: author._id,
              _type: 'reference'
            }
          })
          .commit()
          .then(() => {
            successCount++;
            console.log(`✅ ${successCount}: ${post.title?.substring(0, 40)}...`);
          })
          .catch(error => {
            errorCount++;
            console.error(`❌ ${post.title?.substring(0, 30)}...: ${error.message}`);
          });
        
        promises.push(promise);
      }
      
      await Promise.all(promises);
      
      if (i + 20 < postsWithoutAuthor.length) {
        console.log(`⏳ ${i + 20}/${postsWithoutAuthor.length} 完了、1秒待機...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n📊 Author設定結果:');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 最終確認
    const allPosts = await client.fetch(`
      *[_type == "post"] {
        author
      }
    `);
    
    const withAuthor = allPosts.filter(p => p.author).length;
    const withoutAuthor = allPosts.filter(p => !p.author).length;
    
    console.log('\n📈 最終統計:');
    console.log(`👤 Author設定済み: ${withAuthor}件`);
    console.log(`❓ Author未設定: ${withoutAuthor}件`);
    
    return {
      success: successCount,
      error: errorCount,
      total: allPosts.length,
      withAuthor,
      withoutAuthor
    };
    
  } catch (error) {
    console.error('❌ Author適用エラー:', error.message);
    return null;
  }
}

async function main() {
  // 1. Authorを作成
  const author = await createAuthorSasayoshi();
  
  if (author) {
    // 2. 全記事にAuthor情報を適用
    await updateAllPostsWithAuthor();
  }
  
  console.log('\n🎉 Author設定完了！');
  console.log('💡 アイコン画像はSanity Studioから設定可能です:');
  console.log('   https://aoxze287.sanity.studio');
}

main();