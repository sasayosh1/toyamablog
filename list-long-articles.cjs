const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01'
});

// テキストの文字数を計算
function calculateTextLength(blocks) {
  if (!blocks || !Array.isArray(blocks)) return 0;
  
  return blocks
    .filter(block => block._type === 'block')
    .reduce((total, block) => {
      const text = block.children?.map(child => child.text || '').join('') || '';
      return total + text.length;
    }, 0);
}

async function listLongArticles() {
  try {
    console.log('🔍 2000文字超過記事の調査を開始します...\n');
    
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
        _id, title, body, slug
      }
    `);
    
    const longArticles = [];
    
    for (const post of posts) {
      const textLength = calculateTextLength(post.body);
      
      if (textLength > 2000) {
        longArticles.push({
          title: post.title,
          slug: post.slug?.current || 'no-slug',
          currentLength: textLength,
          excessLength: textLength - 2000,
          sanityUrl: `https://sasakiyoshimasa.sanity.studio/intent/edit/id=${post._id};type=post`
        });
      }
    }
    
    console.log(`📊 調査結果: ${longArticles.length}件の記事が2000文字を超過\n`);
    
    if (longArticles.length > 0) {
      console.log('📋 2000文字超過記事一覧:');
      console.log('=' .repeat(100));
      
      longArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   文字数: ${article.currentLength}文字 (${article.excessLength}文字超過)`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   編集URL: ${article.sanityUrl}`);
        console.log('');
      });
      
      console.log('=' .repeat(100));
      console.log('🎯 対応方針:');
      console.log('1. 上記のSanity Studio編集URLを使用して手動で短縮');
      console.log('2. 各記事を2000文字以内に編集');
      console.log('3. 自然な文章の区切りで短縮');
      console.log('4. 重要な情報は保持し、冗長な部分を削除');
      console.log('\n✅ スマホ最適化により読みやすさが向上します');
    } else {
      console.log('✨ 全記事が2000文字以内です！');
    }
    
  } catch (error) {
    console.error('💥 エラーが発生しました:', error);
  }
}

listLongArticles();