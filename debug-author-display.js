import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugAuthorDisplay() {
  try {
    console.log('🔍 Author表示デバッグ...');
    
    // フロントエンドで使用するクエリをテスト
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...5] {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt,
        youtubeUrl,
        author->{
          _id,
          name,
          slug,
          bio,
          image{
            asset->{
              _ref,
              url
            }
          }
        },
        "excerpt": description,
        "categories": [category]
      }
    `);
    
    console.log(`📊 取得記事数: ${posts.length}件\n`);
    
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title.substring(0, 50)}...`);
      console.log(`   Author ID: ${post.author?._id || '未設定'}`);
      console.log(`   Author名: ${post.author?.name || '未設定'}`);
      console.log(`   Author画像: ${post.author?.image?.asset?.url || '未設定'}`);
      console.log(`   Author Bio: ${post.author?.bio?.substring(0, 50) || '未設定'}...`);
      console.log('');
    });
    
    // Author情報を直接確認
    const author = await client.fetch(`
      *[_type == "author" && name == "ささよし"] {
        _id,
        name,
        slug,
        bio,
        image
      }[0]
    `);
    
    console.log('👤 Sanity内のAuthor情報:');
    console.log(`   ID: ${author._id}`);
    console.log(`   名前: ${author.name}`);
    console.log(`   Slug: ${author.slug?.current}`);
    console.log(`   Bio: ${author.bio}`);
    console.log(`   画像: ${author.image ? 'あり' : 'なし'}`);
    
    // Author参照の確認
    const postsWithAuthorRef = await client.fetch(`
      *[_type == "post" && defined(author)] {
        _id,
        title,
        "authorRef": author._ref
      }
    `);
    
    console.log(`\n📊 Author参照設定済み記事: ${postsWithAuthorRef.length}件`);
    
    const correctAuthorRefs = postsWithAuthorRef.filter(p => p.authorRef === author._id);
    console.log(`✅ 正しいAuthor参照: ${correctAuthorRefs.length}件`);
    
    if (postsWithAuthorRef.length !== correctAuthorRefs.length) {
      console.log('❌ 不正なAuthor参照が存在します');
    }
    
    return {
      postsWithAuthor: posts.filter(p => p.author).length,
      authorExists: !!author,
      authorRefsCorrect: correctAuthorRefs.length,
      totalPostsWithRef: postsWithAuthorRef.length
    };
    
  } catch (error) {
    console.error('❌ デバッグエラー:', error.message);
    return null;
  }
}

debugAuthorDisplay();