const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function checkNewArticleQuality() {
  try {
    console.log('🔍 最新作成記事の品質チェック');
    console.log('===============================');
    
    // 最新の記事を取得
    const query = `*[_type == "post"] | order(_createdAt desc)[0]{
      _id,
      _createdAt,
      title,
      slug,
      youtubeUrl,
      body,
      excerpt,
      tags,
      category,
      publishedAt,
      author
    }`;
    
    const latestArticle = await client.fetch(query);
    
    if (!latestArticle) {
      console.log('❌ 記事が見つかりません');
      return;
    }

    console.log('📄 記事情報:');
    console.log(`   タイトル: ${latestArticle.title}`);
    console.log(`   スラッグ: ${latestArticle.slug?.current}`);
    console.log(`   作成日: ${new Date(latestArticle._createdAt).toLocaleString('ja-JP')}`);
    console.log(`   YouTube URL: ${latestArticle.youtubeUrl}`);
    console.log(`   カテゴリ: ${latestArticle.category}`);
    console.log(`   説明文: ${latestArticle.excerpt || 'なし'}`);
    console.log('');

    // タグの確認
    console.log('🏷️  タグ一覧:');
    if (latestArticle.tags && latestArticle.tags.length > 0) {
      latestArticle.tags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag}`);
      });
    } else {
      console.log('   タグなし');
    }
    console.log('');

    // 本文構造の確認
    console.log('📝 本文構造:');
    if (latestArticle.body && latestArticle.body.length > 0) {
      latestArticle.body.forEach((block, index) => {
        if (block._type === 'block') {
          const text = block.children?.[0]?.text || '';
          const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
          console.log(`   ${index + 1}. [${block.style}] ${textPreview}`);
        } else if (block._type === 'html') {
          console.log(`   ${index + 1}. [HTML] Google Maps埋め込み`);
        }
      });
    } else {
      console.log('   本文なし');
    }
    console.log('');

    // クラウドルール遵守チェック
    console.log('✅ クラウドルール遵守チェック:');
    const hasLocation = latestArticle.title.includes('【') && latestArticle.title.includes('】');
    const hasYouTube = !!latestArticle.youtubeUrl;
    const hasTags = latestArticle.tags && latestArticle.tags.length > 0;
    const hasExcerpt = !!latestArticle.excerpt;
    
    console.log(`   地域名タイトル: ${hasLocation ? '✅' : '❌'}`);
    console.log(`   YouTube動画: ${hasYouTube ? '✅' : '❌'}`);
    console.log(`   タグ設定: ${hasTags ? '✅' : '❌'}`);
    console.log(`   説明文: ${hasExcerpt ? '✅' : '❌'}`);
    console.log('');

    // 記事URL
    const articleUrl = `https://sasakiyoshimasa.com/blog/${latestArticle.slug?.current}`;
    console.log('🔗 記事URL:');
    console.log(`   ${articleUrl}`);
    console.log('');

    console.log('🎉 品質チェック完了');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

checkNewArticleQuality();