import { createClient } from '@sanity/client';
import { config } from 'dotenv';
config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // 最新データを取得するためCDNを無効化
  token: process.env.SANITY_API_TOKEN,
});

async function checkKurobePost() {
  console.log('🔍 スラッグ「kurobe-city-1」の記事を検索中...\n');
  
  try {
    // 詳細な記事情報を取得
    const post = await client.fetch(`
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt,
        youtubeUrl,
        excerpt,
        thumbnail {
          asset -> {
            _ref,
            _id,
            url,
            originalFilename,
            size,
            mimeType,
            metadata {
              dimensions {
                width,
                height
              }
            }
          },
          alt
        },
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
        _createdAt,
        _updatedAt,
        _rev
      }
    `, { slug: 'kurobe-city-1' });

    if (!post) {
      console.log('❌ スラッグ「kurobe-city-1」の記事が見つかりませんでした。');
      
      // 関連するスラッグを検索
      console.log('\n🔍 「kurobe」を含むスラッグを検索中...');
      const relatedPosts = await client.fetch(`
        *[_type == "post" && slug.current match "*kurobe*"] {
          _id,
          title,
          slug,
          publishedAt
        }
      `);
      
      if (relatedPosts.length > 0) {
        console.log('\n📝 「kurobe」を含む記事:');
        relatedPosts.forEach((p, index) => {
          console.log(`${index + 1}. タイトル: ${p.title}`);
          console.log(`   スラッグ: ${p.slug.current}`);
          console.log(`   公開日: ${p.publishedAt || '未公開'}\n`);
        });
      } else {
        console.log('❌ 「kurobe」を含む記事は見つかりませんでした。');
      }
      
      return;
    }

    console.log('✅ 記事が見つかりました！\n');
    
    // 1. 記事のタイトル、スラッグ、公開状況
    console.log('📄 基本情報:');
    console.log(`   タイトル: ${post.title}`);
    console.log(`   スラッグ: ${post.slug.current}`);
    console.log(`   公開状況: ${post.publishedAt ? '公開済み (' + post.publishedAt + ')' : '未公開'}`);
    console.log(`   記事ID: ${post._id}`);
    console.log(`   最終更新: ${post._updatedAt}`);
    console.log(`   リビジョン: ${post._rev}\n`);
    
    // 2. thumbnail フィールドの設定状況
    console.log('🖼️ サムネイル情報:');
    if (post.thumbnail) {
      console.log(`   ✅ サムネイル設定: あり`);
      if (post.thumbnail.asset) {
        console.log(`   画像ID: ${post.thumbnail.asset._id}`);
        console.log(`   画像参照: ${post.thumbnail.asset._ref}`);
        console.log(`   URL: ${post.thumbnail.asset.url}`);
        console.log(`   ファイル名: ${post.thumbnail.asset.originalFilename || 'N/A'}`);
        console.log(`   ファイルサイズ: ${post.thumbnail.asset.size ? (post.thumbnail.asset.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);
        console.log(`   MIME タイプ: ${post.thumbnail.asset.mimeType || 'N/A'}`);
        
        if (post.thumbnail.asset.metadata && post.thumbnail.asset.metadata.dimensions) {
          console.log(`   画像サイズ: ${post.thumbnail.asset.metadata.dimensions.width} x ${post.thumbnail.asset.metadata.dimensions.height} px`);
        }
        
        console.log(`   Alt テキスト: ${post.thumbnail.alt || 'なし'}`);
      } else {
        console.log(`   ❌ 画像アセットが設定されていません`);
      }
    } else {
      console.log(`   ❌ サムネイル設定: なし`);
    }
    console.log('');
    
    // 3. youtubeUrl フィールドの設定状況
    console.log('📹 YouTube URL情報:');
    console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}\n`);
    
    // 4. 記事カードでサムネイル表示に必要な情報の確認
    console.log('🎯 記事カード表示チェック:');
    const hasTitle = !!post.title;
    const hasSlug = !!post.slug?.current;
    const hasPublishedAt = !!post.publishedAt;
    const hasThumbnail = !!(post.thumbnail?.asset?.url);
    const hasDescription = !!(post.description || post.excerpt);
    
    console.log(`   ✅ タイトル: ${hasTitle ? '設定済み' : '❌ 未設定'}`);
    console.log(`   ✅ スラッグ: ${hasSlug ? '設定済み' : '❌ 未設定'}`);
    console.log(`   ✅ 公開日: ${hasPublishedAt ? '設定済み' : '❌ 未設定'}`);
    console.log(`   ${hasThumbnail ? '✅' : '❌'} サムネイル画像: ${hasThumbnail ? '設定済み' : '未設定'}`);
    console.log(`   ✅ 説明文: ${hasDescription ? '設定済み' : '❌ 未設定'}`);
    
    const allRequiredFieldsSet = hasTitle && hasSlug && hasPublishedAt && hasThumbnail && hasDescription;
    console.log(`\n🎯 記事カード表示準備: ${allRequiredFieldsSet ? '✅ 完了' : '❌ 不完全'}`);
    
    if (!allRequiredFieldsSet) {
      console.log('\n🔧 必要な対応:');
      if (!hasThumbnail) {
        console.log('   - Sanity Studioでサムネイル画像を設定してください');
      }
      if (!hasDescription) {
        console.log('   - descriptionまたはexcerptフィールドに説明文を追加してください');
      }
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

checkKurobePost();