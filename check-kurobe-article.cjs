const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function checkKurobeArticle() {
  console.log('🔍 kurobe-city-1記事の詳細情報を確認します...');
  
  try {
    // スラッグでkurobe-city-1記事を検索
    const posts = await client.fetch(`
      *[_type == "post" && slug.current match "kurobe-city-1*"] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        thumbnail {
          asset -> {
            _id,
            url
          },
          alt,
          caption
        },
        youtubeUrl,
        excerpt,
        description
      }
    `);
    
    console.log(`📊 検索結果: ${posts.length}件の記事が見つかりました\n`);
    
    if (posts.length === 0) {
      console.log('❌ kurobe-city-1で始まるスラッグの記事が見つかりませんでした');
      
      // 類似記事を検索
      console.log('🔍 類似記事を検索します...');
      const similarPosts = await client.fetch(`
        *[_type == "post" && slug.current match "*kurobe*"] {
          _id,
          title,
          "slug": slug.current,
          publishedAt
        }
      `);
      
      if (similarPosts.length > 0) {
        console.log(`📋 kurobe関連の記事 ${similarPosts.length}件:`);
        similarPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
          console.log(`   スラッグ: ${post.slug}`);
          console.log(`   公開日: ${post.publishedAt || '未公開'}\n`);
        });
      }
      
      return;
    }
    
    // 各記事の詳細を表示
    posts.forEach((post, index) => {
      console.log(`📄 記事 ${index + 1}: ${post.title}`);
      console.log(`🔗 スラッグ: ${post.slug}`);
      console.log(`📅 公開日: ${post.publishedAt || '未公開'}`);
      
      // サムネイル画像の確認
      if (post.thumbnail?.asset?.url) {
        console.log(`✅ サムネイル画像: 設定済み`);
        console.log(`   URL: ${post.thumbnail.asset.url}`);
        if (post.thumbnail.alt) {
          console.log(`   代替テキスト: ${post.thumbnail.alt}`);
        }
      } else {
        console.log(`❌ サムネイル画像: 未設定`);
      }
      
      // YouTube URLの確認
      if (post.youtubeUrl) {
        console.log(`✅ YouTube URL: ${post.youtubeUrl}`);
        
        // YouTube サムネイル URL を生成
        let videoId = '';
        if (post.youtubeUrl.includes('youtu.be/')) {
          videoId = post.youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (post.youtubeUrl.includes('youtube.com/watch?v=')) {
          videoId = post.youtubeUrl.split('v=')[1]?.split('&')[0];
        } else if (post.youtubeUrl.includes('youtube.com/shorts/')) {
          videoId = post.youtubeUrl.split('shorts/')[1]?.split('?')[0];
        }
        
        if (videoId) {
          console.log(`📺 YouTube サムネイル: https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
        }
      } else {
        console.log(`❌ YouTube URL: 未設定`);
      }
      
      // 説明文の確認
      if (post.description) {
        console.log(`✅ 説明文: 設定済み (${post.description.length}文字)`);
      } else if (post.excerpt) {
        console.log(`📝 抜粋: 設定済み (${post.excerpt.length}文字)`);
      } else {
        console.log(`❌ 説明文・抜粋: 未設定`);
      }
      
      console.log('─'.repeat(50));
    });
    
    // サムネイル表示の問題診断
    const articlesWithoutThumbnail = posts.filter(post => 
      !post.thumbnail?.asset?.url && !post.youtubeUrl
    );
    
    if (articlesWithoutThumbnail.length > 0) {
      console.log(`\n⚠️ サムネイル未設定記事: ${articlesWithoutThumbnail.length}件`);
      console.log('💡 解決策:');
      console.log('1. Sanity Studio でサムネイル画像をアップロード');
      console.log('2. YouTube URL を設定してYouTubeサムネイルを使用');
      console.log('3. フォールバック画像の確認');
    } else {
      console.log('\n✅ 全ての記事にサムネイル表示用の画像が設定されています');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

checkKurobeArticle();